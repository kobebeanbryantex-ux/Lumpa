use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ProviderMode {
    LumpaAccount,
    BringYourOwnKey,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderProfile {
    pub id: String,
    pub name: String,
    pub mode: ProviderMode,
    pub api_base: String,
    pub chat_model: String,
    pub speech_model: String,
    pub image_model: String,
    pub video_model: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PetPackageManifest {
    pub format: String,
    pub format_version: u32,
    pub package_id: String,
    pub pet_id: String,
    pub name: String,
    pub species: String,
    pub created_at: String,
    pub pet: serde_json::Value,
    pub assets: BTreeMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupEnvelope {
    pub format: String,
    pub format_version: u32,
    pub created_at: String,
    pub kdf: String,
    pub memory_kib: u32,
    pub iterations: u32,
    pub parallelism: u32,
    pub salt: String,
    pub nonce: String,
    pub ciphertext: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageRule {
    pub id: String,
    pub name: String,
    pub enabled: bool,
    pub daily_limit_minutes: u32,
    pub schedule_start: Option<String>,
    pub schedule_end: Option<String>,
    pub cooldown_minutes: u32,
    pub recovery_minutes: u32,
    pub app_pattern: Option<String>,
    pub notify: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GatewaySession {
    pub account_id: String,
    pub email_masked: String,
    pub device_id: String,
    pub access_token: String,
    pub access_expires_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MigrationReport {
    pub from_version: u32,
    pub to_version: u32,
    pub status: String,
    pub settings: usize,
    pub pets: usize,
    pub actions: usize,
    pub chats: usize,
    pub memories: usize,
    pub assets: usize,
    pub rollback_backup: Option<String>,
    pub diagnostics: Vec<String>,
}
