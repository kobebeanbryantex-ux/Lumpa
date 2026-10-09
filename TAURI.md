# Tauri 桌面架构

开发入口为 npm run tauri:dev。Tauri 加载严格端口的回环 Vite 服务；正式构建加载 dist/。

前端只能调用 src-tauri/capabilities/default.json 中允许的命令。模型、账号、更新、下载、数据库、安全存储、宠物包、备份、统计与诊断均由 Rust 实现。浏览器层不持有上游 Key，也不接收可继承服务器凭据的任意 URL。

src-tauri/tauri.conf.json 关闭 withGlobalTauri 并配置 CSP。gateway_client.rs 负责账号/BYOK 统一供应商解析；secure_store.rs 管理 Stronghold；storage.rs 管理 SQLite 与迁移；portable.rs 管理宠物包和加密备份；updater.rs 只接受编译时固定的 HTTPS 更新端点。

普通本地编译不代表可发布。正式安装包由 Windows 发布工作流生成；stable 必须通过 Updater 签名、Authenticode、SBOM、秘密扫描和哈希验收。
