use crate::storage::StorageState;
use chrono::Utc;
use serde::Serialize;
use serde_json::json;
use std::{
    fs::{self, OpenOptions},
    io::{Read, Write},
    panic,
    path::{Path, PathBuf},
    sync::Mutex,
};
use zip::{write::SimpleFileOptions, CompressionMethod, ZipWriter};

const MAX_LOG_BYTES: u64 = 1024 * 1024;
const LOG_FILE_COUNT: usize = 5;

pub struct DiagnosticState {
    logs_dir: PathBuf,
    write_lock: Mutex<()>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticPreview {
    pub files: Vec<String>,
    pub excerpt: String,
    pub redaction_notice: String,
}

fn redact_token(token: &str) -> String {
    let lower = token.to_ascii_lowercase();
    if token.contains('@') && token.contains('.') {
        return "[EMAIL]".to_string();
    }
    if lower.starts_with("bearer")
        || lower.starts_with("sk-")
        || lower.contains("api_key")
        || lower.contains("apikey")
        || lower.contains("refresh_token")
        || lower.contains("access_token")
    {
        return "[SECRET]".to_string();
    }
    if token.contains(":\\") || token.starts_with("\\\\") || token.starts_with('/') {
        return "[PATH]".to_string();
    }
    token.to_string()
}

pub fn redact(text: &str) -> String {
    text.split_whitespace()
        .map(redact_token)
        .collect::<Vec<_>>()
        .join(" ")
}

impl DiagnosticState {
    pub fn new(logs_dir: PathBuf) -> Self {
        Self {
            logs_dir,
            write_lock: Mutex::new(()),
        }
    }

    fn rotate(&self) -> Result<(), String> {
        let active = self.logs_dir.join("lumpa.log");
        if fs::metadata(&active)
            .map(|metadata| metadata.len())
            .unwrap_or(0)
            < MAX_LOG_BYTES
        {
            return Ok(());
        }
        let oldest = self.logs_dir.join(format!("lumpa.{}.log", LOG_FILE_COUNT));
        if oldest.exists() {
            fs::remove_file(oldest).map_err(|error| error.to_string())?;
        }
        for index in (1..LOG_FILE_COUNT).rev() {
            let source = self.logs_dir.join(format!("lumpa.{}.log", index));
            let destination = self.logs_dir.join(format!("lumpa.{}.log", index + 1));
            if source.exists() {
                fs::rename(source, destination).map_err(|error| error.to_string())?;
            }
        }
        if active.exists() {
            fs::rename(active, self.logs_dir.join("lumpa.1.log"))
                .map_err(|error| error.to_string())?;
        }
        Ok(())
    }

    pub fn log(&self, level: &str, event: &str, detail: &str) {
        let Ok(_guard) = self.write_lock.lock() else {
            return;
        };
        if self.rotate().is_err() {
            return;
        }
        let line = json!({
            "time": Utc::now().to_rfc3339(),
            "level": level,
            "event": redact(event),
            "detail": redact(detail),
        });
        if let Ok(mut file) = OpenOptions::new()
            .create(true)
            .append(true)
            .open(self.logs_dir.join("lumpa.log"))
        {
            let _ = writeln!(file, "{}", line);
        }
    }
}

pub fn install_panic_hook(logs_dir: PathBuf) {
    let previous = panic::take_hook();
    panic::set_hook(Box::new(move |info| {
        let location = info
            .location()
            .map(|location| {
                let file = Path::new(location.file())
                    .file_name()
                    .and_then(|name| name.to_str())
                    .unwrap_or("unknown");
                format!("{}:{}", file, location.line())
            })
            .unwrap_or_else(|| "unknown".to_string());
        let state = DiagnosticState::new(logs_dir.clone());
        state.log(
            "error",
            "rust_panic",
            &format!("panic captured at {}", location),
        );
        previous(info);
    }));
}

fn diagnostic_files(directory: &Path) -> Vec<PathBuf> {
    let mut files = fs::read_dir(directory)
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| {
            path.is_file() && path.extension().and_then(|value| value.to_str()) == Some("log")
        })
        .collect::<Vec<_>>();
    files.sort();
    files
}

#[tauri::command]
pub fn diagnostics_preview(
    state: tauri::State<'_, DiagnosticState>,
) -> Result<DiagnosticPreview, String> {
    let files = diagnostic_files(&state.logs_dir);
    let mut excerpt = String::new();
    for path in files.iter().rev().take(2) {
        let mut file = OpenOptions::new()
            .read(true)
            .open(path)
            .map_err(|error| error.to_string())?;
        let mut text = String::new();
        file.read_to_string(&mut text)
            .map_err(|error| error.to_string())?;
        excerpt.push_str(&redact(
            &text
                .chars()
                .rev()
                .take(8000)
                .collect::<String>()
                .chars()
                .rev()
                .collect::<String>(),
        ));
        excerpt.push('\n');
    }
    Ok(DiagnosticPreview {
        files: files
            .iter()
            .filter_map(|path| path.file_name()?.to_str().map(str::to_string))
            .collect(),
        excerpt,
        redaction_notice:
            "已遮盖 Key、令牌、邮箱和文件路径；诊断包不包含聊天正文、宠物素材或凭据。".to_string(),
    })
}

#[tauri::command]
pub fn diagnostics_export(
    diagnostics: tauri::State<'_, DiagnosticState>,
    storage: tauri::State<'_, StorageState>,
    destination: String,
) -> Result<String, String> {
    let path = PathBuf::from(&destination);
    if !path.is_absolute()
        || path.extension().and_then(|value| value.to_str()) != Some("zip")
        || !path.parent().is_some_and(Path::is_dir)
    {
        return Err("诊断包导出路径必须是绝对 .zip 路径。".to_string());
    }
    let file = OpenOptions::new()
        .create_new(true)
        .write(true)
        .open(&path)
        .map_err(|error| format!("创建诊断包失败（不会覆盖已有文件）：{}", error))?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default()
        .compression_method(CompressionMethod::Deflated)
        .unix_permissions(0o600);
    zip.start_file("system.json", options)
        .map_err(|error| error.to_string())?;
    let system = json!({
        "format": "lumpa-diagnostics",
        "formatVersion": 1,
        "appVersion": env!("CARGO_PKG_VERSION"),
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "createdAt": Utc::now().to_rfc3339(),
        "databasePresent": storage.database_path.is_file(),
        "redaction": "keys tokens emails chat bodies and paths are excluded or redacted"
    });
    zip.write_all(&serde_json::to_vec_pretty(&system).map_err(|error| error.to_string())?)
        .map_err(|error| error.to_string())?;
    for log_path in diagnostic_files(&diagnostics.logs_dir) {
        let Some(name) = log_path.file_name().and_then(|value| value.to_str()) else {
            continue;
        };
        let text = fs::read_to_string(&log_path).unwrap_or_default();
        zip.start_file(format!("logs/{}", name), options)
            .map_err(|error| error.to_string())?;
        zip.write_all(redact(&text).as_bytes())
            .map_err(|error| error.to_string())?;
    }
    zip.finish().map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[cfg(test)]
mod tests {
    use super::redact;

    #[test]
    fn sensitive_tokens_are_redacted() {
        let output = redact("Bearer abc user@example.com C:\\Users\\name\\file.txt sk-test-value");
        assert!(!output.contains("user@example.com"));
        assert!(!output.contains("C:\\Users"));
        assert!(!output.contains("sk-test-value"));
    }
}
