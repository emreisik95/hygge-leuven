// QA helper (local only): seed a tiny menu (2 categories, a few items with
// dietary keywords) into the dev sqlite DBs so the menu-dependent flag features
// (quick-nav, dietary legend, favourites, print) actually render for review.
// Idempotent-ish: clears prior QA rows by slug/category first. Not for prod.
//
// Both local databases are seeded: ./dev.db (what lib/db.ts opens when the app
// runs from the repo root) and ./prisma/dev.db (what the Prisma CLI migrates).
import Database from "better-sqlite3";
import { existsSync } from "node:fs";

const now = new Date().toISOString();

const cats = [
  { slug: "coffee", label: "Coffee", sort: 0 },
  { slug: "pastries", label: "Pastries", sort: 1 },
];
const items = {
  coffee: [
    { name: "Flat White", desc: "Double ristretto, silky microfoam." },
    { name: "Oat Cortado", desc: "Equal parts espresso and oat milk." },
    {
      name: "Espresso",
      desc: "Tropical fruit, ripe peach and caramel sweetness.",
      origin: "Uganda · Rwenzori Mountains · natural process",
    },
    {
      name: "Americano",
      desc: "The month's expressive single origin, opened up with hot water.",
      origin: "Uganda · Rwenzori Mountains · natural process",
    },
    {
      name: "Filter of the day",
      desc: "Ask what is pouring today — the origin moves with the season.",
      origin: "Uganda · Rwenzori Mountains · natural process",
    },
  ],
  pastries: [
    { name: "Cardamom Bun", desc: "Baked in-house each morning." },
    { name: "Vegan Banana Bread", desc: "Walnuts, no eggs, fully vegan." },
  ],
};

for (const path of ["dev.db", "prisma/dev.db"]) {
  if (!existsSync(path)) continue;
  const db = new Database(path);

  const upTr = db.prepare(
    "INSERT INTO Translation (namespace, locale, value, updatedAt) VALUES (?, 'EN', ?, ?) " +
      "ON CONFLICT(namespace, locale) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt",
  );

  const tx = db.transaction(() => {
    // wipe any prior QA items/categories for these slugs
    for (const c of cats) {
      const row = db.prepare("SELECT id FROM MenuCategory WHERE slug = ?").get(c.slug);
      if (row) {
        const oldItems = db.prepare("SELECT id FROM MenuItem WHERE categoryId = ?").all(row.id);
        for (const item of oldItems) {
          db.prepare("DELETE FROM Translation WHERE namespace LIKE ?").run(`menu.item.${item.id}.%`);
        }
        db.prepare("DELETE FROM MenuItem WHERE categoryId = ?").run(row.id);
        db.prepare("DELETE FROM MenuCategory WHERE id = ?").run(row.id);
      }
    }
    for (const c of cats) {
      const info = db
        .prepare("INSERT INTO MenuCategory (slug, sortOrder) VALUES (?, ?)")
        .run(c.slug, c.sort);
      upTr.run(`menu.category.${c.slug}`, c.label, now);
      let i = 0;
      for (const it of items[c.slug]) {
        const itInfo = db
          .prepare(
            "INSERT INTO MenuItem (categoryId, priceCents, sortOrder, available) VALUES (?, ?, ?, 1)",
          )
          .run(info.lastInsertRowid, 0, i++);
        upTr.run(`menu.item.${itInfo.lastInsertRowid}.name`, it.name, now);
        upTr.run(`menu.item.${itInfo.lastInsertRowid}.description`, it.desc, now);
        if (it.origin) upTr.run(`menu.item.${itInfo.lastInsertRowid}.origin`, it.origin, now);
      }
    }
  });
  tx();

  const cc = db.prepare("SELECT count(*) c FROM MenuCategory").get().c;
  const ic = db.prepare("SELECT count(*) c FROM MenuItem").get().c;
  console.log(`${path}: seeded ${cc} categories, ${ic} items`);
  db.close();
}
