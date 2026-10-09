mod core_types;
mod diagnostics;
mod gateway_client;
mod portable;
mod secure_store;
mod storage;
mod updater;

use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    collections::{HashMap, VecDeque},
    io::Cursor,
    process::Command,
    sync::Mutex,
    time::{Duration, Instant},
};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_notification::NotificationExt;
use url::Url;

const MAIN_WINDOW: &str = "main";
const BASE_FLOATING_WIDTH: f64 = 320.0;
const BASE_FLOATING_HEIGHT: f64 = 300.0;
const BASE_FLOATING_MIN_WIDTH: f64 = 260.0;
const BASE_FLOATING_MIN_HEIGHT: f64 = 240.0;
const DEFAULT_GATEWAY_API_BASE: &str = "";
const DEFAULT_CHAT_MODEL: &str = "gpt-5.4-mini";
const DEFAULT_IMAGE_MODEL: &str = "gpt-image-2";
const DEFAULT_TTS_API_BASE: &str = "https://api.xiaomimimo.com/v1";
const DEFAULT_TTS_MODEL: &str = "mimo-v2.5-tts";
const DEFAULT_TTS_VOICE: &str = "mimo_default";
const MAX_DATA_URL_BYTES: usize = 24 * 1024 * 1024;
const MAX_MEDIA_DOWNLOAD_BYTES: usize = 64 * 1024 * 1024;
const MAX_GIF_DECODED_PIXELS: usize = 64 * 1024 * 1024;
const MAX_API_RESPONSE_BYTES: usize = 4 * 1024 * 1024;

struct StartModeState(Mutex<String>);
struct ModelStopState(Mutex<CapabilityStops>);
struct UsageState(Mutex<UsageTracker>);

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DesktopOptions {
    pet_scale: Option<f64>,
    always_on_top: Option<bool>,
    click_through: Option<bool>,
    desktop_gravity: Option<String>,
    floating_mode: Option<bool>,
    apply_position: Option<bool>,
}

#[derive(Debug, Default)]
struct CapabilityStops {
    chat: Option<ModelStop>,
    tts: Option<ModelStop>,
    image: Option<ModelStop>,
}

