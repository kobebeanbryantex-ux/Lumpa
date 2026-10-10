# Lumpa 1.0.8 源码

本仓库包含当前 Windows 桌面端源码、网页前端、宠物动画素材、账号网关及宠物生成服务代码。
之前的 GitHub 首页说明保留在 [docs/github-original-readme.md](docs/github-original-readme.md)。

## 自定义宠物生成器：英文版（2026-10-10）

- 独立网站源码位于 `pet-generator-web/`，界面、交互提示、无障碍标签及演示弹窗已改为英文，并检查电脑和手机排版。
- 在该目录运行 `node scripts/check-english.mjs` 验证英文文案、脚本语法及站点配置；使用 `python -m http.server 4190 --bind 127.0.0.1 --directory dist` 本地预览。
- `services/pet-studio/` 的公开错误及任务状态文案已英文化，包含旧任务响应兼容及7项回归测试；在该目录执行 `npm ci`、`npm test` 和 `npm run build`。
- 网站目前仍是演示原型，未连接真实图像生成、支付或下载。价格保留CNY示例；网站访问权限沿用原配置，尚未作为公开商业服务上线。
- 本次不修改桌面端版本号，不重新生成Windows安装包。后端源码更新不代表已部署远程推理服务。

## 当前版本：1.0.8

- 默认宠物为黄色（奶油）法斗；当前验收配置开放全部20种宠物，不代表商业版最终解锁规则。
- 黄色法斗新增坐下、摇尾、歪头和哈欠，共16张专属动作帧；加入自主行为与点击互动，双击可坐下。
- 保留拖动奔跑、8帧走路/奔跑及收势过渡；包含跑步、鞠躬脚底悬空和启动旧兔子图像闪现的修复。
- 其他宠物动作与现有音频保持不变。
- 本地验收通过34项前端功能测试、2项Python落点测试及正式网页构建。云端CI状态请以Actions实际结果为准。

### 开发和打包

在项目根目录执行（Windows、Node.js 22+、Rust stable、WebView2）：

```powershell
npm ci
npm run web:dev
# 默认网页入口：http://127.0.0.1:4173/
# 动作预览：http://127.0.0.1:4173/french-bulldog-preview.html

npm test
npm run web:verify
npm run tauri:dev

# 内部验收安装包：RC命令不自动构建前端，必须先执行web:verify。
npm run web:verify
npm run tauri:build:rc
```

RC输出位于 `src-tauri/target/release/bundle/nsis/`，不含正式代码签名，不能等同于已完成商业发布。
如需重新拆分动作素材或运行落点测试，另安装Python和Pillow，然后执行：

```powershell
python -m pip install Pillow
python tools/build_frenchie_daily_v8.py
python tools/test_sprite_contact.py
```

### 本轮代码入口

| 路径 | 内容 |
| --- | --- |
| `src/focus.js` | 动作帧、衔接、自主行为、家具物理及专注逻辑 |
| `src/app.js` | 启动宠物、验收解锁配置、桌面点击和拖动 |
| `src-tauri/src/` | Windows桌面端和Rust后端 |
| `public/assets/pixel_companions_v8/frames/` | 黄色法斗新增16张动作帧 |
| `assets/pixel_companions_v8/sheets/` | 新动作原始精灵图 |
| `tools/build_frenchie_daily_v8.py` | 新动作拆帧与脚底对齐 |
| `french-bulldog-preview.html` | 网页动作预览入口 |

安装包、构建产物、依赖缓存、模型权重、密钥和运行数据不纳入Git；请从模板创建本机环境配置。
原有架构与部署说明如下，正式发布仍需配置相关外部服务与签名凭据。

---

Lumpa 是 Windows 桌面宠物应用。1.0 将桌面端、账号网关、本地数据和发布链路统一为一套可公开审计的架构。

## 已实现

- 桌面端：Tauri v2、严格 CSP、关闭全局 Tauri API；浏览器层不直接请求模型或下载媒体。
- 双模型模式：邮箱 Lumpa 账号与用户自带 Key 可随时切换；自带 Key 只由 Rust 网络层读取。
- 安全存储：Stronghold 保存 Key 和刷新令牌，Stronghold 主密钥由 Windows 凭据管理器保护；访问令牌只在内存中存在。
- 数据层：SQLite 显式迁移、v0-v7 localStorage 事务迁移、30 天加密回滚备份和内容哈希素材目录。
- 便携数据：版本化 .lumpa-pet 包，以及 Argon2id + AES-256-GCM 的 .lumpa-backup；备份不包含 Key 或令牌。
- 隐私中心：分类查看、删除和导出，诊断包先预览后手动导出；统计默认关闭。
- 使用监督：上海本地日期、ISO 周、月视图、CSV、多规则、时段、冷却、恢复条件和系统通知。
- 动作编辑：帧增删排序、逐帧时长、循环区间、裁剪缩放、脚底锚点、透明检查和实时预览。
- 账号网关：Fastify、PostgreSQL、Redis、Caddy；邮箱验证码、刷新轮换、设备撤销、账号删除及原子日配额。
- 发布：stable/beta 签名更新、GitHub Releases + 阿里云 OSS、SBOM、秘密扫描及 Windows Authenticode 门禁。

