import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { Redis } from "ioredis";
import type { GatewayConfig } from "./config.js";
import { createPool, migrateDatabase } from "./database.js";
import { registerAuthRoutes } from "./auth.js";
import { registerProxyRoutes } from "./proxy.js";
import { registerQuotaRoute } from "./quota.js";

export async function buildGateway(config: GatewayConfig) {
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === "test" ? "silent" : "info",
      redact: {
        paths: ["req.headers.authorization", "req.body", "res.body", "email", "code", "refreshToken", "accessToken", "apiKey", "filePath"],
        censor: "[REDACTED]",
      },
      serializers: {
        req(request) { return { method: request.method, url: request.url, requestId: request.id }; },
        res(response) { return { statusCode: response.statusCode }; },
      },
    },
    bodyLimit: 40 * 1024 * 1024,
    requestTimeout: 130_000,
    connectionTimeout: 10_000,
    keepAliveTimeout: 30_000,
    trustProxy: 1,
    genReqId: () => crypto.randomUUID(),
  });
  const pool = createPool(config);
  const redis = new Redis(config.REDIS_URL, { maxRetriesPerRequest: 2, enableReadyCheck: true, lazyConnect: true });
  await Promise.all([migrateDatabase(pool), redis.connect()]);

  app.decorateRequest("auth", null);
  await app.register(helmet, {
    contentSecurityPolicy: false,
    strictTransportSecurity: { maxAge: 31_536_000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: "no-referrer" },
  });
  await app.register(multipart, {
    limits: { files: 1, fileSize: 24 * 1024 * 1024, fields: 8, fieldSize: 20_000, parts: 10 },
    throwFileSizeLimit: true,
  });

  app.get("/healthz", async () => {
    await Promise.all([pool.query("SELECT 1"), redis.ping()]);
    return { status: "ok", version: "1.0.0" };
  });
  registerAuthRoutes(app, config, pool, redis);
  registerQuotaRoute(app, config, pool, redis);
  registerProxyRoutes(app, config, pool, redis);

  app.setNotFoundHandler((_request, reply) => reply.code(404).send({ message: "接口不存在。" }));
  app.setErrorHandler((error, request, reply) => {
    const gatewayError = error as Error & { validation?: unknown; statusCode?: number };
    const validation = gatewayError.validation || gatewayError.name === "ZodError";
    if (!validation) request.log.error({ errorName: gatewayError.name, statusCode: gatewayError.statusCode }, "request failed");
    reply.code(validation ? 400 : Math.min(599, Math.max(400, gatewayError.statusCode || 500))).send({ message: validation ? "请求参数不正确。" : "网关请求失败。" });
  });
  app.addHook("onClose", async () => { await Promise.allSettled([pool.end(), redis.quit()]); });
  return { app, pool, redis };
}