#[derive(Debug, Clone)]
struct ModelStop {
    status: u16,
    reason: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChatPayload {
    provider_id: String,
    messages: Vec<ChatMessage>,
    temperature: Option<f32>,
    max_tokens: Option<u32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct TtsPayload {
    provider_id: String,
    voice: Option<String>,
    text: String,
    speed: Option<f32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ImageEditPayload {
    provider_id: String,
    prompt: String,
    image: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct VideoGenerationPayload {
    provider_id: String,
    prompt: String,
    image: String,
    duration: Option<u32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct VoiceClonePayload {
    provider_id: String,
    custom_name: String,
    audio: String,
    text: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GifActionPayload {
    image: String,
    max_frames: Option<usize>,
    max_duration_ms: Option<u32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ChatResponse {
    reply: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TtsResponse {
    audio_base64: String,
    content_type: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ImageEditResponse {
    image: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct VideoGenerationResponse {
    video: Option<String>,
    content_type: String,
    frames: Option<Vec<String>>,
    durations: Option<Vec<u32>>,
    preview: Option<String>,
    total_duration_ms: Option<u32>,
}

impl VideoGenerationResponse {
    fn media(video: String, content_type: String) -> Self {
        Self {
            video: Some(video),
            content_type,
            frames: None,
            durations: None,
            preview: None,
            total_duration_ms: None,
        }
    }

    fn frame_pack(frames: Vec<String>, durations: Vec<u32>) -> Self {
        let total_duration_ms = durations.iter().copied().sum::<u32>();
        let preview = frames.first().cloned();
        Self {
            video: None,
            content_type: "application/json".to_string(),
            frames: Some(frames),
            durations: Some(durations),
            preview,
            total_duration_ms: Some(total_duration_ms),
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct GifFrameResponse {
    image: String,
    duration_ms: u32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct GifActionResponse {
    frames: Vec<GifFrameResponse>,
    preview: String,
    width: u16,
    height: u16,
    total_duration_ms: u32,
    has_transparency: bool,
    background_removed: bool,
    background_removal: String,
    truncated: bool,
}

#[derive(Debug, Default)]
struct UsageTracker {
    week_index: u64,
    day_index: u64,
    loaded: bool,
    last_sample: Option<Instant>,
    apps: HashMap<String, UsageAppCounter>,
    active_seconds: u64,
    idle_seconds: u64,
    hourly_active_seconds: Vec<u64>,
    daily_active_seconds: Vec<u64>,
    rule_last_notified: HashMap<String, Instant>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
struct UsageAppCounter {
    app_name: String,
    executable: String,
    seconds: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct UsageSnapshot {
    current_app: UsageAppSnapshot,
    apps: Vec<UsageAppSnapshot>,
    active_seconds: u64,
    idle_seconds: u64,
    total_seconds: u64,
    current_idle_seconds: u64,
    week_index: u64,
    day_index: u64,
    hourly_active_seconds: Vec<u64>,
    daily_active_seconds: Vec<u64>,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct UsageAppSnapshot {
    app_name: String,
    executable: String,
    seconds: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ForegroundApp {
    app_name: String,
    executable: String,
    title: String,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct ModelCommandError {
    capability: String,
    message: String,
    status: u16,
    quota_stopped: bool,
    stopped: bool,
}

fn validate_network_url(raw: &str, allow_loopback_http: bool) -> Result<String, String> {
    let parsed = Url::parse(raw.trim()).map_err(|_| "API 地址格式不正确。".to_string())?;
    if !parsed.username().is_empty() || parsed.password().is_some() || parsed.fragment().is_some() {
        return Err("API 地址不能包含账号、密码或片段。".to_string());
    }
    let host = parsed
        .host_str()
        .ok_or_else(|| "API 地址缺少主机名。".to_string())?;
    let loopback = host.eq_ignore_ascii_case("localhost") || host == "127.0.0.1" || host == "::1";
    match parsed.scheme() {
        "https" => {}
        "http" if allow_loopback_http && loopback => {}
        _ => return Err("只允许 HTTPS；本机模型可使用回环 HTTP。".to_string()),
    }
    Ok(parsed.as_str().trim_end_matches('/').to_string())
}

fn secure_api_base(
    value: Option<String>,
    fallback: &str,
    capability: &str,
) -> Result<String, ModelCommandError> {
    let candidate = normalize_base(value, fallback);
    if candidate.is_empty() {
        return Err(command_error(
            capability,
            403,
            "尚未配置安全的模型服务地址。",
            false,
            false,
        ));
    }
    validate_network_url(&candidate, true)
        .map_err(|message| command_error(capability, 400, message, false, false))
}

fn restricted_http_client(
    timeout: Duration,
    allow_loopback_http: bool,
) -> Result<reqwest::Client, String> {
    let redirect_policy = reqwest::redirect::Policy::custom(move |attempt| {
        if attempt.previous().len() >= 3 {
            return attempt.error("重定向次数超过 3 次限制");
        }
        match validate_network_url(attempt.url().as_str(), allow_loopback_http) {
            Ok(_) => attempt.follow(),
            Err(message) => attempt.error(message),
        }
    });
    reqwest::Client::builder()
        .timeout(timeout)
        .redirect(redirect_policy)
        .build()
        .map_err(|error| error.to_string())
}

async fn read_response_limited(
    mut response: reqwest::Response,
    limit: usize,
    capability: &str,
) -> Result<Vec<u8>, ModelCommandError> {
    if response
        .content_length()
        .is_some_and(|length| length > limit as u64)
    {
        return Err(command_error(
            capability,
            413,
            format!("响应超过 {} MB 限制。", limit / 1024 / 1024),
            false,
            false,
        ));
    }
    let mut bytes =
        Vec::with_capacity(response.content_length().unwrap_or(0).min(limit as u64) as usize);
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|error| command_error(capability, 502, error.to_string(), false, false))?
    {
        if bytes.len().saturating_add(chunk.len()) > limit {
            return Err(command_error(
                capability,
                413,
                format!("响应超过 {} MB 限制。", limit / 1024 / 1024),
                false,
                false,
            ));
        }
        bytes.extend_from_slice(&chunk);
    }
    Ok(bytes)
}

impl Default for StartModeState {
    fn default() -> Self {
        Self(Mutex::new(String::new()))
    }
}

impl Default for ModelStopState {
    fn default() -> Self {
        Self(Mutex::new(CapabilityStops::default()))
    }
}

impl Default for UsageState {
    fn default() -> Self {
        Self(Mutex::new(UsageTracker::default()))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .manage(StartModeState::default())
        .manage(ModelStopState::default())
        .manage(UsageState::default())
        .manage(gateway_client::GatewaySessionState::default());

    #[cfg(not(debug_assertions))]
    let builder = builder.plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
        show_window(app);
        for arg in argv {
            handle_deep_link_url(app, &arg);
        }
    }));

    builder
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            secure_store::initialize(app.handle())?;
            app.manage(storage::StorageState::open(app.handle())?);
            let logs_dir = app.state::<storage::StorageState>().logs_dir.clone();
            diagnostics::install_panic_hook(logs_dir.clone());
            let diagnostic_state = diagnostics::DiagnosticState::new(logs_dir);
            diagnostic_state.log("info", "application_start", "Lumpa desktop initialized");
            app.manage(diagnostic_state);
            let usage_app = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    tokio::time::sleep(Duration::from_secs(5)).await;
                    let storage_state = usage_app.state::<storage::StorageState>();
                    let usage_state = usage_app.state::<UsageState>();
                    let Ok(mut tracker) = usage_state.0.lock() else {
                        continue;
                    };
                    if storage::require_permission(storage_state.inner(), "usageStats").is_ok() {
                        let _ = tracker.snapshot(&usage_app);
                    } else {
                        tracker.last_sample = None;
                    }
                }
            });
            setup_tray(app).map_err(|error| error.to_string())?;

            #[cfg(any(windows, target_os = "linux"))]
            app.deep_link()
                .register_all()
                .map_err(|error| error.to_string())?;

            let app_handle = app.handle().clone();

            if let Some(urls) = app
                .deep_link()
                .get_current()
                .map_err(|error| error.to_string())?
            {
                for url in urls {
                    handle_deep_link_url(&app_handle, url.as_str());
                }
            }

            app.deep_link().on_open_url(move |event| {
                for url in event.urls() {
                    handle_deep_link_url(&app_handle, url.as_str());
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_custom_audio,
            import_custom_audio,
            save_polaroid_image,
            get_start_mode,
            get_launch_at_login,
            set_launch_at_login,
            updater::updater_check,
            updater::updater_download_and_install,
            set_window_mode,
            apply_desktop_options,
            start_window_drag,
            close_window,
            model_chat,
            model_tts,
            model_voice_clone,
            model_image_edit,
            model_video_generation,
            process_gif_action,
            get_active_foreground_window,
            get_usage_snapshot,
            storage::migrate_legacy_data,
            storage::storage_bootstrap,
            storage::storage_write_document,
            storage::privacy_summary,
            storage::privacy_delete_category,
            storage::save_provider_profile,
            storage::list_provider_profiles,
            storage::save_usage_rules,
            storage::load_usage_rules,
            storage::usage_month_snapshot,
            storage::usage_export_csv,
            diagnostics::diagnostics_preview,
            diagnostics::diagnostics_export,
            secure_store::secure_store_set,
            secure_store::secure_store_delete,
            portable::create_encrypted_backup,
            portable::restore_encrypted_backup,
            portable::export_pet_package,
            portable::import_pet_package,
            gateway_client::gateway_send_code,
            gateway_client::gateway_verify_code,
            gateway_client::gateway_session_status,
            gateway_client::gateway_refresh_session,
            gateway_client::gateway_logout,
            gateway_client::gateway_account_info,
            gateway_client::gateway_revoke_device,
            gateway_client::gateway_delete_account
        ])
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Lumpa");
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CustomAudioImportResponse {
    imported: Vec<String>,
}

fn custom_audio_slot_names(slot: &str) -> Option<&'static [&'static str]> {
    match slot {
        "cat.gentle" => Some(&["meow_gentle_01", "meow_gentle_02", "meow_gentle_03"]),
        "cat.curious" => Some(&["meow_curious_01", "meow_curious_02"]),
        "cat.alert" => Some(&["meow_alert_01", "meow_alert_02"]),
        "cat.purr" => Some(&["meow_purr_01", "meow_purr_02"]),
        "cat.whine" => Some(&["meow_whine_01", "meow_whine_02"]),
        "cat.pounce" => Some(&["meow_pounce_01"]),
        "cat.stretch" => Some(&["meow_stretch_01"]),
        "cat.yawn" => Some(&["meow_yawn_01"]),
        "fox.gentle" => Some(&["fox_gentle_01", "fox_gentle_02"]),
        "fox.curious" => Some(&["fox_curious_01", "fox_curious_02"]),
        "fox.alert" => Some(&["fox_alert_01", "fox_alert_02"]),
        "wolf.gentle" => Some(&["wolf_gentle_01", "wolf_gentle_02"]),
        "wolf.curious" => Some(&["wolf_curious_01", "wolf_curious_02"]),
        "wolf.alert" => Some(&["wolf_alert_01", "wolf_alert_02"]),
        _ => None,
    }
}

#[tauri::command]
fn import_custom_audio(
    app: tauri::AppHandle,
    sources: Vec<String>,
    slot: String,
) -> Result<CustomAudioImportResponse, String> {
    const MAX_AUDIO_FILES_PER_IMPORT: usize = 6;
    const MAX_AUDIO_FILE_BYTES: u64 = 12 * 1024 * 1024;
    const ALLOWED_EXTENSIONS: [&str; 4] = ["wav", "mp3", "ogg", "m4a"];

    if sources.is_empty() {
        return Err("请先选择至少一条音频。".to_string());
    }
    if sources.len() > MAX_AUDIO_FILES_PER_IMPORT {
        return Err("一次最多导入 6 条音频。".to_string());
    }

    let slot_names = custom_audio_slot_names(&slot)
        .ok_or_else(|| "未知的音效类型。".to_string())?;
    let audio_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("无法定位音效目录：{}", error))?
        .join("audio");
    std::fs::create_dir_all(&audio_dir)
        .map_err(|error| format!("无法创建音效目录：{}", error))?;

    let available_names: Vec<&str> = slot_names
        .iter()
        .copied()
        .filter(|name| {
            !ALLOWED_EXTENSIONS
                .iter()
                .any(|ext| audio_dir.join(format!("{}.{}", name, ext)).exists())
        })
        .collect();
    if sources.len() > available_names.len() {
        return Err(format!(
            "该类型还剩 {} 个空位；请先换一个音效类型，或稍后在设置中替换已有音效。",
            available_names.len()
        ));
    }

    let mut imported = Vec::with_capacity(sources.len());
    for (source, target_name) in sources.iter().zip(available_names.iter()) {
        let source_path = std::path::PathBuf::from(source);
        let metadata = std::fs::metadata(&source_path)
            .map_err(|error| format!("无法读取所选音频：{}", error))?;
        if !metadata.is_file() {
            return Err("所选项目不是普通音频文件。".to_string());
        }
        if metadata.len() > MAX_AUDIO_FILE_BYTES {
            return Err("单条音频不能超过 12 MB。".to_string());
        }
        let extension = source_path
            .extension()
            .and_then(|value| value.to_str())
            .map(|value| value.to_ascii_lowercase())
            .filter(|value| ALLOWED_EXTENSIONS.contains(&value.as_str()))
            .ok_or_else(|| "只支持 WAV、MP3、OGG 或 M4A 音频。".to_string())?;
        let destination = audio_dir.join(format!("{}.{}", target_name, extension));
        std::fs::copy(&source_path, &destination)
            .map_err(|error| format!("保存音效失败：{}", error))?;
        imported.push(destination.file_name().unwrap_or_default().to_string_lossy().to_string());
    }

    Ok(CustomAudioImportResponse { imported })
}

#[tauri::command]
fn read_custom_audio(app: tauri::AppHandle, sound_name: String) -> Option<String> {
    use base64::{engine::general_purpose, Engine as _};
    use std::path::PathBuf;

    let possible_dirs = [
        app.path().app_data_dir().ok().map(|dir| dir.join("audio")),
        std::env::current_exe().ok().and_then(|p| p.parent().map(|d| d.join("audio"))),
        Some(PathBuf::from(r"assets\audio")),
        Some(PathBuf::from(r"public\assets\audio")),
    ];

    let extensions = ["mp3", "wav", "ogg", "m4a", "mp3.mp3", "wav.wav"];

    for dir_opt in possible_dirs {
        if let Some(dir) = dir_opt {
            for ext in extensions {
                let file_path = dir.join(format!("{}.{}", sound_name, ext));
                if file_path.exists() {
                    if let Ok(bytes) = std::fs::read(&file_path) {
                        let mime = match ext {
                            "wav" => "audio/wav",
                            "ogg" => "audio/ogg",
                            "m4a" => "audio/mp4",
                            _ => "audio/mpeg",
                        };
                        let b64 = general_purpose::STANDARD.encode(&bytes);
                        return Some(format!("data:{};base64,{}", mime, b64));
                    }
                }
            }
        }
    }
    None
}

pub fn purge_installed_user_data() -> Result<(), String> {
    secure_store::purge_installed_user_data()
}

fn setup_tray(app: &mut tauri::App) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show", "显示 Lumpa", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "hide", "隐藏 Lumpa", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "打开设置", true, None::<&str>)?;
    let disable_click =
        MenuItem::with_id(app, "disable_click", "关闭穿透点击", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(
        app,
        &[&show, &hide, &settings, &disable_click, &separator, &quit],
    )?;

    let mut tray = TrayIconBuilder::with_id("rabbit-desk-pet-tray")
        .menu(&menu)
        .tooltip("Lumpa")
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => show_window(app),
            "hide" => hide_window(app),
            "settings" => open_settings_window(app),
            "disable_click" => disable_click_through(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::DoubleClick {
                button: MouseButton::Left,
                ..
            } = event
            {
                show_window(tray.app_handle());
            }

            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_window(tray.app_handle());
            }
        });

    if let Some(icon) = app.default_window_icon().cloned() {
        tray = tray.icon(icon);
    }

    let tray = tray.build(app)?;
    app.manage(tray);
    Ok(())
}

fn main_window(app: &tauri::AppHandle) -> Option<tauri::WebviewWindow> {
    app.get_webview_window(MAIN_WINDOW)
}

fn show_window(app: &tauri::AppHandle) {
    if let Some(window) = main_window(app) {
        let _ = apply_window_mode(&window, false);
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.eval(
            "window.dispatchEvent(new CustomEvent('rabbit-desk-pet-mode', { detail: { mode: 'normal' } }));",
        );
    }
}

fn hide_window(app: &tauri::AppHandle) {
    if let Some(window) = main_window(app) {
        let _ = window.hide();
    }
}

fn disable_click_through(app: &tauri::AppHandle) {
    if let Some(window) = main_window(app) {
        let _ = window.eval(
            "window.dispatchEvent(new CustomEvent('rabbit-desk-pet-click-through-disabled'));",
        );
    }
}

fn open_settings_window(app: &tauri::AppHandle) {
    if let Some(window) = main_window(app) {
        let _ = apply_window_mode(&window, false);
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.eval(
            "window.dispatchEvent(new CustomEvent('rabbit-desk-pet-mode', { detail: { mode: 'normal' } }));\
             window.dispatchEvent(new CustomEvent('rabbit-desk-pet-open-settings'));",
        );
    }
}

fn handle_deep_link_url(app: &tauri::AppHandle, url: &str) {
    if !url.starts_with("rabbit-desk-pet://") {
        return;
    }

    let lower_url = url.to_ascii_lowercase();
    let floating = !lower_url.contains("normal");
    remember_start_mode(app, if floating { "floating" } else { "normal" });

    if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
        let _ = apply_window_mode(&window, floating);
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.eval(format!(
            "window.dispatchEvent(new CustomEvent('rabbit-desk-pet-mode', {{ detail: {{ mode: '{}' }} }}));",
            if floating { "floating" } else { "normal" }
        ));
    }
}

fn remember_start_mode(app: &tauri::AppHandle, mode: &str) {
    if let Some(state) = app.try_state::<StartModeState>() {
        if let Ok(mut value) = state.0.lock() {
            *value = mode.to_string();
        }
    }
}

fn launch_registry_name() -> &'static str {
    "Lumpa"
}

fn launch_registry_path() -> &'static str {
    r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run"
}

#[tauri::command]
fn save_polaroid_image(base64_data: String) -> Result<String, String> {
    let clean_base64 = base64_data
        .trim_start_matches("data:image/png;base64,")
        .trim_start_matches("data:image/jpeg;base64,");

    let bytes = general_purpose::STANDARD
        .decode(clean_base64)
        .map_err(|e| format!("Base64 解码失败: {}", e))?;

    let desktop = std::env::var("USERPROFILE")
        .map(|p| std::path::PathBuf::from(p).join("Desktop"))
        .unwrap_or_else(|_| std::path::PathBuf::from("."));

    let filename = format!(
        "Lumpa-Polaroid-{}.png",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
    );
    let target_path = desktop.join(&filename);

    std::fs::write(&target_path, bytes)
        .map_err(|e| format!("写入照片文件失败: {}", e))?;

    Ok(target_path.to_string_lossy().to_string())
}

#[tauri::command]
fn get_launch_at_login() -> Result<bool, String> {
    let output = Command::new("reg")
        .args([
            "query",
            launch_registry_path(),
            "/v",
            launch_registry_name(),
        ])
        .output()
        .map_err(|error| error.to_string())?;
    Ok(output.status.success())
}

#[tauri::command]
fn set_launch_at_login(enabled: bool) -> Result<bool, String> {
    if enabled {
        let exe = std::env::current_exe().map_err(|error| error.to_string())?;
        let value = format!("\"{}\"", exe.display());
        let status = Command::new("reg")
            .args([
                "add",
                launch_registry_path(),
                "/v",
                launch_registry_name(),
                "/t",
                "REG_SZ",
                "/d",
                &value,
                "/f",
            ])
            .status()
            .map_err(|error| error.to_string())?;
        if !status.success() {
            return Err("写入开机自启注册表失败。".to_string());
        }
    } else {
        let status = Command::new("reg")
            .args([
                "delete",
                launch_registry_path(),
                "/v",
                launch_registry_name(),
                "/f",
            ])
            .status()
            .map_err(|error| error.to_string())?;
        if !status.success() && get_launch_at_login().unwrap_or(false) {
            return Err("关闭开机自启失败。".to_string());
        }
    }
    get_launch_at_login()
}

fn apply_window_mode(window: &tauri::WebviewWindow, floating: bool) -> Result<(), String> {
    let size = if floating {
        tauri::Size::Logical(tauri::LogicalSize {
            width: BASE_FLOATING_WIDTH,
            height: BASE_FLOATING_HEIGHT,
        })
    } else {
        tauri::Size::Logical(tauri::LogicalSize {
            width: 1180.0,
            height: 760.0,
        })
    };
    let min_size = if floating {
        tauri::Size::Logical(tauri::LogicalSize {
            width: BASE_FLOATING_MIN_WIDTH,
            height: BASE_FLOATING_MIN_HEIGHT,
        })
    } else {
        tauri::Size::Logical(tauri::LogicalSize {
            width: 760.0,
            height: 560.0,
        })
    };

    window
        .set_min_size(Some(min_size))
        .map_err(|error| error.to_string())?;
    window.set_size(size).map_err(|error| error.to_string())?;
    window
        .set_decorations(!floating)
        .map_err(|error| error.to_string())?;
    window
        .set_resizable(!floating)
        .map_err(|error| error.to_string())?;
    window
        .set_always_on_top(floating)
        .map_err(|error| error.to_string())?;
    window
        .set_skip_taskbar(floating)
        .map_err(|error| error.to_string())?;
    window
        .set_shadow(!floating)
        .map_err(|error| error.to_string())?;

    if !floating {
        let _ = window.center();
    }

    Ok(())
}

fn floating_size_for_scale(scale: f64) -> (f64, f64, f64, f64) {
    let scale = scale.clamp(0.65, 1.45);
    (
        BASE_FLOATING_WIDTH * scale,
        BASE_FLOATING_HEIGHT * scale,
        BASE_FLOATING_MIN_WIDTH * scale,
        BASE_FLOATING_MIN_HEIGHT * scale,
    )
}

fn clamp_i32(value: i32, min: i32, max: i32) -> i32 {
    if max < min {
        min
    } else {
        value.clamp(min, max)
    }
}

fn position_window(window: &tauri::WebviewWindow, gravity: &str) -> Result<(), String> {
    if gravity == "free" {
        return Ok(());
    }

    let monitor = window
        .current_monitor()
        .map_err(|error| error.to_string())?
        .or(window
            .primary_monitor()
            .map_err(|error| error.to_string())?)
        .ok_or_else(|| "No monitor found for desktop pet window.".to_string())?;
    let area = monitor.work_area();
    let window_size = window.outer_size().map_err(|error| error.to_string())?;
    let window_position = window.outer_position().map_err(|error| error.to_string())?;

    let margin = 10;
    let left = area.position.x;
    let top = area.position.y;
    let right = area.position.x + area.size.width as i32;
    let bottom = area.position.y + area.size.height as i32;
    let width = window_size.width as i32;
    let height = window_size.height as i32;
    let max_x = right - width - margin;
    let max_y = bottom - height - margin;

    let (x, y) = match gravity {
        "taskbar" => (max_x - 18, max_y),
        "edge-hang" => (
            right - width + 14,
            clamp_i32(top + (area.size.height as i32 / 3), top + margin, max_y),
        ),
        "snap-edge" => {
            let current_right = window_position.x + width;
            let current_bottom = window_position.y + height;
            let distances = [
                ((window_position.x - left).abs(), "left"),
                ((right - current_right).abs(), "right"),
                ((window_position.y - top).abs(), "top"),
                ((bottom - current_bottom).abs(), "bottom"),
            ];
            let nearest = distances
                .iter()
                .min_by_key(|(distance, _)| *distance)
                .map(|(_, edge)| *edge)
                .unwrap_or("right");

            match nearest {
                "left" => (
                    left + margin,
                    clamp_i32(window_position.y, top + margin, max_y),
                ),
                "right" => (max_x, clamp_i32(window_position.y, top + margin, max_y)),
                "top" => (
                    clamp_i32(window_position.x, left + margin, max_x),
                    top + margin,
                ),
                "bottom" => (clamp_i32(window_position.x, left + margin, max_x), max_y),
                _ => (max_x, max_y),
            }
        }
        _ => return Ok(()),
    };

    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: clamp_i32(x, left - width / 3, right - 24),
            y: clamp_i32(y, top + margin, max_y),
        }))
        .map_err(|error| error.to_string())?;
    Ok(())
}

fn clean_string(value: Option<String>) -> String {
    value.unwrap_or_default().trim().to_string()
}

fn normalize_base(value: Option<String>, fallback: &str) -> String {
    let raw = clean_string(value);
    let value = if raw.is_empty() {
        fallback
    } else {
        raw.as_str()
    };
    value.trim_end_matches('/').to_string()
}

fn stop_for_capability<'a>(stops: &'a CapabilityStops, capability: &str) -> Option<&'a ModelStop> {
    match capability {
        "chat" => stops.chat.as_ref(),
        "tts" => stops.tts.as_ref(),
        "image" => stops.image.as_ref(),
        _ => None,
    }
}

fn set_stop_for_capability(stops: &mut CapabilityStops, capability: &str, stop: ModelStop) {
    match capability {
        "chat" => stops.chat = Some(stop),
        "tts" => stops.tts = Some(stop),
        "image" => stops.image = Some(stop),
        _ => {}
    }
}

fn quota_message(capability: &str) -> String {
    match capability {
        "chat" => "聊天模型免费额度或速率限制已触发，已停止聊天模型调用。".to_string(),
        "tts" => "语音模型免费额度或速率限制已触发，已停止语音合成调用。聊天仍可继续。".to_string(),
        "image" => "图像模型免费额度或速率限制已触发，已停止去背和嘴型生成。聊天和语音不受影响。"
            .to_string(),
        _ => "模型额度或速率限制已触发，已停止调用。".to_string(),
    }
}

fn command_error(
    capability: &str,
    status: u16,
    message: impl Into<String>,
    quota_stopped: bool,
    stopped: bool,
) -> ModelCommandError {
    ModelCommandError {
        capability: capability.to_string(),
        message: message.into(),
        status,
        quota_stopped,
        stopped,
    }
}

fn check_stopped(
    state: &tauri::State<ModelStopState>,
    capability: &str,
) -> Result<(), ModelCommandError> {
    let stops = state
        .0
        .lock()
        .map_err(|_| command_error(capability, 500, "模型状态读取失败。", false, false))?;
    if let Some(stop) = stop_for_capability(&stops, capability) {
        return Err(command_error(
            capability,
            stop.status,
            stop.reason.clone(),
            stop.status == 429,
            true,
        ));
    }
    Ok(())
}

fn remember_quota_stop(
    state: &tauri::State<ModelStopState>,
    capability: &str,
    status: u16,
    detail: &str,
) -> ModelCommandError {
    let reason = quota_message(capability);
    if let Ok(mut stops) = state.0.lock() {
        set_stop_for_capability(
            &mut stops,
            capability,
            ModelStop {
                status,
                reason: reason.clone(),
            },
        );
    }
    command_error(
        capability,
        429,
        if detail.trim().is_empty() {
            reason
        } else {
            format!("{} {}", reason, detail.trim())
        },
        true,
        true,
    )
}

fn looks_like_quota_error(status: u16, text: &str) -> bool {
    let lower = text.to_ascii_lowercase();
    status == 429
        || [
            "resource_exhausted",
            "insufficient_quota",
            "quota exceeded",
            "quota_exceeded",
            "free tier",
            "rate limit",
            "ratelimit",
        ]
        .iter()
        .any(|pattern| lower.contains(pattern))
}

fn friendly_upstream_message(capability: &str, text: &str) -> String {
    let trimmed = text.trim();
    if trimmed.is_empty() {
        return format!("{} API 请求失败。", capability);
    }

    let lower = trimmed.to_ascii_lowercase();
    if lower.contains("auth_unavailable") {
        return match capability {
            "chat" => "中转站没有可用的聊天上游鉴权，当前默认聊天模型不可用。请在设置里换可用的 API Key 和模型，或先在中转站给聊天模型配置 provider。".to_string(),
            "image" => "中转站没有可用的图像上游鉴权，当前图像模型不可用。请在设置里换可用的图像 Key 和模型。".to_string(),
            "tts" => "语音接口没有可用的上游鉴权。请在设置里换可用的语音 Key 和模型。".to_string(),
            _ => "模型接口没有可用的上游鉴权。请检查 API Key、模型和中转站 provider 配置。".to_string(),
        };
    }

    if lower.contains("invalid api key") || lower.contains("unauthorized") {
        return match capability {
            "chat" => {
                "聊天 API Key 无效或无权限。请检查设置里的 API 地址、Key 和模型。".to_string()
            }
            "image" => {
                "图像 API Key 无效或无权限。请检查设置里的图像 API 地址、Key 和模型。".to_string()
            }
            "tts" => {
                "语音 API Key 无效或无权限。请检查设置里的语音 API 地址、Key 和模型。".to_string()
            }
            _ => "API Key 无效或无权限。请检查 API 地址、Key 和模型。".to_string(),
        };
    }

    trimmed.to_string()
}

async fn upstream_error(
    state: &tauri::State<'_, ModelStopState>,
    capability: &str,
    status: u16,
    text: String,
) -> ModelCommandError {
    if looks_like_quota_error(status, &text) {
        remember_quota_stop(state, capability, status, &text)
    } else {
        command_error(
            capability,
            status,
            friendly_upstream_message(capability, &text),
            false,
            false,
        )
    }
}

fn extract_chat_reply(data: &Value) -> String {
    match data
        .get("choices")
        .and_then(|choices| choices.get(0))
        .and_then(|choice| choice.get("message"))
        .and_then(|message| message.get("content"))
    {
        Some(Value::String(text)) => text.trim().to_string(),
        Some(Value::Array(parts)) => parts
            .iter()
            .filter_map(|part| {
                if let Some(text) = part.as_str() {
                    Some(text.to_string())
                } else {
                    part.get("text")
                        .or_else(|| part.get("content"))
                        .and_then(|value| value.as_str())
                        .map(|text| text.to_string())
                }
            })
            .collect::<Vec<_>>()
            .join("")
            .trim()
            .to_string(),
        _ => String::new(),
    }
}

fn decode_data_url(data_url: &str) -> Result<(String, Vec<u8>), ModelCommandError> {
    if data_url.len() > MAX_DATA_URL_BYTES.saturating_mul(4) / 3 + 1024 {
        return Err(command_error(
            "image",
            413,
            "素材超过 24 MB 限制。",
            false,
            false,
        ));
    }
    let (header, payload) = data_url
        .split_once(',')
        .ok_or_else(|| command_error("image", 400, "图片 data URL 格式不正确。", false, false))?;
    let mime = header
        .strip_prefix("data:")
        .and_then(|value| {
            value
                .split_once(";base64")
                .map(|(mime, _)| mime.to_string())
        })
        .unwrap_or_else(|| "image/png".to_string());
    let bytes = general_purpose::STANDARD
        .decode(payload)
        .map_err(|_| command_error("image", 400, "图片 base64 解码失败。", false, false))?;
    if bytes.len() > MAX_DATA_URL_BYTES {
        return Err(command_error(
            "image",
            413,
            "素材超过 24 MB 限制。",
            false,
            false,
        ));
    }
    Ok((mime, bytes))
}

fn color_distance_squared(a: [u8; 3], b: [u8; 3]) -> u32 {
    let dr = a[0] as i32 - b[0] as i32;
    let dg = a[1] as i32 - b[1] as i32;
    let db = a[2] as i32 - b[2] as i32;
    (dr * dr + dg * dg + db * db) as u32
}

fn edge_pixels(rgba: &[u8], width: usize, height: usize) -> Vec<[u8; 3]> {
    let mut pixels = Vec::with_capacity(width.saturating_mul(2) + height.saturating_mul(2));
    if width == 0 || height == 0 {
        return pixels;
    }

    let mut push_pixel = |x: usize, y: usize| {
        let index = (y * width + x) * 4;
        if rgba.get(index + 3).copied().unwrap_or(0) > 220 {
            pixels.push([rgba[index], rgba[index + 1], rgba[index + 2]]);
        }
    };

    for x in 0..width {
        push_pixel(x, 0);
        push_pixel(x, height - 1);
    }
    for y in 0..height {
        push_pixel(0, y);
        push_pixel(width - 1, y);
    }
    pixels
}

fn dominant_edge_color(frames: &[Vec<u8>], width: usize, height: usize) -> Option<([u8; 3], f32)> {
    let mut buckets: HashMap<(u8, u8, u8), usize> = HashMap::new();
    let mut total = 0usize;

    for frame in frames.iter().take(6) {
        for [red, green, blue] in edge_pixels(frame, width, height) {
            let key = (red / 16, green / 16, blue / 16);
            *buckets.entry(key).or_insert(0) += 1;
            total += 1;
        }
    }

    let ((red, green, blue), count) = buckets.into_iter().max_by_key(|(_, count)| *count)?;
    let color = [
        red.saturating_mul(16).saturating_add(8),
        green.saturating_mul(16).saturating_add(8),
        blue.saturating_mul(16).saturating_add(8),
    ];
    Some((color, count as f32 / total.max(1) as f32))
}

fn frame_edge_match_ratio(
    frame: &[u8],
    width: usize,
    height: usize,
    color: [u8; 3],
    tolerance_sq: u32,
) -> f32 {
    let pixels = edge_pixels(frame, width, height);
    if pixels.is_empty() {
        return 0.0;
    }
    let matches = pixels
        .iter()
        .filter(|pixel| color_distance_squared(**pixel, color) <= tolerance_sq)
        .count();
    matches as f32 / pixels.len() as f32
}

fn remove_solid_edge_background(
    rgba: &mut [u8],
    width: usize,
    height: usize,
    color: [u8; 3],
    tolerance_sq: u32,
) {
    if width == 0 || height == 0 {
        return;
    }

    let mut visited = vec![false; width * height];
    let mut queue = VecDeque::new();

    for x in 0..width {
        queue.push_back(x);
        queue.push_back((height - 1) * width + x);
    }
    for y in 0..height {
        queue.push_back(y * width);
        queue.push_back(y * width + width - 1);
    }

    while let Some(pixel) = queue.pop_front() {
        if pixel >= visited.len() || visited[pixel] {
            continue;
        }
        visited[pixel] = true;

        let index = pixel * 4;
        let alpha = rgba[index + 3];
        let current = [rgba[index], rgba[index + 1], rgba[index + 2]];
        let is_background = alpha < 24 || color_distance_squared(current, color) <= tolerance_sq;
        if !is_background {
            continue;
        }

        rgba[index + 3] = 0;
        let x = pixel % width;
        let y = pixel / width;
        if x > 0 {
            queue.push_back(pixel - 1);
        }
        if x + 1 < width {
            queue.push_back(pixel + 1);
        }
        if y > 0 {
            queue.push_back(pixel - width);
        }
        if y + 1 < height {
            queue.push_back(pixel + width);
        }
    }
}

fn encode_png_rgba(width: usize, height: usize, rgba: &[u8]) -> Result<Vec<u8>, ModelCommandError> {
    let mut bytes = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut bytes, width as u32, height as u32);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        let mut writer = encoder
            .write_header()
            .map_err(|error| command_error("image", 500, error.to_string(), false, false))?;
        writer
            .write_image_data(rgba)
            .map_err(|error| command_error("image", 500, error.to_string(), false, false))?;
    }
    Ok(bytes)
}

fn current_day_index() -> u64 {
    use chrono::Datelike;
    shanghai_now().date_naive().num_days_from_ce() as u64
}

fn current_week_index() -> u64 {
    use chrono::Datelike;
    let week = shanghai_now().iso_week();
    (week.year() as u64) * 100 + week.week() as u64
}

fn current_local_hour_index() -> usize {
    use chrono::Timelike;
    shanghai_now().hour() as usize
}

fn current_weekday_index() -> usize {
    use chrono::Datelike;
    shanghai_now().weekday().num_days_from_monday() as usize
}

fn shanghai_now() -> chrono::DateTime<chrono_tz::Tz> {
    shanghai_at(chrono::Utc::now())
}

fn shanghai_at(value: chrono::DateTime<chrono::Utc>) -> chrono::DateTime<chrono_tz::Tz> {
    value.with_timezone(&chrono_tz::Asia::Shanghai)
}

fn current_local_date() -> String {
    local_date_at(chrono::Utc::now())
}

fn local_date_at(value: chrono::DateTime<chrono::Utc>) -> String {
    shanghai_at(value).format("%Y-%m-%d").to_string()
}

fn current_iso_week() -> String {
    iso_week_at(chrono::Utc::now())
}

fn iso_week_at(value: chrono::DateTime<chrono::Utc>) -> String {
    use chrono::Datelike;
    let week = shanghai_at(value).iso_week();
    format!("{:04}-W{:02}", week.year(), week.week())
}

impl UsageTracker {
    fn reset_for_week(&mut self, week_index: u64) {
        self.week_index = week_index;
        self.day_index = current_day_index();
        self.last_sample = None;
        self.apps.clear();
        self.active_seconds = 0;
        self.idle_seconds = 0;
        self.hourly_active_seconds = vec![0; 24];
        self.daily_active_seconds = vec![0; 7];
        self.rule_last_notified.clear();
    }

