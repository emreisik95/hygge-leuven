import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export const MENU_FILENAME = "hygge-seasonal-menu.pdf";
export const MENU_PUBLIC_URL = "/menu.pdf";
export const MAX_MENU_BYTES = 10 * 1024 * 1024;

const menuUploadRoot =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");
const PERSISTENT_MENU_DIR = path.join(menuUploadRoot, "menu");
const PERSISTENT_MENU_PATH = path.join(PERSISTENT_MENU_DIR, MENU_FILENAME);
const BUNDLED_MENU_PATH = path.join(process.cwd(), "public", "menu", MENU_FILENAME);

export class MenuDocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MenuDocumentError";
  }
}

export type ValidatedPdf = {
  buffer: Buffer;
  mime: "application/pdf";
};

export async function readValidatedPdf(file: File): Promise<ValidatedPdf> {
  if (!file || file.size === 0) throw new MenuDocumentError("PDF file required");
  if (file.size > MAX_MENU_BYTES) {
    throw new MenuDocumentError("PDF is too large (max 10MB)");
  }
  if (file.type !== "application/pdf") {
    throw new MenuDocumentError(`Unsupported type: ${file.type || "unknown"}`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length < 5 || buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new MenuDocumentError("File content is not a PDF");
  }
  return { buffer, mime: "application/pdf" };
}

export async function persistMenuPdf(buffer: Buffer): Promise<void> {
  await fs.mkdir(PERSISTENT_MENU_DIR, { recursive: true });
  const digest = crypto.randomBytes(8).toString("hex");
  const temporaryPath = path.join(PERSISTENT_MENU_DIR, `.${MENU_FILENAME}.${digest}.tmp`);

  await fs.writeFile(temporaryPath, buffer, { flag: "wx" });
  try {
    await fs.rename(temporaryPath, PERSISTENT_MENU_PATH);
  } catch (error) {
    await fs.unlink(temporaryPath).catch(() => {});
    throw error;
  }
}

export async function readCurrentMenuPdf(): Promise<Buffer> {
  try {
    return await fs.readFile(PERSISTENT_MENU_PATH);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return fs.readFile(BUNDLED_MENU_PATH);
  }
}

export async function getCurrentMenuMetadata(): Promise<{
  filename: string;
  bytes: number;
  source: "uploaded" | "bundled";
}> {
  try {
    const stat = await fs.stat(PERSISTENT_MENU_PATH);
    return { filename: MENU_FILENAME, bytes: stat.size, source: "uploaded" };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const stat = await fs.stat(BUNDLED_MENU_PATH);
    return { filename: MENU_FILENAME, bytes: stat.size, source: "bundled" };
  }
}
