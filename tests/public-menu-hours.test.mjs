import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  landing: new URL("../app/components/Landing.tsx", import.meta.url),
  menu: new URL("../app/components/MenuDocumentSection.tsx", import.meta.url),
  hours: new URL("../app/components/WeeklyHours.tsx", import.meta.url),
  page: new URL("../app/page.tsx", import.meta.url),
  preview: new URL("../app/admin/preview/page.tsx", import.meta.url),
  imageRoute: new URL("../app/menu-image/route.ts", import.meta.url),
  css: new URL("../app/globals.css", import.meta.url),
};

test("publishes the seasonal menu as a direct accessible image with PDF actions", async () => {
  const [landing, menu, page] = await Promise.all([
    readFile(files.landing, "utf8"),
    readFile(files.menu, "utf8"),
    readFile(files.page, "utf8"),
  ]);

  assert.match(landing, /<MenuDocumentSection/);
  assert.doesNotMatch(landing, /\{hasMenu \? \(\s*<section className="pane pane-menu"/s);
  assert.match(menu, /id="menu"/);
  assert.match(menu, /<img/);
  assert.match(menu, /src=\{MENU_IMAGE_URL\}/);
  assert.match(menu, /alt=\{copy\.viewer\}/);
  assert.doesNotMatch(menu, /<object/);
  assert.match(menu, /Open PDF/);
  assert.match(menu, /Download PDF/);
  assert.match(menu, /menu-text-alternative/);
  assert.match(menu, /readCurrentMenuTranscript/);
  assert.doesNotMatch(menu, /MENU_TEXT_GROUPS/);
  const transcript = await readFile(new URL("../public/menu/hygge-seasonal-menu.txt", import.meta.url), "utf8");
  assert.match(transcript, /allergen information/i);
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

test("keeps the direct menu artwork responsive with explicit PDF controls", async () => {
  const css = await readFile(files.css, "utf8");
  assert.match(css, /\.menu-document-frame\s*\{/);
  assert.match(css, /aspect-ratio:\s*210\s*\/\s*297/);
  assert.match(css, /\.menu-document-frame img\s*\{/);
  assert.match(css, /\.menu-document-actions\s*\{/);
  assert.match(css, /\.weekly-hours-list\s*\{/);
});

test("serves the current generated menu artwork with safe image headers", async () => {
  const route = await readFile(files.imageRoute, "utf8");
  assert.match(route, /readCurrentMenuImage/);
  assert.match(route, /image\/jpeg/);
  assert.match(route, /X-Content-Type-Options/);
  assert.match(route, /Cache-Control["']?,\s*["']no-store/);
});

test("admin preview uses the same PDF-first menu contract as the live page", async () => {
  const preview = await readFile(files.preview, "utf8");
  assert.doesNotMatch(preview, /getMenuForLocale/);
  assert.doesNotMatch(preview, /menu=\{menu\}/);
});
