import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Redis } from "ioredis";
import { z } from "zod";
import { authenticate } from "./auth.js";
import type { GatewayConfig } from "./config.js";
import type { DatabasePool } from "./database.js";
import { completeQuota, reserveQuota, type Capability, type QuotaReservation } from "./quota.js";

const chatSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string().max(100_000) })).min(1).max(64),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(1).max(4096).optional(),
}).passthrough();
const speechSchema = z.object({ input: z.string().min(1).max(20_000), voice: z.string().min(1).max(128), speed: z.number().min(0.25).max(4).optional(), response_format: z.string().max(16).optional() });
const videoSchema = z.object({ prompt: z.string().min(1).max(20_000), image: z.string().max(36 * 1024 * 1024).optional(), image_url: z.string().max(36 * 1024 * 1024).optional(), input_image: z.string().max(36 * 1024 * 1024).optional(), duration: z.number().int().min(2).max(6).optional(), n: z.literal(1).optional() });

function upstreamUrl(config: GatewayConfig, path: string) {
  return `${config.UPSTREAM_BASE_URL.replace(/\/+$/, "")}${path}`;
}

async function upstreamFetch(config: GatewayConfig, path: string, init: RequestInit, timeoutMs: number) {
  return fetch(upstreamUrl(config, path), {
    ...init,
    redirect: "error",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { Authorization: `Bearer ${config.UPSTREAM_API_KEY}`, ...(init.headers || {}) },
  });
}

export async function readLimited(response: Response, limit: number) {
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > limit) throw new Error("upstream response too large");
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) { await reader.cancel(); throw new Error("upstream response too large"); }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), total);
}

function quotaHeaders(reply: FastifyReply, reservation: QuotaReservation) {
  reply.header("x-lumpa-quota-limit", reservation.limit).header("x-lumpa-quota-remaining", reservation.remaining).header("x-lumpa-quota-date", reservation.localDate);
}

async function withQuota(
  config: GatewayConfig,
  pool: DatabasePool,
  redis: Redis,
  request: FastifyRequest,
  reply: FastifyReply,
  capability: Capability,
  work: (reservation: QuotaReservation) => Promise<void>,
) {
  const reservation = await reserveQuota(config, pool, redis, request.auth!.accountId, capability);
  if (!reservation) { reply.header("retry-after", "3600").code(429).send({ message: "今日免费额度已用完。" }); return; }
  quotaHeaders(reply, reservation);
  try { await work(reservation); }
  catch (error) {
    await completeQuota(pool, reservation, "upstream_error");
    request.log.warn({ errorName: error instanceof Error ? error.name : "UnknownError", capability }, "upstream request failed");
    if (!reply.sent) reply.code(502).send({ message: "模型上游暂时不可用，请稍后重试。" });
  }
}

export function registerProxyRoutes(app: FastifyInstance, config: GatewayConfig, pool: DatabasePool, redis: Redis) {
  const protectedRoute = async (request: FastifyRequest, reply: FastifyReply) => authenticate(config, pool, request, reply);

  app.post("/v1/chat/completions", { preHandler: protectedRoute }, async (request, reply) => withQuota(config, pool, redis, request, reply, "chat", async (reservation) => {
    const body = chatSchema.parse(request.body);
    const response = await upstreamFetch(config, "/chat/completions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, model: config.CHAT_MODEL, stream: false }) }, 65_000);
    const bytes = await readLimited(response, 4 * 1024 * 1024);
    if (!response.ok) { await completeQuota(pool, reservation, "upstream_error", response.status); reply.code(response.status === 429 ? 503 : 502).send({ message: "聊天上游请求失败。" }); return; }
    await completeQuota(pool, reservation, "completed", response.status);
    reply.type("application/json").send(bytes);
  }));

  app.post("/v1/audio/speech", { preHandler: protectedRoute }, async (request, reply) => withQuota(config, pool, redis, request, reply, "speech", async (reservation) => {
    const body = speechSchema.parse(request.body);
    const response = await upstreamFetch(config, "/audio/speech", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, model: config.SPEECH_MODEL, stream: false }) }, 65_000);
    const bytes = await readLimited(response, 64 * 1024 * 1024);
    if (!response.ok) { await completeQuota(pool, reservation, "upstream_error", response.status); reply.code(502).send({ message: "语音上游请求失败。" }); return; }
    const contentType = response.headers.get("content-type") || "audio/mpeg";
    if (!contentType.startsWith("audio/")) throw new Error("invalid speech content type");
    await completeQuota(pool, reservation, "completed", response.status);
    reply.type(contentType).send(bytes);
  }));

  app.post("/v1/images/edits", { preHandler: protectedRoute }, async (request, reply) => withQuota(config, pool, redis, request, reply, "image", async (reservation) => {
    const form = new FormData();
    for await (const part of request.parts()) {
      if (part.type === "file") {
        const buffer = await part.toBuffer();
        form.append("image", new Blob([Uint8Array.from(buffer)], { type: part.mimetype }), "lumpa-reference.png");
      } else if (["prompt", "size", "n", "background"].includes(part.fieldname)) {
        form.append(part.fieldname, String(part.value).slice(0, part.fieldname === "prompt" ? 20_000 : 128));
      }
    }
    if (!form.has("prompt") || !form.has("image")) { reply.code(400).send({ message: "prompt 和 image 不能为空。" }); return; }
    form.set("model", config.IMAGE_MODEL);
    const response = await upstreamFetch(config, "/images/edits", { method: "POST", body: form }, 125_000);
    const bytes = await readLimited(response, 72 * 1024 * 1024);
    if (!response.ok) { await completeQuota(pool, reservation, "upstream_error", response.status); reply.code(502).send({ message: "图像上游请求失败。" }); return; }
    await completeQuota(pool, reservation, "completed", response.status);
    reply.type(response.headers.get("content-type") || "application/json").send(bytes);
  }));

  app.post("/v1/videos/generations", { preHandler: protectedRoute }, async (request, reply) => withQuota(config, pool, redis, request, reply, "video", async (reservation) => {
    const body = videoSchema.parse(request.body);
    const response = await upstreamFetch(config, "/videos/generations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, model: config.VIDEO_MODEL, n: 1 }) }, 125_000);
    const bytes = await readLimited(response, 8 * 1024 * 1024);
    if (!response.ok) { await completeQuota(pool, reservation, "upstream_error", response.status); reply.code(502).send({ message: "视频上游请求失败。" }); return; }
    await completeQuota(pool, reservation, "completed", response.status);
    reply.type("application/json").send(bytes);
  }));

  app.get("/v1/videos/generations/:taskId", { preHandler: protectedRoute }, async (request, reply) => {
    const taskId = (request.params as { taskId: string }).taskId;
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(taskId)) return reply.code(400).send({ message: "视频任务 ID 不合法。" });
    try {
      const response = await upstreamFetch(config, `/videos/generations/${encodeURIComponent(taskId)}`, { method: "GET" }, 30_000);
      const bytes = await readLimited(response, 72 * 1024 * 1024);
      if (!response.ok) return reply.code(502).send({ message: "视频任务查询失败。" });
      return reply.type(response.headers.get("content-type") || "application/json").send(bytes);
    } catch { return reply.code(502).send({ message: "视频任务查询失败。" }); }
  });
}
