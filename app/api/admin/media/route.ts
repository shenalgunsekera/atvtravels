import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { findUsages, listMedia, uploadTarget } from "@/lib/media";
import { destroyResource, signUpload } from "@/lib/cloudinary";
import { deleteStored, isSafeMediaId, storeImage } from "@/lib/media-store";

// GET /api/admin/media — all media + where uploads go ("cloudinary" | "database" | "local" | "none")
// GET /api/admin/media?usage=<url> — where a file is used
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (req.nextUrl.searchParams.get("target")) return NextResponse.json({ upload: uploadTarget() });
  const usage = req.nextUrl.searchParams.get("usage");
  if (usage) return NextResponse.json({ usages: await findUsages(usage) });
  try {
    return NextResponse.json(await listMedia());
  } catch (err) {
    console.error("Media list failed:", err);
    return NextResponse.json({ error: "Couldn't load the media library." }, { status: 502 });
  }
}

// POST multipart/form-data { file } — store an image in Neon (or on disk locally)
// POST { kind: "image" | "video" } — signed parameters for a direct browser upload to Cloudinary
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (req.headers.get("content-type")?.startsWith("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
    try {
      const item = await storeImage(file);
      return NextResponse.json({
        item: { id: item.id, url: `/media/${item.id}`, name: item.name, kind: "image", size: item.size, createdAt: item.createdAt, builtIn: false, width: item.width, height: item.height },
      });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 400 });
    }
  }

  const { kind } = await req.json().catch(() => ({ kind: "" }));
  if (kind !== "image" && kind !== "video") return NextResponse.json({ error: "Invalid file type." }, { status: 400 });
  if (uploadTarget() !== "cloudinary") {
    return NextResponse.json({ error: "Video uploads need Cloudinary. Add CLOUDINARY_URL in Vercel, or paste a video link instead." }, { status: 503 });
  }
  try {
    return NextResponse.json(signUpload(kind));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Uploads aren't available." }, { status: 503 });
  }
}

// DELETE { id, kind, url, force? } — delete an uploaded file. Without `force`, refuses (409) if it's in use.
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id, kind, url, force } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || !id || id.startsWith("/") || (kind !== "image" && kind !== "video")) {
    return NextResponse.json({ error: "Only uploaded files can be deleted." }, { status: 400 });
  }
  if (!force && typeof url === "string") {
    const usages = await findUsages(url);
    if (usages.length) return NextResponse.json({ error: "File is in use", usages }, { status: 409 });
  }
  try {
    if (typeof url === "string" && url.startsWith("/media/") && isSafeMediaId(id)) await deleteStored(id);
    else await destroyResource(id, kind);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Couldn't delete the file." }, { status: 502 });
  }
}
