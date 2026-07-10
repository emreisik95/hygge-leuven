// QA helper (local only): flip every feature flag ON in the dev sqlite DB so the
// homepage renders all flag-gated features at once for a manual/markup pass.
// Not used in production — production flags are managed from /admin/features.
//
// Both local databases are updated: ./dev.db (what lib/db.ts opens when the app
// runs from the repo root) and ./prisma/dev.db (what the Prisma CLI migrates).
//
// Usage: node scripts/qa-enable-flags.mjs [on|off]
import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { KEEP_OFF_KEYS, RETIRED_KEYS } from "./qa-flag-policy.mjs";

const FLAG_KEYS = [
  "announcementBanner", "darkMode", "scrollProgress", "backToTop", "cookieConsent",
  "pwaInstall", "liveClock", "loyaltyCard", "photoLightbox",
  "socialShare", "seasonalAccent", "faqSection", "eventsList",
  "menuDietaryTags", "menuSearch", "reservationCta", "giftCardCta", "spotifyEmbed",
  "newsletterSignup", "mapDirectionsCta", "sectionNavDots", "revealOnScroll",
  "a11yToolbar", "localeSuggest", "commandPalette", "seasonalParticles",
  "whatsappCta", "galleryGrid", "aboutStory",
  "coffeeOfWeek", "drinkFinder", "valuesStrip", "neighbourhoodGuide",
  "hoursCountdown", "menuQuickNav", "allergenLegend", "menuFavorites", "printMenu",
  "groupBookingCta", "takeawayCta", "feedbackPrompt", "takeawayCup", "heroArt",
  "endMark", "brandSelection", "themeTransition", "passportStamp",
];

const enabled = (process.argv[2] ?? "on") === "off" ? 0 : 1;
const now = new Date().toISOString();

for (const path of ["dev.db", "prisma/dev.db"]) {
  if (!existsSync(path)) continue;
  const db = new Database(path);
  const up = db.prepare(
    "INSERT INTO FeatureFlag (key, enabled, updatedAt) VALUES (?, ?, ?) " +
      "ON CONFLICT(key) DO UPDATE SET enabled = excluded.enabled, updatedAt = excluded.updatedAt",
  );
  const del = db.prepare("DELETE FROM FeatureFlag WHERE key = ?");
  const tx = db.transaction(() => {
    for (const k of FLAG_KEYS) up.run(k, enabled, now);
    for (const k of KEEP_OFF_KEYS) up.run(k, 0, now);
    for (const k of RETIRED_KEYS) del.run(k);
  });
  tx();
  const c = db.prepare("SELECT count(*) c FROM FeatureFlag WHERE enabled = 1").get();
  console.log(`${path}: set ${FLAG_KEYS.length} flags to ${enabled}; now ${c.c} enabled`);
  db.close();
}
