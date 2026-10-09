// Server-only media library. Uploads live in data/uploads and are served by app/media/[file].
// Files under public/ are listed read-only so existing gallery images can be picked too.
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import sharp from "sharp";
import { UPLOAD_DIR, readDoc } from "./store";
import { slugify } from "./site-normalize";

export type MediaItem = {
  url: string;
  name: string;
  kind: "image" | "video";
  size: number;
  createdAt: string;
  builtIn: boolean;
  width?: number;
  height?: number;
};

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const VIDEO_TYPES = ["video/mp4", "video/webm"];
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 150 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2000;

const EXT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export function contentTypeFor(file: string): string | null {
  return EXT_TYPES[path.extname(file).toLowerCase()] ?? null;
}

// Only plain file names produced by saveUpload are accepted, which rules out path traversal.
export function isSafeUploadName(name: string): boolean {
  return /^[a-z0-9-]+\.(webp|gif|mp4|webm)$/.test(name);
}

function uniqueName(original: string, ext: string) {
  const base = slugify(original.replace(/\.[^.]+$/, "")) || "file";
  return `${base.slice(0, 40)}-${randomBytes(4).toString("hex")}${ext}`;
}

export async function saveUpload(file: File): Promise<MediaItem> {
  const type = file.type;
  const isImage = IMAGE_TYPES.includes(type);
  const isVideo = VIDEO_TYPES.includes(type);
  if (!isImage && !isVideo) {
    throw new Error(`"${file.name}" isn't a supported file. Use JPG, PNG, WebP, AVIF, GIF, MP4 or WebM.`);
  }
  const limit = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > limit) {
    throw new Error(`"${file.name}" is too large (max ${Math.round(limit / 1024 / 1024)} MB).`);
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const input = Buffer.from(await file.arrayBuffer());

  if (isVideo) {
    const name = uniqueName(file.name, type === "video/webm" ? ".webm" : ".mp4");
    await fs.writeFile(path.join(UPLOAD_DIR, name), input);
    return { url: `/media/${name}`, name, kind: "video", size: input.length, createdAt: new Date().toISOString(), builtIn: false };
  }

  // Animated GIFs are kept as-is; everything else is auto-rotated, resized and converted to WebP.
  if (type === "image/gif") {
    const meta = await sharp(input).metadata().catch(() => null);
    if (!meta) throw new Error(`"${file.name}" couldn't be read as an image.`);
    const name = uniqueName(file.name, ".gif");
    await fs.writeFile(path.join(UPLOAD_DIR, name), input);
    return { url: `/media/${name}`, name, kind: "image", size: input.length, createdAt: new Date().toISOString(), builtIn: false, width: meta.width, height: meta.pageHeight ?? meta.height };
  }

  let output: { data: Buffer; info: sharp.OutputInfo };
  try {
    output = await sharp(input)
      .rotate()
      .resize({ width: MAX_IMAGE_EDGE, height: MAX_IMAGE_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new Error(`"${file.name}" couldn't be read as an image.`);
  }
  const name = uniqueName(file.name, ".webp");
  await fs.writeFile(path.join(UPLOAD_DIR, name), output.data);
  return {
    url: `/media/${name}`,
    name,
    kind: "image",
    size: output.data.length,
    createdAt: new Date().toISOString(),
    builtIn: false,
    width: output.info.width,
    height: output.info.height,
  };
}

async function listDir(dir: string, urlPrefix: string, builtIn: boolean): Promise<MediaItem[]> {
  let names: string[] = [];
  try {
    names = await fs.readdir(dir);
  } catch {
    return [];
  }
  const items: MediaItem[] = [];
  for (const name of names) {
    const type = contentTypeFor(name);
    if (!type) continue;
    const stat = await fs.stat(path.join(dir, name));
    if (!stat.isFile()) continue;
    items.push({
      url: `${urlPrefix}/${name}`,
      name,
      kind: type.startsWith("video/") ? "video" : "image",
      size: stat.size,
      createdAt: stat.mtime.toISOString(),
      builtIn,
    });
  }
  return items;
}

export async function listMedia(): Promise<MediaItem[]> {
  const pub = path.join(process.cwd(), "public");
  const [uploads, gallery, videos] = await Promise.all([
    listDir(UPLOAD_DIR, "/media", false),
    listDir(path.join(pub, "images", "gallery"), "/images/gallery", true),
    listDir(path.join(pub, "videos", "hero"), "/videos/hero", true),
  ]);
  uploads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  gallery.sort((a, b) => a.name.localeCompare(b.name));
  return [...uploads, ...gallery, ...videos];
}

export async function deleteUpload(name: string) {
  if (!isSafeUploadName(name)) throw new Error("Only uploaded files can be deleted.");
  await fs.unlink(path.join(UPLOAD_DIR, name));
}

// Where a media URL is referenced across site content and packages.
export async function findUsages(url: string): Promise<string[]> {
  const [site, packages] = await Promise.all([readDoc("site"), readDoc("packages")]);
  const hits: string[] = [];
  const bare = url.split("?")[0];
  const walk = (value: unknown, trail: string) => {
    if (typeof value === "string") {
      if (value.split("?")[0] === bare) hits.push(trail);
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${trail} › #${i + 1}`));
    } else if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) walk(v, trail ? `${trail} › ${k}` : k);
    }
  };
  walk(site.data, "Site");
  for (const c of Object.values(packages.data)) {
    if (c.heroImage === url || c.cardImage === url) hits.push(`Destination › ${c.name}`);
    for (const p of c.packages) if (p.image === url) hits.push(`Package › ${p.name}`);
  }
  return hits;
}
