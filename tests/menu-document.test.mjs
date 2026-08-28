import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
});
