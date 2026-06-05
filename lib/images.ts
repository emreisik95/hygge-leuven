// Shared image-upload primitives for the admin uploaders (photos + menu).
//
// Before this module the two uploaders diverged: photos re-encoded to WebP via
// sharp while menu stored raw bytes, each with its own size/MIME constants and
// neither verifying that the bytes actually match the declared Content-Type.
// Centralizing here gives us one set of limits, magic-byte sniffing (so a
// `.svg` renamed to `image/png` is rejected), content-addressed filenames, and
// a write-then-rollback helper so a failed DB write never leaves an orphan file.

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");
export const UPLOAD_URL_BASE = "/api/uploads";
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_WIDTH = 1600;

// The four raster formats we accept on upload. SVG is intentionally excluded —
// it can carry script and is an XSS vector when served inline.
export const ALLOWED_IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

export class ImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageError";
  }
}

// Identify an image by its leading bytes. Returns the canonical MIME or null if
// the signature matches none of our accepted formats. We never trust the
// client-supplied Content-Type for anything security-relevant.
export function sniffImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return "image/png";
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export type ValidatedImage = { buffer: Buffer; mime: string };

// Read a File into a buffer and verify size, declared MIME, and magic bytes all
// agree. Throws ImageError on any mismatch. This is the authoritative check —
// the cheap synchronous validateImageFile() in lib/validation.ts only gates the
// UI for a friendly field error before we bother reading the bytes.
export async function readValidatedImage(file: File): Promise<ValidatedImage> {
  if (!file || file.size === 0) throw new ImageError("File required");
  if (file.size > MAX_IMAGE_BYTES) throw new ImageError("File too large (max 8MB)");
  if (!ALLOWED_IMAGE_MIMES.has(file.type)) {
    throw new ImageError(`Unsupported type: ${file.type || "unknown"}`);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(buffer);
  if (!sniffed) throw new ImageError("File content is not a recognized image");
  if (sniffed !== file.type) throw new ImageError("File content does not match its type");
  return { buffer, mime: sniffed };
}

// Re-encode to WebP, auto-rotating by EXIF orientation and capping width. The
// re-encode strips metadata (EXIF/GPS) as a side benefit. Filename is the
// content hash so identical uploads dedupe.
export async function encodeToWebp(buffer: Buffer): Promise<{ filename: string; data: Buffer }> {
  const data = await sharp(buffer)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const hash = crypto.createHash("sha256").update(data).digest("hex").slice(0, 12);
  return { filename: `${hash}.webp`, data };
}

// Content-addressed filename for a raw (not re-encoded) image — used by the menu
// uploader, which preserves the original bytes so animated GIFs keep animating.
export function rawImageFilename(buffer: Buffer, mime: string, prefix = ""): string {
  const hash = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 12);
  const ext = mime === "image/jpeg" ? "jpg" : mime.split("/")[1];
  return `${prefix}${hash}.${ext}`;
}

// Write `data` to UPLOAD_DIR/filename, then run `commit` (the DB work that
// records the new path). If commit throws, the just-written file is unlinked so
// a failed transaction never leaks an orphan on disk. Returns commit's result.
export async function persistImage<T>(
  filename: string,
  data: Buffer,
  commit: (url: string) => Promise<T>,
): Promise<T> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const abs = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(abs, data);
  try {
    return await commit(`${UPLOAD_URL_BASE}/${filename}`);
  } catch (e) {
    await fs.unlink(abs).catch(() => {});
    throw e;
  }
}

// Best-effort delete of a stored upload given its public URL. Guards against
// path traversal — only unlinks a bare filename inside UPLOAD_DIR.
export async function unlinkByUrl(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith(UPLOAD_URL_BASE + "/")) return;
  const file = url.slice(UPLOAD_URL_BASE.length + 1);
  if (!file || file.includes("/") || file.includes("..")) return;
  await fs.unlink(path.join(UPLOAD_DIR, file)).catch(() => {});
}
