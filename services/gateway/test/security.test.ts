import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";
import { readLimited } from "../src/proxy.js";
import { shanghaiDate } from "../src/quota.js";

function baseEnvironment() {
  return {
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://lumpa:test@127.0.0.1:5432/lumpa_test",
    REDIS_URL: "redis://127.0.0.1:6379/15",
    JWT_SECRET: "test-jwt-secret-with-more-than-thirty-two-bytes",
    OTP_PEPPER: "test-otp-pepper-with-more-than-thirty-two-bytes",
    MAIL_MODE: "memory",
    UPSTREAM_BASE_URL: "http://127.0.0.1:9089/v1",
    UPSTREAM_API_KEY: "test-upstream-key",
  } as NodeJS.ProcessEnv;
}

describe("gateway security boundaries", () => {
  it("rejects non-loopback plain HTTP upstreams", () => {
    expect(() => loadConfig({ ...baseEnvironment(), UPSTREAM_BASE_URL: "http://example.com/v1" })).toThrow(/HTTPS/);
  });

  it("allows explicit loopback HTTP only for a private upstream", () => {
    expect(loadConfig(baseEnvironment()).UPSTREAM_BASE_URL).toBe("http://127.0.0.1:9089/v1");
  });

  it("uses Shanghai local midnight for quota dates", () => {
    expect(shanghaiDate(new Date("2026-07-17T15:59:59.000Z"))).toBe("2026-07-17");
    expect(shanghaiDate(new Date("2026-07-17T16:00:00.000Z"))).toBe("2026-07-18");
  });

  it("stops reading oversized upstream bodies", async () => {
    const response = new Response(new Uint8Array(1025), { headers: { "content-type": "application/octet-stream" } });
    await expect(readLimited(response, 1024)).rejects.toThrow(/too large/);
  });
});
