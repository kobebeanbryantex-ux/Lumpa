use crate::{
    core_types::{BackupEnvelope, PetPackageManifest, ProviderProfile, UsageRule},
    storage::{rebuild_kind, upsert_document, StorageState, SCHEMA_VERSION},
};
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{Algorithm, Argon2, Params, Version};
use base64::{engine::general_purpose, Engine as _};
use chrono::Utc;
use rand::{rngs::OsRng, RngCore};
use rusqlite::{params, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    collections::BTreeMap,
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    path::{Path, PathBuf},
};
use zip::{write::SimpleFileOptions, CompressionMethod, ZipArchive, ZipWriter};

const BACKUP_FORMAT_VERSION: u32 = 1;
const PET_PACKAGE_FORMAT_VERSION: u32 = 1;
const MAX_BACKUP_FILE_BYTES: u64 = 768 * 1024 * 1024;
const MAX_PACKAGE_FILE_BYTES: u64 = 256 * 1024 * 1024;
const MAX_PACKAGE_ENTRIES: usize = 256;
const MAX_PACKAGE_EXPANDED_BYTES: u64 = 256 * 1024 * 1024;
const MAX_SINGLE_PACKAGE_ASSET: u64 = 64 * 1024 * 1024;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PortableBackup {
    format: String,
    format_version: u32,
    schema_version: u32,
    created_at: String,
    documents: BTreeMap<String, Value>,
    provider_profiles: Vec<ProviderProfile>,
    usage_rules: Vec<UsageRule>,
    usage_daily: Vec<UsageDailyRow>,
    usage_apps_daily: Vec<UsageAppRow>,
    #[serde(default)]
    usage_hourly: Vec<UsageHourlyRow>,
    assets: BTreeMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct UsageDailyRow {
    local_date: String,
    iso_week: String,
    active_seconds: u64,
    idle_seconds: u64,
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct UsageAppRow {
    local_date: String,
    app_id: String,
    app_name: String,
    active_seconds: u64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct UsageHourlyRow {
    local_date: String,
    hour: u8,
    active_seconds: u64,
}

fn validate_passphrase(passphrase: &str) -> Result<(), String> {
    let characters = passphrase.chars().count();
    if !(10..=1024).contains(&characters) {
        return Err("备份口令须为 10 到 1024 个字符。".to_string());
    }
    Ok(())
}

fn derive_key(
    passphrase: &str,
    salt: &[u8],
    memory_kib: u32,
    iterations: u32,
    parallelism: u32,
) -> Result<[u8; 32], String> {
    let parameters = Params::new(memory_kib, iterations, parallelism, Some(32))
        .map_err(|_| "备份 KDF 参数不合法。".to_string())?;
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, parameters);
    let mut key = [0u8; 32];
    argon2
        .hash_password_into(passphrase.as_bytes(), salt, &mut key)
        .map_err(|_| "Argon2id 密钥派生失败。".to_string())?;
    Ok(key)
}

fn validate_export_path(path: &str, extension: &str) -> Result<PathBuf, String> {
    let path = PathBuf::from(path);
    if !path.is_absolute() || path.extension().and_then(|value| value.to_str()) != Some(extension) {
        return Err(format!("导出路径必须是绝对路径并以 .{} 结尾。", extension));
    }
    let parent = path
        .parent()
        .ok_or_else(|| "导出路径缺少父目录。".to_string())?;
    if !parent.is_dir() {
        return Err("导出目录不存在。".to_string());
    }
    Ok(path)
}

fn validate_import_path(path: &str, extension: &str, max_bytes: u64) -> Result<PathBuf, String> {
    let path = PathBuf::from(path);
    if !path.is_absolute() || path.extension().and_then(|value| value.to_str()) != Some(extension) {
        return Err(format!("导入文件必须是绝对路径并以 .{} 结尾。", extension));
    }
    let metadata = fs::metadata(&path).map_err(|error| format!("无法读取导入文件：{}", error))?;
    if !metadata.is_file() || metadata.len() > max_bytes {
        return Err("导入文件类型或体积不符合限制。".to_string());
    }
    Ok(path)
}

fn snapshot_backup(state: &StorageState) -> Result<PortableBackup, String> {
    let connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let mut documents = BTreeMap::new();
    {
        let mut statement = connection
            .prepare("SELECT kind,payload_json FROM documents ORDER BY kind")
            .map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })
            .map_err(|error| error.to_string())?;
        for row in rows {
            let (kind, payload) = row.map_err(|error| error.to_string())?;
            documents.insert(
                kind,
                serde_json::from_str(&payload).map_err(|error| error.to_string())?,
            );
        }
    }
    let query_json_rows = |sql: &str| -> Result<Vec<String>, String> {
        let mut statement = connection.prepare(sql).map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([], |row| row.get::<_, String>(0))
            .map_err(|error| error.to_string())?;
        rows.map(|row| row.map_err(|error| error.to_string()))
            .collect()
    };
    let provider_profiles =
        query_json_rows("SELECT payload_json FROM provider_profiles ORDER BY id")?
            .into_iter()
            .map(|payload| serde_json::from_str(&payload).map_err(|error| error.to_string()))
            .collect::<Result<Vec<_>, _>>()?;
    let usage_rules = query_json_rows("SELECT payload_json FROM usage_rules ORDER BY id")?
        .into_iter()
        .map(|payload| serde_json::from_str(&payload).map_err(|error| error.to_string()))
        .collect::<Result<Vec<_>, _>>()?;
    let usage_daily = {
        let mut statement = connection.prepare("SELECT local_date,iso_week,active_seconds,idle_seconds,updated_at FROM usage_daily ORDER BY local_date").map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([], |row| {
                Ok(UsageDailyRow {
                    local_date: row.get(0)?,
                    iso_week: row.get(1)?,
                    active_seconds: row.get(2)?,
                    idle_seconds: row.get(3)?,
                    updated_at: row.get(4)?,
                })
            })
            .map_err(|error| error.to_string())?;
        rows.map(|row| row.map_err(|error| error.to_string()))
            .collect::<Result<Vec<_>, _>>()?
    };
    let usage_apps_daily = {
        let mut statement = connection.prepare("SELECT local_date,app_id,app_name,active_seconds FROM usage_apps_daily ORDER BY local_date,app_id").map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([], |row| {
                Ok(UsageAppRow {
                    local_date: row.get(0)?,
                    app_id: row.get(1)?,
                    app_name: row.get(2)?,
                    active_seconds: row.get(3)?,
                })
            })
            .map_err(|error| error.to_string())?;
        rows.map(|row| row.map_err(|error| error.to_string()))
            .collect::<Result<Vec<_>, _>>()?
    };
    let usage_hourly = {
        let mut statement = connection
            .prepare(
                "SELECT local_date,hour,active_seconds FROM usage_hourly ORDER BY local_date,hour",
            )
            .map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([], |row| {
                Ok(UsageHourlyRow {
                    local_date: row.get(0)?,
                    hour: row.get(1)?,
                    active_seconds: row.get(2)?,
                })
            })
            .map_err(|error| error.to_string())?;
        rows.map(|row| row.map_err(|error| error.to_string()))
            .collect::<Result<Vec<_>, _>>()?
    };
    drop(connection);
    let mut assets = BTreeMap::new();
    for entry in fs::read_dir(&state.assets_dir)
        .map_err(|error| error.to_string())?
        .flatten()
    {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let name = entry.file_name().to_string_lossy().to_string();
        let bytes = fs::read(path).map_err(|error| error.to_string())?;
        if bytes.len() > MAX_SINGLE_PACKAGE_ASSET as usize {
            return Err(format!("素材 {} 超过备份限制。", name));
        }
        assets.insert(name, general_purpose::STANDARD.encode(bytes));
    }
    Ok(PortableBackup {
        format: "lumpa-backup-content".to_string(),
        format_version: BACKUP_FORMAT_VERSION,
        schema_version: SCHEMA_VERSION,
        created_at: Utc::now().to_rfc3339(),
        documents,
        provider_profiles,
        usage_rules,
        usage_daily,
        usage_apps_daily,
        usage_hourly,
        assets,
    })
}

