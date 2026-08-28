import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

export const MENU_FILENAME = "hygge-seasonal-menu.pdf";
export const MENU_PUBLIC_URL = "/menu.pdf";
export const MENU_IMAGE_FILENAME = "hygge-seasonal-menu.jpg";
export const MENU_IMAGE_URL = "/menu-image";
export const MENU_TEXT_FILENAME = "hygge-seasonal-menu.txt";
export const MAX_MENU_BYTES = 10 * 1024 * 1024;
const MAX_MENU_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_MENU_TEXT_BYTES = 256 * 1024;
const DEFAULT_MENU_RETIRE_GRACE_MS = 60_000;

const execFileAsync = promisify(execFile);
let menuPublishQueue: Promise<void> = Promise.resolve();

const menuUploadRoot =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");
const PERSISTENT_MENU_DIR = path.join(menuUploadRoot, "menu");
const PERSISTENT_MENU_POINTER_PATH = path.join(PERSISTENT_MENU_DIR, "current.json");
const PERSISTENT_MENU_PATH = path.join(PERSISTENT_MENU_DIR, MENU_FILENAME);
export const PERSISTENT_MENU_IMAGE_PATH = path.join(
  PERSISTENT_MENU_DIR,
  MENU_IMAGE_FILENAME,
);
const PERSISTENT_MENU_TEXT_PATH = path.join(
  PERSISTENT_MENU_DIR,
  MENU_TEXT_FILENAME,
);
const BUNDLED_MENU_PATH = path.join(process.cwd(), "public", "menu", MENU_FILENAME);
const BUNDLED_MENU_IMAGE_PATH = path.join(
  process.cwd(),
  "public",
  "menu",
  MENU_IMAGE_FILENAME,
);
const BUNDLED_MENU_TEXT_PATH = path.join(
  process.cwd(),
  "public",
  "menu",
  MENU_TEXT_FILENAME,
);

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

type PersistentMenuPointer = {
  pdf: string;
  image: string;
  text: string;
};

function resolvePersistentPointer(pointer: PersistentMenuPointer) {
  const pdfMatch = /^menu-([a-f0-9]{16})\.pdf$/.exec(pointer.pdf);
  const imageMatch = /^menu-([a-f0-9]{16})\.jpg$/.exec(pointer.image);
  const textMatch = /^menu-([a-f0-9]{16})\.txt$/.exec(pointer.text);
  if (
    !pdfMatch ||
    !imageMatch ||
    !textMatch ||
    pdfMatch[1] !== imageMatch[1] ||
    pdfMatch[1] !== textMatch[1]
  ) {
    throw new MenuDocumentError("Stored menu pointer is invalid");
  }
  return {
    ...pointer,
    digest: pdfMatch[1],
    pdfPath: path.join(PERSISTENT_MENU_DIR, pointer.pdf),
    imagePath: path.join(PERSISTENT_MENU_DIR, pointer.image),
    textPath: path.join(PERSISTENT_MENU_DIR, pointer.text),
  };
}

