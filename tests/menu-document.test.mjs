import assert from "node:assert/strict";
import { access, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  MAX_MENU_BYTES,
  MenuDocumentError,
  readValidatedPdf,
} from "../lib/menu-document.ts";

function pdfFile(bytes = "%PDF-1.4\n%%EOF", type = "application/pdf") {
  return new File([Buffer.from(bytes)], "menu.pdf", { type });
}

test("accepts a real PDF with the declared PDF MIME", async () => {
  const result = await readValidatedPdf(pdfFile());
  assert.equal(result.mime, "application/pdf");
  assert.equal(result.buffer.subarray(0, 5).toString(), "%PDF-");
});

test("rejects spoofed or mismatched PDF uploads", async () => {
  await assert.rejects(
    readValidatedPdf(pdfFile("not a pdf")),
    (error) => error instanceof MenuDocumentError && /not a PDF/i.test(error.message),
  );
  await assert.rejects(
    readValidatedPdf(pdfFile("%PDF-1.4\n", "text/plain")),
    (error) => error instanceof MenuDocumentError && /unsupported type/i.test(error.message),
  );
});

test("rejects empty and oversized menu documents", async () => {
  await assert.rejects(
    readValidatedPdf(new File([], "empty.pdf", { type: "application/pdf" })),
    (error) => error instanceof MenuDocumentError && /required/i.test(error.message),
  );
  const oversized = new File(
    [Buffer.alloc(MAX_MENU_BYTES + 1, 0x20)],
    "large.pdf",
    { type: "application/pdf" },
  );
  await assert.rejects(
    readValidatedPdf(oversized),
    (error) => error instanceof MenuDocumentError && /too large/i.test(error.message),
  );
});

test("serves the stable menu URL inline and prevents MIME sniffing", async () => {
  const route = await readFile(new URL("../app/menu.pdf/route.ts", import.meta.url), "utf8");
  assert.match(route, /Content-Type["']?,\s*["']application\/pdf/);
  assert.match(route, /Content-Disposition["']?,\s*[`"']inline; filename=/);
  assert.match(route, /X-Content-Type-Options["']?,\s*["']nosniff/);
  assert.match(route, /readCurrentMenuPdf/);
  assert.match(route, /Cache-Control["']?,\s*["']no-store/);
});

test("renders a browser-free menu preview whenever the PDF is replaced", async () => {
  const source = await readFile(new URL("../lib/menu-document.ts", import.meta.url), "utf8");
  const dockerfile = await readFile(new URL("../Dockerfile", import.meta.url), "utf8");
  assert.match(source, /MENU_IMAGE_URL/);
  assert.match(source, /renderMenuPreview/);
  assert.match(source, /pdftoppm/);
  assert.match(source, /readCurrentMenuImage/);
  assert.match(source, /PERSISTENT_MENU_IMAGE_PATH/);
  assert.match(source, /PERSISTENT_MENU_POINTER_PATH/);
  assert.match(source, /current\.json/);
  assert.match(source, /renderMenuTranscript/);
  assert.match(source, /readCurrentMenuTranscript/);
  assert.match(source, /removePublishedVersion/);
  assert.match(source, /-scale-to/);
  assert.match(dockerfile, /poppler-utils/);
});

test("atomically selects a matching generated PDF and image pair", async (t) => {
  const uploadRoot = await mkdtemp(path.join(os.tmpdir(), "hygge-menu-test-"));
  t.after(async () => rm(uploadRoot, { recursive: true, force: true }));
  const originalPdftoppmPath = process.env.PDFTOPPM_PATH;
  const originalPdftotextPath = process.env.PDFTOTEXT_PATH;
  const previewCandidates = [
    originalPdftoppmPath,
    "/opt/homebrew/bin/pdftoppm",
    "/usr/bin/pdftoppm",
  ].filter(Boolean);
  const textCandidates = [
    originalPdftotextPath,
    "/opt/homebrew/bin/pdftotext",
    "/usr/bin/pdftotext",
  ].filter(Boolean);
  let pdftoppmPath;
  for (const candidate of previewCandidates) {
    try {
      await access(candidate);
      pdftoppmPath = candidate;
      break;
    } catch {
      // Try the next known installation path.
    }
  }
  let pdftotextPath;
  for (const candidate of textCandidates) {
    try {
      await access(candidate);
      pdftotextPath = candidate;
      break;
    } catch {
      // Try the next known installation path.
    }
  }
  if (!pdftoppmPath || !pdftotextPath) {
    t.skip("Poppler preview and text tools are not installed");
    return;
  }
  process.env.PDFTOPPM_PATH = pdftoppmPath;
  process.env.PDFTOTEXT_PATH = pdftotextPath;
  t.after(() => {
    if (originalPdftoppmPath === undefined) delete process.env.PDFTOPPM_PATH;
    else process.env.PDFTOPPM_PATH = originalPdftoppmPath;
    if (originalPdftotextPath === undefined) delete process.env.PDFTOTEXT_PATH;
    else process.env.PDFTOTEXT_PATH = originalPdftotextPath;
  });
  const originalUploadDir = process.env.UPLOAD_DIR;
  const originalRetireGrace = process.env.MENU_RETIRE_GRACE_MS;
  process.env.UPLOAD_DIR = uploadRoot;
  process.env.MENU_RETIRE_GRACE_MS = "0";
  t.after(() => {
    if (originalUploadDir === undefined) delete process.env.UPLOAD_DIR;
    else process.env.UPLOAD_DIR = originalUploadDir;
    if (originalRetireGrace === undefined) delete process.env.MENU_RETIRE_GRACE_MS;
    else process.env.MENU_RETIRE_GRACE_MS = originalRetireGrace;
  });

  const menu = await import(`../lib/menu-document.ts?atomic=${Date.now()}`);
  const pdf = await readFile(new URL("../public/menu/hygge-seasonal-menu.pdf", import.meta.url));
  await Promise.all([
    menu.persistMenuPdf(Buffer.concat([pdf, Buffer.from("\n%A\n")])),
    menu.persistMenuPdf(Buffer.concat([pdf, Buffer.from("\n%B\n")])),
  ]);

  const pointer = JSON.parse(
    await readFile(path.join(uploadRoot, "menu", "current.json"), "utf8"),
  );
  assert.match(pointer.pdf, /^menu-[a-f0-9]{16}\.pdf$/);
  assert.match(pointer.image, /^menu-[a-f0-9]{16}\.jpg$/);
  assert.match(pointer.text, /^menu-[a-f0-9]{16}\.txt$/);
  assert.equal(pointer.pdf.replace(/\.pdf$/, ""), pointer.image.replace(/\.jpg$/, ""));
  assert.equal(pointer.pdf.replace(/\.pdf$/, ""), pointer.text.replace(/\.txt$/, ""));

  const [currentPdf, currentImage, currentText] = await Promise.all([
    menu.readCurrentMenuPdf(),
    menu.readCurrentMenuImage(),
    menu.readCurrentMenuTranscript(),
  ]);
  assert.match(currentPdf.subarray(-4).toString(), /%[AB]/);
  assert.equal(currentImage.subarray(0, 3).toString("hex"), "ffd8ff");
  assert.match(currentText, /black coffee/i);

  const versionFiles = (await readdir(path.join(uploadRoot, "menu")))
    .filter((name) => /^menu-[a-f0-9]{16}\.(pdf|jpg|txt)$/.test(name));
  assert.deepEqual(versionFiles.sort(), [pointer.image, pointer.pdf, pointer.text].sort());
});
