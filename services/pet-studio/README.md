# Lumpa Pet Studio Server

这是图片生成桌宠的自建服务入口。它不依赖任何外部大模型 API：上传图像、生成任务、隔离存储和任务状态都在自己的服务器；GPU 推理由可替换的私有模型服务完成。

## 当前真实状态

- `LUMPA_PET_INFERENCE_MODE=disabled` 是默认且安全的状态：服务能启动、检查健康状态和接口能力，但提交任务后会明确显示“尚未连接模型”，不会伪造图片或扣除额度。
- `webhook` 模式已定义并实现了私有推理服务适配接口。模型服务器必须由你自行部署在同一内网/VPN，不能直接暴露给用户。
- Pet Studio 的 Node 任务 API 还未连接这个本地模型，也不含账户、支付、队列重试或公网反向代理；这些将在用户流程接通后再上线。

## 轻薄本本机模型

当前开发机为 Intel Core Ultra 7 155H、约 32 GB 内存、Intel Arc 核显。已在本机下载并固定 BiRefNet `b7d7f31fed203ab364ac756d62053ee467502434` 权重（约 445 MB），完成真实图片抠图输出验证。当前 PyTorch 是 CPU 版，因此这条推理使用 CPU，适合验证流程和小量调试；暂未启用 Arc GPU 加速，也还未接到网页上传页。

模型文件保存在 `models/birefnet/`（已加入 git 忽略，不会混进应用源码提交）。模型卡标注 MIT，项目附有 [模型说明](models/README.md)。运行方式：

```powershell
.venv\Scripts\python.exe inference\remove_background.py "D:\图片\角色.png"
```

默认会在原图旁生成 `角色-transparent.png`。首次建立隔离环境时，使用支持的 PyTorch CPU/GPU 发行版后安装 `requirements-inference.txt`；固定 Transformers 4.57.6 是因为当前 BiRefNet 自定义实现与 Transformers 5.x 不兼容。GPU 服务器需要按实际显卡重新安装对应 PyTorch/ROCm/CUDA 版本，不能照搬这台电脑的 CPU 环境。

## 首次本地启动

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

检查：`GET http://127.0.0.1:8090/healthz`。

## 私有模型服务协议

配置：

```env
LUMPA_PET_INFERENCE_MODE=webhook
LUMPA_PET_INFERENCE_URL=http://10.0.0.20:8189/v1/lumpa/pet-jobs
LUMPA_PET_INFERENCE_TOKEN=replace-with-a-long-random-secret
```

Pet Studio 会向该 URL 发出 `multipart/form-data` 请求，字段为 `jobId`、`style`（`pixel` / `storybook` / `plush`）和 `image`，并在有 token 时带 `Authorization: Bearer ...`。推理服务必须同步返回：

```json
{
  "state": "succeeded",
  "message": "已生成 8 个动作帧",
  "previewUrl": "https://assets.example/private/preview.png",
  "bundleUrl": "https://assets.example/private/pet-bundle.zip"
}
```

失败时返回 `{ "state": "failed", "message": "...", "errorCode": "..." }`。URL 只能是 HTTPS，避免把非安全下载链接交给用户端。

## 推荐部署顺序

1. 在 GPU 服务器部署实际的去背景、图生图、角色一致性和补帧模型，并把它们封装为上述私有接口。
2. 先在局域网让 Pet Studio 使用 `webhook` 连通 GPU 服务。
3. 再把 Pet Studio 接到现有 Gateway 的登录、额度与支付校验之后。
4. 最后用 HTTPS 反向代理公开 Pet Studio，GPU 服务始终保持私网。

`docker compose up --build -d` 仅会启动 Pet Studio；启动前应自行复制 `.env.example` 为 `.env`。默认端口只绑定本机 `127.0.0.1`，不直接暴露到公网。
