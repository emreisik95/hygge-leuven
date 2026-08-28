import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(relative) {
  return readFile(new URL(`../${relative}`, import.meta.url), "utf8");
}

test("shows the live English defaults as editable translation values", async () => {
  const [page, db] = await Promise.all([
    read("app/admin/translations/page.tsx"),
    read("lib/db.ts"),
  ]);

  assert.match(db, /export const SITE_TEXT_DEFAULTS/);
  assert.match(page, /SITE_TEXT_DEFAULTS/);
  assert.match(page, /code === "EN"/);
  assert.match(page, /defaultEn/);
});

test("makes every language field visibly labelled and saveable on mobile", async () => {
  const [page, css, actions] = await Promise.all([
    read("app/admin/translations/page.tsx"),
    read("app/admin/admin.css"),
    read("app/admin/translations/actions.ts"),
  ]);

  assert.match(page, /<AdminPageIntro\b/);
  assert.match(page, /className="tx-locale-label"/);
  assert.match(page, /Save \{group\.title\}/);
  assert.match(css, /\.admin-shell \.tx-locale-label\s*\{/);
  assert.match(actions, /prisma\.translation\.upsert/);
  assert.match(actions, /revalidatePath\("\/"\)/);
  assert.match(actions, /EN_FALLBACK_NAMESPACES/);
  assert.match(actions, /SITE_TEXT_FIELDS\.map\(siteTextNamespace\)/);
});

test("keeps translations discoverable from daily admin actions", async () => {
  const overview = await read("app/admin/page.tsx");
  assert.match(overview, /href="\/admin\/translations"/);
  assert.match(overview, />Edit translations</);
});
