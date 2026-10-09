import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildGateway } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const enabled = Boolean(process.env.TEST_DATABASE_URL && process.env.TEST_REDIS_URL);
const suite = enabled ? describe : describe.skip;

suite("gateway auth and quota integration", () => {
  let context: Awaited<ReturnType<typeof buildGateway>>;
  const deviceId = "a".repeat(32);
  let accessToken = "";
  let refreshToken = "";

  beforeAll(async () => {
    const config = loadConfig({
      ...process.env,
      NODE_ENV: "test",
      DATABASE_URL: process.env.TEST_DATABASE_URL!,
      REDIS_URL: process.env.TEST_REDIS_URL!,
      JWT_SECRET: "integration-jwt-secret-with-more-than-thirty-two-bytes",
      OTP_PEPPER: "integration-otp-pepper-with-more-than-thirty-two-bytes",
      MAIL_MODE: "memory",
      REGISTRATION_ENABLED: "true",
      UPSTREAM_BASE_URL: "http://127.0.0.1:1/v1",
      UPSTREAM_API_KEY: "integration-upstream-key",
      CHAT_DAILY_LIMIT: "1",
    });
    context = await buildGateway(config);
    await context.pool.query("TRUNCATE audit_events,quota_ledger,device_sessions,accounts RESTART IDENTITY CASCADE");
    await context.redis.flushdb();
  });

  afterAll(async () => { if (context) await context.app.close(); });

  it("consumes a verification challenge once", async () => {
    const started = await context.app.inject({ method: "POST", url: "/v1/auth/email/start", payload: { email: "tester@example.com" } });
    expect(started.statusCode).toBe(200);
    const challenge = started.json<{ challengeId: string; testCode: string }>();
    const verified = await context.app.inject({ method: "POST", url: "/v1/auth/email/verify", payload: { challengeId: challenge.challengeId, code: challenge.testCode, deviceId, deviceName: "Integration Test" } });
    expect(verified.statusCode).toBe(200);
    ({ accessToken, refreshToken } = verified.json());
    const replay = await context.app.inject({ method: "POST", url: "/v1/auth/email/verify", payload: { challengeId: challenge.challengeId, code: challenge.testCode, deviceId, deviceName: "Integration Test" } });
    expect(replay.statusCode).toBe(400);
  });

  it("rotates refresh tokens and rejects reuse", async () => {
    const first = refreshToken;
    const refreshed = await context.app.inject({ method: "POST", url: "/v1/auth/refresh", payload: { deviceId, refreshToken: first } });
    expect(refreshed.statusCode).toBe(200);
    ({ accessToken, refreshToken } = refreshed.json());
    expect(refreshToken).not.toBe(first);
    const reuse = await context.app.inject({ method: "POST", url: "/v1/auth/refresh", payload: { deviceId, refreshToken: first } });
    expect(reuse.statusCode).toBe(401);
  });

  it("does not revoke a session with a forged logout secret", async () => {
    const [sessionId] = refreshToken.split(".");
    const forged = `${sessionId}.${"f".repeat(64)}`;
    const response = await context.app.inject({ method: "POST", url: "/v1/auth/logout", payload: { deviceId, refreshToken: forged } });
    expect(response.statusCode).toBe(204);
    const account = await context.app.inject({ method: "GET", url: "/v1/account", headers: { authorization: `Bearer ${accessToken}` } });
    expect(account.statusCode).toBe(200);
  });

  it("enforces quota atomically under concurrent requests", async () => {
    const request = () => context.app.inject({ method: "POST", url: "/v1/chat/completions", headers: { authorization: `Bearer ${accessToken}` }, payload: { messages: [{ role: "user", content: "hello" }] } });
    const responses = await Promise.all([request(), request()]);
    expect(responses.map((response) => response.statusCode).sort()).toEqual([429, 502]);
    const ledger = await context.pool.query("SELECT outcome,COUNT(*)::int AS count FROM quota_ledger GROUP BY outcome ORDER BY outcome");
    expect(ledger.rows).toEqual(expect.arrayContaining([expect.objectContaining({ outcome: "rejected", count: 1 }), expect.objectContaining({ outcome: "upstream_error", count: 1 })]));
  });

  it("revokes a device session", async () => {
    const revoked = await context.app.inject({ method: "DELETE", url: `/v1/account/devices/${deviceId}`, headers: { authorization: `Bearer ${accessToken}` } });
    expect(revoked.statusCode).toBe(204);
    const account = await context.app.inject({ method: "GET", url: "/v1/account", headers: { authorization: `Bearer ${accessToken}` } });
    expect(account.statusCode).toBe(401);
  });

  it("deletes an account and every active device session", async () => {
    const started = await context.app.inject({ method: "POST", url: "/v1/auth/email/start", payload: { email: "delete-me@example.com" } });
    const challenge = started.json<{ challengeId: string; testCode: string }>();
    const verified = await context.app.inject({ method: "POST", url: "/v1/auth/email/verify", payload: { challengeId: challenge.challengeId, code: challenge.testCode, deviceId: "b".repeat(32), deviceName: "Disposable Test" } });
    const token = verified.json<{ accessToken: string }>().accessToken;
    const deleted = await context.app.inject({ method: "DELETE", url: "/v1/account", headers: { authorization: `Bearer ${token}` } });
    expect(deleted.statusCode).toBe(204);
    const rejected = await context.app.inject({ method: "GET", url: "/v1/account", headers: { authorization: `Bearer ${token}` } });
    expect(rejected.statusCode).toBe(401);
  });
});
