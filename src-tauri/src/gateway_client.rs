use crate::{
    core_types::{GatewaySession, ProviderMode, ProviderProfile},
    secure_store,
    storage::{load_provider, StorageState},
};
use chrono::Utc;
use rand::{rngs::OsRng, RngCore};
use reqwest::redirect::Policy;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{sync::Mutex, time::Duration};
use url::Url;

const MAX_AUTH_RESPONSE_BYTES: usize = 1024 * 1024;

#[derive(Default)]
pub struct GatewaySessionState(pub Mutex<Option<GatewaySession>>);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthChallenge {
    challenge_id: String,
    expires_at: String,
    retry_after_seconds: u32,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct VerifyResponse {
    account_id: String,
    email_masked: String,
    access_token: String,
    access_expires_at: String,
    refresh_token: String,
}

#[derive(Debug, Clone)]
pub struct ResolvedProvider {
    pub profile: ProviderProfile,
    pub api_base: String,
    pub credential: String,
}

fn configured_gateway_base() -> Result<String, String> {
    let raw = option_env!("LUMPA_GATEWAY_BASE").unwrap_or("").trim();
    let parsed = Url::parse(raw).map_err(|_| "此安装包未配置 Lumpa 账号网关。".to_string())?;
    if parsed.scheme() != "https"
        || parsed.host_str().is_none()
        || !parsed.username().is_empty()
        || parsed.password().is_some()
        || parsed.fragment().is_some()
    {
        return Err("Lumpa 账号网关必须是固定 HTTPS 地址。".to_string());
    }
    Ok(parsed.as_str().trim_end_matches('/').to_string())
}

fn auth_client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(Duration::from_secs(20))
        .redirect(Policy::none())
        .build()
        .map_err(|error| error.to_string())
}

async fn read_json_limited(response: reqwest::Response) -> Result<(u16, Value), String> {
    let status = response.status().as_u16();
    if response
        .content_length()
        .is_some_and(|size| size > MAX_AUTH_RESPONSE_BYTES as u64)
    {
        return Err("网关响应超过 1 MB 限制。".to_string());
    }
    let mut response = response;
    let mut bytes = Vec::new();
    while let Some(chunk) = response.chunk().await.map_err(|error| error.to_string())? {
        if bytes.len().saturating_add(chunk.len()) > MAX_AUTH_RESPONSE_BYTES {
            return Err("网关响应超过 1 MB 限制。".to_string());
        }
        bytes.extend_from_slice(&chunk);
    }
    let value = serde_json::from_slice(&bytes)
        .unwrap_or_else(|_| json!({"message":"网关返回了无效响应。"}));
    Ok((status, value))
}

fn gateway_error(status: u16, value: &Value) -> String {
    let message = value
        .get("message")
        .and_then(Value::as_str)
        .unwrap_or("Lumpa 网关请求失败。");
    format!("{}（HTTP {}）", message, status)
}

fn create_device_id() -> String {
    let mut bytes = [0u8; 16];
    OsRng.fill_bytes(&mut bytes);
    hex::encode(bytes)
}

#[tauri::command]
pub async fn gateway_send_code(
    email: String,
    invite_code: Option<String>,
) -> Result<AuthChallenge, String> {
    let email = email.trim().to_ascii_lowercase();
    if email.len() > 254 || !email.contains('@') || email.contains(char::is_whitespace) {
        return Err("邮箱地址格式不正确。".to_string());
    }
    let response = auth_client()?
        .post(format!("{}/v1/auth/email/start", configured_gateway_base()?))
        .json(&json!({"email": email, "inviteCode": invite_code.unwrap_or_default().chars().take(128).collect::<String>()}))
        .send().await.map_err(|_| "无法连接 Lumpa 账号网关。".to_string())?;
    let (status, value) = read_json_limited(response).await?;
    if !(200..300).contains(&status) {
        return Err(gateway_error(status, &value));
    }
    Ok(AuthChallenge {
        challenge_id: value
            .get("challengeId")
            .and_then(Value::as_str)
            .ok_or_else(|| "网关未返回验证码会话。".to_string())?
            .to_string(),
        expires_at: value
            .get("expiresAt")
            .and_then(Value::as_str)
            .ok_or_else(|| "网关未返回验证码过期时间。".to_string())?
            .to_string(),
        retry_after_seconds: value
            .get("retryAfterSeconds")
            .and_then(Value::as_u64)
            .unwrap_or(60) as u32,
    })
}