## 本地开发

要求 Windows、Node.js 22、Rust stable 和 WebView2。

~~~powershell
npm ci
npm run web:build
npm test
cargo test --manifest-path src-tauri/Cargo.toml --all-targets
npm run tauri:dev
~~~

Vite 只监听 127.0.0.1:4173，并启用 strictPort；端口被占用时启动会失败，不会复用未知服务。项目不再包含 server.mjs 兼容层。

需要测试 Lumpa 账号模式时，在启动 Tauri 前给 Rust 编译进固定 HTTPS 网关：

~~~powershell
$env:LUMPA_GATEWAY_BASE = "https://api.lumpa.example.com"
npm run tauri:dev
~~~

BYOK 配置在首次启动向导中完成，不应写入 .env、源码或前端构建产物。

## 网关部署

复制 .env.gateway.example 为本机的 .env.gateway，填写随机数据库口令、JWT/OTP 密钥、阿里云 DirectMail SMTP、上游地址和上游 Key。.env.gateway 已被 Git 忽略。

~~~powershell
docker compose --env-file .env.gateway build
docker compose --env-file .env.gateway up -d
docker compose --env-file .env.gateway ps
~~~

PostgreSQL、Redis 和 Gateway 只在 Docker 内部网络暴露；公网入口由 Caddy 提供 HTTPS。生产环境默认关闭注册，可用邀请码控制测试账号。

网关测试使用独立的回环端口数据库：

~~~powershell
docker compose -f services/gateway/docker-compose.test.yml up -d
cd services/gateway
npm ci
npm run lint
npm test
cd ../..
docker compose -f services/gateway/docker-compose.test.yml down
~~~

## 数据与卸载

应用数据位于 Tauri 的 Windows AppData 目录，包含 SQLite、内容哈希素材、Stronghold 和滚动日志。成功迁移后的回滚备份保留 30 天，也可在隐私中心提前删除。

NSIS 卸载器提供保留或删除应用数据的选择。勾选删除数据时，会先清除 Stronghold 主密钥凭据和应用数据；清除失败会中止卸载，避免给用户造成已经彻底删除的错觉。

## 发布

.github/workflows/ci.yml 执行前端、Rust、Gateway 测试，npm/cargo 审计，Gitleaks、二进制秘密扫描和 SBOM。

.github/workflows/release.yml 接受 beta 或 stable：

- 两个通道都要求 Tauri Updater 私钥、公开验证公钥、OSS 配置和固定 HTTPS 更新端点。
- stable 额外要求 Azure Trusted Signing 凭据，并对应用 EXE 与 NSIS 安装器执行 Authenticode 验证。
- 同一批签名包、清单、SBOM 和 SHA-256 文件会发布到 GitHub Releases 与阿里云 OSS。
- 任一签名、哈希、秘密扫描或配置门禁失败都会阻止发布。

编译时环境变量：

~~~text
LUMPA_GATEWAY_BASE
LUMPA_UPDATER_PUBKEY
LUMPA_OSS_UPDATE_BASE
LUMPA_GITHUB_UPDATE_BASE
~~~

stable 还需要工作流中列出的 Azure 签名变量；OSS、SMTP、HTTPS 域名和 Windows 代码签名证书是正式发布前的外部必备资源。没有这些资源时只能做本地开发验证，不能把产物标记为 stable。

无需发布凭据的内部 RC 可运行 npm run tauri:build:rc。该产物不带 Updater 包和 Authenticode 签名，只能用于内部验收，不能公开发布。

## 关键目录

~~~text
src/                         前端及 1.0 功能模块
src-tauri/src/               受限 IPC、网络、安全存储、SQLite、备份和更新
services/gateway/            账号与配额网关
scripts/                     秘密扫描、更新清单、OSS 上传和 Windows 签名
.github/workflows/           CI 与发布门禁
docs/                        迁移、发布与安全说明
~~~

提交前至少运行：

~~~powershell
npm run web:build
npm test
node scripts/scan-secrets.mjs .
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml --all-targets
~~~