    fn ensure_bucket_lengths(&mut self) {
        if self.hourly_active_seconds.len() != 24 {
            self.hourly_active_seconds.resize(24, 0);
        }
        if self.daily_active_seconds.len() != 7 {
            self.daily_active_seconds.resize(7, 0);
        }
    }

    fn reset_for_day(&mut self, day_index: u64) {
        self.day_index = day_index;
        self.last_sample = None;
        self.apps.clear();
        self.active_seconds = 0;
        self.idle_seconds = 0;
        self.hourly_active_seconds = vec![0; 24];
    }

    fn load_current_week(&mut self, app: &tauri::AppHandle) {
        if self.loaded {
            return;
        }
        self.loaded = true;

        let week_index = current_week_index();
        self.reset_for_week(week_index);
        let storage_state = app.state::<storage::StorageState>();
        if let Ok(seed) = storage::load_usage_seed(
            storage_state.inner(),
            &current_local_date(),
            &current_iso_week(),
        ) {
            self.active_seconds = seed.active_seconds;
            self.idle_seconds = seed.idle_seconds;
            self.apps = seed
                .apps
                .into_iter()
                .map(|(app_name, executable, seconds)| {
                    let key = executable.to_lowercase();
                    (
                        key,
                        UsageAppCounter {
                            app_name,
                            executable,
                            seconds,
                        },
                    )
                })
                .collect();
            self.hourly_active_seconds = seed.hourly_active_seconds;
            self.daily_active_seconds = seed.daily_active_seconds;
            self.ensure_bucket_lengths();
        }
        self.last_sample = None;
    }

