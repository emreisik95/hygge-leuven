import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import Database from "better-sqlite3";

const MIGRATION = new URL(
  "../prisma/migrations/20260828090000_set_opening_hours/migration.sql",
  import.meta.url,
);

test("publishes the approved weekly hours idempotently", async () => {
  const sql = await readFile(MIGRATION, "utf8");
  const db = new Database(":memory:");
  try {
    db.exec(`
      CREATE TABLE "OpeningHours" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "dayOfWeek" INTEGER NOT NULL UNIQUE,
        "opensAt" TEXT,
        "closesAt" TEXT
      );
      INSERT INTO "OpeningHours" ("dayOfWeek", "opensAt", "closesAt")
      VALUES (1, NULL, NULL);
    `);

    db.exec(sql);
    db.exec(sql);

    const rows = db
      .prepare(
        'SELECT "dayOfWeek", "opensAt", "closesAt" FROM "OpeningHours" ORDER BY "dayOfWeek"',
      )
      .all();

    assert.deepEqual(rows, [
      { dayOfWeek: 0, opensAt: "10:00", closesAt: "17:00" },
      { dayOfWeek: 1, opensAt: "08:30", closesAt: "19:00" },
      { dayOfWeek: 2, opensAt: "08:30", closesAt: "19:00" },
      { dayOfWeek: 3, opensAt: "08:30", closesAt: "19:00" },
      { dayOfWeek: 4, opensAt: "08:30", closesAt: "19:00" },
      { dayOfWeek: 5, opensAt: "08:30", closesAt: "19:00" },
      { dayOfWeek: 6, opensAt: "09:00", closesAt: "19:00" },
    ]);
  } finally {
    db.close();
  }
});
