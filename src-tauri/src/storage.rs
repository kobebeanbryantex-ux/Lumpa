use crate::core_types::{MigrationReport, ProviderProfile, UsageRule};
use crate::secure_store;
use base64::{engine::general_purpose, Engine as _};
use chrono::{Duration as ChronoDuration, Local, Utc};
use rand::{rngs::OsRng, RngCore};
use rusqlite::{params, Connection, OptionalExtension, Transaction};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeMap, HashSet},
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
    time::Duration,
};
use tauri::Manager;

pub(crate) const SCHEMA_VERSION: u32 = 2;
const MAX_DOCUMENT_BYTES: usize = 96 * 1024 * 1024;
const MAX_ASSET_BYTES: usize = 64 * 1024 * 1024;
const SECRET_FIELDS: &[&str] = &["apiKey", "ttsApiKey", "imageApiKey", "videoApiKey"];

pub struct StorageState {
    pub(crate) connection: Mutex<Connection>,
    pub(crate) database_path: PathBuf,
    pub(crate) assets_dir: PathBuf,
    pub(crate) backups_dir: PathBuf,
    pub(crate) logs_dir: PathBuf,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LegacyMigrationPayload {
    pub from_version: Option<u32>,
    pub documents: BTreeMap<String, Value>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BootstrapData {
    pub schema_version: u32,
    pub documents: BTreeMap<String, Value>,
    pub migration: Option<MigrationReport>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PrivacySummary {
    pub settings: u64,
    pub pets: u64,
    pub actions: u64,
    pub memories: u64,
    pub chats: u64,
    pub usage_days: u64,
    pub usage_rules: u64,
    pub assets: u64,
    pub log_files: u64,
    pub rollback_backups: u64,
}

#[derive(Debug, Default)]
pub struct UsageSeed {
    pub active_seconds: u64,
    pub idle_seconds: u64,
    pub apps: Vec<(String, String, u64)>,
    pub hourly_active_seconds: Vec<u64>,
    pub daily_active_seconds: Vec<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageMonthSnapshot {
    pub month: String,
    pub days: Vec<UsageMonthDay>,
    pub apps: Vec<UsageMonthApp>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageMonthDay {
    pub local_date: String,
    pub active_seconds: u64,
    pub idle_seconds: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageMonthApp {
    pub app_id: String,
    pub app_name: String,
    pub active_seconds: u64,
}

impl StorageState {
    pub fn open(app: &tauri::AppHandle) -> Result<Self, String> {
        let data_dir = app
            .path()
            .app_data_dir()
            .map_err(|error| format!("无法定位应用数据目录：{}", error))?;
        let assets_dir = data_dir.join("assets");
        let backups_dir = data_dir.join("backups");
        let logs_dir = data_dir.join("logs");
        for directory in [&data_dir, &assets_dir, &backups_dir, &logs_dir] {
            fs::create_dir_all(directory)
                .map_err(|error| format!("创建数据目录失败：{}", error))?;
        }
        let database_path = data_dir.join("lumpa.sqlite3");
        let connection = Connection::open(&database_path)
            .map_err(|error| format!("打开 SQLite 失败：{}", error))?;
        connection
            .busy_timeout(Duration::from_secs(5))
            .map_err(|error| error.to_string())?;
        connection
            .execute_batch(
                "PRAGMA journal_mode=WAL;
                 PRAGMA foreign_keys=ON;
                 PRAGMA synchronous=FULL;
                 PRAGMA secure_delete=ON;",
            )
            .map_err(|error| error.to_string())?;
        migrate_schema(&connection)?;
        purge_expired_rollbacks(&backups_dir)?;
        Ok(Self {
            connection: Mutex::new(connection),
            database_path,
            assets_dir,
            backups_dir,
            logs_dir,
        })
    }
}

fn migrate_schema(connection: &Connection) -> Result<(), String> {
    connection
        .execute_batch(
            "CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                applied_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS documents (
                kind TEXT PRIMARY KEY,
                format_version INTEGER NOT NULL,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS pets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                species TEXT NOT NULL,
                profile_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS actions (
                id TEXT PRIMARY KEY,
                pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                loop_start INTEGER,
                loop_end INTEGER,
                anchor_x REAL NOT NULL DEFAULT 0.5,
                anchor_y REAL NOT NULL DEFAULT 0.92,
                metadata_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS action_frames (
                action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
                frame_index INTEGER NOT NULL,
                asset_hash TEXT NOT NULL,
                duration_ms INTEGER NOT NULL,
                crop_json TEXT NOT NULL,
                PRIMARY KEY(action_id, frame_index)
             );
             CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
                kind TEXT NOT NULL,
                content_json TEXT NOT NULL,
                created_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                pet_id TEXT REFERENCES pets(id) ON DELETE SET NULL,
                title TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                role TEXT NOT NULL CHECK(role IN ('user','assistant','system')),
                content_json TEXT NOT NULL,
                created_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS usage_daily (
                local_date TEXT PRIMARY KEY,
                iso_week TEXT NOT NULL,
                active_seconds INTEGER NOT NULL DEFAULT 0,
                idle_seconds INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS usage_apps_daily (
                local_date TEXT NOT NULL,
                app_id TEXT NOT NULL,
                app_name TEXT NOT NULL,
                active_seconds INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY(local_date, app_id)
             );
             CREATE TABLE IF NOT EXISTS usage_hourly (
                local_date TEXT NOT NULL,
                hour INTEGER NOT NULL CHECK(hour BETWEEN 0 AND 23),
                active_seconds INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY(local_date, hour)
             );
             CREATE TABLE IF NOT EXISTS usage_rules (
                id TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS provider_profiles (
                id TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS migration_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_version INTEGER NOT NULL,
                to_version INTEGER NOT NULL,
                status TEXT NOT NULL,
                report_json TEXT NOT NULL,
                created_at TEXT NOT NULL
             );
             CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, id);
             CREATE INDEX IF NOT EXISTS idx_actions_pet ON actions(pet_id);",
        )
        .map_err(|error| format!("创建 SQLite schema 失败：{}", error))?;
    let applied: Option<u32> = connection
        .query_row("SELECT MAX(version) FROM schema_migrations", [], |row| {
            row.get(0)
        })
        .optional()
        .map_err(|error| error.to_string())?
        .flatten();
    if applied.unwrap_or(0) < SCHEMA_VERSION {
        connection
            .execute(
                "INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES(?1, ?2)",
                params![SCHEMA_VERSION, Utc::now().to_rfc3339()],
            )
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

fn purge_expired_rollbacks(directory: &Path) -> Result<(), String> {
    let cutoff = Utc::now() - ChronoDuration::days(30);
    let entries = fs::read_dir(directory).map_err(|error| error.to_string())?;
    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if !name.starts_with("migration-") || !name.ends_with(".lumpa-rollback") {
            continue;
        }
        let modified = entry
            .metadata()
            .ok()
            .and_then(|metadata| metadata.modified().ok())
            .map(chrono::DateTime::<Utc>::from);
        if modified.is_some_and(|value| value < cutoff) {
            remove_rollback_backup(&entry.path())?;
        }
    }
    Ok(())
}

fn rollback_secret_name(path: &Path) -> Option<String> {
    let name = path.file_name()?.to_str()?;
    let id = name
        .strip_prefix("migration-")?
        .strip_suffix(".lumpa-rollback")?;
    (!id.is_empty()).then(|| format!("vault:migration:{id}"))
}

fn remove_rollback_backup(path: &Path) -> Result<(), String> {
    let secret =
        rollback_secret_name(path).ok_or_else(|| "迁移回滚备份文件名不合法。".to_string())?;
    fs::remove_file(path).map_err(|error| format!("删除迁移回滚备份失败：{error}"))?;
    secure_store::delete_secret(&secret)
}

fn extension_for_mime(mime: &str) -> &'static str {
    match mime.to_ascii_lowercase().as_str() {
        "image/png" => "png",
        "image/jpeg" | "image/jpg" => "jpg",
        "image/gif" => "gif",
        "image/webp" => "webp",
        "audio/wav" | "audio/x-wav" => "wav",
        "audio/mpeg" => "mp3",
        "video/mp4" => "mp4",
        _ => "bin",
    }
}

fn parse_data_url(value: &str) -> Result<Option<(String, Vec<u8>)>, String> {
    if !value.starts_with("data:") {
        return Ok(None);
    }
    let (header, encoded) = value
        .split_once(',')
        .ok_or_else(|| "素材 data URL 格式错误。".to_string())?;
    if !header.ends_with(";base64") {
        return Err("只允许 base64 素材 data URL。".to_string());
    }
    let mime = header
        .trim_start_matches("data:")
        .trim_end_matches(";base64")
        .to_string();
    let bytes = general_purpose::STANDARD
        .decode(encoded)
        .map_err(|_| "素材 base64 解码失败。".to_string())?;
    if bytes.len() > MAX_ASSET_BYTES {
        return Err("单个素材超过 64 MB 限制。".to_string());
    }
    Ok(Some((mime, bytes)))
}

pub(crate) fn materialize_assets(
    value: &mut Value,
    directory: &Path,
    hashes: &mut HashSet<String>,
) -> Result<(), String> {
    match value {
        Value::String(text) => {
            if let Some((mime, bytes)) = parse_data_url(text)? {
                let hash = hex::encode(Sha256::digest(&bytes));
                let extension = extension_for_mime(&mime);
                let filename = format!("{}.{}", hash, extension);
                let path = directory.join(&filename);
                if !path.exists() {
                    let temporary = directory.join(format!(".{}.tmp", hash));
                    fs::write(&temporary, &bytes).map_err(|error| error.to_string())?;
                    fs::rename(&temporary, &path).map_err(|error| error.to_string())?;
                }
                hashes.insert(hash.clone());
                *text = format!("lumpa-asset:{}:{}:{}", hash, mime, extension);
            }
        }
        Value::Array(items) => {
            for item in items {
                materialize_assets(item, directory, hashes)?;
            }
        }
        Value::Object(object) => {
            for item in object.values_mut() {
                materialize_assets(item, directory, hashes)?;
            }
        }
        _ => {}
    }
    Ok(())
}

pub(crate) fn hydrate_assets(value: &mut Value, directory: &Path) -> Result<(), String> {
    match value {
        Value::String(text) if text.starts_with("lumpa-asset:") => {
            let mut parts = text.splitn(4, ':');
            let _prefix = parts.next();
            let hash = parts
                .next()
                .ok_or_else(|| "素材引用缺少哈希。".to_string())?;
            let mime = parts
                .next()
                .ok_or_else(|| "素材引用缺少类型。".to_string())?;
            let extension = parts
                .next()
                .ok_or_else(|| "素材引用缺少扩展名。".to_string())?;
            if hash.len() != 64 || !hash.bytes().all(|byte| byte.is_ascii_hexdigit()) {
                return Err("素材哈希不合法。".to_string());
            }
            let path = directory.join(format!("{}.{}", hash, extension));
            let bytes = fs::read(path).map_err(|_| format!("素材 {} 缺失。", hash))?;
            if hex::encode(Sha256::digest(&bytes)) != hash {
                return Err(format!("素材 {} 哈希校验失败。", hash));
            }
            *text = format!(
                "data:{};base64,{}",
                mime,
                general_purpose::STANDARD.encode(bytes)
            );
        }
        Value::Array(items) => {
            for item in items {
                hydrate_assets(item, directory)?;
            }
        }
        Value::Object(object) => {
            for item in object.values_mut() {
                hydrate_assets(item, directory)?;
            }
        }
        _ => {}
    }
    Ok(())
}

fn sanitize_settings(value: &mut Value) -> Result<Vec<(String, String)>, String> {
    let mut secrets = Vec::new();
    let Some(object) = value.as_object_mut() else {
        return Ok(secrets);
    };
    for field in SECRET_FIELDS {
        if let Some(Value::String(secret)) = object.get_mut(*field) {
            let trimmed = secret.trim().to_string();
            secret.clear();
            if !trimmed.is_empty() {
                secrets.push((format!("provider:legacy:{}", field), trimmed));
            }
        }
    }
    Ok(secrets)
}

pub(crate) fn upsert_document(
    transaction: &Transaction<'_>,
    kind: &str,
    value: &Value,
) -> Result<(), String> {
    let payload = serde_json::to_string(value).map_err(|error| error.to_string())?;
    if payload.len() > MAX_DOCUMENT_BYTES {
        return Err(format!("{} 文档超过 96 MB 限制。", kind));
    }
    transaction
        .execute(
            "INSERT INTO documents(kind, format_version, payload_json, updated_at)
             VALUES(?1, ?2, ?3, ?4)
             ON CONFLICT(kind) DO UPDATE SET format_version=excluded.format_version,
             payload_json=excluded.payload_json, updated_at=excluded.updated_at",
            params![kind, SCHEMA_VERSION, payload, Utc::now().to_rfc3339()],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

fn rebuild_settings(transaction: &Transaction<'_>, value: &Value) -> Result<usize, String> {
    transaction
        .execute("DELETE FROM settings", [])
        .map_err(|error| error.to_string())?;
    let Some(object) = value.as_object() else {
        return Ok(0);
    };
    for (key, item) in object {
        transaction
            .execute(
                "INSERT INTO settings(key, value_json, updated_at) VALUES(?1, ?2, ?3)",
                params![key, item.to_string(), Utc::now().to_rfc3339()],
            )
            .map_err(|error| error.to_string())?;
    }
    Ok(object.len())
}

fn rebuild_pets(
    transaction: &Transaction<'_>,
    value: &Value,
) -> Result<(usize, usize, usize), String> {
    transaction
        .execute("DELETE FROM pets", [])
        .map_err(|error| error.to_string())?;
    let pets = value
        .get("pets")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let mut action_count = 0usize;
    let mut memory_count = 0usize;
    for (index, pet) in pets.iter().enumerate() {
        let id = pet
            .get("id")
            .and_then(Value::as_str)
            .map(str::trim)
            .filter(|id| !id.is_empty())
            .map(str::to_string)
            .unwrap_or_else(|| format!("migrated-pet-{}", index));
        let name = pet.get("name").and_then(Value::as_str).unwrap_or("桌宠");
        let species = pet
            .get("species")
            .and_then(Value::as_str)
            .unwrap_or("custom");
        let created_at = pet
            .get("createdAt")
            .and_then(Value::as_i64)
            .and_then(chrono::DateTime::<Utc>::from_timestamp_millis)
            .unwrap_or_else(Utc::now)
            .to_rfc3339();
        transaction.execute(
            "INSERT INTO pets(id,name,species,profile_json,created_at,updated_at) VALUES(?1,?2,?3,?4,?5,?6)",
            params![id, name, species, pet.to_string(), created_at, Utc::now().to_rfc3339()],
        ).map_err(|error| format!("迁移宠物失败：{}", error))?;

        if let Some(memory) = pet.get("memory") {
            transaction.execute(
                "INSERT INTO memories(id,pet_id,kind,content_json,created_at) VALUES(?1,?2,'profile',?3,?4)",
                params![format!("legacy-memory:{}", id), id, memory.to_string(), Utc::now().to_rfc3339()],
            ).map_err(|error| error.to_string())?;
            memory_count += 1;
        }
        let actions = pet
            .pointer("/assets/actions")
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default();
        for (action_index, action) in actions.iter().enumerate() {
            let action_id = action
                .get("id")
                .and_then(Value::as_str)
                .map(str::to_string)
                .unwrap_or_else(|| format!("legacy-action:{}:{}", id, action_index));
            let database_action_id = format!("{}:{}", id, action_id);
            let action_name = action
                .get("name")
                .and_then(Value::as_str)
                .unwrap_or("自定义动作");
            let frames = action
                .get("frames")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();
            let durations = action
                .get("durations")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();
            let loop_start = action.get("loopStart").and_then(Value::as_u64).unwrap_or(0) as i64;
            let loop_end = action
                .get("loopEnd")
                .and_then(Value::as_u64)
                .unwrap_or_else(|| frames.len().saturating_sub(1) as u64)
                as i64;
            let anchor_x = action
                .pointer("/anchor/x")
                .and_then(Value::as_f64)
                .unwrap_or(0.5)
                .clamp(0.0, 1.0);
            let anchor_y = action
                .pointer("/anchor/y")
                .and_then(Value::as_f64)
                .unwrap_or(0.92)
                .clamp(0.0, 1.0);
            transaction.execute(
                "INSERT INTO actions(id,pet_id,name,loop_start,loop_end,anchor_x,anchor_y,metadata_json,created_at,updated_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?9)",
                params![database_action_id, id, action_name, loop_start, loop_end, anchor_x, anchor_y, action.to_string(), Utc::now().to_rfc3339()],
            ).map_err(|error| error.to_string())?;
            for (frame_index, frame) in frames.iter().enumerate() {
                let Some(reference) = frame
                    .as_str()
                    .and_then(|value| value.strip_prefix("lumpa-asset:"))
                else {
                    continue;
                };
                let asset_hash = reference.split(':').next().unwrap_or_default();
                if asset_hash.len() != 64
                    || !asset_hash.bytes().all(|byte| byte.is_ascii_hexdigit())
                {
                    continue;
                }
                let duration_ms = durations
                    .get(frame_index)
                    .and_then(Value::as_u64)
                    .unwrap_or(80)
                    .clamp(20, 1000);
                transaction.execute(
                    "INSERT INTO action_frames(action_id,frame_index,asset_hash,duration_ms,crop_json) VALUES(?1,?2,?3,?4,?5)",
                    params![database_action_id, frame_index as i64, asset_hash, duration_ms, action.get("crop").cloned().unwrap_or(Value::Null).to_string()],
                ).map_err(|error| error.to_string())?;
            }
            action_count += 1;
        }
    }
    Ok((pets.len(), action_count, memory_count))
}

fn rebuild_chat(transaction: &Transaction<'_>, value: &Value) -> Result<usize, String> {
    transaction
        .execute("DELETE FROM conversations", [])
        .map_err(|error| error.to_string())?;
    let Some(conversations) = value.as_object() else {
        return Ok(0);
    };
    let known_pets = {
        let mut statement = transaction
            .prepare("SELECT id FROM pets")
            .map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([], |row| row.get::<_, String>(0))
            .map_err(|error| error.to_string())?;
        rows.flatten().collect::<HashSet<_>>()
    };
    let mut count = 0usize;
    for (pet_id, messages) in conversations {
        let conversation_id = format!("legacy:{}", pet_id);
        let pet_reference = known_pets.contains(pet_id).then_some(pet_id.as_str());
        transaction.execute(
            "INSERT INTO conversations(id,pet_id,title,created_at,updated_at) VALUES(?1,?2,'历史对话',?3,?3)",
            params![conversation_id, pet_reference, Utc::now().to_rfc3339()],
        ).map_err(|error| error.to_string())?;
        for item in messages.as_array().into_iter().flatten() {
            let role = if item.get("role").and_then(Value::as_str) == Some("user") {
                "user"
            } else {
                "assistant"
            };
            let text = item.get("text").and_then(Value::as_str).unwrap_or("");
            if text.is_empty() {
                continue;
            }
            let created_at = item
                .get("createdAt")
                .and_then(Value::as_i64)
                .and_then(chrono::DateTime::<Utc>::from_timestamp_millis)
                .unwrap_or_else(Utc::now)
                .to_rfc3339();
            transaction.execute(
                "INSERT INTO messages(conversation_id,role,content_json,created_at) VALUES(?1,?2,?3,?4)",
                params![conversation_id, role, json!({"text": text}).to_string(), created_at],
            ).map_err(|error| error.to_string())?;
            count += 1;
        }
    }
    Ok(count)
}

pub(crate) fn rebuild_kind(
    transaction: &Transaction<'_>,
    kind: &str,
    value: &Value,
) -> Result<(usize, usize, usize, usize), String> {
    match kind {
        "settings" => Ok((rebuild_settings(transaction, value)?, 0, 0, 0)),
        "pets" => {
            let (pets, actions, memories) = rebuild_pets(transaction, value)?;
            Ok((0, pets, actions, memories))
        }
        "chat" => Ok((0, 0, 0, rebuild_chat(transaction, value)?)),
        _ => Ok((0, 0, 0, 0)),
    }
}

fn migration_backup(
    state: &StorageState,
    payload: &LegacyMigrationPayload,
) -> Result<PathBuf, String> {
    use aes_gcm::{
        aead::{Aead, KeyInit},
        Aes256Gcm, Nonce,
    };
    let mut key = [0u8; 32];
    OsRng.fill_bytes(&mut key);
    let mut nonce = [0u8; 12];
    OsRng.fill_bytes(&mut nonce);
    let plaintext = serde_json::to_vec(payload).map_err(|error| error.to_string())?;
    let ciphertext = Aes256Gcm::new_from_slice(&key)
        .map_err(|_| "创建迁移备份加密器失败。".to_string())?
        .encrypt(Nonce::from_slice(&nonce), plaintext.as_ref())
        .map_err(|_| "加密迁移回滚备份失败。".to_string())?;
    let id = format!(
        "{}-{}",
        Local::now().format("%Y%m%d-%H%M%S"),
        hex::encode(&nonce[..4])
    );
    secure_store::set_secret(
        &format!("vault:migration:{}", id),
        &general_purpose::STANDARD.encode(key),
    )?;
    let path = state
        .backups_dir
        .join(format!("migration-{}.lumpa-rollback", id));
    let envelope = json!({
        "format": "lumpa-migration-rollback",
        "formatVersion": 1,
        "nonce": general_purpose::STANDARD.encode(nonce),
        "ciphertext": general_purpose::STANDARD.encode(ciphertext)
    });
    fs::write(
        &path,
        serde_json::to_vec(&envelope).map_err(|error| error.to_string())?,
    )
    .map_err(|error| format!("写入迁移回滚备份失败：{}", error))?;
    Ok(path)
}

#[tauri::command]
pub fn migrate_legacy_data(
    state: tauri::State<'_, StorageState>,
    payload: LegacyMigrationPayload,
) -> Result<MigrationReport, String> {
    let backup_path = migration_backup(&state, &payload)?;
    let mut documents = payload.documents.clone();
    let mut hashes = HashSet::new();
    let mut secrets = Vec::new();
    for (kind, value) in &mut documents {
        if kind == "settings" {
            secrets.extend(sanitize_settings(value)?);
        }
        materialize_assets(value, &state.assets_dir, &mut hashes)?;
    }
    for (name, value) in &secrets {
        secure_store::set_secret(name, value)?;
    }

    let result = (|| {
        let mut connection = state
            .connection
            .lock()
            .map_err(|_| "SQLite 锁已损坏。".to_string())?;
        let transaction = connection
            .transaction()
            .map_err(|error| error.to_string())?;
        let mut report = MigrationReport {
            from_version: payload.from_version.unwrap_or(0),
            to_version: SCHEMA_VERSION,
            status: "success".to_string(),
            assets: hashes.len(),
            rollback_backup: Some(backup_path.to_string_lossy().to_string()),
            ..MigrationReport::default()
        };
        for (kind, value) in &documents {
            upsert_document(&transaction, kind, value)?;
            let counts = rebuild_kind(&transaction, kind, value)?;
            report.settings += counts.0;
            report.pets += counts.1;
            report.actions += counts.2;
            if kind == "pets" {
                report.memories += counts.3;
            } else {
                report.chats += counts.3;
            }
        }
        let report_json = serde_json::to_string(&report).map_err(|error| error.to_string())?;
        transaction.execute(
            "INSERT INTO migration_runs(from_version,to_version,status,report_json,created_at) VALUES(?1,?2,'success',?3,?4)",
            params![report.from_version, report.to_version, report_json, Utc::now().to_rfc3339()],
        ).map_err(|error| error.to_string())?;
        transaction.commit().map_err(|error| error.to_string())?;
        Ok(report)
    })();
    if result.is_err() {
        for (name, _) in &secrets {
            let _ = secure_store::delete_secret(name);
        }
    }
    result
}

#[tauri::command]
pub fn storage_bootstrap(state: tauri::State<'_, StorageState>) -> Result<BootstrapData, String> {
    let connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let mut statement = connection
        .prepare("SELECT kind,payload_json FROM documents ORDER BY kind")
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|error| error.to_string())?;
    let mut documents = BTreeMap::new();
    for row in rows {
        let (kind, payload) = row.map_err(|error| error.to_string())?;
        let mut value: Value = serde_json::from_str(&payload).map_err(|error| error.to_string())?;
        hydrate_assets(&mut value, &state.assets_dir)?;
        if kind == "settings" {
            if let Some(object) = value.as_object_mut() {
                for field in SECRET_FIELDS {
                    if let Some(secret) =
                        secure_store::get_secret(&format!("provider:legacy:{}", field))?
                    {
                        object.insert((*field).to_string(), Value::String(secret));
                    }
                }
            }
        }
        documents.insert(kind, value);
    }
    let migration = connection
        .query_row(
            "SELECT report_json FROM migration_runs WHERE status='success' ORDER BY id DESC LIMIT 1",
            [],
            |row| row.get::<_, String>(0),
        )
        .optional()
        .map_err(|error| error.to_string())?
        .and_then(|value| serde_json::from_str(&value).ok());
    Ok(BootstrapData {
        schema_version: SCHEMA_VERSION,
        documents,
        migration,
    })
}

#[tauri::command]
pub fn storage_write_document(
    state: tauri::State<'_, StorageState>,
    kind: String,
    mut value: Value,
) -> Result<(), String> {
    if !matches!(kind.as_str(), "settings" | "pets" | "chat") {
        return Err("不允许写入该文档类型。".to_string());
    }
    let secrets = if kind == "settings" {
        sanitize_settings(&mut value)?
    } else {
        Vec::new()
    };
    let mut hashes = HashSet::new();
    materialize_assets(&mut value, &state.assets_dir, &mut hashes)?;
    for (name, secret) in &secrets {
        secure_store::set_secret(name, secret)?;
    }
    let mut connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    upsert_document(&transaction, &kind, &value)?;
    rebuild_kind(&transaction, &kind, &value)?;
    transaction.commit().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn privacy_summary(state: tauri::State<'_, StorageState>) -> Result<PrivacySummary, String> {
    let connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let count = |table: &str| -> Result<u64, String> {
        connection
            .query_row(&format!("SELECT COUNT(*) FROM {}", table), [], |row| {
                row.get(0)
            })
            .map_err(|error| error.to_string())
    };
    let assets = fs::read_dir(&state.assets_dir)
        .map_err(|error| error.to_string())?
        .flatten()
        .filter(|entry| entry.path().is_file())
        .count() as u64;
    let log_files = fs::read_dir(&state.logs_dir)
        .map_err(|error| error.to_string())?
        .flatten()
        .filter(|entry| entry.path().is_file())
        .count() as u64;
    let rollback_backups = fs::read_dir(&state.backups_dir)
        .map_err(|error| error.to_string())?
        .flatten()
        .filter(|entry| rollback_secret_name(&entry.path()).is_some())
        .count() as u64;
    Ok(PrivacySummary {
        settings: count("settings")?,
        pets: count("pets")?,
        actions: count("actions")?,
        memories: count("memories")?,
        chats: count("messages")?,
        usage_days: count("usage_daily")?,
        usage_rules: count("usage_rules")?,
        assets,
        log_files,
        rollback_backups,
    })
}

#[tauri::command]
pub fn privacy_delete_category(
    state: tauri::State<'_, StorageState>,
    category: String,
) -> Result<(), String> {
    let mut connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    match category.as_str() {
        "chat" => {
            transaction
                .execute("DELETE FROM conversations", [])
                .map_err(|error| error.to_string())?;
            transaction
                .execute("DELETE FROM documents WHERE kind='chat'", [])
                .map_err(|error| error.to_string())?;
        }
        "memory" => {
            transaction
                .execute("DELETE FROM memories", [])
                .map_err(|error| error.to_string())?;
        }
        "usage" => {
            transaction
                .execute("DELETE FROM usage_apps_daily", [])
                .map_err(|error| error.to_string())?;
            transaction
                .execute("DELETE FROM usage_hourly", [])
                .map_err(|error| error.to_string())?;
            transaction
                .execute("DELETE FROM usage_daily", [])
                .map_err(|error| error.to_string())?;
        }
        "rules" => {
            transaction
                .execute("DELETE FROM usage_rules", [])
                .map_err(|error| error.to_string())?;
        }
        "pets" => {
            transaction
                .execute("DELETE FROM pets", [])
                .map_err(|error| error.to_string())?;
            transaction
                .execute("DELETE FROM documents WHERE kind='pets'", [])
                .map_err(|error| error.to_string())?;
        }
        "settings" => {
            transaction
                .execute("DELETE FROM settings", [])
                .map_err(|error| error.to_string())?;
            transaction
                .execute("DELETE FROM documents WHERE kind='settings'", [])
                .map_err(|error| error.to_string())?;
        }
        "logs" => {
            drop(transaction);
            drop(connection);
            for entry in fs::read_dir(&state.logs_dir)
                .map_err(|error| error.to_string())?
                .flatten()
            {
                if entry.path().is_file() {
                    fs::remove_file(entry.path()).map_err(|error| error.to_string())?;
                }
            }
            return Ok(());
        }
        "rollback_backups" => {
            drop(transaction);
            drop(connection);
            let paths = fs::read_dir(&state.backups_dir)
                .map_err(|error| error.to_string())?
                .flatten()
                .map(|entry| entry.path())
                .filter(|path| rollback_secret_name(path).is_some())
                .collect::<Vec<_>>();
            for path in paths {
                remove_rollback_backup(&path)?;
            }
            return Ok(());
        }
        _ => return Err("未知隐私数据分类。".to_string()),
    }
    transaction.commit().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn save_provider_profile(
    state: tauri::State<'_, StorageState>,
    profile: ProviderProfile,
    api_key: Option<String>,
) -> Result<(), String> {
    if profile.id.is_empty()
        || profile.id.len() > 64
        || !profile
            .id
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || matches!(byte, b'-' | b'_'))
    {
        return Err("供应商 ID 不合法。".to_string());
    }
    if let Some(key) = api_key.filter(|value| !value.trim().is_empty()) {
        secure_store::set_secret(&format!("provider:{}:api_key", profile.id), key.trim())?;
    }
    let connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    connection.execute(
        "INSERT INTO provider_profiles(id,payload_json,updated_at) VALUES(?1,?2,?3)
         ON CONFLICT(id) DO UPDATE SET payload_json=excluded.payload_json,updated_at=excluded.updated_at",
        params![profile.id, serde_json::to_string(&profile).map_err(|error| error.to_string())?, Utc::now().to_rfc3339()],
    ).map_err(|error| error.to_string())?;
    Ok(())
}

pub fn load_provider(
    state: &StorageState,
    id: &str,
) -> Result<(ProviderProfile, Option<String>), String> {
    let connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let payload: String = connection
        .query_row(
            "SELECT payload_json FROM provider_profiles WHERE id=?1",
            [id],
            |row| row.get(0),
        )
        .map_err(|_| "供应商配置不存在。".to_string())?;
    drop(connection);
    let profile =
        serde_json::from_str::<ProviderProfile>(&payload).map_err(|error| error.to_string())?;
    let key = secure_store::get_secret(&format!("provider:{}:api_key", id))?;
    Ok((profile, key))
}

pub fn require_permission(state: &StorageState, permission: &str) -> Result<(), String> {
    let connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let payload: Option<String> = connection
        .query_row(
            "SELECT value_json FROM settings WHERE key='permissions'",
            [],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())?;
    let allowed = payload
        .as_deref()
        .and_then(|value| serde_json::from_str::<Value>(value).ok())
        .and_then(|value| value.get(permission).and_then(Value::as_bool))
        .unwrap_or(false);
    if allowed {
        Ok(())
    } else {
        Err(format!("权限“{}”未启用。", permission))
    }
}

pub fn load_usage_seed(
    state: &StorageState,
    local_date: &str,
    iso_week: &str,
) -> Result<UsageSeed, String> {
    use chrono::Datelike;
    let connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let (active_seconds, idle_seconds) = connection
        .query_row(
            "SELECT active_seconds,idle_seconds FROM usage_daily WHERE local_date=?1",
            [local_date],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()
        .map_err(|error| error.to_string())?
        .unwrap_or((0, 0));
    let apps = {
        let mut statement = connection.prepare("SELECT app_name,app_id,active_seconds FROM usage_apps_daily WHERE local_date=?1 ORDER BY active_seconds DESC").map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([local_date], |row| {
                Ok((row.get(0)?, row.get(1)?, row.get(2)?))
            })
            .map_err(|error| error.to_string())?;
        rows.map(|row| row.map_err(|error| error.to_string()))
            .collect::<Result<Vec<_>, _>>()?
    };
    let mut hourly_active_seconds = vec![0u64; 24];
    {
        let mut statement = connection
            .prepare("SELECT hour,active_seconds FROM usage_hourly WHERE local_date=?1")
            .map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([local_date], |row| {
                Ok((row.get::<_, usize>(0)?, row.get::<_, u64>(1)?))
            })
            .map_err(|error| error.to_string())?;
        for row in rows {
            let (hour, seconds) = row.map_err(|error| error.to_string())?;
            if hour < 24 {
                hourly_active_seconds[hour] = seconds;
            }
        }
    }
    let mut daily_active_seconds = vec![0u64; 7];
    {
        let mut statement = connection
            .prepare("SELECT local_date,active_seconds FROM usage_daily WHERE iso_week=?1")
            .map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([iso_week], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, u64>(1)?))
            })
            .map_err(|error| error.to_string())?;
        for row in rows {
            let (date, seconds) = row.map_err(|error| error.to_string())?;
            if let Ok(date) = chrono::NaiveDate::parse_from_str(&date, "%Y-%m-%d") {
                daily_active_seconds[date.weekday().num_days_from_monday() as usize] = seconds;
            }
        }
    }
    Ok(UsageSeed {
        active_seconds,
        idle_seconds,
        apps,
        hourly_active_seconds,
        daily_active_seconds,
    })
}

pub struct UsageDelta {
    pub local_date: String,
    pub iso_week: String,
    pub hour: usize,
    pub app_id: String,
    pub app_name: String,
    pub active_seconds: u64,
    pub idle_seconds: u64,
}

pub fn record_usage_delta(state: &StorageState, delta: UsageDelta) -> Result<(), String> {
    if delta.hour > 23 || delta.active_seconds.saturating_add(delta.idle_seconds) > 30 {
        return Err("使用统计采样值超出限制。".to_string());
    }
    let mut connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction.execute(
        "INSERT INTO usage_daily(local_date,iso_week,active_seconds,idle_seconds,updated_at) VALUES(?1,?2,?3,?4,?5)
         ON CONFLICT(local_date) DO UPDATE SET iso_week=excluded.iso_week,active_seconds=usage_daily.active_seconds+excluded.active_seconds,idle_seconds=usage_daily.idle_seconds+excluded.idle_seconds,updated_at=excluded.updated_at",
        params![delta.local_date,delta.iso_week,delta.active_seconds,delta.idle_seconds,Utc::now().to_rfc3339()],
    ).map_err(|error| error.to_string())?;
    if delta.active_seconds > 0 {
        transaction.execute(
            "INSERT INTO usage_hourly(local_date,hour,active_seconds) VALUES(?1,?2,?3) ON CONFLICT(local_date,hour) DO UPDATE SET active_seconds=usage_hourly.active_seconds+excluded.active_seconds",
            params![delta.local_date,delta.hour,delta.active_seconds],
        ).map_err(|error| error.to_string())?;
        transaction.execute(
            "INSERT INTO usage_apps_daily(local_date,app_id,app_name,active_seconds) VALUES(?1,?2,?3,?4)
             ON CONFLICT(local_date,app_id) DO UPDATE SET app_name=excluded.app_name,active_seconds=usage_apps_daily.active_seconds+excluded.active_seconds",
            params![delta.local_date,delta.app_id,delta.app_name,delta.active_seconds],
        ).map_err(|error| error.to_string())?;
    }
    transaction.commit().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn usage_month_snapshot(
    state: tauri::State<'_, StorageState>,
    month: String,
) -> Result<UsageMonthSnapshot, String> {
    if month.len() != 7
        || chrono::NaiveDate::parse_from_str(&format!("{}-01", month), "%Y-%m-%d").is_err()
    {
        return Err("月份格式必须是 YYYY-MM。".to_string());
    }
    require_permission(state.inner(), "usageStats")?;
    let connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let days = {
        let mut statement = connection.prepare("SELECT local_date,active_seconds,idle_seconds FROM usage_daily WHERE substr(local_date,1,7)=?1 ORDER BY local_date").map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([&month], |row| {
                Ok(UsageMonthDay {
                    local_date: row.get(0)?,
                    active_seconds: row.get(1)?,
                    idle_seconds: row.get(2)?,
                })
            })
            .map_err(|error| error.to_string())?;
        rows.map(|row| row.map_err(|error| error.to_string()))
            .collect::<Result<Vec<_>, _>>()?
    };
    let apps = {
        let mut statement = connection.prepare("SELECT app_id,MAX(app_name),SUM(active_seconds) FROM usage_apps_daily WHERE substr(local_date,1,7)=?1 GROUP BY app_id ORDER BY SUM(active_seconds) DESC").map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([&month], |row| {
                Ok(UsageMonthApp {
                    app_id: row.get(0)?,
                    app_name: row.get(1)?,
                    active_seconds: row.get(2)?,
                })
            })
            .map_err(|error| error.to_string())?;
        rows.map(|row| row.map_err(|error| error.to_string()))
            .collect::<Result<Vec<_>, _>>()?
    };
    Ok(UsageMonthSnapshot { month, days, apps })
}

fn csv_cell(value: &str) -> String {
    format!("\"{}\"", value.replace('"', "\"\""))
}

#[tauri::command]
pub fn usage_export_csv(
    state: tauri::State<'_, StorageState>,
    month: String,
    destination: String,
) -> Result<String, String> {
    let snapshot = usage_month_snapshot(state.clone(), month)?;
    let path = PathBuf::from(&destination);
    if !path.is_absolute()
        || path.extension().and_then(|value| value.to_str()) != Some("csv")
        || !path.parent().is_some_and(Path::is_dir)
    {
        return Err("CSV 导出路径不合法。".to_string());
    }
    let mut output = String::from("type,date_or_app,name,active_seconds,idle_seconds\r\n");
    for day in snapshot.days {
        output.push_str(&format!(
            "day,{},{},{},{}\r\n",
            csv_cell(&day.local_date),
            csv_cell(""),
            day.active_seconds,
            day.idle_seconds
        ));
    }
    for app in snapshot.apps {
        output.push_str(&format!(
            "app,{},{},{},0\r\n",
            csv_cell(&app.app_id),
            csv_cell(&app.app_name),
            app.active_seconds
        ));
    }
    let mut file = fs::OpenOptions::new()
        .create_new(true)
        .write(true)
        .open(&path)
        .map_err(|error| format!("创建 CSV 失败（不会覆盖已有文件）：{}", error))?;
    use std::io::Write;
    file.write_all(b"\xEF\xBB\xBF")
        .and_then(|_| file.write_all(output.as_bytes()))
        .and_then(|_| file.sync_all())
        .map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn list_provider_profiles(
    state: tauri::State<'_, StorageState>,
) -> Result<Vec<ProviderProfile>, String> {
    let connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let mut statement = connection
        .prepare("SELECT payload_json FROM provider_profiles ORDER BY id")
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|error| error.to_string())?;
    rows.map(|row| {
        row.map_err(|error| error.to_string())
            .and_then(|payload| serde_json::from_str(&payload).map_err(|error| error.to_string()))
    })
    .collect()
}

#[tauri::command]
pub fn save_usage_rules(
    state: tauri::State<'_, StorageState>,
    rules: Vec<UsageRule>,
) -> Result<(), String> {
    let mut ids = HashSet::new();
    for rule in &rules {
        if rule.id.is_empty() || !ids.insert(rule.id.clone()) {
            return Err("使用规则 ID 不能为空或重复。".to_string());
        }
        if rule.daily_limit_minutes > 24 * 60
            || rule.cooldown_minutes > 24 * 60
            || rule.recovery_minutes > 24 * 60
        {
            return Err("使用规则时长超过一天。".to_string());
        }
    }
    let mut connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute("DELETE FROM usage_rules", [])
        .map_err(|error| error.to_string())?;
    for rule in rules {
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
    transaction.commit().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn load_usage_rules(state: tauri::State<'_, StorageState>) -> Result<Vec<UsageRule>, String> {
    load_usage_rules_internal(state.inner())
}

pub fn load_usage_rules_internal(state: &StorageState) -> Result<Vec<UsageRule>, String> {
    let connection = state
        .connection
        .lock()
        .map_err(|_| "SQLite 锁已损坏。".to_string())?;
    let mut statement = connection
        .prepare("SELECT payload_json FROM usage_rules ORDER BY id")
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|error| error.to_string())?;
    rows.map(|row| {
        row.map_err(|error| error.to_string())
            .and_then(|payload| serde_json::from_str(&payload).map_err(|error| error.to_string()))
    })
    .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn data_urls_are_content_addressed_and_rehydrated() {
        let directory =
            std::env::temp_dir().join(format!("lumpa-storage-test-{}", std::process::id()));
        fs::create_dir_all(&directory).unwrap();
        let mut value = Value::String("data:image/png;base64,aGVsbG8=".to_string());
        let mut hashes = HashSet::new();
        materialize_assets(&mut value, &directory, &mut hashes).unwrap();
        assert_eq!(hashes.len(), 1);
        hydrate_assets(&mut value, &directory).unwrap();
        assert_eq!(value.as_str().unwrap(), "data:image/png;base64,aGVsbG8=");
        let _ = fs::remove_dir_all(directory);
    }

    #[test]
    fn settings_secrets_are_removed_before_sqlite_write() {
        let mut settings = json!({"apiKey":"secret", "theme":"warm"});
        let secrets = sanitize_settings(&mut settings).unwrap();
        assert_eq!(secrets.len(), 1);
        assert_eq!(settings["apiKey"], "");
    }

    #[test]
    fn sqlite_migration_transaction_rolls_back_on_validation_failure() {
        let mut connection = rusqlite::Connection::open_in_memory().unwrap();
        connection
            .execute_batch("CREATE TABLE migration_sample(id INTEGER PRIMARY KEY, value TEXT NOT NULL CHECK(length(value) <= 8));")
            .unwrap();
        {
            let transaction = connection.transaction().unwrap();
            transaction
                .execute("INSERT INTO migration_sample(value) VALUES(?1)", ["valid"])
                .unwrap();
            assert!(transaction
                .execute(
                    "INSERT INTO migration_sample(value) VALUES(?1)",
                    ["value-is-too-long"]
                )
                .is_err());
        }
        let count: u64 = connection
            .query_row("SELECT COUNT(*) FROM migration_sample", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(count, 0);
    }
}