#[tauri::command]
pub async fn gateway_verify_code(
    sessions: tauri::State<'_, GatewaySessionState>,
    challenge_id: String,
    code: String,
    device_name: String,
) -> Result<GatewaySession, String> {
    if code.len() != 6 || !code.bytes().all(|byte| byte.is_ascii_digit()) {
        return Err("验证码必须是 6 位数字。".to_string());
    }
    let device_id = create_device_id();
    let response = auth_client()?
        .post(format!("{}/v1/auth/email/verify", configured_gateway_base()?))
        .json(&json!({"challengeId": challenge_id, "code": code, "deviceId": device_id, "deviceName": device_name.chars().take(80).collect::<String>()}))
        .send().await.map_err(|_| "无法连接 Lumpa 账号网关。".to_string())?;
    let (status, value) = read_json_limited(response).await?;
    if !(200..300).contains(&status) {
        return Err(gateway_error(status, &value));
    }
    let verified: VerifyResponse =
        serde_json::from_value(value).map_err(|_| "网关登录响应不完整。".to_string())?;
    secure_store::set_secret(
        &format!("auth:refresh:{}", device_id),
        &verified.refresh_token,
    )?;
    let session = GatewaySession {
        account_id: verified.account_id,
        email_masked: verified.email_masked,
        device_id,
        access_token: verified.access_token,
        access_expires_at: verified.access_expires_at,
    };
    *sessions
        .0
        .lock()
        .map_err(|_| "登录会话锁已损坏。".to_string())? = Some(session.clone());
    let mut public_session = session;
    public_session.access_token.clear();
    Ok(public_session)
}

#[tauri::command]
pub fn gateway_session_status(
    sessions: tauri::State<'_, GatewaySessionState>,
) -> Result<Option<GatewaySession>, String> {
    let mut session = sessions
        .0
        .lock()
        .map_err(|_| "登录会话锁已损坏。".to_string())?
        .clone();
    if let Some(value) = &mut session {
        value.access_token.clear();
    }
    Ok(session)
}

#[tauri::command]
pub async fn gateway_refresh_session(
    sessions: tauri::State<'_, GatewaySessionState>,
) -> Result<GatewaySession, String> {
    let current = sessions
        .0
        .lock()
        .map_err(|_| "登录会话锁已损坏。".to_string())?
        .clone()
        .ok_or_else(|| "当前没有登录会话。".to_string())?;
    let refresh_token = secure_store::get_secret(&format!("auth:refresh:{}", current.device_id))?
        .ok_or_else(|| "登录刷新令牌已丢失，请重新登录。".to_string())?;
    let response = auth_client()?
        .post(format!("{}/v1/auth/refresh", configured_gateway_base()?))
        .json(&json!({"deviceId": current.device_id, "refreshToken": refresh_token}))
        .send()
        .await
        .map_err(|_| "无法连接 Lumpa 账号网关。".to_string())?;
    let (status, value) = read_json_limited(response).await?;
    if !(200..300).contains(&status) {
        return Err(gateway_error(status, &value));
    }
    let verified: VerifyResponse =
        serde_json::from_value(value).map_err(|_| "网关刷新响应不完整。".to_string())?;
    secure_store::set_secret(
        &format!("auth:refresh:{}", current.device_id),
        &verified.refresh_token,
    )?;
    let session = GatewaySession {
        account_id: verified.account_id,
        email_masked: verified.email_masked,
        device_id: current.device_id,
        access_token: verified.access_token,
        access_expires_at: verified.access_expires_at,
    };
    *sessions
        .0
        .lock()
        .map_err(|_| "登录会话锁已损坏。".to_string())? = Some(session.clone());
    let mut public_session = session;
    public_session.access_token.clear();
    Ok(public_session)
}

#[tauri::command]
pub async fn gateway_logout(sessions: tauri::State<'_, GatewaySessionState>) -> Result<(), String> {
    let current = sessions
        .0
        .lock()
        .map_err(|_| "登录会话锁已损坏。".to_string())?
        .clone();
    if let Some(session) = current {
        let refresh_token =
            secure_store::get_secret(&format!("auth:refresh:{}", session.device_id))?
                .unwrap_or_default();
        let _ = auth_client()?
            .post(format!("{}/v1/auth/logout", configured_gateway_base()?))
            .json(&json!({"deviceId": session.device_id, "refreshToken": refresh_token}))
            .send()
            .await;
        secure_store::delete_secret(&format!("auth:refresh:{}", session.device_id))?;
    }
    *sessions
        .0
        .lock()
        .map_err(|_| "登录会话锁已损坏。".to_string())? = None;
    Ok(())
}

