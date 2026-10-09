use base64::{engine::general_purpose, Engine as _};
use keyring::Entry;
use rand::{rngs::OsRng, RngCore};
use std::{
    fs,
    path::PathBuf,
    sync::{Mutex, OnceLock},
};
use tauri::Manager;
use tauri_plugin_stronghold::stronghold::Stronghold;

const SERVICE_NAME: &str = "com.lumpa.desktop";
const MASTER_KEY_NAME: &str = "stronghold:master-key:v1";
const CLIENT_NAME: &[u8] = b"lumpa-desktop-v1";
const MAX_SECRET_BYTES: usize = 16 * 1024;
const APP_DATA_DIRECTORY: &str = "com.songz.rabbit-desk-pet";

static VAULT_PATH: OnceLock<PathBuf> = OnceLock::new();
static VAULT_LOCK: Mutex<()> = Mutex::new(());

fn validate_name(name: &str) -> Result<(), String> {
    let valid = !name.is_empty()
        && name.len() <= 96
        && name
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || matches!(byte, b'.' | b'_' | b'-' | b':'));
    if valid {
        Ok(())
    } else {
        Err("安全存储条目名称不合法。".to_string())
    }
}

fn credential(name: &str) -> Result<Entry, String> {
    Entry::new(SERVICE_NAME, name).map_err(|_| "无法访问 Windows 凭据管理器。".to_string())
}

fn master_key() -> Result<Vec<u8>, String> {
    let entry = credential(MASTER_KEY_NAME)?;
    match entry.get_password() {
        Ok(encoded) => {
            let key = general_purpose::STANDARD
                .decode(encoded)
                .map_err(|_| "Stronghold 主密钥损坏。".to_string())?;
            if key.len() != 32 {
                return Err("Stronghold 主密钥长度不正确。".to_string());
            }
            Ok(key)
        }
        Err(keyring::Error::NoEntry) => {
            let mut key = vec![0_u8; 32];
            OsRng.fill_bytes(&mut key);
            entry
                .set_password(&general_purpose::STANDARD.encode(&key))
                .map_err(|_| "无法用 Windows 凭据管理器保护 Stronghold 主密钥。".to_string())?;
            Ok(key)
        }
        Err(_) => Err("读取 Stronghold 主密钥失败。".to_string()),
    }
}

fn vault_path() -> Result<&'static PathBuf, String> {
    VAULT_PATH
        .get()
        .ok_or_else(|| "Stronghold 尚未初始化。".to_string())
}

fn open_vault() -> Result<Stronghold, String> {
    let path = vault_path()?;
    let key = master_key()?;
    let stronghold = match Stronghold::new(path, key.clone()) {
        Ok(s) => s,
        Err(error) => {
            if path.exists() {
                let _ = fs::remove_file(path);
                Stronghold::new(path, key)
                    .map_err(|e| format!("损坏回滚后重新创建 Stronghold 失败：{e}"))?
            } else {
                return Err(format!("打开 Stronghold 失败：{error}"));
            }
        }
    };
    if stronghold.load_client(CLIENT_NAME).is_err() {
        stronghold
            .create_client(CLIENT_NAME)
            .map_err(|error| format!("创建 Stronghold 客户端失败：{error}"))?;
    }
    Ok(stronghold)
}

pub fn initialize<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> Result<(), String> {
    let directory = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("secure");
    fs::create_dir_all(&directory).map_err(|error| format!("创建 Stronghold 目录失败：{error}"))?;
    let path = directory.join("vault.hold");
    if let Some(existing) = VAULT_PATH.get() {
        if existing != &path {
            return Err("Stronghold 已用不同路径初始化。".to_string());
        }
    } else {
        VAULT_PATH
            .set(path)
            .map_err(|_| "Stronghold 路径初始化失败。".to_string())?;
    }
    let _guard = VAULT_LOCK
        .lock()
        .map_err(|_| "Stronghold 锁已损坏。".to_string())?;
    let vault = open_vault()?;
    vault
        .save()
        .map_err(|error| format!("初始化 Stronghold 快照失败：{error}"))
}

fn migrate_legacy_credential(name: &str) -> Result<Option<String>, String> {
    let legacy = credential(name)?;
    match legacy.get_password() {
        Ok(value) => {
            set_secret(name, &value)?;
            legacy
                .delete_credential()
                .map_err(|_| "迁移旧安全凭据后无法删除原条目。".to_string())?;
            Ok(Some(value))
        }
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(_) => Err("读取旧安全凭据失败。".to_string()),
    }
}

