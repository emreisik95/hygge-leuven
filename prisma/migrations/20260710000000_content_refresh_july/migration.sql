-- July content refresh, expressed as data so production picks it up on deploy:
--
-- 1. Retire the hero dictionary-definition body ("a feeling of cozy
--    contentment.") and the "why hygge" vision pane. The in-code defaults for
--    these fields are now empty strings and Landing hides the empty blocks, so
--    deleting the Translation rows removes the copy in every locale. The admin
--    can always re-add text later; nothing structural is dropped.
-- 2. Remove flag + settings rows for features deleted from the codebase: the
--    two live-weather widgets (weatherGreeting, weatherRecommend) and the
--    weekly opening-hours chart (openingTimeline). Unknown keys are ignored by
--    loadFlags, but leaving rows behind would clutter the FeatureFlag table.
-- 3. Turn the new takeaway-cup hero badge on by default (INSERT OR IGNORE keeps
--    an explicit admin choice, should one ever exist).
-- 4. Seed the rotating-origins menu note (EN/NL/FR). Idempotent upsert keeps
--    re-runs safe; an admin edit afterwards wins because the admin writes the
--    same rows.

DELETE FROM "Translation" WHERE "namespace" IN (
  'site.definitionBody',
  'site.visionHeading',
  'site.visionBody'
);

DELETE FROM "FeatureFlag" WHERE "key" IN (
  'weatherGreeting',
  'weatherRecommend',
  'openingTimeline'
);

DELETE FROM "Setting" WHERE "key" IN (
  'feature.weatherGreeting',
  'feature.weatherRecommend',
  'feature.openingTimeline'
);

INSERT OR IGNORE INTO "FeatureFlag" ("key", "enabled", "updatedAt")
VALUES ('takeawayCup', true, '2026-07-10 00:00:00');

INSERT INTO "Translation" ("namespace", "locale", "value", "updatedAt") VALUES
  ('site.menuBeansNote', 'EN', 'Every cup here has a passport. Our espresso and americano beans move to a new single origin roughly once a month, and our coffees and teas are chosen origin-first — so there is always a new flavour, a new feeling, waiting. Come back soon; the cup changes with the seasons.', '2026-07-10 00:00:00'),
  ('site.menuBeansNote', 'NL', 'Elke kop heeft hier een paspoort. Onze espresso- en americanobonen verhuizen ongeveer elke maand naar een nieuwe single origin, en onze koffie en thee kiezen we op herkomst — er wacht dus altijd een nieuwe smaak, een nieuw gevoel. Kom snel terug; de kop verandert met de seizoenen.', '2026-07-10 00:00:00'),
  ('site.menuBeansNote', 'FR', 'Chaque tasse a ici son passeport. Nos grains d''espresso et d''americano changent d''origine environ une fois par mois, et nos cafés comme nos thés sont choisis pour leur terroir — il y a donc toujours une nouvelle saveur, une nouvelle émotion à découvrir. Revenez bientôt ; la tasse change avec les saisons.', '2026-07-10 00:00:00')
ON CONFLICT ("namespace", "locale") DO UPDATE SET
  "value" = excluded."value",
  "updatedAt" = excluded."updatedAt";
