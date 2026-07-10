import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("the takeaway cup settles into a slow idle float", () => {
  assert.match(css, /@keyframes takeaway-cup-float/);
  assert.match(css, /takeaway-cup-float 6s ease-in-out 0\.8s infinite/);
});

test("menu origins use a quiet pulse and hover nudge", () => {
  assert.match(css, /@keyframes menu-origin-pulse/);
  assert.match(css, /\.menu-item-origin::before/);
  assert.match(css, /\.menu-item:hover \.menu-item-title/);
});

test("site-level reduced motion disables every added animation", () => {
  assert.match(
    css,
    /html\[data-reduce-motion="on"\] \.takeaway-cup-art,[\s\S]*?html\[data-reduce-motion="on"\] \.menu-item-origin::before \{ animation: none; \}/,
  );
  assert.match(
    css,
    /html\[data-reduce-motion="on"\] \.menu-item-title \{ transition: none; \}/,
  );
});