    fn snapshot(&mut self, app_handle: &tauri::AppHandle) -> UsageSnapshot {
        self.load_current_week(app_handle);

        let week_index = current_week_index();
        if self.week_index != week_index {
            self.reset_for_week(week_index);
            self.loaded = false;
            self.load_current_week(app_handle);
        }
        self.ensure_bucket_lengths();

        let day_index = current_day_index();
        if self.day_index != day_index {
            self.reset_for_day(day_index);
            let storage_state = app_handle.state::<storage::StorageState>();
            if let Ok(seed) = storage::load_usage_seed(
                storage_state.inner(),
                &current_local_date(),
                &current_iso_week(),
            ) {
                self.active_seconds = seed.active_seconds;
                self.idle_seconds = seed.idle_seconds;
                self.apps = seed
                    .apps
                    .into_iter()
                    .map(|(app_name, executable, seconds)| {
                        let key = executable.to_lowercase();
                        (
                            key,
                            UsageAppCounter {
                                app_name,
                                executable,
                                seconds,
                            },
                        )
                    })
                    .collect();
                self.hourly_active_seconds = seed.hourly_active_seconds;
                self.daily_active_seconds = seed.daily_active_seconds;
            }
        }

        let now = Instant::now();
        let delta_seconds = self
            .last_sample
            .replace(now)
            .map(|last| now.saturating_duration_since(last).as_secs().min(30))
            .unwrap_or(0);

        let idle_now = current_idle_seconds();
        let app = current_foreground_app().unwrap_or_else(|| ForegroundApp {
            app_name: "Unknown".to_string(),
            executable: "unknown".to_string(),
            title: String::new(),
        });

        if delta_seconds > 0 {
            let mut active_delta = 0;
            let mut idle_delta = 0;
            if idle_now >= 60 {
                self.idle_seconds = self.idle_seconds.saturating_add(delta_seconds);
                idle_delta = delta_seconds;
            } else {
                self.active_seconds = self.active_seconds.saturating_add(delta_seconds);
                active_delta = delta_seconds;
                let hour = current_local_hour_index();
                let weekday = current_weekday_index();
                self.hourly_active_seconds[hour] =
                    self.hourly_active_seconds[hour].saturating_add(delta_seconds);
                self.daily_active_seconds[weekday] =
                    self.daily_active_seconds[weekday].saturating_add(delta_seconds);
                let key = app.executable.to_lowercase();
                let counter = self.apps.entry(key).or_insert_with(|| UsageAppCounter {
                    app_name: app.app_name.clone(),
                    executable: app.executable.clone(),
                    seconds: 0,
                });
                counter.app_name = app.app_name.clone();
                counter.executable = app.executable.clone();
                counter.seconds = counter.seconds.saturating_add(delta_seconds);
            }
            let storage_state = app_handle.state::<storage::StorageState>();
            let _ = storage::record_usage_delta(
                storage_state.inner(),
                storage::UsageDelta {
                    local_date: current_local_date(),
                    iso_week: current_iso_week(),
                    hour: current_local_hour_index(),
                    app_id: app.executable.to_lowercase(),
                    app_name: app.app_name.clone(),
                    active_seconds: active_delta,
                    idle_seconds: idle_delta,
                },
            );
            self.evaluate_rules(app_handle, &app, idle_now);
        }

        let mut apps = self
            .apps
            .values()
            .map(|item| UsageAppSnapshot {
                app_name: item.app_name.clone(),
                executable: item.executable.clone(),
                seconds: item.seconds,
            })
            .collect::<Vec<_>>();
        apps.sort_by(|a, b| {
            b.seconds
                .cmp(&a.seconds)
                .then_with(|| a.app_name.cmp(&b.app_name))
        });

        UsageSnapshot {
            current_app: UsageAppSnapshot {
                app_name: app.app_name,
                executable: app.executable,
                seconds: 0,
            },
            apps,
            active_seconds: self.active_seconds,
            idle_seconds: self.idle_seconds,
            total_seconds: self.active_seconds.saturating_add(self.idle_seconds),
            current_idle_seconds: idle_now,
            week_index: self.week_index,
            day_index: self.day_index,
            hourly_active_seconds: self.hourly_active_seconds.clone(),
            daily_active_seconds: self.daily_active_seconds.clone(),
        }
    }

    fn evaluate_rules(
        &mut self,
        app_handle: &tauri::AppHandle,
        foreground: &ForegroundApp,
        idle_now: u64,
    ) {
        use chrono::Timelike;
        let storage_state = app_handle.state::<storage::StorageState>();
        let Ok(rules) = storage::load_usage_rules_internal(storage_state.inner()) else {
            return;
        };
        let now = shanghai_now();
        let current_minutes = now.hour() * 60 + now.minute();
        for rule in rules.into_iter().filter(|rule| rule.enabled) {
            let schedule_matches = match (&rule.schedule_start, &rule.schedule_end) {
                (Some(start), Some(end)) => {
                    let parse = |value: &str| -> Option<u32> {
                        let (hour, minute) = value.split_once(':')?;
                        let hour = hour.parse::<u32>().ok()?;
                        let minute = minute.parse::<u32>().ok()?;
                        (hour < 24 && minute < 60).then_some(hour * 60 + minute)
                    };
                    match (parse(start), parse(end)) {
                        (Some(start), Some(end)) if start <= end => {
                            current_minutes >= start && current_minutes <= end
                        }
                        (Some(start), Some(end)) => {
                            current_minutes >= start || current_minutes <= end
                        }
                        _ => false,
                    }
                }
                _ => true,
            };
            if !schedule_matches {
                continue;
            }
            let pattern = rule
                .app_pattern
                .as_deref()
                .unwrap_or("")
                .trim()
                .to_lowercase();
            if !pattern.is_empty()
                && !foreground.app_name.to_lowercase().contains(&pattern)
                && !foreground.executable.to_lowercase().contains(&pattern)
            {
                continue;
            }
            if idle_now >= rule.recovery_minutes as u64 * 60 {
                self.rule_last_notified.remove(&rule.id);
                continue;
            }
            let used_seconds = if pattern.is_empty() {
                self.active_seconds
            } else {
                self.apps
                    .get(&foreground.executable.to_lowercase())
                    .map(|value| value.seconds)
                    .unwrap_or(0)
            };
            if used_seconds < rule.daily_limit_minutes as u64 * 60 {
                continue;
            }
            let cooldown_ready = self.rule_last_notified.get(&rule.id).is_none_or(|last| {
                last.elapsed() >= Duration::from_secs(rule.cooldown_minutes.max(1) as u64 * 60)
            });
            if !cooldown_ready {
                continue;
            }
            if rule.notify {
                let _ = app_handle
                    .notification()
                    .builder()
                    .title(format!("Lumpa · {}", rule.name))
                    .body(format!(
                        "已达到 {} 分钟监督阈值，休息 {} 分钟后再继续。",
                        rule.daily_limit_minutes, rule.recovery_minutes
                    ))
                    .show();
            }
            self.rule_last_notified.insert(rule.id, Instant::now());
        }
    }
}

fn current_idle_seconds() -> u64 {
    #[cfg(windows)]
    {
        windows_current_idle_seconds()
    }

    #[cfg(not(windows))]
    {
        0
    }
}

fn current_foreground_app() -> Option<ForegroundApp> {
    #[cfg(windows)]
    {
        windows_foreground_app()
    }

    #[cfg(not(windows))]
    {
        None
    }
}

#[cfg(windows)]
fn windows_current_idle_seconds() -> u64 {
    use windows::Win32::System::SystemInformation::GetTickCount;
    use windows::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};

