-- Four small delight touches (owner-approved from the 2026-07-10 ideation):
--   endMark        — a quiet "tak." at the true end of the page
--   brandSelection — text selection in the café palette instead of browser blue
--   themeTransition— the dark/light toggle spreads like candlelight
--   passportStamp  — "in the cup right now: <origin>" derived from menu items
--
-- INSERT OR IGNORE keeps any explicit admin choice; registry defaults in
-- lib/flags.ts stay false, so this is curation expressed as data.

INSERT OR IGNORE INTO "FeatureFlag" ("key", "enabled", "updatedAt") VALUES
  ('endMark',         true, '2026-07-10 19:00:00'),
  ('brandSelection',  true, '2026-07-10 19:00:00'),
  ('themeTransition', true, '2026-07-10 19:00:00'),
  ('passportStamp',   true, '2026-07-10 19:00:00');