fn current_session(sessions: &GatewaySessionState) -> Result<GatewaySession, String> {
    sessions
        .0
        .lock()
        .map_err(|_| "登录会话锁已损坏。".to_string())?
        .clone()
        .ok_or_else(|| "当前没有登录会话。".to_string())
}

async fn authenticated_gateway_request(
    method: reqwest::Method,
    path: &str,
    session: &GatewaySession,
) -> Result<(u16, Value), String> {
    let response = auth_client()?
        .request(method, format!("{}{}", configured_gateway_base()?, path))
        .bearer_auth(&session.access_token)
        .send()
        .await
        .map_err(|_| "无法连接 Lumpa 账号网关。".to_string())?;
    read_json_limited(response).await
}

#[tauri::command]
pub async fn gateway_account_info(
    sessions: tauri::State<'_, GatewaySessionState>,
) -> Result<Value, String> {
    let session = current_session(sessions.inner())?;
    let (status, value) =
        authenticated_gateway_request(reqwest::Method::GET, "/v1/account", &session).await?;
    if !(200..300).contains(&status) {
        return Err(gateway_error(status, &value));
    }
    Ok(value)
}

#[tauri::command]
pub async fn gateway_revoke_device(
    sessions: tauri::State<'_, GatewaySessionState>,
    device_id: String,
) -> Result<(), String> {
    if device_id.len() != 32 || !device_id.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        return Err("设备 ID 格式不正确。".to_string());
    }
    let session = current_session(sessions.inner())?;
    let path = format!("/v1/account/devices/{device_id}");
    let (status, value) =
        authenticated_gateway_request(reqwest::Method::DELETE, &path, &session).await?;
    if !(200..300).contains(&status) {
        return Err(gateway_error(status, &value));
    }
    if session.device_id == device_id {
        secure_store::delete_secret(&format!("auth:refresh:{}", session.device_id))?;
        *sessions
            .0
            .lock()
            .map_err(|_| "登录会话锁已损坏。".to_string())? = None;
    }
    Ok(())
}

#[tauri::command]
pub async fn gateway_delete_account(
    sessions: tauri::State<'_, GatewaySessionState>,
    confirmation: String,
) -> Result<(), String> {
    if confirmation != "DELETE" {
        return Err("注销账号确认文本不正确。".to_string());
    }
    let session = current_session(sessions.inner())?;
    let (status, value) =
        authenticated_gateway_request(reqwest::Method::DELETE, "/v1/account", &session).await?;
    if !(200..300).contains(&status) {
        return Err(gateway_error(status, &value));
    }
    secure_store::delete_secret(&format!("auth:refresh:{}", session.device_id))?;
    *sessions
        .0
        .lock()
        .map_err(|_| "登录会话锁已损坏。".to_string())? = None;
    Ok(())
}

pub fn resolve_provider(
    storage: &StorageState,
    sessions: &GatewaySessionState,
    provider_id: &str,
) -> Result<ResolvedProvider, String> {
    let (profile, stored_key) = load_provider(storage, provider_id)?;
    match profile.mode {
        ProviderMode::BringYourOwnKey => {
            let credential = stored_key
                .filter(|value| !value.trim().is_empty())
                .ok_or_else(|| "该供应商没有可用的用户 Key。".to_string())?;
            Ok(ResolvedProvider {
                api_base: profile.api_base.clone(),
                profile,
                credential,
            })
        }
        ProviderMode::LumpaAccount => {
            let session = sessions
                .0
                .lock()
                .map_err(|_| "登录会话锁已损坏。".to_string())?
                .clone()
                .ok_or_else(|| "请先登录 Lumpa 账号。".to_string())?;
            let expires = chrono::DateTime::parse_from_rfc3339(&session.access_expires_at)
                .map_err(|_| "登录会话过期时间损坏。".to_string())?;
            if expires.with_timezone(&Utc) <= Utc::now() {
                return Err("登录会话已过期，请刷新或重新登录。".to_string());
            }
            Ok(ResolvedProvider {
                api_base: configured_gateway_base()?,
                profile,
                credential: session.access_token,
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn device_ids_are_random_and_fixed_length() {
        let first = create_device_id();
        let second = create_device_id();
        assert_eq!(first.len(), 32);
        assert_ne!(first, second);
    }
}
