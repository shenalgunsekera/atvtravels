// Server-only Cloudinary access via its REST API (no SDK: the official SDK parses
// CLOUDINARY_URL when it loads and throws on any formatting mistake, which broke deploys).
// Configure with CLOUDINARY_URL (cloudinary://key:secret@cloud) or
// CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET.
import { createHash } from "crypto";

export const MEDIA_FOLDER = "atv-travels";
export const MEDIA_TAG = "atv-travels";
// Images are capped at 2000px on upload so originals stay small; delivery resizes further.
const IMAGE_INCOMING = "c_limit,w_2000,h_2000";

type Creds = { cloudName: string; apiKey: string; apiSecret: string };

// Tolerant of common paste mistakes: surrounding quotes/spaces, a leading "CLOUDINARY_URL=",
// and <angle brackets> left around values.
function clean(v: string | undefined) {
  return (v ?? "").trim().replace(/^["']|["']$/g, "").replace(/^CLOUDINARY_URL=/i, "").replace(/[<>]/g, "").trim();
}

function credentials(): Creds | null {
  const url = clean(process.env.CLOUDINARY_URL);
  if (url) {
    const m = /^cloudinary:\/\/([^:]+):([^@]+)@([^/?\s]+)/.exec(url);
    if (m) return { apiKey: m[1], apiSecret: m[2], cloudName: m[3] };
  }
  const cloudName = clean(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = clean(process.env.CLOUDINARY_API_KEY);
  const apiSecret = clean(process.env.CLOUDINARY_API_SECRET);
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

export function cloudinaryConfigured() {
  return credentials() !== null;
}

function creds(): Creds {
  const c = credentials();
  if (!c) throw new Error("Cloudinary isn't configured. Add CLOUDINARY_URL (cloudinary://API_KEY:API_SECRET@CLOUD_NAME) in Vercel.");
  return c;
}

// Cloudinary signature: sorted "key=value" pairs joined with "&", plus the secret, SHA-1.
function sign(params: Record<string, string>, secret: string) {
  const payload = Object.keys(params)
    .filter((k) => params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(payload + secret).digest("hex");
}

export type UploadSignature = {
  uploadUrl: string;
  fields: Record<string, string>;
};

// Signed parameters so the browser can upload straight to Cloudinary. This avoids
// Vercel's 4.5 MB request limit and keeps the API secret on the server.
export function signUpload(kind: "image" | "video"): UploadSignature {
  const c = creds();
  const params: Record<string, string> = {
    timestamp: String(Math.round(Date.now() / 1000)),
    folder: MEDIA_FOLDER,
    tags: MEDIA_TAG,
    use_filename: "true",
    unique_filename: "true",
  };
  if (kind === "image") params.transformation = IMAGE_INCOMING;
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${c.cloudName}/${kind}/upload`,
    fields: { ...params, api_key: c.apiKey, signature: sign(params, c.apiSecret) },
  };
}

export type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
};

// Every image and video in the account, newest first.
export async function listResources(): Promise<CloudinaryResource[]> {
  const c = creds();
  const auth = "Basic " + Buffer.from(`${c.apiKey}:${c.apiSecret}`).toString("base64");
  const fetchAll = async (type: "image" | "video") => {
    const out: CloudinaryResource[] = [];
    let cursor = "";
    do {
      const qs = new URLSearchParams({ max_results: "500", direction: "desc" });
      if (cursor) qs.set("next_cursor", cursor);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${c.cloudName}/resources/${type}/upload?${qs}`, {
        headers: { Authorization: auth },
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(`Cloudinary: ${body?.error?.message ?? res.statusText}`);
      }
      const body = await res.json();
      out.push(...(body.resources as CloudinaryResource[]));
      cursor = body.next_cursor ?? "";
    } while (cursor && out.length < 2000);
    return out;
  };
  const [images, videos] = await Promise.all([fetchAll("image"), fetchAll("video")]);
  return [...images, ...videos].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function destroyResource(publicId: string, kind: "image" | "video") {
  const c = creds();
  const params = { public_id: publicId, invalidate: "true", timestamp: String(Math.round(Date.now() / 1000)) };
  const form = new URLSearchParams({ ...params, api_key: c.apiKey, signature: sign(params, c.apiSecret) });
  const res = await fetch(`https://api.cloudinary.com/v1_1/${c.cloudName}/${kind}/destroy`, { method: "POST", body: form, cache: "no-store" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || (body.result !== "ok" && body.result !== "not found")) {
    throw new Error(`Cloudinary couldn't delete the file (${body?.error?.message ?? body.result ?? res.statusText}).`);
  }
}
