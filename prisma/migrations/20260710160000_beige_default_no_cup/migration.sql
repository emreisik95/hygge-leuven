-- Owner feedback (2026-07-10 voice note + follow-up), expressed as data for
-- production: the illustrated takeaway cup is out — force the flag OFF even
-- where the previous migration seeded it ON. The optional heroArt illustration
-- was tried and declined, so its flag simply keeps its registry default (off).
--
-- The beige-by-default theme itself is a CSS change and needs no data.

INSERT INTO "FeatureFlag" ("key", "enabled", "updatedAt")
VALUES ('takeawayCup', false, '2026-07-10 17:00:00')
ON CONFLICT ("key") DO UPDATE SET
  "enabled" = false,
  "updatedAt" = '2026-07-10 17:00:00';
