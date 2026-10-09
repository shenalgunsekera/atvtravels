// Server-only content storage with optimistic locking and automatic backups.
// Production (Vercel): Neon Postgres. Local dev without DATABASE_URL: data/*.json files.
import { promises as fs } from "fs";
import path from "path";
import { DATABASE_URL, db } from "./db";
import { CONTENT_SQL as SQL, MAX_BACKUPS_PER_DOC } from "./sql";
import { normalizePackages, normalizeSite } from "./site-normalize";
import type { PackagesData, SiteContent } from "./site-types";
import seedSite from "@/data/site.json";
import seedPackages from "@/data/packages.json";

export type DocName = "site" | "packages";
type DocMap = { site: SiteContent; packages: PackagesData };
export type BackupInfo = { id: string; doc: DocName; createdAt: string; size: number };

const DOCS: { [K in DocName]: { file: string; seed: unknown; normalize: (raw: unknown) => DocMap[K] } } = {
  site: { file: "site.json", seed: seedSite, normalize: normalizeSite },
  packages: { file: "packages.json", seed: seedPackages, normalize: normalizePackages },
};

export function isDocName(v: unknown): v is DocName {
  return v === "site" || v === "packages";
}

export class VersionConflictError extends Error {}
export class StorageNotConfiguredError extends Error {}

export const usingDatabase = () => DATABASE_URL !== "";

// ── Public API ─────────────────────────────────────────────────────────

export async function readDoc<K extends DocName>(name: K): Promise<{ data: DocMap[K]; version: string }> {
  const raw = usingDatabase() ? await dbReadSafe(name) : await fileRead(name);
  return { data: DOCS[name].normalize(raw.data) as DocMap[K], version: raw.version };
}

// The build never talks to the database: database calls while Next prerenders pages and
// routes (robots.txt, sitemap.xml) can stall the deploy. Pages are built from data/*.json and
// refreshed from the database at runtime (see `revalidate` in app/(site)/layout.tsx).
async function dbReadSafe(name: DocName) {
  if (process.env.NEXT_PHASE === "phase-production-build") return { data: DOCS[name].seed, version: "0" };
  return dbRead(name);
}

export async function writeDoc<K extends DocName>(
  name: K,
  data: unknown,
  expectedVersion?: string
): Promise<{ data: DocMap[K]; version: string }> {
  const clean = DOCS[name].normalize(data) as DocMap[K];
  const version = usingDatabase() ? await dbWrite(name, clean, expectedVersion) : await fileWrite(name, clean, expectedVersion);
  return { data: clean, version };
}

export async function listBackups(): Promise<BackupInfo[]> {
  if (!usingDatabase()) return fileListBackups();
  const rows = await db(SQL.listBackups);
  return rows.map((r) => ({
    id: String(r.id),
    doc: r.doc as DocName,
    createdAt: new Date(r.created_at as string).toISOString(),
    size: Number(r.size),
  }));
}

export async function readBackup(id: string): Promise<{ doc: DocName; raw: unknown } | null> {
  if (!usingDatabase()) return fileReadBackup(id);
  if (!/^\d+$/.test(id)) return null;
  const [row] = await db(SQL.readBackup, [id]);
  return row && isDocName(row.doc) ? { doc: row.doc, raw: row.data } : null;
}

// ── Neon backend ───────────────────────────────────────────────────────

async function dbRead(name: DocName): Promise<{ data: unknown; version: string }> {
  let [row] = await db(SQL.read, [name]);
  if (!row) {
    // First run: seed the database from the JSON files committed in the repo.
    await db(SQL.seed, [name, JSON.stringify(DOCS[name].seed)]);
    [row] = await db(SQL.read, [name]);
  }
  return { data: row.data, version: String(row.version) };
}

async function dbWrite(name: DocName, data: unknown, expectedVersion?: string): Promise<string> {
  await dbRead(name); // make sure the row exists
  const expected = expectedVersion && /^\d+$/.test(expectedVersion) ? Number(expectedVersion) : null;
  const rows = await db(SQL.write, [name, expected, JSON.stringify(data)]);
  if (rows.length === 0) {
    throw new VersionConflictError("This content was changed somewhere else. Reload to get the latest version.");
  }
  await db(SQL.prune, [name]).catch((err) => console.error("Backup prune failed:", err));
  return String(rows[0].version);
}

// ── File backend (local development) ───────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const BACKUP_RE = /^(site|packages)--(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)\.json$/;
const docPath = (name: DocName) => path.join(DATA_DIR, DOCS[name].file);

async function fileRead(name: DocName): Promise<{ data: unknown; version: string }> {
  try {
    const [raw, stat] = await Promise.all([fs.readFile(docPath(name), "utf-8"), fs.stat(docPath(name))]);
    return { data: JSON.parse(raw), version: String(stat.mtimeMs) };
  } catch {
    return { data: DOCS[name].seed, version: "0" };
  }
}

// Serialize file writes per document so two quick saves can't interleave.
const writeQueues = new Map<DocName, Promise<unknown>>();

function fileWrite(name: DocName, data: unknown, expectedVersion?: string): Promise<string> {
  if (process.env.VERCEL) {
    return Promise.reject(
      new StorageNotConfiguredError("The database isn't connected. Add the Neon integration (DATABASE_URL) in Vercel, then redeploy.")
    );
  }
  const prev = writeQueues.get(name) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(async () => {
    const current = await fileRead(name);
    if (expectedVersion && current.version !== "0" && expectedVersion !== current.version) {
      throw new VersionConflictError("This content was changed somewhere else. Reload to get the latest version.");
    }
    const file = docPath(name);
    if (current.version !== "0") {
      await fs.mkdir(BACKUP_DIR, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      await fs.copyFile(file, path.join(BACKUP_DIR, `${name}--${stamp}.json`));
      const old = (await fileListBackups()).filter((b) => b.doc === name).slice(MAX_BACKUPS_PER_DOC);
      await Promise.all(old.map((b) => fs.unlink(path.join(BACKUP_DIR, b.id)).catch(() => {})));
    }
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf-8");
    await fs.rename(tmp, file);
    return String((await fs.stat(file)).mtimeMs);
  });
  writeQueues.set(name, next);
  return next;
}

async function fileListBackups(): Promise<BackupInfo[]> {
  let files: string[] = [];
  try {
    files = await fs.readdir(BACKUP_DIR);
  } catch {
    return [];
  }
  const out: BackupInfo[] = [];
  for (const file of files) {
    const m = BACKUP_RE.exec(file);
    if (!m) continue;
    const stat = await fs.stat(path.join(BACKUP_DIR, file));
    const iso = m[2].replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/, "T$1:$2:$3.$4Z");
    out.push({ id: file, doc: m[1] as DocName, createdAt: iso, size: stat.size });
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function fileReadBackup(file: string): Promise<{ doc: DocName; raw: unknown } | null> {
  const m = BACKUP_RE.exec(file);
  if (!m) return null;
  try {
    return { doc: m[1] as DocName, raw: JSON.parse(await fs.readFile(path.join(BACKUP_DIR, file), "utf-8")) };
  } catch {
    return null;
  }
}
