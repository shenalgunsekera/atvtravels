import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { findUsages, listMedia } from "@/lib/media";
import { destroyResource, signUpload } from "@/lib/cloudinary";

// GET /api/admin/media — all media (Cloudinary uploads first, then built-in files)
// GET /api/admin/media?usage=<url> — where a file is used
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const usage = req.nextUrl.searchParams.get("usage");
  if (usage) return NextResponse.json({ usages: await findUsages(usage) });
  try {
    return NextResponse.json(await listMedia());
  } catch (err) {
    console.error("Media list failed:", err);
    return NextResponse.json({ error: "Couldn't load the media library from Cloudinary." }, { status: 502 });
  }
}

// POST { kind: "image" | "video" } — signed parameters for a direct browser upload to Cloudinary
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { kind } = await req.json().catch(() => ({ kind: "" }));
  if (kind !== "image" && kind !== "video") return NextResponse.json({ error: "Invalid file type." }, { status: 400 });
  try {
    return NextResponse.json(signUpload(kind));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Uploads aren't available." }, { status: 503 });
  }
}

// DELETE { id, kind, url, force? } — delete a Cloudinary file. Without `force`, refuses (409) if it's in use.
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
    await destroyResource(id, kind);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Couldn't delete the file." }, { status: 502 });
  }
}