    unsafe {
        let mut info = LASTINPUTINFO {
            cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
            dwTime: 0,
        };
        if GetLastInputInfo(&mut info).as_bool() {
            let tick = GetTickCount();
            tick.saturating_sub(info.dwTime) as u64 / 1000
        } else {
            0
        }
    }
}

#[tauri::command]
fn get_usage_snapshot(
    app_handle: tauri::AppHandle,
    state: tauri::State<UsageState>,
    storage_state: tauri::State<storage::StorageState>,
) -> Result<UsageSnapshot, String> {
    storage::require_permission(storage_state.inner(), "usageStats")?;
    let mut tracker = state
        .0
        .lock()
        .map_err(|_| "usage tracker lock poisoned".to_string())?;
    Ok(tracker.snapshot(&app_handle))
}

#[tauri::command]
fn get_active_foreground_window() -> Option<ForegroundApp> {
    #[cfg(windows)]
    {
        windows_foreground_app()
    }
    #[cfg(not(windows))]
    {
        None
    }
}

#[cfg(windows)]
fn windows_foreground_app() -> Option<ForegroundApp> {
    use windows::core::PWSTR;
    use windows::Win32::Foundation::CloseHandle;
    use windows::Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_FORMAT,
        PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextW, GetWindowThreadProcessId};

    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.0.is_null() {
            return None;
        }

        let mut title_buf = vec![0u16; 512];
        let title_len = GetWindowTextW(hwnd, &mut title_buf);
        let title = if title_len > 0 {
            String::from_utf16_lossy(&title_buf[..title_len as usize])
        } else {
            String::new()
        };

        let mut process_id = 0u32;
        GetWindowThreadProcessId(hwnd, Some(&mut process_id));
        if process_id == 0 {
            return None;
        }

        let process = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, process_id).ok()?;
        let mut buffer = vec![0u16; 32_768];
        let mut size = buffer.len() as u32;
        let query = QueryFullProcessImageNameW(
            process,
            PROCESS_NAME_FORMAT(0),
            PWSTR(buffer.as_mut_ptr()),
            &mut size,
        );
        let _ = CloseHandle(process);
        query.ok()?;

        let path = String::from_utf16_lossy(&buffer[..size as usize]);
        let executable = path
            .rsplit(['\\', '/'])
            .next()
            .filter(|value| !value.is_empty())
            .unwrap_or("unknown.exe")
            .to_string();
        let app_name = executable
            .strip_suffix(".exe")
            .unwrap_or(&executable)
            .to_string();

        Some(ForegroundApp {
            app_name,
            executable,
            title,
        })
    }
}

fn blend_rgba_pixel(dst: &mut [u8], src: &[u8]) {
    let alpha = src[3] as u32;
    if alpha == 0 {
        return;
    }
    if alpha >= 255 {
        dst.copy_from_slice(src);
        return;
    }

    let inv = 255 - alpha;
    dst[0] = ((src[0] as u32 * alpha + dst[0] as u32 * inv) / 255) as u8;
    dst[1] = ((src[1] as u32 * alpha + dst[1] as u32 * inv) / 255) as u8;
    dst[2] = ((src[2] as u32 * alpha + dst[2] as u32 * inv) / 255) as u8;
    dst[3] = (alpha + dst[3] as u32 * inv / 255).min(255) as u8;
}

fn decoded_gif_pixels(
    width: usize,
    height: usize,
    frame_count: usize,
) -> Result<usize, ModelCommandError> {
    let pixels = width
        .checked_mul(height)
        .and_then(|value| value.checked_mul(frame_count))
        .ok_or_else(|| command_error("image", 413, "GIF 解码预算溢出。", false, false))?;
    if pixels > MAX_GIF_DECODED_PIXELS {
        return Err(command_error(
            "image",
            413,
            "GIF 解码后像素总量超过限制。",
            false,
            false,
        ));
    }
    Ok(pixels)
}

#[tauri::command]
fn process_gif_action(payload: GifActionPayload) -> Result<GifActionResponse, ModelCommandError> {
    let (mime, bytes) = decode_data_url(&payload.image)?;
    if !mime.to_ascii_lowercase().contains("gif") {
        return Err(command_error(
            "image",
            400,
            "请上传 GIF 文件。",
            false,
            false,
        ));
    }

    let max_frames = payload.max_frames.unwrap_or(48).clamp(1, 48);
    let max_duration_ms = payload.max_duration_ms.unwrap_or(6000).clamp(200, 6000);
    let mut options = gif::DecodeOptions::new();
    options.set_color_output(gif::ColorOutput::RGBA);
    let mut reader = options.read_info(Cursor::new(bytes)).map_err(|error| {
        command_error(
            "image",
            400,
            format!("GIF 解码失败：{}", error),
            false,
            false,
        )
    })?;
    let width = reader.width() as usize;
    let height = reader.height() as usize;
    if width == 0 || height == 0 || width > 2048 || height > 2048 {
        return Err(command_error(
            "image",
            400,
            "GIF 尺寸不支持。",
            false,
            false,
        ));
    }

    let mut canvas = vec![0u8; width * height * 4];
    let mut frames: Vec<Vec<u8>> = Vec::new();
    let mut durations = Vec::new();
    let mut total_duration_ms = 0u32;
    let mut truncated = false;

    loop {
        let frame = reader.read_next_frame().map_err(|error| {
            command_error(
                "image",
                400,
                format!("GIF 读取帧失败：{}", error),
                false,
                false,
            )
        })?;
        let Some(frame) = frame else { break };

        if frames.len() >= max_frames || total_duration_ms >= max_duration_ms {
            truncated = true;
            break;
        }

        decoded_gif_pixels(width, height, frames.len().saturating_add(1))?;

        let before_frame = if matches!(frame.dispose, gif::DisposalMethod::Previous) {
            Some(canvas.clone())
        } else {
            None
        };

        let frame_width = frame.width as usize;
        let frame_height = frame.height as usize;
        if frame_width
            .checked_mul(frame_height)
            .and_then(|pixels| pixels.checked_mul(4))
            .is_none_or(|required| required > frame.buffer.len())
        {
            return Err(command_error(
                "image",
                400,
                "GIF 帧数据不完整。",
                false,
                false,
            ));
        }
        let left = frame.left as usize;
        let top = frame.top as usize;
        for y in 0..frame_height {
            for x in 0..frame_width {
                let dst_x = left + x;
                let dst_y = top + y;
                if dst_x >= width || dst_y >= height {
                    continue;
                }
                let src_index = (y * frame_width + x) * 4;
                let dst_index = (dst_y * width + dst_x) * 4;
                blend_rgba_pixel(
                    &mut canvas[dst_index..dst_index + 4],
                    &frame.buffer[src_index..src_index + 4],
                );
            }
        }

        let duration_ms = if frame.delay == 0 {
            80
        } else {
            (frame.delay as u32 * 10).max(20)
        };
        frames.push(canvas.clone());
        durations.push(duration_ms);
        total_duration_ms = total_duration_ms.saturating_add(duration_ms);

        match frame.dispose {
            gif::DisposalMethod::Background => {
                for y in 0..frame_height {
                    for x in 0..frame_width {
                        let dst_x = left + x;
                        let dst_y = top + y;
                        if dst_x >= width || dst_y >= height {
                            continue;
                        }
                        let dst_index = (dst_y * width + dst_x) * 4;
                        canvas[dst_index..dst_index + 4].copy_from_slice(&[0, 0, 0, 0]);
                    }
                }
            }
            gif::DisposalMethod::Previous => {
                if let Some(previous) = before_frame {
                    canvas = previous;
                }
            }
            _ => {}
        }
    }

    if frames.is_empty() {
        return Err(command_error(
            "image",
            400,
            "GIF 没有可用帧。",
            false,
            false,
        ));
    }

    let had_transparency = frames
        .iter()
        .any(|frame| frame.chunks_exact(4).any(|pixel| pixel[3] < 245));
    let mut background_removed = false;
    let mut background_removal = if had_transparency {
        "already-transparent"
    } else {
        "none"
    }
    .to_string();

    if !had_transparency {
        let tolerance_sq = 46u32 * 46u32 * 3u32;
        if let Some((background, dominance)) = dominant_edge_color(&frames, width, height) {
            let stable_background = dominance >= 0.42
                && frames.iter().take(12).all(|frame| {
                    frame_edge_match_ratio(frame, width, height, background, tolerance_sq) >= 0.58
                });
            if stable_background {
                for frame in &mut frames {
                    remove_solid_edge_background(frame, width, height, background, tolerance_sq);
                }
                background_removed = true;
                background_removal = "solid-edge".to_string();
            } else {
                background_removal = "complex-background".to_string();
            }
        } else {
            background_removal = "complex-background".to_string();
        }
    }

    let mut response_frames = Vec::with_capacity(frames.len());
    for (index, frame) in frames.iter().enumerate() {
        let png = encode_png_rgba(width, height, frame)?;
        response_frames.push(GifFrameResponse {
            image: format!(
                "data:image/png;base64,{}",
                general_purpose::STANDARD.encode(png)
            ),
            duration_ms: durations.get(index).copied().unwrap_or(80),
        });
    }
    let preview = response_frames
        .first()
        .map(|frame| frame.image.clone())
        .unwrap_or_default();

    Ok(GifActionResponse {
        frames: response_frames,
        preview,
        width: width as u16,
        height: height as u16,
        total_duration_ms,
        has_transparency: had_transparency || background_removed,
        background_removed,
        background_removal,
        truncated,
    })
}

fn image_result_to_data_url(data: &Value) -> Option<String> {
    let candidates = [
        data.get("data").and_then(|items| items.get(0)),
        data.get("images").and_then(|items| items.get(0)),
        data.get("output").and_then(|items| items.get(0)),
        data.get("result").and_then(|items| items.get(0)),
    ];
    let item = candidates.into_iter().flatten().next()?;
    if let Some(b64) = item
        .get("b64_json")
        .or_else(|| item.get("base64"))
        .or_else(|| item.get("image_base64"))
        .and_then(|value| value.as_str())
    {
        return Some(format!("data:image/png;base64,{}", b64));
    }
    item.get("url")
        .or_else(|| item.get("image_url"))
        .and_then(|value| {
            if let Some(text) = value.as_str() {
                Some(text.to_string())
            } else {
                value
                    .get("url")
                    .and_then(|nested| nested.as_str())
                    .map(|text| text.to_string())
            }
        })
}

fn media_string_from_item(item: &Value) -> Option<(String, bool)> {
    if let Some(text) = item.as_str() {
        if text.starts_with("data:") || text.starts_with("http://") || text.starts_with("https://")
        {
            return Some((text.to_string(), !text.starts_with("http")));
        }
    }

    if let Some(b64) = item
        .get("b64_json")
        .or_else(|| item.get("base64"))
        .or_else(|| item.get("video_base64"))
        .or_else(|| item.get("content"))
        .and_then(|value| value.as_str())
    {
        if b64.starts_with("data:") {
            return Some((b64.to_string(), true));
        }
        if b64.len() > 128 {
            return Some((format!("data:video/mp4;base64,{}", b64), true));
        }
    }

    item.get("url")
        .or_else(|| item.get("video_url"))
        .or_else(|| item.get("output_url"))
        .or_else(|| item.get("download_url"))
        .or_else(|| item.get("file"))
        .or_else(|| item.get("video"))
        .and_then(|value| {
            if let Some(text) = value.as_str() {
                Some((text.to_string(), false))
            } else {
                value
                    .get("url")
                    .or_else(|| value.get("video_url"))
                    .and_then(|nested| nested.as_str())
                    .map(|text| (text.to_string(), false))
            }
        })
}

fn video_result_value(data: &Value) -> Option<(String, bool)> {
    if let Some(result) = media_string_from_item(data) {
        return Some(result);
    }

    for key in ["data", "videos", "video", "output", "result", "results"] {
        if let Some(array) = data.get(key).and_then(|value| value.as_array()) {
            for item in array {
                if let Some(result) = media_string_from_item(item) {
                    return Some(result);
                }
            }
        }
        if let Some(item) = data.get(key) {
            if let Some(result) = media_string_from_item(item) {
                return Some(result);
            }
        }
    }

    None
}

