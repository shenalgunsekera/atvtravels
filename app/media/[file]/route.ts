import { NextResponse } from "next/server";
import { readStored } from "@/lib/media-store";

// Serves images uploaded without Cloudinary. Each upload gets a unique name, so responses
// are cached forever by browsers and Vercel's CDN; the database is only hit once per file.
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const stored = await readStored(file);
  if (!stored) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(stored.data), {
    headers: {
      "Content-Type": stored.mime,
      "Content-Length": String(stored.data.length),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
