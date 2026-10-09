// Server-only media library: uploads live in Cloudinary; files shipped in /public are
// listed read-only (from lib/public-media.json, generated at build time).
import { readDoc } from "./store";
import { cloudinaryConfigured, listResources } from "./cloudinary";
import publicMedia from "./public-media.json";

export type MediaItem = {
  id: string; // Cloudinary public_id, or the path for built-in files
  url: string;
  name: string;
  kind: "image" | "video";
  size: number;
  createdAt: string;
  builtIn: boolean;
  width?: number;
  height?: number;
};

export async function listMedia(): Promise<{ items: MediaItem[]; cloudinary: boolean }> {
  const builtIn: MediaItem[] = (publicMedia as { url: string; name: string; kind: "image" | "video"; size: number }[]).map((m) => ({
    id: m.url,
    url: m.url,
    name: m.name,
    kind: m.kind,
    size: m.size,
    createdAt: "",
    builtIn: true,
  }));
  if (!cloudinaryConfigured()) return { items: builtIn, cloudinary: false };

  const uploads: MediaItem[] = (await listResources()).map((r) => ({
    id: r.public_id,
    url: r.secure_url,
    name: `${r.public_id.split("/").pop()}${r.format ? `.${r.format}` : ""}`,
    kind: r.resource_type === "video" ? "video" : "image",
    size: r.bytes,
    createdAt: r.created_at,
    builtIn: false,
    width: r.width,
    height: r.height,
  }));
  return { items: [...uploads, ...builtIn], cloudinary: true };
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