fn encrypt_backup(content: &PortableBackup, passphrase: &str) -> Result<BackupEnvelope, String> {
    validate_passphrase(passphrase)?;
    let memory_kib = 64 * 1024;
    let iterations = 3;
    let parallelism = 1;
    let mut salt = [0u8; 16];
    OsRng.fill_bytes(&mut salt);
    let mut nonce = [0u8; 12];
    OsRng.fill_bytes(&mut nonce);
    let key = derive_key(passphrase, &salt, memory_kib, iterations, parallelism)?;
    let plaintext = serde_json::to_vec(content).map_err(|error| error.to_string())?;
    let ciphertext = Aes256Gcm::new_from_slice(&key)
        .map_err(|_| "创建备份加密器失败。".to_string())?
        .encrypt(Nonce::from_slice(&nonce), plaintext.as_ref())
        .map_err(|_| "加密备份失败。".to_string())?;
    Ok(BackupEnvelope {
        format: "lumpa-backup".to_string(),
        format_version: BACKUP_FORMAT_VERSION,
        created_at: Utc::now().to_rfc3339(),
        kdf: "argon2id".to_string(),
        memory_kib,
        iterations,
        parallelism,
        salt: general_purpose::STANDARD.encode(salt),
        nonce: general_purpose::STANDARD.encode(nonce),
        ciphertext: general_purpose::STANDARD.encode(ciphertext),
    })
}