async function readPersistentPointer(): Promise<ReturnType<typeof resolvePersistentPointer> | null> {
  try {
    const raw = await fs.readFile(PERSISTENT_MENU_POINTER_PATH, "utf8");
    return resolvePersistentPointer(JSON.parse(raw) as PersistentMenuPointer);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function removePublishedVersion(paths: string[]): Promise<void> {
  await Promise.all(paths.map((filePath) => fs.unlink(filePath).catch(() => {})));
}

function getMenuRetireGraceMs(): number {
  const configured = Number(process.env.MENU_RETIRE_GRACE_MS);
  return Number.isFinite(configured) && configured >= 0
    ? configured
    : DEFAULT_MENU_RETIRE_GRACE_MS;
}

async function markVersionRetired(
  pointer: ReturnType<typeof resolvePersistentPointer>,
): Promise<void> {
  const retiredAt = new Date();
  await Promise.all(
    [pointer.pdfPath, pointer.imagePath, pointer.textPath].map((filePath) =>
      fs.utimes(filePath, retiredAt, retiredAt).catch((error) => {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }),
    ),
  );
}

async function cleanupRetiredVersions(
  current: ReturnType<typeof resolvePersistentPointer>,
): Promise<void> {
  const cutoff = Date.now() - getMenuRetireGraceMs();
  const entries = await fs.readdir(PERSISTENT_MENU_DIR, { withFileTypes: true });
  const versions = new Map<string, string[]>();

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const match = /^menu-([a-f0-9]{16})\.(pdf|jpg|txt)$/.exec(entry.name);
    if (!match || match[1] === current.digest) continue;
    const files = versions.get(match[1]) ?? [];
    files.push(path.join(PERSISTENT_MENU_DIR, entry.name));
    versions.set(match[1], files);
  }

  for (const files of versions.values()) {
    const stats = await Promise.all(
      files.map((filePath) => fs.stat(filePath).catch(() => null)),
    );
    const newestMtime = Math.max(
      ...stats.flatMap((stat) => (stat ? [stat.mtimeMs] : [])),
    );
    if (Number.isFinite(newestMtime) && newestMtime <= cutoff) {
      await removePublishedVersion(files);
    }
  }
}

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

async function persistMenuPdfNow(buffer: Buffer): Promise<void> {
  await fs.mkdir(PERSISTENT_MENU_DIR, { recursive: true });
  const previousPointer = await readPersistentPointer();
  const digest = crypto.randomBytes(8).toString("hex");
  const pdfFilename = `menu-${digest}.pdf`;
  const imageFilename = `menu-${digest}.jpg`;
  const textFilename = `menu-${digest}.txt`;
  const versionedPdfPath = path.join(PERSISTENT_MENU_DIR, pdfFilename);
  const versionedImagePath = path.join(PERSISTENT_MENU_DIR, imageFilename);
  const versionedTextPath = path.join(PERSISTENT_MENU_DIR, textFilename);
  const temporaryPointerPath = path.join(PERSISTENT_MENU_DIR, `.current-${digest}.tmp`);
  let published = false;

  await fs.writeFile(versionedPdfPath, buffer, { flag: "wx" });
  try {
    await renderMenuPreview(versionedPdfPath, versionedImagePath);
    await renderMenuTranscript(versionedPdfPath, versionedTextPath);
    await fs.writeFile(
      temporaryPointerPath,
      JSON.stringify({ pdf: pdfFilename, image: imageFilename, text: textFilename }),
      { flag: "wx" },
    );
    await fs.rename(temporaryPointerPath, PERSISTENT_MENU_POINTER_PATH);
    published = true;
    if (previousPointer) {
      await markVersionRetired(previousPointer).catch((error) => {
        console.error("Could not mark the previous menu version as retired.", error);
      });
    }
    const currentPointer = resolvePersistentPointer({
      pdf: pdfFilename,
      image: imageFilename,
      text: textFilename,
    });
    await cleanupRetiredVersions(currentPointer).catch((error) => {
      console.error("Could not clean up retired menu versions.", error);
    });
  } catch (error) {
    throw error;
  } finally {
    await fs.unlink(temporaryPointerPath).catch(() => {});
    if (!published) {
      await Promise.all([
        fs.unlink(versionedPdfPath).catch(() => {}),
        fs.unlink(versionedImagePath).catch(() => {}),
        fs.unlink(versionedTextPath).catch(() => {}),
      ]);
    }
  }
}

export function persistMenuPdf(buffer: Buffer): Promise<void> {
  const pending = menuPublishQueue.then(() => persistMenuPdfNow(buffer));
  menuPublishQueue = pending.then(() => undefined, () => undefined);
  return pending;
}

export async function renderMenuTranscript(
  pdfPath: string,
  textPath: string,
): Promise<void> {
  try {
    await execFileAsync(process.env.PDFTOTEXT_PATH ?? "pdftotext", [
      "-f",
      "1",
      "-l",
      "1",
      "-layout",
      "-enc",
      "UTF-8",
      pdfPath,
      textPath,
    ], {
      timeout: 30_000,
      maxBuffer: 1024 * 1024,
    });

    const stat = await fs.stat(textPath);
    if (stat.size === 0 || stat.size > MAX_MENU_TEXT_BYTES) {
      throw new MenuDocumentError("Generated menu transcript is invalid");
    }
    const transcript = await fs.readFile(textPath, "utf8");
    if (transcript.trim().length < 10) {
      throw new MenuDocumentError("Generated menu transcript is empty");
    }
  } catch (error) {
    await fs.unlink(textPath).catch(() => {});
    if (error instanceof MenuDocumentError) throw error;
    const message = error instanceof Error ? `: ${error.message}` : "";
    throw new MenuDocumentError(`Menu transcript could not be generated${message}`);
  }
}

export async function renderMenuPreview(
  pdfPath: string,
  imagePath: string,
): Promise<void> {
  await fs.mkdir(path.dirname(imagePath), { recursive: true });
  const digest = crypto.randomBytes(8).toString("hex");
  const outputPrefix = path.join(
    path.dirname(imagePath),
    `.menu-preview-${digest}`,
  );
  const generatedPath = `${outputPrefix}.jpg`;

  try {
    await execFileAsync(process.env.PDFTOPPM_PATH ?? "pdftoppm", [
      "-f",
      "1",
      "-l",
      "1",
      "-singlefile",
      "-jpeg",
      "-scale-to",
      "2106",
      "-jpegopt",
      "quality=92,optimize=y,progressive=y",
      pdfPath,
      outputPrefix,
    ], {
      timeout: 30_000,
      maxBuffer: 1024 * 1024,
    });

    const stat = await fs.stat(generatedPath);
    if (stat.size > MAX_MENU_IMAGE_BYTES) {
      throw new MenuDocumentError("Generated menu preview is too large");
    }
    const image = await fs.readFile(generatedPath);
    const isJpeg =
      image.length > 1024 &&
      image[0] === 0xff &&
      image[1] === 0xd8 &&
      image[2] === 0xff;
    if (!isJpeg) throw new MenuDocumentError("Generated menu preview is invalid");

    await fs.rename(generatedPath, imagePath);
  } catch (error) {
    await fs.unlink(generatedPath).catch(() => {});
    if (error instanceof MenuDocumentError) throw error;
    const message = error instanceof Error ? `: ${error.message}` : "";
    throw new MenuDocumentError(`Menu preview could not be generated${message}`);
  }
}

export async function readCurrentMenuPdf(): Promise<Buffer> {
  const pointer = await readPersistentPointer();
  if (pointer) return fs.readFile(pointer.pdfPath);

  try {
    return await fs.readFile(PERSISTENT_MENU_PATH);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return fs.readFile(BUNDLED_MENU_PATH);
  }
}

export async function readCurrentMenuImage(): Promise<Buffer> {
  const pointer = await readPersistentPointer();
  if (pointer) return fs.readFile(pointer.imagePath);

  try {
    return await fs.readFile(PERSISTENT_MENU_IMAGE_PATH);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  try {
    await fs.access(PERSISTENT_MENU_PATH);
    await renderMenuPreview(PERSISTENT_MENU_PATH, PERSISTENT_MENU_IMAGE_PATH);
    return await fs.readFile(PERSISTENT_MENU_IMAGE_PATH);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Could not render the uploaded menu preview; using the bundled image.", error);
    }
    return fs.readFile(BUNDLED_MENU_IMAGE_PATH);
  }
}

export async function readCurrentMenuTranscript(): Promise<string> {
  const pointer = await readPersistentPointer();
  if (pointer) return fs.readFile(pointer.textPath, "utf8");

  try {
    return await fs.readFile(PERSISTENT_MENU_TEXT_PATH, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  try {
    await fs.access(PERSISTENT_MENU_PATH);
    await renderMenuTranscript(PERSISTENT_MENU_PATH, PERSISTENT_MENU_TEXT_PATH);
    return await fs.readFile(PERSISTENT_MENU_TEXT_PATH, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Could not render the uploaded menu transcript; using the bundled text.", error);
    }
    return fs.readFile(BUNDLED_MENU_TEXT_PATH, "utf8");
  }
}

export async function getCurrentMenuMetadata(): Promise<{
  filename: string;
  bytes: number;
  source: "uploaded" | "bundled";
}> {
  const pointer = await readPersistentPointer();
  if (pointer) {
    const stat = await fs.stat(pointer.pdfPath);
    return { filename: MENU_FILENAME, bytes: stat.size, source: "uploaded" };
  }

  try {
    const stat = await fs.stat(PERSISTENT_MENU_PATH);
    return { filename: MENU_FILENAME, bytes: stat.size, source: "uploaded" };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const stat = await fs.stat(BUNDLED_MENU_PATH);
    return { filename: MENU_FILENAME, bytes: stat.size, source: "bundled" };
  }
}
