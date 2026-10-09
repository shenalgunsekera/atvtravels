// Server-only Neon Postgres access. Enabled when DATABASE_URL (or POSTGRES_URL, set by
// Vercel's Neon integration) is present; otherwise content is stored in data/*.json.
import { neon } from "@neondatabase/serverless";
import { SCHEMA } from "./sql";

export const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

type Query = (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

let client: ReturnType<typeof neon> | null = null;
let ready: Promise<void> | null = null;

export const db: Query = async (text, params = []) => {
  if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
  client ??= neon(DATABASE_URL);
  const c = client;
  ready ??= (async () => {
    for (const stmt of SCHEMA) await c.query(stmt);
  })().catch((err) => {
    ready = null; // retry on the next request
    throw err;
  });
  await ready;
  return (await c.query(text, params)) as Record<string, unknown>[];
};