fn data_url_content_type(data_url: &str, fallback: &str) -> String {
    data_url
        .strip_prefix("data:")
        .and_then(|value| value.split_once(';').map(|(mime, _)| mime.to_string()))
        .unwrap_or_else(|| fallback.to_string())
}

fn data_url_from_base64(value: &str, content_type: &str) -> String {
    if value.starts_with("data:") {
        value.to_string()
    } else {
        format!("data:{};base64,{}", content_type, value)
    }
}

fn inline_frame_pack_from_value(data: &Value) -> Option<VideoGenerationResponse> {
    let array = data
        .get("frames")
        .or_else(|| data.get("frameImages"))
        .or_else(|| data.get("images"))
        .and_then(|value| value.as_array())?;
    let mut frames = Vec::new();
    let mut durations = Vec::new();

    for (index, item) in array.iter().enumerate() {
        let image = if let Some(text) = item.as_str() {
            text.to_string()
        } else {
            item.get("image")
                .or_else(|| item.get("dataUrl"))
                .or_else(|| item.get("data_url"))
                .or_else(|| item.get("b64_json"))
                .or_else(|| item.get("base64"))
                .and_then(|value| value.as_str())
                .map(|value| data_url_from_base64(value, "image/png"))?
        };
        if !image.starts_with("data:image/") {
            continue;
        }
        let duration = item
            .get("durationMs")
            .or_else(|| item.get("duration_ms"))
            .or_else(|| item.get("duration"))
            .and_then(|value| value.as_u64())
            .map(|value| value.clamp(20, 1000) as u32)
            .unwrap_or(80);
        frames.push(image);
        durations.push(duration);
        if index >= 47 {
            break;
        }
    }

    if frames.is_empty() {
        None
    } else {
        Some(VideoGenerationResponse::frame_pack(frames, durations))
    }
}

fn inline_media_from_value(data: &Value) -> Option<VideoGenerationResponse> {
    if let Some(frame_pack) = inline_frame_pack_from_value(data) {
        return Some(frame_pack);
    }

    for (key, content_type) in [
        ("gif", "image/gif"),
        ("gifBase64", "image/gif"),
        ("gif_base64", "image/gif"),
        ("videoBase64", "video/mp4"),
        ("video_base64", "video/mp4"),
        ("video", "video/mp4"),
        ("content", "video/mp4"),
    ] {
        if let Some(text) = data.get(key).and_then(|value| value.as_str()) {
            if text.starts_with("http://") || text.starts_with("https://") {
                continue;
            }
            let data_url = data_url_from_base64(text, content_type);
            let mime = data_url_content_type(&data_url, content_type);
            return Some(VideoGenerationResponse::media(data_url, mime));
        }
    }

    if let Some((media, _inline)) = video_result_value(data) {
        if media.starts_with("data:") {
            let content_type = data_url_content_type(&media, "video/mp4");
            return Some(VideoGenerationResponse::media(media, content_type));
        }
    }

    None
}

fn task_id_from_video_result(data: &Value) -> Option<String> {
    data.get("id")
        .or_else(|| data.get("task_id"))
        .or_else(|| data.get("taskId"))
        .or_else(|| data.get("job_id"))
        .or_else(|| data.get("request_id"))
        .and_then(|value| value.as_str())
        .map(|value| value.to_string())
}

fn url_host_label(url: &str) -> String {
    url.split_once("://")
        .and_then(|(_, rest)| rest.split('/').next())
        .filter(|host| !host.trim().is_empty())
        .unwrap_or("视频文件地址")
        .to_string()
}

fn video_download_error(url: &str, detail: &str) -> ModelCommandError {
    let host = url_host_label(url);
    let trimmed = detail.trim();
    let suffix = if trimmed.is_empty() {
        "".to_string()
    } else {
        format!(" 原始错误：{}", trimmed)
    };
    command_error(
        "image",
        502,
        format!(
            "视频已经生成，但无法下载 {} 的 mp4 文件用于本地抽帧。当前网络可能无法访问 xAI 视频存储；请换可直连的视频模型，或让中转站提供 base64/文件代理。{}",
            host, suffix
        ),
        false,
        false,
    )
}

async fn send_media_download_request(
    client: &reqwest::Client,
    api_key: &str,
    url: &str,
) -> Result<reqwest::Response, reqwest::Error> {
    let mut request = client
        .get(url)
        .header(
            reqwest::header::USER_AGENT,
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Lumpa/0.1",
        )
        .header(reqwest::header::ACCEPT, "video/mp4,video/*,*/*;q=0.8");
    if !api_key.is_empty() && url.contains("/v1/") {
        request = request.bearer_auth(api_key);
    }
    request.send().await
}

async fn download_media_as_data_url(
    client: &reqwest::Client,
    api_key: &str,
    url: &str,
) -> Result<VideoGenerationResponse, ModelCommandError> {
    if url.starts_with("data:") {
        let (_, bytes) = decode_data_url(url)?;
        if bytes.len() > MAX_MEDIA_DOWNLOAD_BYTES {
            return Err(command_error(
                "image",
                413,
                "媒体超过 64 MB 限制。",
                false,
                false,
            ));
        }
        let content_type = url
            .strip_prefix("data:")
            .and_then(|value| value.split_once(';').map(|(mime, _)| mime.to_string()))
            .unwrap_or_else(|| "video/mp4".to_string());
        return Ok(VideoGenerationResponse::media(
            url.to_string(),
            content_type,
        ));
    }

    validate_network_url(url, true)
        .map_err(|message| command_error("image", 400, message, false, false))?;

    let response = match send_media_download_request(client, api_key, url).await {
        Ok(response) => response,
        Err(first_error) => {
            let retry_client = restricted_http_client(Duration::from_secs(45), true)
                .map_err(|error| command_error("image", 500, error.to_string(), false, false))?;
            send_media_download_request(&retry_client, api_key, url)
                .await
                .map_err(|second_error| {
                    video_download_error(
                        url,
                        &format!(
                            "默认下载失败：{}；直连重试失败：{}",
                            first_error, second_error
                        ),
                    )
                })?
        }
    };
    if !response.status().is_success() {
        let status = response.status().as_u16();
        let text = read_response_limited(response, MAX_API_RESPONSE_BYTES, "image")
            .await
            .map(|bytes| String::from_utf8_lossy(&bytes).to_string())
            .unwrap_or_default();
        return Err(video_download_error(
            url,
            &format!(
                "HTTP {} {}",
                status,
                friendly_upstream_message("image", &text)
            ),
        ));
    }
    let content_type = response
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .unwrap_or("video/mp4")
        .to_string();
    if !content_type.starts_with("video/") && content_type != "application/octet-stream" {
        return Err(command_error(
            "image",
            415,
            "媒体下载返回了不允许的内容类型。",
            false,
            false,
        ));
    }
    let bytes = read_response_limited(response, MAX_MEDIA_DOWNLOAD_BYTES, "image").await?;
    Ok(VideoGenerationResponse::media(
        format!(
            "data:{};base64,{}",
            content_type,
            general_purpose::STANDARD.encode(bytes)
        ),
        content_type,
    ))
}

async fn resolve_video_media(
    client: &reqwest::Client,
    api_key: &str,
    media: &str,
) -> Result<VideoGenerationResponse, ModelCommandError> {
    if media.starts_with("data:") {
        return download_media_as_data_url(client, api_key, media).await;
    }

    download_media_as_data_url(client, api_key, media).await
}

fn pcm16_to_wav(pcm: &[u8], sample_rate: u32) -> Vec<u8> {
    let channels = 1u16;
    let bits_per_sample = 16u16;
    let byte_rate = sample_rate * channels as u32 * (bits_per_sample as u32 / 8);
    let block_align = channels * (bits_per_sample / 8);
    let mut wav = Vec::with_capacity(44 + pcm.len());

    wav.extend_from_slice(b"RIFF");
    wav.extend_from_slice(&(36 + pcm.len() as u32).to_le_bytes());
    wav.extend_from_slice(b"WAVE");
    wav.extend_from_slice(b"fmt ");
    wav.extend_from_slice(&16u32.to_le_bytes());
    wav.extend_from_slice(&1u16.to_le_bytes());
    wav.extend_from_slice(&channels.to_le_bytes());
    wav.extend_from_slice(&sample_rate.to_le_bytes());
    wav.extend_from_slice(&byte_rate.to_le_bytes());
    wav.extend_from_slice(&block_align.to_le_bytes());
    wav.extend_from_slice(&bits_per_sample.to_le_bytes());
    wav.extend_from_slice(b"data");
    wav.extend_from_slice(&(pcm.len() as u32).to_le_bytes());
    wav.extend_from_slice(pcm);
    wav
}

fn sample_rate_from_mime(mime: &str) -> u32 {
    mime.split(';')
        .find_map(|part| {
            let part = part.trim();
            part.strip_prefix("rate=")
                .and_then(|rate| rate.parse::<u32>().ok())
        })
        .unwrap_or(24000)
}

#[tauri::command]
fn get_start_mode(app: tauri::AppHandle) -> String {
    if let Some(state) = app.try_state::<StartModeState>() {
        if let Ok(value) = state.0.lock() {
            if !value.is_empty() {
                return value.clone();
            }
        }
    }

    std::env::var("RABBIT_DESK_PET_START_MODE").unwrap_or_default()
}

#[tauri::command]
async fn model_chat(
    state: tauri::State<'_, ModelStopState>,
    storage: tauri::State<'_, storage::StorageState>,
    sessions: tauri::State<'_, gateway_client::GatewaySessionState>,
    payload: ChatPayload,
) -> Result<ChatResponse, ModelCommandError> {
    check_stopped(&state, "chat")?;
    storage::require_permission(storage.inner(), "chatNetwork")
        .map_err(|message| command_error("chat", 403, message, false, false))?;

    if payload.messages.is_empty() {
        return Err(command_error(
            "chat",
            400,
            "messages 不能为空。",
            false,
            false,
        ));
    }

    let provider =
        gateway_client::resolve_provider(storage.inner(), sessions.inner(), &payload.provider_id)
            .map_err(|message| command_error("chat", 403, message, false, false))?;
    let api_base = secure_api_base(Some(provider.api_base), DEFAULT_GATEWAY_API_BASE, "chat")?;
    let api_key = provider.credential;
    if api_base.is_empty() || api_key.is_empty() {
        return Err(command_error(
            "chat",
            403,
            "请登录 Lumpa 账号或配置自己的 HTTPS API 地址和 Key。",
            false,
            false,
        ));
    }
    let model = clean_string(Some(provider.profile.chat_model)).if_empty(DEFAULT_CHAT_MODEL);
    let messages = payload
        .messages
        .into_iter()
        .map(|message| json!({ "role": message.role, "content": message.content }))
        .collect::<Vec<_>>();

    let client = restricted_http_client(Duration::from_secs(60), true)
        .map_err(|error| command_error("chat", 500, error, false, false))?;
    let response = client
        .post(format!("{}/chat/completions", api_base))
        .bearer_auth(api_key)
        .json(&json!({
            "model": model,
            "temperature": payload.temperature.unwrap_or(0.8),
            "max_tokens": payload.max_tokens.unwrap_or(180),
            "messages": messages,
        }))
        .send()
        .await
        .map_err(|error| command_error("chat", 502, error.to_string(), false, false))?;

    let status = response.status().as_u16();
    let text =
        String::from_utf8(read_response_limited(response, MAX_API_RESPONSE_BYTES, "chat").await?)
            .map_err(|_| command_error("chat", 502, "聊天响应不是有效文本。", false, false))?;
    if !(200..300).contains(&status) {
        return Err(upstream_error(&state, "chat", status, text).await);
    }

    let data: Value = serde_json::from_str(&text)
        .map_err(|error| command_error("chat", 502, error.to_string(), false, false))?;
    let reply = extract_chat_reply(&data);
    if reply.is_empty() {
        return Err(command_error(
            "chat",
            502,
            "聊天接口没有返回回复。",
            false,
            false,
        ));
    }

    Ok(ChatResponse { reply })
}

