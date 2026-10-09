import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { z } from "zod";
import type { PetStudioConfig } from "./config.js";
import { runInference } from "./inference.js";
import { JobStore } from "./storage.js";
import { petStyles, type PetJob, type PetStyle } from "./types.js";

const allowedMimes = new Set<PetJob["sourceMime"]>(["image/jpeg", "image/png", "image/webp"]);
const styleSchema = z.enum(petStyles);

function publicJob(job: PetJob) {
  const { sourceFilename: _sourceFilename, sourceMime: _sourceMime, ...publicValue } = job;
  return publicValue;
}

export async function buildPetStudio(config: PetStudioConfig) {
  const app = Fastify({
    logger: {
      level: config.nodeEnv === "test" ? "silent" : "info",
      redact: { paths: ["req.headers.authorization", "req.body", "res.body"], censor: "[REDACTED]" },
      serializers: { req: (request) => ({ method: request.method, url: request.url, requestId: request.id }) },
    },
    bodyLimit: config.maxUploadBytes + 128 * 1024,
    requestTimeout: 135_000,
    connectionTimeout: 10_000,
    trustProxy: true,
    genReqId: () => crypto.randomUUID(),
  });
  const store = new JobStore(config.storageDir);
  await store.init();
  await app.register(helmet, { contentSecurityPolicy: false, referrerPolicy: { policy: "no-referrer" } });
  await app.register(multipart, { limits: { files: 1, fileSize: config.maxUploadBytes, fields: 4, parts: 5 }, throwFileSizeLimit: true });

  app.addHook("onRequest", async (request, reply) => {
    const origin = request.headers.origin;
    if (origin && config.allowedOrigins.has(origin)) {
      reply.header("access-control-allow-origin", origin).header("vary", "Origin").header("access-control-allow-methods", "GET,POST,DELETE,OPTIONS").header("access-control-allow-headers", "content-type,authorization");
    }
    if (request.method === "OPTIONS") return reply.code(204).send();
  });

  app.get("/healthz", async () => ({ status: "ok", service: "lumpa-pet-studio", inferenceMode: config.inference.mode }));
  app.get("/v1/pet-studio/capabilities", async () => ({
    generationEnabled: config.inference.mode === "webhook",
    acceptedImageTypes: [...allowedMimes],
    maxUploadBytes: config.maxUploadBytes,
    styles: petStyles,
  }));

  app.post("/v1/pet-studio/jobs", async (request, reply) => {
    const fields = await request.parts();
    let style: PetStyle | undefined;
    let file: { data: Buffer; mime: PetJob["sourceMime"] } | undefined;
    for await (const part of fields) {
      if (part.type === "file") {
        if (part.fieldname !== "image" || !allowedMimes.has(part.mimetype as PetJob["sourceMime"]) || file) return reply.code(400).send({ message: "请上传一张 JPG、PNG 或 WebP 图片。" });
        file = { data: await part.toBuffer(), mime: part.mimetype as PetJob["sourceMime"] };
      } else if (part.fieldname === "style") {
        const parsed = styleSchema.safeParse(part.value);
        if (parsed.success) style = parsed.data;
      }
    }
    if (!style || !file || file.data.byteLength === 0) return reply.code(400).send({ message: "image 和 style 不能为空。" });
    const job = await store.create({ style, mime: file.mime, source: file.data });
    if (config.inference.mode === "disabled") {
      const waiting = await runInference(config, store, job);
      return reply.code(202).send({ job: publicJob(waiting) });
    }
    void runInference(config, store, job).catch((error: unknown) => request.log.error({ errorName: error instanceof Error ? error.name : "UnknownError" }, "background pet inference failed"));
    return reply.code(202).send({ job: publicJob(job) });
  });

  app.get("/v1/pet-studio/jobs/:id", async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const job = await store.get(id);
    if (!job) return reply.code(404).send({ message: "未找到该生成任务。" });
    return { job: publicJob(job) };
  });

  app.delete("/v1/pet-studio/jobs/:id", async (request, reply) => {
    const id = (request.params as { id: string }).id;
    if (!store.isValidId(id)) return reply.code(404).send({ message: "未找到该生成任务。" });
    await store.remove(id);
    return reply.code(204).send();
  });

  app.setErrorHandler((error, request, reply) => {
    const serviceError = error as Error & { code?: string; statusCode?: number };
    request.log.error({ name: serviceError.name, statusCode: serviceError.statusCode }, "pet studio request failed");
    if (serviceError.code === "FST_REQ_FILE_TOO_LARGE") return reply.code(413).send({ message: "图片超过允许大小。" });
    return reply.code(Math.min(599, Math.max(400, serviceError.statusCode || 500))).send({ message: "桌宠生成服务暂时不可用。" });
  });
  return { app, store };
}
