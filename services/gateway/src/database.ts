import pg from "pg";
import type { GatewayConfig } from "./config.js";

const { Pool } = pg;

export function createPool(config: GatewayConfig) {
  return new Pool({ connectionString: config.DATABASE_URL, max: 12, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000 });
}

export type DatabasePool = ReturnType<typeof createPool>;

export async function migrateDatabase(pool: DatabasePool) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS gateway_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY,
        email_normalized TEXT NOT NULL UNIQUE,
        email_masked TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','disabled','deleting')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS device_sessions (
        id UUID PRIMARY KEY,
        account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        device_id TEXT NOT NULL,
        device_name TEXT NOT NULL,
        refresh_hash TEXT NOT NULL,
        refresh_version INTEGER NOT NULL DEFAULT 1,
        expires_at TIMESTAMPTZ NOT NULL,
        last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(account_id, device_id)
      );
      CREATE TABLE IF NOT EXISTS quota_ledger (
        id BIGSERIAL PRIMARY KEY,
        request_id UUID NOT NULL UNIQUE,
        account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        local_date DATE NOT NULL,
        capability TEXT NOT NULL CHECK(capability IN ('chat','speech','image','video')),
        units INTEGER NOT NULL CHECK(units > 0),
        outcome TEXT NOT NULL CHECK(outcome IN ('reserved','completed','rejected','upstream_error')),
        upstream_status INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_quota_account_date ON quota_ledger(account_id, local_date, capability);
      CREATE TABLE IF NOT EXISTS audit_events (
        id BIGSERIAL PRIMARY KEY,
        account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
        event_type TEXT NOT NULL,
        request_id TEXT,
        summary_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      INSERT INTO gateway_migrations(version) VALUES(1) ON CONFLICT DO NOTHING;
    `);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function audit(pool: DatabasePool, eventType: string, accountId: string | null, requestId: string | null, summary: Record<string, unknown> = {}) {
  await pool.query(
    "INSERT INTO audit_events(account_id,event_type,request_id,summary_json) VALUES($1,$2,$3,$4)",
    [accountId, eventType, requestId, JSON.stringify(summary)],
  );
}
