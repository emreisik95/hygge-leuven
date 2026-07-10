import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMenuItemView,
  itemTranslationNamespace,
  itemTranslationNamespaces,
  pickMenuTranslation,
} from "../lib/menu-translations.ts";

test("builds the localized origin namespace for a menu item", () => {
  assert.equal(itemTranslationNamespace(42, "origin"), "menu.item.42.origin");
});

test("lists every translation namespace deleted with a menu item", () => {
  assert.deepEqual(itemTranslationNamespaces(42), [
    "menu.item.42.name",
    "menu.item.42.description",
    "menu.item.42.origin",
  ]);
});

test("prefers the active locale and falls back to English", () => {
  const rows = [
    { namespace: "menu.item.42.origin", locale: "EN", value: "Uganda · Rwenzori Mountains" },
    { namespace: "menu.item.42.origin", locale: "NL", value: "Oeganda · Rwenzori-gebergte" },
  ];

  assert.equal(
    pickMenuTranslation(rows, "menu.item.42.origin", "NL", ""),
    "Oeganda · Rwenzori-gebergte",
  );
  assert.equal(
    pickMenuTranslation(rows, "menu.item.42.origin", "FR", ""),
    "Uganda · Rwenzori Mountains",
  );
});

test("uses the supplied fallback when no translation exists", () => {
  assert.equal(pickMenuTranslation([], "menu.item.42.origin", "EN", "origin unknown"), "origin unknown");
});

test("builds a localized menu item view with origin and without price", () => {
  const view = buildMenuItemView({
    item: {
      id: 42,
      priceCents: 480,
      available: true,
      sortOrder: 10,
      photoId: null,
    },
    photo: null,
    rows: [
      { namespace: "menu.item.42.name", locale: "EN", value: "Americano" },
      {
        namespace: "menu.item.42.origin",
        locale: "EN",
        value: "Uganda · Rwenzori Mountains · natural process",
      },
    ],
    locale: "EN",
  });

  assert.deepEqual(view, {
    id: 42,
    available: true,
    sortOrder: 10,
    photoId: null,
    photoPath: null,
    photoAlt: "",
    name: "Americano",
    description: "",
    origin: "Uganda · Rwenzori Mountains · natural process",
  });
  assert.equal("priceCents" in view, false);
});
