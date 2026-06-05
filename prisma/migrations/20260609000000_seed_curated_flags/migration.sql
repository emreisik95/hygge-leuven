-- Seed a curated, default-ON set of feature flags so the live site ships with a
-- tasteful layer of UX polish rather than every new feature sitting dormant.
--
-- Scope is deliberate: ONLY chrome / UX features that (a) assert no business
-- facts the owner hasn't entered, and (b) have all the data they need already on
-- production (opening hours, map coordinates, the Instagram feed). Content panes
-- that need real copy first — story, values, events, testimonials, FAQ, coffee
-- of the week, press, neighbourhood guide — and anything gated on a contact
-- email / phone or the menu are left OFF, for the owner to populate and switch on
-- from /admin/features.
--
-- INSERT OR IGNORE keeps this idempotent and non-destructive: if a key already
-- has a row (e.g. an admin has already chosen a value), that choice is kept. The
-- registry defaults in lib/flags.ts stay false, so this is an explicit curation
-- expressed as data, not a change to the "fresh database renders as before"
-- invariant. Every flag remains togglable from the admin afterwards.

INSERT OR IGNORE INTO "FeatureFlag" ("key", "enabled", "updatedAt") VALUES
  ('scrollProgress',  true, '2026-06-06 00:00:00'),
  ('backToTop',       true, '2026-06-06 00:00:00'),
  ('seasonalAccent',  true, '2026-06-06 00:00:00'),
  ('sectionNavDots',  true, '2026-06-06 00:00:00'),
  ('revealOnScroll',  true, '2026-06-06 00:00:00'),
  ('a11yToolbar',     true, '2026-06-06 00:00:00'),
  ('darkMode',        true, '2026-06-06 00:00:00'),
  ('commandPalette',  true, '2026-06-06 00:00:00'),
  ('cookieConsent',   true, '2026-06-06 00:00:00'),
  ('liveClock',       true, '2026-06-06 00:00:00'),
  ('hoursCountdown',  true, '2026-06-06 00:00:00'),
  ('photoLightbox',   true, '2026-06-06 00:00:00'),
  ('socialShare',     true, '2026-06-06 00:00:00'),
  ('openingTimeline', true, '2026-06-06 00:00:00'),
  ('mapDirectionsCta', true, '2026-06-06 00:00:00');
