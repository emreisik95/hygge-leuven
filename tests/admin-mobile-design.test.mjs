import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("uses the approved daylight cafe service-book palette", async () => {
  const css = await read("app/admin/admin.css");

  for (const colour of ["#FBFAF6", "#30251F", "#E9DDC9", "#F1CF72", "#54705D", "#A33B43"]) {
    assert.match(css, new RegExp(colour, "i"));
  }
});

test("uses a fixed five-item bottom navigation on mobile and a left rail on desktop", async () => {
  const css = await read("app/admin/admin.css");

  assert.match(css, /\.admin-sidebar\s*\{[^}]*position:\s*fixed[^}]*bottom:\s*0/s);
  assert.match(css, /\.admin-nav-list\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /@media\s*\(min-width:\s*960px\)[\s\S]*grid-template-columns:\s*var\(--a-sidebar-w\)\s+minmax\(0,\s*1fr\)/);
  assert.doesNotMatch(css, /\.admin-nav-list\s*\{[^}]*overflow-x:\s*auto/s);
});

test("keeps admin controls touch-safe and keyboard-visible", async () => {
  const css = await read("app/admin/admin.css");

  assert.match(css, /min-height:\s*48px/);
  assert.match(css, /@media\s*\(max-width:\s*959px\)[\s\S]*font-size:\s*16px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test("styles the new overview, menu PDF, hours, and more surfaces", async () => {
  const css = await read("app/admin/admin.css");

  for (const selector of [
    ".admin-status-rail",
    ".admin-overview-grid",
    ".admin-menu-preview",
    ".hours-group-card",
    ".admin-tool-grid",
  ]) {
    assert.match(css, new RegExp(selector.replace(".", "\\.")));
  }
});