fn decrypt_backup(envelope: BackupEnvelope, passphrase: &str) -> Result<PortableBackup, String> {
    validate_passphrase(passphrase)?;
    if envelope.format != "lumpa-backup"
        || envelope.format_version != BACKUP_FORMAT_VERSION
        || envelope.kdf != "argon2id"
    {
        return Err("不支持的 Lumpa 备份格式。".to_string());
    }
    if envelope.memory_kib < 32 * 1024
        || envelope.memory_kib > 256 * 1024
        || !(2..=10).contains(&envelope.iterations)
        || !(1..=4).contains(&envelope.parallelism)
    {
        return Err("备份 KDF 参数超出安全范围。".to_string());
    }
    let salt = general_purpose::STANDARD
        .decode(envelope.salt)
        .map_err(|_| "备份盐值损坏。".to_string())?;
    let nonce = general_purpose::STANDARD
        .decode(envelope.nonce)
        .map_err(|_| "备份 nonce 损坏。".to_string())?;
    let ciphertext = general_purpose::STANDARD
        .decode(envelope.ciphertext)
        .map_err(|_| "备份密文损坏。".to_string())?;
    if salt.len() != 16 || nonce.len() != 12 {
        return Err("备份加密参数长度不正确。".to_string());
    }
    let key = derive_key(
        passphrase,
        &salt,
        envelope.memory_kib,
        envelope.iterations,
        envelope.parallelism,
    )?;
    let plaintext = Aes256Gcm::new_from_slice(&key)
        .map_err(|_| "创建备份解密器失败。".to_string())?
        .decrypt(Nonce::from_slice(&nonce), ciphertext.as_ref())
        .map_err(|_| "备份口令错误或文件已被篡改。".to_string())?;
    let content: PortableBackup =
        serde_json::from_slice(&plaintext).map_err(|_| "备份内容损坏。".to_string())?;
    if content.format != "lumpa-backup-content" || content.format_version != BACKUP_FORMAT_VERSION {
        return Err("不支持的备份内容版本。".to_string());
    }
    Ok(content)
}

