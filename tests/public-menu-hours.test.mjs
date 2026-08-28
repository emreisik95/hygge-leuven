import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  landing: new URL("../app/components/Landing.tsx", import.meta.url),
  menu: new URL("../app/components/MenuDocumentSection.tsx", import.meta.url),
  hours: new URL("../app/components/WeeklyHours.tsx", import.meta.url),
  page: new URL("../app/page.tsx", import.meta.url),
  css: new URL("../app/globals.css", import.meta.url),
};

test("publishes the seasonal PDF as a permanent accessible menu section", async () => {
  const [landing, menu, page] = await Promise.all([
    readFile(files.landing, "utf8"),
    readFile(files.menu, "utf8"),
    readFile(files.page, "utf8"),
  ]);

  assert.match(landing, /<MenuDocumentSection/);
  assert.doesNotMatch(landing, /\{hasMenu \? \(\s*<section className="pane pane-menu"/s);
  assert.match(menu, /id="menu"/);
  assert.match(menu, /<object/);
  assert.match(menu, /type="application\/pdf"/);
  assert.match(menu, /data=\{MENU_PUBLIC_URL\}/);
  assert.match(menu, /Open full menu/);
  assert.match(menu, /Download PDF/);
  assert.match(page, /hasMenu:\s*true/);
});

test("renders the database-backed weekly schedule in the location card", async () => {
  const [landing, hours] = await Promise.all([
    readFile(files.landing, "utf8"),
    readFile(files.hours, "utf8"),
  ]);

  assert.match(landing, /<WeeklyHours hours=\{hoursRows\} locale=\{locale\}/);
  assert.match(hours, /formatRowRange/);
  assert.match(hours, /Monday/);
  assert.match(hours, /Saturday/);
  assert.match(hours, /Sunday/);
  assert.match(hours, /weekly-hours-list/);
});

test("keeps the PDF viewer responsive with explicit fallback controls", async () => {
  const css = await readFile(files.css, "utf8");
  assert.match(css, /\.menu-document-frame\s*\{/);
  assert.match(css, /aspect-ratio:\s*210\s*\/\s*297/);
  assert.match(css, /\.menu-document-actions\s*\{/);
  assert.match(css, /\.weekly-hours-list\s*\{/);
});
