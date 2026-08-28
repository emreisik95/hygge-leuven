import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("makes the admin menu screen PDF-first", async () => {
  const page = await read("app/admin/menu/page.tsx");
  assert.match(page, /Current menu/);
  assert.match(page, /Replace menu PDF/);
  assert.match(page, /Open live menu/);
  assert.match(page, /Download PDF/);
  assert.match(page, /<object/);
  assert.match(page, /MENU_PUBLIC_URL/);
  assert.match(page, /accept="\.pdf,application\/pdf"/);
  assert.doesNotMatch(page, /Seed default categories/);
  assert.doesNotMatch(page, /Add category/);
});

test("validates and atomically publishes replacement menu PDFs", async () => {
  const actions = await read("app/admin/menu/actions.ts");
  assert.match(actions, /await requireAdmin\(\)/);
  assert.match(actions, /readValidatedPdf/);
  assert.match(actions, /persistMenuPdf/);
  assert.match(actions, /action:\s*"menu\.document\.replace"/);
  assert.match(actions, /revalidatePath\("\/"\)/);
  assert.match(actions, /revalidatePath\("\/admin\/menu"\)/);
  assert.match(actions, /redirect\("\/admin\/menu\?saved=1"\)/);
});

test("shows useful upload errors without removing the live menu", async () => {
  const [page, actions] = await Promise.all([
    read("app/admin/menu/page.tsx"),
    read("app/admin/menu/actions.ts"),
  ]);
  assert.match(page, /Upload failed/);
  assert.match(actions, /MenuDocumentError/);
  assert.match(actions, /\/admin\/menu\?error=/);
});
