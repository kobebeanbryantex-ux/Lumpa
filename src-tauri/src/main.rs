#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    if std::env::args_os().any(|argument| argument == "--purge-user-data") {
        if rabbit_desk_pet_lib::purge_installed_user_data().is_err() {
            std::process::exit(1);
        }
        return;
    }
    let result = std::panic::catch_unwind(rabbit_desk_pet_lib::run);
    match result {
        Ok(Ok(())) => {}
        Ok(Err(error)) => startup_error(&error.to_string()),
        Err(_) => startup_error("应用初始化异常。请查看启动日志，或使用完整安装包修复运行环境。"),
    }
}

fn startup_error(detail: &str) {
    let path = std::env::temp_dir().join("Lumpa-startup-error.log");
    let _ = std::fs::write(
        &path,
        format!(
            "Lumpa {} / {}\n{}",
            env!("CARGO_PKG_VERSION"),
            std::env::consts::ARCH,
            detail
        ),
    );
    #[cfg(windows)]
    {
        use windows::core::PCWSTR;
        use windows::Win32::UI::WindowsAndMessaging::{MessageBoxW, MB_ICONERROR, MB_OK};
        let message = format!("Lumpa 启动失败，未能打开窗口。\n\n{}\n\n请使用完整安装包检查 Microsoft Edge WebView2 运行环境。\n启动日志：{}", detail, path.display());
        let wide: Vec<u16> = message.encode_utf16().chain(Some(0)).collect();
        let title: Vec<u16> = "Lumpa 启动诊断".encode_utf16().chain(Some(0)).collect();
        unsafe {
            let _ = MessageBoxW(
                None,
                PCWSTR(wide.as_ptr()),
                PCWSTR(title.as_ptr()),
                MB_OK | MB_ICONERROR,
            );
        }
    }
    std::process::exit(1);
}
