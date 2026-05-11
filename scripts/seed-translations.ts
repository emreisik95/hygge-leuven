/**
 * Seed translations for the status/hours rendering surface so EN/NL/FR strings
 * exist out-of-box. Idempotent — uses upsert on (namespace, locale).
 *
 * Run: npx tsx scripts/seed-translations.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { STATUS_TRANSLATION_DEFAULTS } from "../lib/hours";

async function main() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  const prisma = new PrismaClient({ adapter });

  let count = 0;
  for (const [locale, entries] of Object.entries(STATUS_TRANSLATION_DEFAULTS)) {
    for (const [namespace, value] of Object.entries(entries)) {
      await prisma.translation.upsert({
        where: { namespace_locale: { namespace, locale: locale as "EN" | "NL" | "FR" } },
        create: { namespace, locale: locale as "EN" | "NL" | "FR", value },
        update: {}, // do not overwrite manual edits
      });
      count++;
    }
  }
  console.log(`Seeded ${count} translation rows (idempotent — existing values preserved).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
