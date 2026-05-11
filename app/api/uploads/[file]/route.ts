import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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
        "cache-control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}
