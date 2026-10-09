import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteUpload, findUsages, isSafeUploadName, listMedia, saveUpload } from "@/lib/media";

// GET /api/admin/media — all media (uploads first, then built-in files)
// GET /api/admin/media?usage=/media/x.webp — where a file is used
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const usage = req.nextUrl.searchParams.get("usage");
  if (usage) return NextResponse.json({ usages: await findUsages(usage) });
  return NextResponse.json({ items: await listMedia() });
}

// POST multipart/form-data with one or more "files"
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const form = await req.formData().catch(() => null);
  const files = form?.getAll("files").filter((f): f is File => f instanceof File) ?? [];
  if (files.length === 0) return NextResponse.json({ error: "No files received." }, { status: 400 });

  const items = [];
  const errors: string[] = [];
  for (const file of files) {
    try {
      items.push(await saveUpload(file));
    } catch (err) {
      errors.push(err instanceof Error ? err.message : `Couldn't upload "${file.name}".`);
    }
  }
  return NextResponse.json({ items, errors }, { status: items.length ? 200 : 400 });
}

// DELETE /api/admin/media?name=file.webp[&force=1]
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const name = req.nextUrl.searchParams.get("name") ?? "";
  if (!isSafeUploadName(name)) {
    return NextResponse.json({ error: "Only uploaded files can be deleted." }, { status: 400 });
  }
  if (req.nextUrl.searchParams.get("force") !== "1") {
    const usages = await findUsages(`/media/${name}`);
    if (usages.length) return NextResponse.json({ error: "File is in use", usages }, { status: 409 });
  }
  try {
    await deleteUpload(name);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}
