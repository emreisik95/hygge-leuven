import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Intentionally PUBLIC: these are landing-page images (menu photos, background
// art) referenced by `Photo.path` and rendered to anonymous visitors, so the
// route must serve without a session. Filenames are content-addressed SHA
// hashes — unguessable and immutable — so a long immutable cache + `nosniff`
// are safe. The path-traversal guard below is the only access control needed.
export const dynamic = "force-dynamic";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ file: string }> }
) {
  const { file } = await ctx.params;
  if (file.includes("/") || file.includes("..") || file.startsWith(".")) {
    return new NextResponse("not found", { status: 404 });
  }
  const fullPath = path.join(UPLOAD_DIR, file);
  try {
    const buf = await fs.readFile(fullPath);
    const ext = path.extname(file).toLowerCase();
    const type = MIME[ext] ?? "application/octet-stream";
    const body = new Uint8Array(buf);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": type,
        // Content-addressed filenames never change contents, so cache hard.
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}
