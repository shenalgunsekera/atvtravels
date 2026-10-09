// Server-only storage for uploaded images when Cloudinary isn't configured:
// Neon (bytea) when DATABASE_URL is set, otherwise data/uploads on local disk.
// Files are served by app/media/[file]/route.ts at /media/<id>.
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import sharp from "sharp";
import { DATABASE_URL, db } from "./db";
import { MEDIA_SQL } from "./sql";
import { slugify } from "./site-normalize";
import { StorageNotConfiguredError } from "./store";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
export const MAX_STORED_BYTES = 3 * 1024 * 1024;

export type StoredMedia = { id: string; name: string; mime: string; size: number; width?: number; height?: number; createdAt: string };

export function isSafeMediaId(id: string) {
  return /^[a-z0-9-]+\.(webp|gif)$/.test(id);
}

const MIME: Record<string, string> = { webp: "image/webp", gif: "image/gif" };

export async function storeImage(file: File): Promise<StoredMedia> {
  if (!DATABASE_URL && process.env.VERCEL) {
    throw new StorageNotConfiguredError("Connect the Neon database in Vercel (Storage tab) to upload images.");
  }
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    throw new Error(`"${file.name}" isn't a supported image. Use JPG, PNG, WebP or GIF. (Videos need Cloudinary.)`);
  }
  const input = Buffer.from(await file.arrayBuffer());
  const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 40) || "image";

  let data: Buffer;
  let ext: "webp" | "gif";
  let width: number | undefined;
  let height: number | undefined;
  try {
    if (file.type === "image/gif") {
      const meta = await sharp(input).metadata();
      data = input;
      ext = "gif";
      width = meta.width;
      height = meta.pageHeight ?? meta.height;
    } else {
      // Auto-rotate, cap at 2000px, strip metadata, convert to WebP.
      const out = await sharp(input)
        .rotate()
        .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
      data = out.data;
      ext = "webp";
      width = out.info.width;
      height = out.info.height;
    }
  } catch {
    throw new Error(`"${file.name}" couldn't be read as an image.`);
  }
  if (data.length > MAX_STORED_BYTES) throw new Error(`"${file.name}" is too large after compression (max 3 MB).`);

  const id = `${base}-${randomBytes(4).toString("hex")}.${ext}`;
  const item: StoredMedia = { id, name: id, mime: MIME[ext], size: data.length, width, height, createdAt: new Date().toISOString() };

  if (DATABASE_URL) {
    await db(MEDIA_SQL.insert, [id, file.name, item.mime, item.size, width ?? null, height ?? null, data.toString("hex")]);
  } else {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, id), data);
  }
  return item;
}

export async function listStored(): Promise<StoredMedia[]> {
  if (DATABASE_URL) {
    const rows = await db(MEDIA_SQL.list);
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.id),
      mime: String(r.mime),
      size: Number(r.size),
      width: r.width == null ? undefined : Number(r.width),
      height: r.height == null ? undefined : Number(r.height),
      createdAt: new Date(r.created_at as string).toISOString(),
    }));
  }
  let names: string[] = [];
  try {
    names = await fs.readdir(UPLOAD_DIR);
  } catch {
    return [];
  }
  const items = await Promise.all(
    names.filter(isSafeMediaId).map(async (id) => {
      const stat = await fs.stat(path.join(UPLOAD_DIR, id));
      return { id, name: id, mime: MIME[id.split(".").pop()!], size: stat.size, createdAt: stat.mtime.toISOString() };
    })
  );
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function readStored(id: string): Promise<{ mime: string; data: Buffer } | null> {
  if (!isSafeMediaId(id)) return null;
  if (DATABASE_URL) {
    const [row] = await db(MEDIA_SQL.get, [id]);
    return row ? { mime: String(row.mime), data: Buffer.from(String(row.b64), "base64") } : null;
  }
  try {
    return { mime: MIME[id.split(".").pop()!], data: await fs.readFile(path.join(UPLOAD_DIR, id)) };
  } catch {
    return null;
  }
}

export async function deleteStored(id: string) {
  if (!isSafeMediaId(id)) throw new Error("Invalid file.");
  if (DATABASE_URL) await db(MEDIA_SQL.delete, [id]);
  else await fs.unlink(path.join(UPLOAD_DIR, id)).catch(() => {});
}
