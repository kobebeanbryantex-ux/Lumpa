import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Redis } from "ioredis";
import { randomUUID } from "node:crypto";
import { authenticate } from "./auth.js";
import { quotaLimits, type GatewayConfig } from "./config.js";
import type { DatabasePool } from "./database.js";

export type Capability = "chat" | "speech" | "image" | "video";

const reserveScript = `
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
local units = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
if current + units > limit then return {-1, current} end
local updated = redis.call('INCRBY', KEYS[1], units)
if updated == units then redis.call('EXPIRE', KEYS[1], tonumber(ARGV[3])) end
return {updated, limit - updated}
`;

export function shanghaiDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export interface QuotaReservation {
  requestId: string;
  capability: Capability;
  used: number;
  remaining: number;
  limit: number;
  localDate: string;
}

export async function reserveQuota(config: GatewayConfig, pool: DatabasePool, redis: Redis, accountId: string, capability: Capability, units = 1): Promise<QuotaReservation | null> {
  const limit = quotaLimits(config)[capability];
  const localDate = shanghaiDate();
  const key = `quota:${accountId}:${localDate}:${capability}`;
  const result = await redis.eval(reserveScript, 1, key, units, limit, 172_800) as [number, number];
  const requestId = randomUUID();
  if (Number(result[0]) < 0) {
    await pool.query("INSERT INTO quota_ledger(request_id,account_id,local_date,capability,units,outcome) VALUES($1,$2,$3,$4,$5,'rejected')", [requestId, accountId, localDate, capability, units]);
    return null;
  }
  await pool.query("INSERT INTO quota_ledger(request_id,account_id,local_date,capability,units,outcome) VALUES($1,$2,$3,$4,$5,'reserved')", [requestId, accountId, localDate, capability, units]);
  return { requestId, capability, used: Number(result[0]), remaining: Number(result[1]), limit, localDate };
}

export async function completeQuota(pool: DatabasePool, reservation: QuotaReservation, outcome: "completed" | "upstream_error", upstreamStatus?: number) {
  await pool.query("UPDATE quota_ledger SET outcome=$1,upstream_status=$2,updated_at=NOW() WHERE request_id=$3", [outcome, upstreamStatus ?? null, reservation.requestId]);
}

export function registerQuotaRoute(app: FastifyInstance, config: GatewayConfig, pool: DatabasePool, redis: Redis) {
  const protectedRoute = async (request: FastifyRequest, reply: FastifyReply) => authenticate(config, pool, request, reply);
  app.get("/v1/quota", { preHandler: protectedRoute }, async (request) => {
    const limits = quotaLimits(config);
    const localDate = shanghaiDate();
    const capabilities = Object.keys(limits) as Capability[];
    const keys = capabilities.map((capability) => `quota:${request.auth!.accountId}:${localDate}:${capability}`);
    const values = await redis.mget(...keys);
    return {
      localDate,
      timezone: "Asia/Shanghai",
      quotas: Object.fromEntries(capabilities.map((capability, index) => {
        const used = Number(values[index] || 0);
        return [capability, { used, limit: limits[capability], remaining: Math.max(0, limits[capability] - used) }];
      })),
    };
  });
}

export const quotaLuaScript = reserveScript;
