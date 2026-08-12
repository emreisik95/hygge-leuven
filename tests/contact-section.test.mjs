import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const MIGRATION =
  "prisma/migrations/20260812120000_publish_contact_email/migration.sql";

test("publishes the verified public contact email idempotently", async () => {
  assert.ok(existsSync(MIGRATION), "contact-email migration is missing");
  const migration = await readFile(MIGRATION, "utf8");

  assert.match(
    migration,
    /['"]site\.contactEmail['"]\s*,\s*['"]EN['"]\s*,\s*['"]contact@hyggeleuven\.be['"]/,
  );
  assert.match(
    migration,
    /ON CONFLICT\s*\(\s*"namespace"\s*,\s*"locale"\s*\)\s*DO UPDATE/i,
  );
  assert.doesNotMatch(migration, /ADMIN_EMAIL/);
});
