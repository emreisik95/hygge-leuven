-- Seed a curated Instagram-style feed from local café imagery so the landing
-- "from the café" section renders a real grid without requiring the Meta Graph
-- API / OAuth login. Images are shipped in the repo (public/assets/insta/*),
-- so the URLs never expire. Tiles link to the public profile.
--
-- When the Graph API is later connected, refreshMedia() upserts by `id`; these
-- seed rows use a non-numeric "seed-*" id space and will simply sit alongside
-- (or can be deleted from /admin). INSERT OR IGNORE keeps deploys idempotent.

INSERT OR IGNORE INTO "InstagramPost"
  ("id","mediaUrl","permalink","caption","mediaType","timestamp","fetchedAt") VALUES
  ('seed-01','/assets/insta/01.jpg','https://www.instagram.com/hygge.leuven/','Danish smørrebrød, made fresh','IMAGE','2026-05-28T10:00:00.000+00:00','2026-05-28T10:00:00.000+00:00'),
  ('seed-02','/assets/insta/02.jpg','https://www.instagram.com/hygge.leuven/','Specialty coffee, poured with care','IMAGE','2026-05-26T10:00:00.000+00:00','2026-05-26T10:00:00.000+00:00'),
  ('seed-03','/assets/insta/03.jpg','https://www.instagram.com/hygge.leuven/','Straight from the oven','IMAGE','2026-05-24T10:00:00.000+00:00','2026-05-24T10:00:00.000+00:00'),
  ('seed-04','/assets/insta/04.jpg','https://www.instagram.com/hygge.leuven/','Pastry of the day','IMAGE','2026-05-21T10:00:00.000+00:00','2026-05-21T10:00:00.000+00:00'),
  ('seed-05','/assets/insta/05.jpg','https://www.instagram.com/hygge.leuven/','A proper Danish lunch','IMAGE','2026-05-18T10:00:00.000+00:00','2026-05-18T10:00:00.000+00:00'),
  ('seed-06','/assets/insta/06.jpg','https://www.instagram.com/hygge.leuven/','Single-origin beans','IMAGE','2026-05-15T10:00:00.000+00:00','2026-05-15T10:00:00.000+00:00'),
  ('seed-07','/assets/insta/07.jpg','https://www.instagram.com/hygge.leuven/','A cosy corner in Leuven','IMAGE','2026-05-12T10:00:00.000+00:00','2026-05-12T10:00:00.000+00:00'),
  ('seed-08','/assets/insta/08.jpg','https://www.instagram.com/hygge.leuven/','Pull up a chair — hygge','IMAGE','2026-05-09T10:00:00.000+00:00','2026-05-09T10:00:00.000+00:00');
