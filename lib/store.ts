// Server-only JSON document storage with atomic writes, optimistic locking and backups.
import { promises as fs } from "fs";
import path from "path";
import { normalizePackages, normalizeSite } from "./site-normalize";
import type { PackagesData, SiteContent } from "./site-types";

export const DATA_DIR = path.join(process.cwd(), "data");
export const BACKUP_DIR = path.join(DATA_DIR, "backups");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const MAX_BACKUPS_PER_DOC = 40;

export type DocName = "site" | "packages";
type DocMap = { site: SiteContent; packages: PackagesData };

const DOCS: { [K in DocName]: { file: string; normalize: (raw: unknown) => DocMap[K] } } = {
  site: { file: "site.json", normalize: normalizeSite },
  packages: { file: "packages.json", normalize: normalizePackages },
};

export function isDocName(v: unknown): v is DocName {
  return v === "site" || v === "packages";
}

function docPath(name: DocName) {
  return path.join(DATA_DIR, DOCS[name].file);
}

export class VersionConflictError extends Error {}

export async function readDoc<K extends DocName>(name: K): Promise<{ data: DocMap[K]; version: string }> {
  const file = docPath(name);
  try {
    const [raw, stat] = await Promise.all([fs.readFile(file, "utf-8"), fs.stat(file)]);
    return { data: DOCS[name].normalize(JSON.parse(raw)) as DocMap[K], version: String(stat.mtimeMs) };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") console.error(`Failed to read ${file}:`, err);
    return { data: DOCS[name].normalize({}) as DocMap[K], version: "0" };
  }
}

// Serialize writes per document so two quick saves can't interleave.
const writeQueues = new Map<DocName, Promise<unknown>>();

export function writeDoc<K extends DocName>(
  name: K,
  data: unknown,
  expectedVersion?: string
): Promise<{ data: DocMap[K]; version: string }> {
  const prev = writeQueues.get(name) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(async () => {
    const current = await readDoc(name);
    if (expectedVersion && current.version !== "0" && expectedVersion !== current.version) {
      throw new VersionConflictError("This content was changed somewhere else. Reload to get the latest version.");
    }
    const clean = DOCS[name].normalize(data) as DocMap[K];
    const file = docPath(name);
    if (current.version !== "0") await backupDoc(name);
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(clean, null, 2) + "\n", "utf-8");
    await fs.rename(tmp, file);
    const stat = await fs.stat(file);
    return { data: clean, version: String(stat.mtimeMs) };
  });
  writeQueues.set(name, next);
  return next;
}

// ── Backups ────────────────────────────────────────────────────────────

export type BackupInfo = { file: string; doc: DocName; createdAt: string; size: number };

async function backupDoc(name: DocName) {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  await fs.copyFile(docPath(name), path.join(BACKUP_DIR, `${name}--${stamp}.json`));
  const all = (await listBackups()).filter((b) => b.doc === name);
  await Promise.all(
    all.slice(MAX_BACKUPS_PER_DOC).map((b) => fs.unlink(path.join(BACKUP_DIR, b.file)).catch(() => {}))
  );
}

const BACKUP_RE = /^(site|packages)--(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)\.json$/;

export async function listBackups(): Promise<BackupInfo[]> {
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
    out.push({ file, doc: m[1] as DocName, createdAt: iso, size: stat.size });
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function readBackup(file: string): Promise<{ doc: DocName; raw: unknown } | null> {
  const m = BACKUP_RE.exec(file);
  if (!m) return null;
  try {
    const raw = JSON.parse(await fs.readFile(path.join(BACKUP_DIR, file), "utf-8"));
    return { doc: m[1] as DocName, raw };
  } catch {
    return null;
  }
}
