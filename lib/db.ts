// Server-only Neon Postgres access. Enabled when DATABASE_URL (or POSTGRES_URL, set by
// Vercel's Neon integration) is present; otherwise content is stored in data/*.json.
import { neon } from "@neondatabase/serverless";
import { SCHEMA, SCHEMA_LOCK_ID } from "./sql";

export const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

type Query = (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

let client: ReturnType<typeof neon> | null = null;
let ready: Promise<void> | null = null;

// Concurrent CREATE TABLE IF NOT EXISTS can still fail with "duplicate key" in Postgres
// (e.g. many build workers starting at once), so the schema is created inside one
// transaction holding an advisory lock, and a lost race is retried.
async function ensureSchema(c: ReturnType<typeof neon>) {
  for (let attempt = 1; ; attempt++) {
    try {
      await c.transaction([c.query(`SELECT pg_advisory_xact_lock(${SCHEMA_LOCK_ID})`), ...SCHEMA.map((s) => c.query(s))]);
      return;
    } catch (err) {
      const code = (err as { code?: string }).code;
      const race = code === "23505" || code === "42P07" || code === "42710";
      if (!race || attempt >= 3) throw err;
    }
  }
}

export const db: Query = async (text, params = []) => {
  if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
  client ??= neon(DATABASE_URL);
  const c = client;
  ready ??= ensureSchema(c).catch((err) => {
    ready = null; // retry on the next request
    throw err;
  });
  await ready;
  return (await c.query(text, params)) as Record<string, unknown>[];
};
