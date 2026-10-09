import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Redis } from "ioredis";
import { SignJWT, jwtVerify } from "jose";
import nodemailer from "nodemailer";
import { createHmac, randomBytes, randomInt, randomUUID, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";
import { z } from "zod";
import type { GatewayConfig } from "./config.js";
import { audit, type DatabasePool } from "./database.js";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const startSchema = z.object({ email: emailSchema, inviteCode: z.string().max(128).optional() });
const verifySchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/),
  deviceId: z.string().regex(/^[a-f0-9]{32}$/),
  deviceName: z.string().trim().min(1).max(80),
});
const refreshSchema = z.object({ deviceId: z.string().regex(/^[a-f0-9]{32}$/), refreshToken: z.string().min(40).max(256) });

export interface AuthClaims {
  accountId: string;
  sessionId: string;
  deviceId: string;
}

declare module "fastify" {
  interface FastifyRequest {
    auth: AuthClaims | null;
  }
}

function maskEmail(email: string) {
  const [local = "", domain = ""] = email.split("@");
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}

function otpDigest(config: GatewayConfig, challengeId: string, email: string, code: string) {
  return createHmac("sha256", config.OTP_PEPPER).update(`${challengeId}\n${email}\n${code}`).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function refreshParts(token: string) {
  const [sessionId, secret, extra] = token.split(".");
  if (extra || !sessionId || !secret || !z.string().uuid().safeParse(sessionId).success || secret.length < 32) return null;
  return { sessionId, secret };
}

async function hashRefreshSecret(secret: string) {
  const salt = randomBytes(16);
  const derived = await deriveScrypt(secret, salt, 32, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$16384$8$1$${salt.toString("base64")}$${derived.toString("base64")}`;
}

async function verifyRefreshSecret(stored: string, secret: string) {
  const [algorithm, n, r, p, saltEncoded, expectedEncoded, extra] = stored.split("$");
  if (extra || algorithm !== "scrypt" || !n || !r || !p || !saltEncoded || !expectedEncoded) return false;
  const expected = Buffer.from(expectedEncoded, "base64");
  const derived = await deriveScrypt(secret, Buffer.from(saltEncoded, "base64"), expected.length, {
    N: Number(n), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024,
  }).catch(() => null);
  return Boolean(derived && derived.length === expected.length && timingSafeEqual(derived, expected));
}

function deriveScrypt(secret: string, salt: Buffer, length: number, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(secret, salt, length, options, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });
}

async function signAccess(config: GatewayConfig, claims: AuthClaims) {
  return new SignJWT({ sid: claims.sessionId, did: claims.deviceId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.accountId)
    .setIssuer("lumpa-gateway")
    .setAudience("lumpa-desktop")
    .setIssuedAt()
    .setExpirationTime(`${config.ACCESS_TOKEN_MINUTES}m`)
    .sign(new TextEncoder().encode(config.JWT_SECRET));
}

export async function authenticate(config: GatewayConfig, pool: DatabasePool, request: FastifyRequest, reply: FastifyReply) {
  const authorization = request.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) return reply.code(401).send({ message: "需要登录。" });
  try {
    const { payload } = await jwtVerify(authorization.slice(7), new TextEncoder().encode(config.JWT_SECRET), {
      issuer: "lumpa-gateway",
      audience: "lumpa-desktop",
      algorithms: ["HS256"],
    });
    const accountId = payload.sub;
    const sessionId = payload.sid;
    const deviceId = payload.did;
    if (typeof accountId !== "string" || typeof sessionId !== "string" || typeof deviceId !== "string") throw new Error("invalid claims");
    const active = await pool.query(
      `SELECT 1 FROM device_sessions s JOIN accounts a ON a.id=s.account_id
       WHERE s.id=$1 AND s.account_id=$2 AND s.device_id=$3 AND s.revoked_at IS NULL AND s.expires_at>NOW() AND a.status='active'`,
      [sessionId, accountId, deviceId],
    );
    if (!active.rowCount) return reply.code(401).send({ message: "登录设备已失效。" });
    request.auth = { accountId, sessionId, deviceId };
  } catch {
    return reply.code(401).send({ message: "访问令牌无效或已过期。" });
  }
}

function createMailer(config: GatewayConfig) {
  if (config.MAIL_MODE === "memory") return null;
  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD },
    pool: true,
    maxConnections: 3,
  });
}

async function rateLimit(redis: Redis, key: string, limit: number, seconds: number) {
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, seconds);
  return count <= limit;
}

async function issueSession(config: GatewayConfig, pool: DatabasePool, accountId: string, emailMasked: string, deviceId: string, deviceName: string) {
  const sessionId = randomUUID();
  const refreshSecret = `${randomUUID().replaceAll("-", "")}${randomUUID().replaceAll("-", "")}`;
  const refreshHash = await hashRefreshSecret(refreshSecret);
  const expiresAt = new Date(Date.now() + config.REFRESH_TOKEN_DAYS * 86_400_000);
  await pool.query(
    `INSERT INTO device_sessions(id,account_id,device_id,device_name,refresh_hash,expires_at)
     VALUES($1,$2,$3,$4,$5,$6)
     ON CONFLICT(account_id,device_id) DO UPDATE SET id=EXCLUDED.id,device_name=EXCLUDED.device_name,
       refresh_hash=EXCLUDED.refresh_hash,refresh_version=device_sessions.refresh_version+1,
       expires_at=EXCLUDED.expires_at,last_used_at=NOW(),revoked_at=NULL`,
    [sessionId, accountId, deviceId, deviceName, refreshHash, expiresAt],
  );
  const accessToken = await signAccess(config, { accountId, sessionId, deviceId });
  return {
    accountId,
    emailMasked,
    accessToken,
    accessExpiresAt: new Date(Date.now() + config.ACCESS_TOKEN_MINUTES * 60_000).toISOString(),
    refreshToken: `${sessionId}.${refreshSecret}`,
  };
}

export function registerAuthRoutes(app: FastifyInstance, config: GatewayConfig, pool: DatabasePool, redis: Redis) {
  const mailer = createMailer(config);

  app.post("/v1/auth/email/start", async (request, reply) => {
    const parsed = startSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "邮箱地址格式不正确。" });
    const email = parsed.data.email;
    const ipKey = createHmac("sha256", config.OTP_PEPPER).update(request.ip).digest("hex").slice(0, 24);
    const emailKey = createHmac("sha256", config.OTP_PEPPER).update(email).digest("hex").slice(0, 24);
    if (!(await rateLimit(redis, `auth:start:ip:${ipKey}`, 12, 3600)) || !(await rateLimit(redis, `auth:start:email:${emailKey}`, 5, 3600))) {
      return reply.code(429).header("retry-after", "3600").send({ message: "验证码请求过于频繁，请稍后重试。" });
    }
    const existing = await pool.query("SELECT id FROM accounts WHERE email_normalized=$1", [email]);
    if (!existing.rowCount && !config.REGISTRATION_ENABLED) {
      const supplied = parsed.data.inviteCode || "";
      if (!config.REGISTRATION_INVITE_CODE || !safeEqual(supplied, config.REGISTRATION_INVITE_CODE)) {
        return reply.code(403).send({ message: "当前未开放注册，需要有效邀请码。" });
      }
    }
    const challengeId = randomUUID();
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const expiresAt = new Date(Date.now() + 10 * 60_000);
    const record = JSON.stringify({ email, digest: otpDigest(config, challengeId, email, code) });
    await redis.set(`auth:challenge:${challengeId}`, record, "EX", 600, "NX");
    try {
      if (mailer) {
        await mailer.sendMail({
          from: config.SMTP_FROM,
          to: email,
          subject: "Lumpa 登录验证码",
          text: `你的 Lumpa 登录验证码是 ${code}，10 分钟内有效。请勿转发给他人。`,
          html: `<p>你的 Lumpa 登录验证码是：</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>10 分钟内有效，请勿转发给他人。</p>`,
        });
      }
    } catch {
      await redis.del(`auth:challenge:${challengeId}`);
      return reply.code(502).send({ message: "验证码邮件发送失败，请稍后重试。" });
    }
    await audit(pool, "auth_code_sent", null, request.id, { emailHash: emailKey });
    const response: Record<string, unknown> = { challengeId, expiresAt: expiresAt.toISOString(), retryAfterSeconds: 60 };
    if (config.NODE_ENV === "test" && config.MAIL_MODE === "memory") response.testCode = code;
    return reply.send(response);
  });

  app.post("/v1/auth/email/verify", async (request, reply) => {
    const parsed = verifySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "验证码请求格式不正确。" });
    const raw = await redis.call("GETDEL", `auth:challenge:${parsed.data.challengeId}`) as string | null;
    if (!raw) return reply.code(400).send({ message: "验证码已过期或已使用。" });
    const record = JSON.parse(raw) as { email: string; digest: string };
    if (!safeEqual(record.digest, otpDigest(config, parsed.data.challengeId, record.email, parsed.data.code))) {
      await audit(pool, "auth_code_rejected", null, request.id, {});
      return reply.code(400).send({ message: "验证码不正确；该验证码会话已作废。" });
    }
    const accountId = randomUUID();
    const emailMasked = maskEmail(record.email);
    const account = await pool.query(
      `INSERT INTO accounts(id,email_normalized,email_masked) VALUES($1,$2,$3)
       ON CONFLICT(email_normalized) DO UPDATE SET updated_at=NOW()
       RETURNING id,email_masked,status`,
      [accountId, record.email, emailMasked],
    );
    const row = account.rows[0] as { id: string; email_masked: string; status: string };
    if (row.status !== "active") return reply.code(403).send({ message: "账号当前不可用。" });
    const session = await issueSession(config, pool, row.id, row.email_masked, parsed.data.deviceId, parsed.data.deviceName);
    await audit(pool, "auth_login", row.id, request.id, { deviceId: parsed.data.deviceId });
    return reply.send(session);
  });

  app.post("/v1/auth/refresh", async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "刷新请求格式不正确。" });
    const parts = refreshParts(parsed.data.refreshToken);
    if (!parts) return reply.code(401).send({ message: "刷新令牌无效。" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `SELECT s.account_id,s.device_name,s.refresh_hash,s.expires_at,s.revoked_at,a.email_masked,a.status
         FROM device_sessions s JOIN accounts a ON a.id=s.account_id WHERE s.id=$1 AND s.device_id=$2 FOR UPDATE`,
        [parts.sessionId, parsed.data.deviceId],
      );
      const row = result.rows[0] as { account_id: string; device_name: string; refresh_hash: string; expires_at: Date; revoked_at: Date | null; email_masked: string; status: string } | undefined;
      const valid = row && !row.revoked_at && row.status === "active" && new Date(row.expires_at).getTime() > Date.now() && await verifyRefreshSecret(row.refresh_hash, parts.secret);
      if (!valid) {
        await client.query("ROLLBACK");
        return reply.code(401).send({ message: "刷新令牌已失效，请重新登录。" });
      }
      const nextSecret = `${randomUUID().replaceAll("-", "")}${randomUUID().replaceAll("-", "")}`;
      const nextHash = await hashRefreshSecret(nextSecret);
      await client.query("UPDATE device_sessions SET refresh_hash=$1,refresh_version=refresh_version+1,last_used_at=NOW() WHERE id=$2", [nextHash, parts.sessionId]);
      await client.query("COMMIT");
      const accessToken = await signAccess(config, { accountId: row.account_id, sessionId: parts.sessionId, deviceId: parsed.data.deviceId });
      return reply.send({ accountId: row.account_id, emailMasked: row.email_masked, accessToken, accessExpiresAt: new Date(Date.now() + config.ACCESS_TOKEN_MINUTES * 60_000).toISOString(), refreshToken: `${parts.sessionId}.${nextSecret}` });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally { client.release(); }
  });

  app.post("/v1/auth/logout", async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "注销请求格式不正确。" });
    const parts = refreshParts(parsed.data.refreshToken);
    if (parts) {
      const session = await pool.query("SELECT refresh_hash FROM device_sessions WHERE id=$1 AND device_id=$2 AND revoked_at IS NULL", [parts.sessionId, parsed.data.deviceId]);
      const stored = session.rows[0]?.refresh_hash as string | undefined;
      if (stored && await verifyRefreshSecret(stored, parts.secret)) {
        await pool.query("UPDATE device_sessions SET revoked_at=NOW() WHERE id=$1 AND device_id=$2", [parts.sessionId, parsed.data.deviceId]);
      }
    }
    return reply.code(204).send();
  });

  const protectedRoute = async (request: FastifyRequest, reply: FastifyReply) => authenticate(config, pool, request, reply);
  app.get("/v1/account", { preHandler: protectedRoute }, async (request) => {
    const result = await pool.query("SELECT email_masked,created_at FROM accounts WHERE id=$1", [request.auth!.accountId]);
    const sessions = await pool.query("SELECT device_id,device_name,last_used_at,created_at FROM device_sessions WHERE account_id=$1 AND revoked_at IS NULL ORDER BY last_used_at DESC", [request.auth!.accountId]);
    return { accountId: request.auth!.accountId, emailMasked: result.rows[0]?.email_masked, createdAt: result.rows[0]?.created_at, sessions: sessions.rows };
  });
  app.delete("/v1/account/devices/:deviceId", { preHandler: protectedRoute }, async (request, reply) => {
    const deviceId = (request.params as { deviceId: string }).deviceId;
    await pool.query("UPDATE device_sessions SET revoked_at=NOW() WHERE account_id=$1 AND device_id=$2", [request.auth!.accountId, deviceId]);
    await audit(pool, "device_revoked", request.auth!.accountId, request.id, { deviceId });
    return reply.code(204).send();
  });
  app.delete("/v1/account", { preHandler: protectedRoute }, async (request, reply) => {
    await audit(pool, "account_deleted", request.auth!.accountId, request.id, {});
    await pool.query("DELETE FROM accounts WHERE id=$1", [request.auth!.accountId]);
    return reply.code(204).send();
  });
}
