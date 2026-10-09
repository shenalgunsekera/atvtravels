import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { StorageNotConfiguredError, VersionConflictError, isDocName, readDoc, writeDoc } from "@/lib/store";

type Ctx = { params: Promise<{ doc: string }> };

// GET /api/admin/content/site | /api/admin/content/packages
export async function GET(_req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { doc } = await params;
  if (!isDocName(doc)) return NextResponse.json({ error: "Unknown document" }, { status: 404 });
  return NextResponse.json(await readDoc(doc));
}

// PUT body: { data, version } — replaces the document. `version` must match the one last read.
export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { doc } = await params;
  if (!isDocName(doc)) return NextResponse.json({ error: "Unknown document" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || !("data" in body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  try {
    const saved = await writeDoc(doc, body.data, typeof body.version === "string" ? body.version : undefined);
    revalidatePath("/", "layout");
    return NextResponse.json(saved);
  } catch (err) {
    if (err instanceof VersionConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof StorageNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error(`Admin save (${doc}) failed:`, err);
    return NextResponse.json({ error: "Couldn't save. Please try again." }, { status: 500 });
  }
}