#[tauri::command]
async fn model_tts(
    state: tauri::State<'_, ModelStopState>,
    storage: tauri::State<'_, storage::StorageState>,
    sessions: tauri::State<'_, gateway_client::GatewaySessionState>,
    payload: TtsPayload,
) -> Result<TtsResponse, ModelCommandError> {
    check_stopped(&state, "tts")?;
    storage::require_permission(storage.inner(), "ttsNetwork")
        .map_err(|message| command_error("tts", 403, message, false, false))?;

    let text = payload.text.trim().to_string();
    if text.is_empty() {
        return Err(command_error("tts", 400, "text 不能为空。", false, false));
    }

    let provider =
        gateway_client::resolve_provider(storage.inner(), sessions.inner(), &payload.provider_id)
            .map_err(|message| command_error("tts", 403, message, false, false))?;
    let api_base = secure_api_base(Some(provider.api_base), DEFAULT_TTS_API_BASE, "tts")?
        .trim_end_matches("/openai")
        .to_string();
    let model = clean_string(Some(provider.profile.speech_model)).if_empty(DEFAULT_TTS_MODEL);
    let voice = clean_string(payload.voice).if_empty(DEFAULT_TTS_VOICE);
    let is_mimo_tts = model.to_ascii_lowercase().starts_with("mimo-v2.5-tts")
        || api_base.contains("xiaomimimo.com");
    let api_key = provider.credential;
    if api_key.is_empty() {
        return Err(command_error(
            "tts",
            403,
            "语音合成需要单独填写语音 API Key。",
            false,
            false,
        ));
    }

    if is_mimo_tts {
        let model_lower = model.to_ascii_lowercase();
        let voice_prompt = if voice.eq_ignore_ascii_case(DEFAULT_TTS_VOICE) {
            "温柔、清亮、自然、年轻的陪伴型声音，语速适中，适合可爱桌宠。".to_string()
        } else {
            voice.clone()
        };
        let user_content = if model_lower.contains("voicedesign") {
            voice_prompt
        } else if model_lower.contains("voiceclone") {
            String::new()
        } else {
            "请用自然、温柔、适合桌宠陪伴的语气朗读。".to_string()
        };
        let audio_payload = if model_lower.contains("voicedesign") {
            json!({
                "format": "wav",
                "optimize_text_preview": false
            })
        } else {
            json!({
                "voice": voice,
                "format": "wav"
            })
        };

        let client = restricted_http_client(Duration::from_secs(60), true)
            .map_err(|error| command_error("tts", 500, error, false, false))?;
        let response = client
            .post(format!("{}/chat/completions", api_base))
            .header("api-key", api_key)
            .json(&json!({
                "model": model,
                "messages": [
                    { "role": "user", "content": user_content },
                    { "role": "assistant", "content": text }
                ],
                "modalities": ["text", "audio"],
                "audio": audio_payload
            }))
            .send()
            .await
            .map_err(|error| command_error("tts", 502, error.to_string(), false, false))?;

        let status = response.status().as_u16();
        let text_response = String::from_utf8(
            read_response_limited(response, MAX_MEDIA_DOWNLOAD_BYTES, "tts").await?,
        )
        .map_err(|_| command_error("tts", 502, "语音响应不是有效文本。", false, false))?;
        if !(200..300).contains(&status) {
            return Err(upstream_error(&state, "tts", status, text_response).await);
        }

        let data: Value = serde_json::from_str(&text_response)
            .map_err(|error| command_error("tts", 502, error.to_string(), false, false))?;
        let audio_data = data
            .get("choices")
            .and_then(|items| items.get(0))
            .and_then(|choice| choice.get("message"))
            .and_then(|message| message.get("audio"))
            .and_then(|audio| audio.get("data"))
            .and_then(|value| value.as_str())
            .ok_or_else(|| command_error("tts", 502, "MiMo TTS 没有返回音频。", false, false))?;

        if let Some((header, payload)) = audio_data.split_once(',') {
            let content_type = header
                .trim_start_matches("data:")
                .trim_end_matches(";base64")
                .to_string();
            return Ok(TtsResponse {
                audio_base64: payload.to_string(),
                content_type: if content_type.is_empty() {
                    "audio/wav".to_string()
                } else {
                    content_type
                },
            });
        }

        return Ok(TtsResponse {
            audio_base64: audio_data.to_string(),
            content_type: "audio/wav".to_string(),
        });
    }

    if model.to_ascii_lowercase().contains("gemini")
        || api_base.contains("generativelanguage.googleapis.com")
    {
        let client = restricted_http_client(Duration::from_secs(60), true)
            .map_err(|error| command_error("tts", 500, error, false, false))?;
        let response = client
            .post(format!("{}/models/{}:generateContent", api_base, model))
            .header("x-goog-api-key", api_key)
            .json(&json!({
                "contents": [{ "parts": [{ "text": text }] }],
                "generationConfig": {
                    "responseModalities": ["AUDIO"],
                    "speechConfig": {
                        "voiceConfig": {
                            "prebuiltVoiceConfig": { "voiceName": voice }
                        }
                    }
                }
            }))
            .send()
            .await
            .map_err(|error| command_error("tts", 502, error.to_string(), false, false))?;

        let status = response.status().as_u16();
        let text_response = String::from_utf8(
            read_response_limited(response, MAX_MEDIA_DOWNLOAD_BYTES, "tts").await?,
        )
        .map_err(|_| command_error("tts", 502, "语音响应不是有效文本。", false, false))?;
        if !(200..300).contains(&status) {
            return Err(upstream_error(&state, "tts", status, text_response).await);
        }

        let data: Value = serde_json::from_str(&text_response)
            .map_err(|error| command_error("tts", 502, error.to_string(), false, false))?;
        let inline_data = data
            .get("candidates")
            .and_then(|items| items.get(0))
            .and_then(|candidate| candidate.get("content"))
            .and_then(|content| content.get("parts"))
            .and_then(|parts| parts.as_array())
            .and_then(|parts| parts.iter().find_map(|part| part.get("inlineData")));
        let audio_b64 = inline_data
            .and_then(|value| value.get("data"))
            .and_then(|value| value.as_str())
            .ok_or_else(|| command_error("tts", 502, "Gemini TTS 没有返回音频。", false, false))?;
        let mime = inline_data
            .and_then(|value| value.get("mimeType"))
            .and_then(|value| value.as_str())
            .unwrap_or("audio/L16;codec=pcm;rate=24000");
        let audio = general_purpose::STANDARD
            .decode(audio_b64)
            .map_err(|_| command_error("tts", 502, "音频 base64 解码失败。", false, false))?;
        if audio.len() > MAX_MEDIA_DOWNLOAD_BYTES {
            return Err(command_error(
                "tts",
                413,
                "音频超过 64 MB 限制。",
                false,
                false,
            ));
        }

        if mime.to_ascii_lowercase().contains("pcm") || mime.contains("L16") {
            let wav = pcm16_to_wav(&audio, sample_rate_from_mime(mime));
            return Ok(TtsResponse {
                audio_base64: general_purpose::STANDARD.encode(wav),
                content_type: "audio/wav".to_string(),
            });
        }

        return Ok(TtsResponse {
            audio_base64: general_purpose::STANDARD.encode(audio),
            content_type: mime.to_string(),
        });
    }

    let client = restricted_http_client(Duration::from_secs(60), true)
        .map_err(|error| command_error("tts", 500, error, false, false))?;
    let response = client
        .post(format!("{}/audio/speech", api_base))
        .bearer_auth(api_key)
        .json(&json!({
            "model": model,
            "voice": voice,
            "input": text,
            "response_format": "mp3",
            "stream": false,
            "speed": payload.speed.unwrap_or(1.05),
        }))
        .send()
        .await
        .map_err(|error| command_error("tts", 502, error.to_string(), false, false))?;

    let status = response.status().as_u16();
    let content_type = response
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .unwrap_or("audio/mpeg")
        .to_string();
    if (200..300).contains(&status) && !content_type.starts_with("audio/") {
        return Err(command_error(
            "tts",
            415,
            "语音接口返回了不允许的内容类型。",
            false,
            false,
        ));
    }
    let bytes = read_response_limited(response, MAX_MEDIA_DOWNLOAD_BYTES, "tts").await?;
    if !(200..300).contains(&status) {
        let text = String::from_utf8_lossy(&bytes).to_string();
        return Err(upstream_error(&state, "tts", status, text).await);
    }

    Ok(TtsResponse {
        audio_base64: general_purpose::STANDARD.encode(bytes),
        content_type,
    })
}

#[tauri::command]
async fn model_voice_clone(
    state: tauri::State<'_, ModelStopState>,
    storage: tauri::State<'_, storage::StorageState>,
    sessions: tauri::State<'_, gateway_client::GatewaySessionState>,
    payload: VoiceClonePayload,
) -> Result<Value, ModelCommandError> {
    check_stopped(&state, "tts")?;
    storage::require_permission(storage.inner(), "ttsNetwork")
        .and_then(|_| storage::require_permission(storage.inner(), "voiceClone"))
        .map_err(|message| command_error("tts", 403, message, false, false))?;
    let custom_name = payload.custom_name.trim();
    if custom_name.is_empty()
        || custom_name.len() > 48
        || !custom_name
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || matches!(byte, b'-' | b'_'))
    {
        return Err(command_error(
            "tts",
            400,
            "克隆音色名称不合法。",
            false,
            false,
        ));
    }
    let transcript = payload.text.trim();
    if transcript.is_empty() || transcript.chars().count() > 1000 {
        return Err(command_error(
            "tts",
            400,
            "参考文本须为 1 到 1000 个字符。",
            false,
            false,
        ));
    }
    let (_, audio_bytes) = decode_data_url(&payload.audio)?;
    if audio_bytes.len() > 12 * 1024 * 1024 {
        return Err(command_error(
            "tts",
            413,
            "参考音频超过 12 MB 限制。",
            false,
            false,
        ));
    }
    let provider =
        gateway_client::resolve_provider(storage.inner(), sessions.inner(), &payload.provider_id)
            .map_err(|message| command_error("tts", 403, message, false, false))?;
    let api_base = secure_api_base(Some(provider.api_base), DEFAULT_TTS_API_BASE, "tts")?;
    let client = restricted_http_client(Duration::from_secs(60), true)
        .map_err(|error| command_error("tts", 500, error, false, false))?;
    let response = client
        .post(format!("{}/uploads/audio/voice", api_base))
        .bearer_auth(provider.credential)
        .json(&json!({
            "model": provider.profile.speech_model,
            "customName": custom_name,
            "audio": payload.audio,
            "text": transcript,
        }))
        .send()
        .await
        .map_err(|error| command_error("tts", 502, error.to_string(), false, false))?;
    let status = response.status().as_u16();
    let text =
        String::from_utf8(read_response_limited(response, MAX_API_RESPONSE_BYTES, "tts").await?)
            .map_err(|_| command_error("tts", 502, "音色克隆响应不是有效文本。", false, false))?;
    if !(200..300).contains(&status) {
        return Err(upstream_error(&state, "tts", status, text).await);
    }
    serde_json::from_str(&text)
        .map_err(|_| command_error("tts", 502, "音色克隆响应不是有效 JSON。", false, false))
}

