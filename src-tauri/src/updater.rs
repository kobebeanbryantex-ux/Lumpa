use std::time::Duration;

use serde::Serialize;
use tauri::{AppHandle, Emitter};
use tauri_plugin_updater::{Updater, UpdaterExt};
use url::Url;

use crate::storage::{require_permission, StorageState};

const UPDATE_TIMEOUT: Duration = Duration::from_secs(30);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    current_version: String,
    latest_version: Option<String>,
    available: bool,
    notes: Option<String>,
    published_at: Option<String>,
    channel: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct UpdateProgress {
    phase: &'static str,
    downloaded: u64,
    total: Option<u64>,
    percent: Option<u8>,
}

fn validated_channel(channel: &str) -> Result<&'static str, String> {
    match channel.trim().to_ascii_lowercase().as_str() {
        "stable" => Ok("stable"),
        "beta" => Ok("beta"),
        _ => Err("更新通道只能是 stable 或 beta。".to_string()),
    }
}

fn endpoint(base: &str, channel: &str) -> Result<Url, String> {
    let base = base.trim().trim_end_matches('/');
    if base.is_empty() {
        return Err("发布构建未配置更新端点。".to_string());
    }
    let url = Url::parse(&format!("{base}/{channel}/latest.json"))
        .map_err(|_| "发布构建中的更新端点无效。".to_string())?;
    if url.scheme() != "https" || url.host_str().is_none() {
        return Err("更新端点必须是带有效主机名的 HTTPS 地址。".to_string());
    }
    Ok(url)
}

fn build_updater(app: &AppHandle, channel: &str) -> Result<Updater, String> {
    let public_key = option_env!("LUMPA_UPDATER_PUBKEY").unwrap_or("").trim();
    if public_key.is_empty() {
        return Err("此安装包没有内置 Updater 公钥，仅可作为内部 RC 使用。".to_string());
    }

    let endpoints = vec![
        endpoint(option_env!("LUMPA_OSS_UPDATE_BASE").unwrap_or(""), channel)?,
        endpoint(
            option_env!("LUMPA_GITHUB_UPDATE_BASE").unwrap_or(""),
            channel,
        )?,
    ];
    let builder = app
        .updater_builder()
        .pubkey(public_key)
        .timeout(UPDATE_TIMEOUT)
        .endpoints(endpoints)
        .map_err(|error| format!("更新端点配置失败：{error}"))?;
    builder
        .build()
        .map_err(|error| format!("Updater 初始化失败：{error}"))
}

fn ensure_update_permission(state: &StorageState) -> Result<(), String> {
    require_permission(state, "autoUpdate")
        .map_err(|_| "自动更新权限未开启，请先在设置中明确允许。".to_string())
}

#[tauri::command]
pub async fn updater_check(
    app: AppHandle,
    state: tauri::State<'_, StorageState>,
    channel: String,
) -> Result<UpdateInfo, String> {
    ensure_update_permission(state.inner())?;
    let channel = validated_channel(&channel)?;
    let update = build_updater(&app, channel)?
        .check()
        .await
        .map_err(|error| format!("检查更新失败：{error}"))?;

    Ok(match update {
        Some(update) => UpdateInfo {
            current_version: update.current_version,
            latest_version: Some(update.version),
            available: true,
            notes: update.body,
            published_at: update.date.map(|date| date.to_string()),
            channel: channel.to_string(),
        },
        None => UpdateInfo {
            current_version: env!("CARGO_PKG_VERSION").to_string(),
            latest_version: None,
            available: false,
            notes: None,
            published_at: None,
            channel: channel.to_string(),
        },
    })
}

#[tauri::command]
pub async fn updater_download_and_install(
    app: AppHandle,
    state: tauri::State<'_, StorageState>,
    channel: String,
) -> Result<(), String> {
    ensure_update_permission(state.inner())?;
    let channel = validated_channel(&channel)?;
    let update = build_updater(&app, channel)?
        .check()
        .await
        .map_err(|error| format!("重新检查更新失败：{error}"))?
        .ok_or_else(|| "当前已经是最新版本。".to_string())?;

    let progress_app = app.clone();
    let downloaded = std::sync::Arc::new(std::sync::Mutex::new(0_u64));
    let chunk_counter = downloaded.clone();
    let finish_counter = downloaded.clone();
    let bytes = update
        .download(
            move |chunk, total| {
                let current = if let Ok(mut value) = chunk_counter.lock() {
                    *value = value.saturating_add(chunk as u64);
                    *value
                } else {
                    0
                };
                let percent = total.and_then(|value| {
                    (value > 0).then(|| ((current.saturating_mul(100) / value).min(100)) as u8)
                });
                let _ = progress_app.emit(
                    "lumpa://updater-progress",
                    UpdateProgress {
                        phase: "downloading",
                        downloaded: current,
                        total,
                        percent,
                    },
                );
            },
            {
                let finish_app = app.clone();
                move || {
                    let current = finish_counter.lock().map(|value| *value).unwrap_or(0);
                    let _ = finish_app.emit(
                        "lumpa://updater-progress",
                        UpdateProgress {
                            phase: "verified",
                            downloaded: current,
                            total: Some(current),
                            percent: Some(100),
                        },
                    );
                }
            },
        )
        .await
        .map_err(|error| format!("更新包下载或签名校验失败：{error}"))?;

    app.emit(
        "lumpa://updater-progress",
        UpdateProgress {
            phase: "installing",
            downloaded: bytes.len() as u64,
            total: Some(bytes.len() as u64),
            percent: Some(100),
        },
    )
    .map_err(|error| error.to_string())?;
    update
        .install(bytes)
        .map_err(|error| format!("安装更新失败，当前版本保持不变：{error}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_known_channels_are_accepted() {
        assert_eq!(validated_channel("stable").unwrap(), "stable");
        assert_eq!(validated_channel("BETA").unwrap(), "beta");
        assert!(validated_channel("nightly").is_err());
    }

    #[test]
    fn updater_endpoints_must_be_https() {
        assert!(endpoint("https://updates.example.com/lumpa", "stable").is_ok());
        assert!(endpoint("http://updates.example.com/lumpa", "stable").is_err());
        assert!(endpoint("", "stable").is_err());
    }
}
