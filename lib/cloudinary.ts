// Server-only Cloudinary access. Configure with CLOUDINARY_URL (cloudinary://key:secret@cloud)
// or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET.
import { v2 as cloudinary } from "cloudinary";

export const MEDIA_FOLDER = "atv-travels";
export const MEDIA_TAG = "atv-travels";
// Images are capped at 2000px on upload so originals stay small; delivery resizes further.
const IMAGE_INCOMING = "c_limit,w_2000,h_2000";

type Creds = { cloudName: string; apiKey: string; apiSecret: string };

function credentials(): Creds | null {
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    const m = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url.trim());
    if (m) return { apiKey: m[1], apiSecret: m[2], cloudName: m[3] };
  }
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

export function cloudinaryConfigured() {
  return credentials() !== null;
}

function client() {
  const c = credentials();
  if (!c) throw new Error("Cloudinary isn't configured. Add CLOUDINARY_URL to your environment variables.");
  cloudinary.config({ cloud_name: c.cloudName, api_key: c.apiKey, api_secret: c.apiSecret, secure: true });
  return { cloudinary, creds: c };
}

export type UploadSignature = {
  uploadUrl: string;
  fields: Record<string, string>;
};

// Signed parameters so the browser can upload straight to Cloudinary. This avoids
// Vercel's 4.5 MB request limit and keeps the API secret on the server.
export function signUpload(kind: "image" | "video"): UploadSignature {
  const { cloudinary: cl, creds } = client();
  const params: Record<string, string> = {
    timestamp: String(Math.round(Date.now() / 1000)),
    folder: MEDIA_FOLDER,
    tags: MEDIA_TAG,
    use_filename: "true",
    unique_filename: "true",
  };
  if (kind === "image") params.transformation = IMAGE_INCOMING;
  const signature = cl.utils.api_sign_request(params, creds.apiSecret);
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${creds.cloudName}/${kind}/upload`,
    fields: { ...params, api_key: creds.apiKey, signature },
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
  const { cloudinary: cl } = client();
  const fetchAll = async (resource_type: "image" | "video") => {
    const out: CloudinaryResource[] = [];
    let next_cursor: string | undefined;
    do {
      const res = await cl.api.resources({ type: "upload", resource_type, max_results: 500, direction: "desc", next_cursor });
      out.push(...(res.resources as CloudinaryResource[]));
      next_cursor = res.next_cursor;
    } while (next_cursor && out.length < 2000);
    return out;
  };
  const [images, videos] = await Promise.all([fetchAll("image"), fetchAll("video")]);
  return [...images, ...videos].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function destroyResource(publicId: string, kind: "image" | "video") {
  const { cloudinary: cl } = client();
  const res = await cl.uploader.destroy(publicId, { resource_type: kind, invalidate: true });
  if (res.result !== "ok" && res.result !== "not found") throw new Error(`Cloudinary couldn't delete the file (${res.result}).`);
}