#[tauri::command]
async fn model_image_edit(
    state: tauri::State<'_, ModelStopState>,
    storage: tauri::State<'_, storage::StorageState>,
    sessions: tauri::State<'_, gateway_client::GatewaySessionState>,
    payload: ImageEditPayload,
) -> Result<ImageEditResponse, ModelCommandError> {
    check_stopped(&state, "image")?;
    storage::require_permission(storage.inner(), "imageGeneration")
        .map_err(|message| command_error("image", 403, message, false, false))?;

    if payload.prompt.trim().is_empty() || payload.image.trim().is_empty() {
        return Err(command_error(
            "image",
            400,
            "prompt 和 image 不能为空。",
            false,
            false,
        ));
    }

    let provider =
        gateway_client::resolve_provider(storage.inner(), sessions.inner(), &payload.provider_id)
            .map_err(|message| command_error("image", 403, message, false, false))?;
    let api_base = secure_api_base(Some(provider.api_base), DEFAULT_GATEWAY_API_BASE, "image")?;
    let api_key = provider.credential;
    if api_key.is_empty() {
        return Err(command_error(
            "image",
            403,
            "图像生成需要单独图像 Key。聊天和语音仍可用。",
            false,
            false,
        ));
    }
    let model = clean_string(Some(provider.profile.image_model)).if_empty(
        if api_base.contains("siliconflow.") {
            "Qwen/Qwen-Image-Edit-2509"
        } else {
            DEFAULT_IMAGE_MODEL
        },
    );

    let client = restricted_http_client(Duration::from_secs(120), true)
        .map_err(|error| command_error("image", 500, error, false, false))?;
    let response = if api_base.contains("siliconflow.") {
        client
            .post(format!("{}/images/generations", api_base))
            .bearer_auth(api_key)
            .json(&json!({
                "model": model,
                "prompt": payload.prompt,
                "image": payload.image,
                "num_inference_steps": 50,
                "cfg": 4,
            }))
            .send()
            .await
    } else {
        let (mime, bytes) = decode_data_url(&payload.image)?;
        let part = reqwest::multipart::Part::bytes(bytes)
            .file_name("desk-pet-reference.png")
            .mime_str(&mime)
            .map_err(|error| command_error("image", 400, error.to_string(), false, false))?;
        let supports_transparent_background = !model.to_ascii_lowercase().contains("gpt-image-2");
        let mut form = reqwest::multipart::Form::new()
            .text("model", model)
            .text("prompt", payload.prompt)
            .text("size", "1024x1024")
            .text("n", "1");
        if supports_transparent_background {
            form = form.text("background", "transparent");
        }
        form = form.part("image", part);
        client
            .post(format!("{}/images/edits", api_base))
            .bearer_auth(api_key)
            .multipart(form)
            .send()
            .await
    }
    .map_err(|error| command_error("image", 502, error.to_string(), false, false))?;

    let status = response.status().as_u16();
    let text = String::from_utf8(
        read_response_limited(response, MAX_MEDIA_DOWNLOAD_BYTES, "image").await?,
    )
    .map_err(|_| command_error("image", 502, "图像响应不是有效文本。", false, false))?;
    if !(200..300).contains(&status) {
        return Err(upstream_error(&state, "image", status, text).await);
    }

    let data: Value = serde_json::from_str(&text)
        .map_err(|error| command_error("image", 502, error.to_string(), false, false))?;
    let image = image_result_to_data_url(&data)
        .ok_or_else(|| command_error("image", 502, "图像接口没有返回图片。", false, false))?;

    if image.starts_with("data:") {
        return Ok(ImageEditResponse { image });
    }

    let image_url = validate_network_url(&image, true)
        .map_err(|message| command_error("image", 400, message, false, false))?;
    let image_response = client
        .get(&image_url)
        .send()
        .await
        .map_err(|error| command_error("image", 502, error.to_string(), false, false))?;
    let content_type = image_response
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .unwrap_or("image/png")
        .to_string();
    if !content_type.starts_with("image/") {
        return Err(command_error(
            "image",
            415,
            "图片下载返回了不允许的内容类型。",
            false,
            false,
        ));
    }
    let bytes = read_response_limited(image_response, MAX_MEDIA_DOWNLOAD_BYTES, "image").await?;
    Ok(ImageEditResponse {
        image: format!(
            "data:{};base64,{}",
            content_type,
            general_purpose::STANDARD.encode(bytes)
        ),
    })
}

#[tauri::command]
async fn model_video_generation(
    state: tauri::State<'_, ModelStopState>,
    storage: tauri::State<'_, storage::StorageState>,
    sessions: tauri::State<'_, gateway_client::GatewaySessionState>,
    payload: VideoGenerationPayload,
) -> Result<VideoGenerationResponse, ModelCommandError> {
    check_stopped(&state, "image")?;
    storage::require_permission(storage.inner(), "imageGeneration")
        .map_err(|message| command_error("image", 403, message, false, false))?;

    if payload.prompt.trim().is_empty() || payload.image.trim().is_empty() {
        return Err(command_error(
            "image",
            400,
            "动作描述和参考图不能为空。",
            false,
            false,
        ));
    }

    let provider =
        gateway_client::resolve_provider(storage.inner(), sessions.inner(), &payload.provider_id)
            .map_err(|message| command_error("image", 403, message, false, false))?;
    let api_base = secure_api_base(Some(provider.api_base), DEFAULT_GATEWAY_API_BASE, "image")?;
    let api_key = provider.credential;
    if api_key.is_empty() {
        return Err(command_error(
            "image",
            403,
            "视频动作生成需要图像/视频 API Key。",
            false,
            false,
        ));
    }

    let model = clean_string(Some(provider.profile.video_model)).if_empty("grok-imagine-video");
    let duration = payload.duration.unwrap_or(3).clamp(2, 6);
    let client = restricted_http_client(Duration::from_secs(120), true)
        .map_err(|error| command_error("image", 500, error.to_string(), false, false))?;

    let attempts = vec![
        json!({
            "model": model,
            "prompt": payload.prompt,
            "image_url": payload.image,
            "duration": duration,
            "n": 1
        }),
        json!({
            "model": model,
            "prompt": payload.prompt,
            "image": payload.image,
            "duration": duration,
            "n": 1
        }),
        json!({
            "model": model,
            "prompt": payload.prompt,
            "input_image": payload.image,
            "duration": duration,
            "n": 1
        }),
    ];

    let mut last_error = String::new();
    for body in attempts {
        let response = client
            .post(format!("{}/videos/generations", api_base))
            .bearer_auth(api_key.clone())
            .json(&body)
            .send()
            .await
            .map_err(|error| command_error("image", 502, error.to_string(), false, false))?;

        let status = response.status().as_u16();
        let text = String::from_utf8(
            read_response_limited(response, MAX_MEDIA_DOWNLOAD_BYTES, "image").await?,
        )
        .map_err(|_| command_error("image", 502, "视频响应不是有效文本。", false, false))?;

        if !(200..300).contains(&status) {
            if looks_like_quota_error(status, &text) {
                return Err(remember_quota_stop(&state, "image", status, &text));
            }
            last_error = if text.trim().is_empty() {
                format!("视频接口返回 HTTP {}。", status)
            } else {
                text
            };
            if !matches!(status, 400 | 404 | 415 | 422) {
                return Err(command_error(
                    "image",
                    status,
                    friendly_upstream_message("image", &last_error),
                    false,
                    false,
                ));
            }
            continue;
        }

        let data: Value = serde_json::from_str(&text)
            .map_err(|error| command_error("image", 502, error.to_string(), false, false))?;
        if let Some(inline_media) = inline_media_from_value(&data) {
            return Ok(inline_media);
        }
        if let Some((media, _inline)) = video_result_value(&data) {
            return resolve_video_media(&client, &api_key, &media).await;
        }

        if let Some(task_id) = task_id_from_video_result(&data) {
            let poll_paths = [
                format!("{}/videos/generations/{}", api_base, task_id),
                format!("{}/videos/{}", api_base, task_id),
                format!("{}/tasks/{}", api_base, task_id),
            ];
            for _ in 0..180 {
                tokio::time::sleep(Duration::from_secs(3)).await;
                for poll_url in &poll_paths {
                    let poll_response = client
                        .get(poll_url)
                        .bearer_auth(api_key.clone())
                        .send()
                        .await;
                    let Ok(poll_response) = poll_response else {
                        continue;
                    };
                    if !poll_response.status().is_success() {
                        continue;
                    }
                    let poll_text =
                        read_response_limited(poll_response, MAX_MEDIA_DOWNLOAD_BYTES, "image")
                            .await
                            .map(|bytes| String::from_utf8_lossy(&bytes).to_string())
                            .unwrap_or_default();
                    let Ok(poll_data) = serde_json::from_str::<Value>(&poll_text) else {
                        continue;
                    };
                    if let Some(inline_media) = inline_media_from_value(&poll_data) {
                        return Ok(inline_media);
                    }
                    if let Some((media, _inline)) = video_result_value(&poll_data) {
                        return resolve_video_media(&client, &api_key, &media).await;
                    }
                }
            }
            return Err(command_error(
                "image",
                504,
                "视频生成任务超时，请稍后重试或缩短动作描述。",
                false,
                false,
            ));
        }

        last_error = text;
    }

    Err(command_error(
        "image",
        502,
        if last_error.trim().is_empty() {
            "视频接口没有返回可用视频。".to_string()
        } else {
            friendly_upstream_message("image", &last_error)
        },
        false,
        false,
    ))
}

trait IfEmpty {
    fn if_empty(self, fallback: &str) -> String;
}

impl IfEmpty for String {
    fn if_empty(self, fallback: &str) -> String {
        if self.trim().is_empty() {
            fallback.to_string()
        } else {
            self
        }
    }
}

#[tauri::command]
fn set_window_mode(window: tauri::WebviewWindow, mode: String) -> Result<(), String> {
    apply_window_mode(&window, mode == "floating")
}

#[tauri::command]
fn apply_desktop_options(
    window: tauri::WebviewWindow,
    options: DesktopOptions,
) -> Result<(), String> {
    let floating = options.floating_mode.unwrap_or(false);
    let scale = options.pet_scale.unwrap_or(1.0);

    if floating {
        let (width, height, min_width, min_height) = floating_size_for_scale(scale);
        window
            .set_min_size(Some(tauri::Size::Logical(tauri::LogicalSize {
                width: min_width,
                height: min_height,
            })))
            .map_err(|error| error.to_string())?;
        window
            .set_size(tauri::Size::Logical(tauri::LogicalSize { width, height }))
            .map_err(|error| error.to_string())?;
    }

    if floating {
        if let Some(always_on_top) = options.always_on_top {
            window
                .set_always_on_top(always_on_top)
                .map_err(|error| error.to_string())?;
        }
        if let Some(true) = options.click_through {
            let _ = window.set_ignore_cursor_events(true);
        }
    }

    if options.apply_position.unwrap_or(false) && floating {
        if let Some(gravity) = options.desktop_gravity.as_deref() {
            position_window(&window, gravity)?;
        }
    }

    Ok(())
}

#[tauri::command]
fn start_window_drag(window: tauri::WebviewWindow) -> Result<(), String> {
    window.start_dragging().map_err(|error| error.to_string())
}

#[tauri::command]
fn close_window(window: tauri::WebviewWindow) -> Result<(), String> {
    window.hide().map_err(|error| error.to_string())
}

#[cfg(test)]
mod security_tests {
    use super::*;
    use chrono::{TimeZone, Utc};

    #[test]
    fn network_urls_enforce_https_and_explicit_loopback_http() {
        assert!(validate_network_url("https://api.example.com/v1", false).is_ok());
        assert!(validate_network_url("http://api.example.com/v1", true).is_err());
        assert!(validate_network_url("http://127.0.0.1:9089/v1", true).is_ok());
        assert!(validate_network_url("http://localhost:9089/v1", false).is_err());
        assert!(validate_network_url("https://user:secret@example.com/v1", false).is_err());
        assert!(validate_network_url("https://example.com/v1#unsafe", false).is_err());
    }

    #[test]
    fn shanghai_date_and_iso_week_change_at_the_correct_boundary() {
        let before_midnight = Utc.with_ymd_and_hms(2026, 7, 17, 15, 59, 59).unwrap();
        let at_midnight = Utc.with_ymd_and_hms(2026, 7, 17, 16, 0, 0).unwrap();
        assert_eq!(local_date_at(before_midnight), "2026-07-17");
        assert_eq!(local_date_at(at_midnight), "2026-07-18");

        let final_sunday = Utc.with_ymd_and_hms(2027, 1, 3, 15, 59, 59).unwrap();
        let first_monday = Utc.with_ymd_and_hms(2027, 1, 3, 16, 0, 0).unwrap();
        assert_eq!(iso_week_at(final_sunday), "2026-W53");
        assert_eq!(iso_week_at(first_monday), "2027-W01");
    }

    #[test]
    fn media_and_gif_budgets_reject_oversized_inputs() {
        let oversized = format!(
            "data:image/png;base64,{}",
            "A".repeat(MAX_DATA_URL_BYTES.saturating_mul(4) / 3 + 1025)
        );
        let error = decode_data_url(&oversized).unwrap_err();
        assert_eq!(error.status, 413);
        assert!(decoded_gif_pixels(512, 512, 100).is_ok());
        assert!(decoded_gif_pixels(4096, 4096, 5).is_err());
        assert!(decoded_gif_pixels(usize::MAX, usize::MAX, 2).is_err());
    }
}