pub fn set_secret(name: &str, value: &str) -> Result<(), String> {
    validate_name(name)?;
    if value.len() > MAX_SECRET_BYTES {
        return Err("安全存储值超过 16 KB 限制。".to_string());
    }
    let _guard = VAULT_LOCK
        .lock()
        .map_err(|_| "Stronghold 锁已损坏。".to_string())?;
    let vault = open_vault()?;
    let client = vault
        .get_client(CLIENT_NAME)
        .map_err(|error| format!("读取 Stronghold 客户端失败：{error}"))?;
    client
        .store()
        .insert(name.as_bytes().to_vec(), value.as_bytes().to_vec(), None)
        .map_err(|error| format!("写入 Stronghold 失败：{error}"))?;
    vault
        .save()
        .map_err(|error| format!("保存 Stronghold 快照失败：{error}"))
}

pub fn get_secret(name: &str) -> Result<Option<String>, String> {
    validate_name(name)?;
    let value = {
        let _guard = VAULT_LOCK
            .lock()
            .map_err(|_| "Stronghold 锁已损坏。".to_string())?;
        let vault = open_vault()?;
        let client = vault
            .get_client(CLIENT_NAME)
            .map_err(|error| format!("读取 Stronghold 客户端失败：{error}"))?;
        client
            .store()
            .get(name.as_bytes())
            .map_err(|error| format!("读取 Stronghold 失败：{error}"))?
    };
    match value {
        Some(bytes) => String::from_utf8(bytes)
            .map(Some)
            .map_err(|_| "Stronghold 条目不是有效文本。".to_string()),
        None => migrate_legacy_credential(name),
    }
}

pub fn delete_secret(name: &str) -> Result<(), String> {
    validate_name(name)?;
    let _guard = VAULT_LOCK
        .lock()
        .map_err(|_| "Stronghold 锁已损坏。".to_string())?;
    let vault = open_vault()?;
    let client = vault
        .get_client(CLIENT_NAME)
        .map_err(|error| format!("读取 Stronghold 客户端失败：{error}"))?;
    let _ = client
        .store()
        .delete(name.as_bytes())
        .map_err(|error| format!("删除 Stronghold 条目失败：{error}"))?;
    vault
        .save()
        .map_err(|error| format!("保存 Stronghold 快照失败：{error}"))?;
    match credential(name)?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(_) => Err("清理旧安全凭据失败。".to_string()),
    }
}

pub fn purge_installed_user_data() -> Result<(), String> {
    match credential(MASTER_KEY_NAME)?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => {}
        Err(_) => return Err("无法清除 Stronghold 主密钥凭据。".to_string()),
    }
    let roaming = std::env::var_os("APPDATA")
        .map(PathBuf::from)
        .ok_or_else(|| "无法定位 Windows AppData 目录。".to_string())?;
    let data_dir = roaming.join(APP_DATA_DIRECTORY);
    if data_dir == roaming || !data_dir.starts_with(&roaming) {
        return Err("拒绝清除不安全的数据路径。".to_string());
    }
    if data_dir.exists() {
        fs::remove_dir_all(&data_dir)
            .map_err(|error| format!("彻底清除 Lumpa 本地数据失败：{error}"))?;
    }
    Ok(())
}

#[tauri::command]
pub fn secure_store_set(name: String, value: String) -> Result<(), String> {
    if !(name.starts_with("provider:") || name.starts_with("auth:") || name.starts_with("vault:")) {
        return Err("不允许写入该安全存储命名空间。".to_string());
    }
    set_secret(&name, &value)
}

#[tauri::command]
pub fn secure_store_delete(name: String) -> Result<(), String> {
    if !(name.starts_with("provider:") || name.starts_with("auth:") || name.starts_with("vault:")) {
        return Err("不允许删除该安全存储命名空间。".to_string());
    }
    delete_secret(&name)
}

#[cfg(test)]
mod tests {
    use super::validate_name;

    #[test]
    fn validates_vault_entry_names() {
        assert!(validate_name("provider:main:api_key").is_ok());
        assert!(validate_name("../secret").is_err());
        assert!(validate_name("bad name").is_err());
    }
}
