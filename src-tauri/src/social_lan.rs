use serde_json::{json, Value};
use std::{
    fs,
    io::Cursor,
    net::UdpSocket,
    process::{Child, Command, Stdio},
    sync::Mutex,
    time::{Duration, Instant},
};
use tauri::Manager;

const RUNTIME: &[u8] = include_bytes!("../social-runtime.zip");
#[derive(Default)]
pub struct LanHostState(Mutex<Option<(Child, Value)>>);
pub fn shutdown(app: &tauri::AppHandle) {
    if let Some(state) = app.try_state::<LanHostState>() {
        if let Ok(mut host) = state.0.lock() {
            if let Some((mut child, _)) = host.take() {
                let _ = child.kill();
                let _ = child.wait();
            }
        }
    }
}
impl Drop for LanHostState {
    fn drop(&mut self) {
        if let Ok(state) = self.0.get_mut() {
            if let Some((child, _)) = state.as_mut() {
                let _ = child.kill();
            }
        }
    }
}
fn start(app: tauri::AppHandle) -> Result<Value, String> {
    use sha2::{Digest, Sha256};
    let state = app.state::<LanHostState>();
    let mut host = state.0.lock().map_err(|_| "联机状态忙碌".to_string())?;
    if let Some((child, info)) = host.as_mut() {
        if child.try_wait().map_err(|e| e.to_string())?.is_none() {
            return Ok(info.clone());
        }
    }
    let data = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("lan-play");
    fs::create_dir_all(&data).map_err(|e| e.to_string())?;
    let hash = hex::encode(Sha256::digest(RUNTIME));
    let runtime = data.join(format!("runtime-{}", &hash[..12]));
    if !runtime.join(".complete").is_file() {
        fs::create_dir_all(&runtime).map_err(|e| e.to_string())?;
        zip::ZipArchive::new(Cursor::new(RUNTIME))
            .map_err(|e| e.to_string())?
            .extract(&runtime)
            .map_err(|e| e.to_string())?;
        fs::write(runtime.join(".complete"), &hash).map_err(|e| e.to_string())?;
    }
    let ready = data.join("ready.json");
    if ready.is_file() {
        fs::remove_file(&ready).map_err(|e| e.to_string())?;
    }
    // A fixed LAN port keeps identity and friend records stable between restarts.
    let port = if std::net::TcpListener::bind(("0.0.0.0", 4185)).is_ok() {
        4185
    } else {
        0
    };
    let log = fs::File::create(data.join("server.log")).map_err(|e| e.to_string())?;
    let mut command = Command::new(runtime.join("node.exe"));
    command
        .arg("services/social/server.mjs")
        .current_dir(&runtime)
        .env("LUMPA_SOCIAL_HOST", "0.0.0.0")
        .env("LUMPA_SOCIAL_PORT", port.to_string())
        .env("LUMPA_SOCIAL_DATA", data.join("records"))
        .env("LUMPA_SOCIAL_LAN", "1")
        .env("LUMPA_SOCIAL_READY_FILE", &ready)
        .stdin(Stdio::null())
        .stdout(log.try_clone().map_err(|e| e.to_string())?)
        .stderr(log);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    let mut child = command.spawn().map_err(|e| e.to_string())?;
    let start = Instant::now();
    while start.elapsed() < Duration::from_secs(12) {
        if let Ok(bytes) = fs::read(&ready) {
            if let Ok(mut info) = serde_json::from_slice::<Value>(&bytes) {
                info["url"] = json!(format!(
                    "http://127.0.0.1:{}",
                    info["port"].as_u64().unwrap_or(4185)
                ));
                *host = Some((child, info.clone()));
                return Ok(info);
            }
        }
        if child.try_wait().map_err(|e| e.to_string())?.is_some() {
            return Err("局域网服务未启动，请查看联机日志。".into());
        }
        std::thread::sleep(Duration::from_millis(100));
    }
    let _ = child.kill();
    Err("局域网服务启动超时。".into())
}
#[tauri::command]
pub async fn start_lan_host(window: tauri::WebviewWindow) -> Result<Value, String> {
    if window.label() != "social" {
        return Err("请从乐园开启局域网。".into());
    }
    let app = window.app_handle().clone();
    tauri::async_runtime::spawn_blocking(move || start(app))
        .await
        .map_err(|e| e.to_string())?
}
#[tauri::command]
pub fn stop_lan_host(window: tauri::WebviewWindow) -> Result<(), String> {
    if window.label() != "social" {
        return Err("窗口无效".into());
    }
    let state = window.state::<LanHostState>();
    if let Some((mut child, _)) = state.0.lock().map_err(|_| "状态忙碌")?.take() {
        child.kill().map_err(|e| e.to_string())?;
        let _ = child.wait();
    }
    Ok(())
}
#[tauri::command]
pub async fn discover_lan_hosts(window: tauri::WebviewWindow) -> Result<Vec<Value>, String> {
    if window.label() != "social" {
        return Err("窗口无效".into());
    }
    tauri::async_runtime::spawn_blocking(move || {
        let socket = UdpSocket::bind("0.0.0.0:0").map_err(|e| e.to_string())?;
        socket.set_broadcast(true).map_err(|e| e.to_string())?;
        socket
            .set_read_timeout(Some(Duration::from_millis(300)))
            .map_err(|e| e.to_string())?;
        let nonce = format!("{:016x}", rand::random::<u64>());
        let request = serde_json::to_vec(&json!({"type":"lumpa-discover","nonce":nonce})).unwrap();
        for address in ["255.255.255.255:4189", "127.0.0.1:4189"] {
            let _ = socket.send_to(&request, address);
        }
        let start = Instant::now();
        let mut hosts = Vec::new();
        let mut bytes = [0u8; 2048];
        while start.elapsed() < Duration::from_secs(3) {
            if let Ok((length, peer)) = socket.recv_from(&mut bytes) {
                let Ok(info) = serde_json::from_slice::<Value>(&bytes[..length]) else {
                    continue;
                };
                let private = match peer.ip() {
                    std::net::IpAddr::V4(ip) => ip.is_private() || ip.is_loopback(),
                    _ => false,
                };
                let Some(port) = info["port"]
                    .as_u64()
                    .filter(|port| *port > 0 && *port <= 65535)
                else {
                    continue;
                };
                if !private || info["type"] != "lumpa-host" || info["nonce"] != nonce {
                    continue;
                }
                let url = format!("http://{}:{}", peer.ip(), port);
                if !hosts.iter().any(|row: &Value| row["url"] == url) {
                    hosts.push(json!({"url":url,"name":info["name"],"version":info["version"]}));
                }
            }
        }
        Ok(hosts)
    })
    .await
    .map_err(|e| e.to_string())?
}
