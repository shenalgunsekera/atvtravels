import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { UPLOAD_DIR } from "@/lib/store";
import { contentTypeFor, isSafeUploadName } from "@/lib/media";

// Serves files uploaded from the admin panel. Names are unique per upload, so they're cached forever.
export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const type = contentTypeFor(file);
  if (!isSafeUploadName(file) || !type) return new NextResponse("Not found", { status: 404 });

  const full = path.join(UPLOAD_DIR, file);
  let stat;
  try {
    stat = await fs.stat(full);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
  const headers: Record<string, string> = {
    "Content-Type": type,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  };

  // Range support so uploaded videos can stream and seek.
  const range = req.headers.get("range");
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range);
  if (m && (m[1] || m[2])) {
    const size = stat.size;
    let start = m[1] ? Number(m[1]) : size - Number(m[2]);
    let end = m[1] && m[2] ? Number(m[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end) {
      return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    const handle = await fs.open(full, "r");
    try {
      const buf = Buffer.alloc(end - start + 1);
      await handle.read(buf, 0, buf.length, start);
      return new NextResponse(buf, {
        status: 206,
        headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(buf.length) },
      });
    } finally {
      await handle.close();
    }
  }

  const data = await fs.readFile(full);
  return new NextResponse(data, { headers: { ...headers, "Content-Length": String(stat.size) } });
}