#[tauri::command]
pub fn create_encrypted_backup(
    state: tauri::State<'_, StorageState>,
    destination: String,
    passphrase: String,
) -> Result<String, String> {
    let path = validate_export_path(&destination, "lumpa-backup")?;
    let envelope = encrypt_backup(&snapshot_backup(&state)?, &passphrase)?;
    let bytes = serde_json::to_vec(&envelope).map_err(|error| error.to_string())?;
    let mut file = OpenOptions::new()
        .create_new(true)
        .write(true)
        .open(&path)
        .map_err(|error| format!("创建备份失败（不会覆盖已有文件）：{}", error))?;
    file.write_all(&bytes).map_err(|error| error.to_string())?;
    file.sync_all().map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn restore_encrypted_backup(
    state: tauri::State<'_, StorageState>,
    source: String,
    passphrase: String,
) -> Result<(), String> {
    let path = validate_import_path(&source, "lumpa-backup", MAX_BACKUP_FILE_BYTES)?;
    let bytes = fs::read(path).map_err(|error| error.to_string())?;
    let envelope: BackupEnvelope =
        serde_json::from_slice(&bytes).map_err(|_| "备份信封损坏。".to_string())?;
    let content = decrypt_backup(envelope, &passphrase)?;
    let mut prepared_assets = Vec::new();
    let mut total_asset_bytes = 0u64;
    for (name, encoded) in &content.assets {
        let safe_name = Path::new(name)
            .file_name()
            .and_then(|value| value.to_str())
            .filter(|value| *value == name)
            .ok_or_else(|| "备份包含不安全的素材路径。".to_string())?;
        let (expected_hash, _) = safe_name
            .split_once('.')
            .ok_or_else(|| "备份素材名称缺少哈希。".to_string())?;
        if expected_hash.len() != 64 || !expected_hash.bytes().all(|byte| byte.is_ascii_hexdigit())
        {
            return Err("备份素材哈希不合法。".to_string());
        }
        let decoded = general_purpose::STANDARD
            .decode(encoded)
            .map_err(|_| "备份素材 base64 损坏。".to_string())?;
        total_asset_bytes = total_asset_bytes.saturating_add(decoded.len() as u64);
        if decoded.len() as u64 > MAX_SINGLE_PACKAGE_ASSET
            || total_asset_bytes > MAX_PACKAGE_EXPANDED_BYTES * 2
        {
            return Err("备份素材超出恢复预算。".to_string());
        }
        if hex::encode(Sha256::digest(&decoded)) != expected_hash {
            return Err(format!("备份素材 {} 哈希不匹配。", name));
        }
        prepared_assets.push((name.clone(), decoded));
    }
    for (name, bytes) in &prepared_assets {
        let target = state.assets_dir.join(name);
        if !target.exists() {
            fs::write(target, bytes).map_err(|error| error.to_string())?;
        }
    }
    let mut connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    for (kind, value) in &content.documents {
        if !matches!(kind.as_str(), "settings" | "pets" | "chat") {
            continue;
        }
        upsert_document(&transaction, kind, value)?;
        rebuild_kind(&transaction, kind, value)?;
    }
    transaction
        .execute("DELETE FROM provider_profiles", [])
        .map_err(|error| error.to_string())?;
    for profile in content.provider_profiles {
        transaction
            .execute(
                "INSERT INTO provider_profiles(id,payload_json,updated_at) VALUES(?1,?2,?3)",
                params![
                    profile.id,
                    serde_json::to_string(&profile).map_err(|error| error.to_string())?,
                    Utc::now().to_rfc3339()
                ],
            )
            .map_err(|error| error.to_string())?;
    }
    transaction
        .execute("DELETE FROM usage_rules", [])
        .map_err(|error| error.to_string())?;
    for rule in content.usage_rules {
        transaction
            .execute(
                "INSERT INTO usage_rules(id,payload_json,updated_at) VALUES(?1,?2,?3)",
                params![
                    rule.id,
                    serde_json::to_string(&rule).map_err(|error| error.to_string())?,
                    Utc::now().to_rfc3339()
                ],
            )
            .map_err(|error| error.to_string())?;
    }
    transaction
        .execute("DELETE FROM usage_apps_daily", [])
        .map_err(|error| error.to_string())?;
    transaction
        .execute("DELETE FROM usage_hourly", [])
        .map_err(|error| error.to_string())?;
    transaction
        .execute("DELETE FROM usage_daily", [])
        .map_err(|error| error.to_string())?;
    for row in content.usage_daily {
        transaction.execute("INSERT INTO usage_daily(local_date,iso_week,active_seconds,idle_seconds,updated_at) VALUES(?1,?2,?3,?4,?5)", params![row.local_date,row.iso_week,row.active_seconds,row.idle_seconds,row.updated_at]).map_err(|error| error.to_string())?;
    }
    for row in content.usage_apps_daily {
        transaction.execute("INSERT INTO usage_apps_daily(local_date,app_id,app_name,active_seconds) VALUES(?1,?2,?3,?4)", params![row.local_date,row.app_id,row.app_name,row.active_seconds]).map_err(|error| error.to_string())?;
    }
    for row in content.usage_hourly {
        if row.hour > 23 {
            return Err("备份包含无效的小时统计。".to_string());
        }
        transaction
            .execute(
                "INSERT INTO usage_hourly(local_date,hour,active_seconds) VALUES(?1,?2,?3)",
                params![row.local_date, row.hour, row.active_seconds],
            )
            .map_err(|error| error.to_string())?;
    }
    transaction.commit().map_err(|error| error.to_string())
}

fn collect_asset_references(
    value: &Value,
    references: &mut BTreeMap<String, String>,
) -> Result<(), String> {
    match value {
        Value::String(text) if text.starts_with("lumpa-asset:") => {
            let mut parts = text.splitn(4, ':');
            parts.next();
            let hash = parts
                .next()
                .ok_or_else(|| "宠物素材引用缺少哈希。".to_string())?;
            parts
                .next()
                .ok_or_else(|| "宠物素材引用缺少类型。".to_string())?;
            let extension = parts
                .next()
                .ok_or_else(|| "宠物素材引用缺少扩展名。".to_string())?;
            if hash.len() != 64
                || !hash.bytes().all(|byte| byte.is_ascii_hexdigit())
                || !extension.bytes().all(|byte| byte.is_ascii_alphanumeric())
            {
                return Err("宠物素材引用不合法。".to_string());
            }
            references.insert(hash.to_string(), format!("assets/{}.{}", hash, extension));
        }
        Value::Array(items) => {
            for item in items {
                collect_asset_references(item, references)?;
            }
        }
        Value::Object(object) => {
            for item in object.values() {
                collect_asset_references(item, references)?;
            }
        }
        _ => {}
    }
    Ok(())
}

#[tauri::command]
pub fn export_pet_package(
    state: tauri::State<'_, StorageState>,
    pet_id: String,
    destination: String,
) -> Result<String, String> {
    let path = validate_export_path(&destination, "lumpa-pet")?;
    let connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let profile_json: String = connection
        .query_row(
            "SELECT profile_json FROM pets WHERE id=?1",
            [&pet_id],
            |row| row.get(0),
        )
        .map_err(|_| "未找到要导出的宠物。".to_string())?;
    drop(connection);
    let pet: Value = serde_json::from_str(&profile_json).map_err(|error| error.to_string())?;
    let mut assets = BTreeMap::new();
    collect_asset_references(&pet, &mut assets)?;
    let mut package_nonce = [0u8; 8];
    OsRng.fill_bytes(&mut package_nonce);
    let manifest = PetPackageManifest {
        format: "lumpa-pet".to_string(),
        format_version: PET_PACKAGE_FORMAT_VERSION,
        package_id: hex::encode(package_nonce),
        pet_id: pet_id.clone(),
        name: pet
            .get("name")
            .and_then(Value::as_str)
            .unwrap_or("Lumpa 宠物")
            .to_string(),
        species: pet
            .get("species")
            .and_then(Value::as_str)
            .unwrap_or("custom")
            .to_string(),
        created_at: Utc::now().to_rfc3339(),
        pet,
        assets: assets.clone(),
    };
    let file = OpenOptions::new()
        .create_new(true)
        .write(true)
        .open(&path)
        .map_err(|error| format!("创建宠物包失败（不会覆盖已有文件）：{}", error))?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default()
        .compression_method(CompressionMethod::Deflated)
        .unix_permissions(0o600);
    zip.start_file("manifest.json", options)
        .map_err(|error| error.to_string())?;
    zip.write_all(&serde_json::to_vec_pretty(&manifest).map_err(|error| error.to_string())?)
        .map_err(|error| error.to_string())?;
    for path_in_zip in assets.values() {
        let filename = path_in_zip.trim_start_matches("assets/");
        let bytes = fs::read(state.assets_dir.join(filename))
            .map_err(|_| format!("宠物素材 {} 缺失。", filename))?;
        let expected_hash = filename.split('.').next().unwrap_or_default();
        if hex::encode(Sha256::digest(&bytes)) != expected_hash {
            return Err(format!("宠物素材 {} 哈希校验失败。", filename));
        }
        zip.start_file(path_in_zip, options)
            .map_err(|error| error.to_string())?;
        zip.write_all(&bytes).map_err(|error| error.to_string())?;
    }
    zip.finish().map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

fn read_package_entries(
    path: &Path,
) -> Result<(PetPackageManifest, BTreeMap<String, Vec<u8>>), String> {
    let file = File::open(path).map_err(|error| error.to_string())?;
    let mut archive = ZipArchive::new(file).map_err(|_| "宠物包不是有效 ZIP。".to_string())?;
    if archive.is_empty() || archive.len() > MAX_PACKAGE_ENTRIES {
        return Err("宠物包条目数量超出限制。".to_string());
    }
    let mut total = 0u64;
    let mut manifest_bytes = None;
    let mut assets = BTreeMap::new();
    for index in 0..archive.len() {
        let mut entry = archive.by_index(index).map_err(|error| error.to_string())?;
        let enclosed = entry
            .enclosed_name()
            .ok_or_else(|| "宠物包包含路径穿越条目。".to_string())?
            .to_path_buf();
        if entry.is_dir() {
            continue;
        }
        if entry.size() > MAX_SINGLE_PACKAGE_ASSET {
            return Err("宠物包单个条目超过 64 MB。".to_string());
        }
        if entry.compressed_size() > 0 && entry.size() / entry.compressed_size().max(1) > 200 {
            return Err("宠物包压缩比异常。".to_string());
        }
        total = total.saturating_add(entry.size());
        if total > MAX_PACKAGE_EXPANDED_BYTES {
            return Err("宠物包解压后超过 256 MB。".to_string());
        }
        let mut bytes = Vec::with_capacity(entry.size() as usize);
        entry
            .read_to_end(&mut bytes)
            .map_err(|error| error.to_string())?;
        let normalized = enclosed.to_string_lossy().replace('\\', "/");
        if normalized == "manifest.json" {
            if bytes.len() > 1024 * 1024 || manifest_bytes.replace(bytes).is_some() {
                return Err("宠物包 manifest 重复或过大。".to_string());
            }
        } else if normalized.starts_with("assets/") {
            if assets.insert(normalized, bytes).is_some() {
                return Err("宠物包包含重复素材路径。".to_string());
            }
        } else {
            return Err("宠物包包含未知条目。".to_string());
        }
    }
    let manifest: PetPackageManifest =
        serde_json::from_slice(&manifest_bytes.ok_or_else(|| "宠物包缺少 manifest。".to_string())?)
            .map_err(|_| "宠物包 manifest 损坏。".to_string())?;
    if manifest.format != "lumpa-pet"
        || manifest.format_version != PET_PACKAGE_FORMAT_VERSION
        || manifest.pet_id.is_empty()
    {
        return Err("不支持的宠物包格式。".to_string());
    }
    if manifest.assets.len() != assets.len() {
        return Err("宠物包素材清单与文件不一致。".to_string());
    }
    for (hash, asset_path) in &manifest.assets {
        let bytes = assets
            .get(asset_path)
            .ok_or_else(|| format!("宠物包缺少素材 {}。", asset_path))?;
        if hash.len() != 64 || hex::encode(Sha256::digest(bytes)) != *hash {
            return Err(format!("宠物包素材 {} 哈希不匹配。", asset_path));
        }
    }
    Ok((manifest, assets))
}

#[tauri::command]
pub fn import_pet_package(
    state: tauri::State<'_, StorageState>,
    source: String,
    replace_existing: bool,
) -> Result<String, String> {
    let path = validate_import_path(&source, "lumpa-pet", MAX_PACKAGE_FILE_BYTES)?;
    let (manifest, assets) = read_package_entries(&path)?;
    let mut pet = manifest.pet.clone();
    if pet.get("id").and_then(Value::as_str) != Some(manifest.pet_id.as_str()) {
        return Err("宠物包 ID 与 manifest 不一致。".to_string());
    }
    for (asset_path, bytes) in assets {
        let filename = asset_path.trim_start_matches("assets/");
        let target = state.assets_dir.join(filename);
        if !target.exists() {
            fs::write(target, bytes).map_err(|error| error.to_string())?;
        }
    }
    let mut connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let exists: bool = connection
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM pets WHERE id=?1)",
            [&manifest.pet_id],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())?;
    if exists && !replace_existing {
        return Err("宠物 ID 已存在；请明确选择替换。".to_string());
    }
    let current_payload: Option<String> = connection
        .query_row(
            "SELECT payload_json FROM documents WHERE kind='pets'",
            [],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())?;
    let mut document: Value = current_payload
        .as_deref()
        .map(serde_json::from_str)
        .transpose()
        .map_err(|error| error.to_string())?
        .unwrap_or_else(|| json!({"version": 7, "activePetId": manifest.pet_id, "pets": []}));
    let pets = document
        .get_mut("pets")
        .and_then(Value::as_array_mut)
        .ok_or_else(|| "宠物文档结构损坏。".to_string())?;
    if let Some(index) = pets
        .iter()
        .position(|value| value.get("id").and_then(Value::as_str) == Some(manifest.pet_id.as_str()))
    {
        pets.remove(index);
    }
    pets.push(std::mem::take(&mut pet));
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    upsert_document(&transaction, "pets", &document)?;
    rebuild_kind(&transaction, "pets", &document)?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(manifest.pet_id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn backup_tampering_is_rejected() {
        let content = PortableBackup {
            format: "lumpa-backup-content".to_string(),
            format_version: 1,
            schema_version: 1,
            created_at: Utc::now().to_rfc3339(),
            documents: BTreeMap::new(),
            provider_profiles: vec![],
            usage_rules: vec![],
            usage_daily: vec![],
            usage_apps_daily: vec![],
            usage_hourly: vec![],
            assets: BTreeMap::new(),
        };
        let mut envelope = encrypt_backup(&content, "correct horse battery staple").unwrap();
        envelope.ciphertext.push('A');
        assert!(decrypt_backup(envelope, "correct horse battery staple").is_err());
    }

    #[test]
    fn backup_wrong_passphrase_is_rejected() {
        let content = PortableBackup {
            format: "lumpa-backup-content".to_string(),
            format_version: 1,
            schema_version: 1,
            created_at: Utc::now().to_rfc3339(),
            documents: BTreeMap::new(),
            provider_profiles: vec![],
            usage_rules: vec![],
            usage_daily: vec![],
            usage_apps_daily: vec![],
            usage_hourly: vec![],
            assets: BTreeMap::new(),
        };
        let envelope = encrypt_backup(&content, "correct horse battery staple").unwrap();
        assert!(decrypt_backup(envelope, "completely different passphrase").is_err());
    }

    #[test]
    fn pet_package_path_traversal_is_rejected() {
        let path = std::env::temp_dir().join(format!(
            "lumpa-path-traversal-{}-{}.lumpa-pet",
            std::process::id(),
            Utc::now().timestamp_nanos_opt().unwrap_or_default()
        ));
        let file = File::create(&path).unwrap();
        let mut writer = ZipWriter::new(file);
        writer
            .start_file("../manifest.json", SimpleFileOptions::default())
            .unwrap();
        writer.write_all(b"{}").unwrap();
        writer.finish().unwrap();

        let result = read_package_entries(&path);
        let _ = fs::remove_file(path);
        assert!(result.is_err());
    }
}
