import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isDocName, listBackups, readBackup, readDoc, writeDoc } from "@/lib/store";

// GET /api/admin/backups — list automatic backups
// GET /api/admin/backups?export=1 — download everything as one JSON file
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (req.nextUrl.searchParams.get("export")) {
    const [site, packages] = await Promise.all([readDoc("site"), readDoc("packages")]);
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(
      JSON.stringify({ exportedAt: new Date().toISOString(), site: site.data, packages: packages.data }, null, 2),
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="atv-travels-content-${stamp}.json"`,
        },
      }
    );
  }
  return NextResponse.json({ backups: await listBackups() });
}

// POST { restore: "<backup file>" } — restore one backup
// POST { import: { site?, packages? } } — import an exported file
// The current version is backed up automatically before anything is overwritten.
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json().catch(() => null);

  try {
    if (body && typeof body.restore === "string") {
      const backup = await readBackup(body.restore);
      if (!backup) return NextResponse.json({ error: "Backup not found." }, { status: 404 });
      await writeDoc(backup.doc, backup.raw);
    } else if (body && body.import && typeof body.import === "object") {
      const docs = Object.keys(body.import).filter(isDocName);
      if (docs.length === 0) {
        return NextResponse.json({ error: "That file doesn't contain any ATV Travels content." }, { status: 400 });
      }
      for (const doc of docs) await writeDoc(doc, body.import[doc]);
    } else {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
  } catch (err) {
    console.error("Restore failed:", err);
    return NextResponse.json({ error: "Restore failed. Nothing was changed." }, { status: 500 });
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ success: true });
}
