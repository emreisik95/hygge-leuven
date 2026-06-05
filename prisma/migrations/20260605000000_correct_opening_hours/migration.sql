-- Correct opening hours to match the café's actual schedule (Naamsestraat 55, Leuven).
-- Source of truth: Google Business listing.
--   Sun        10:00–17:00
--   Mon–Fri    08:30–19:00
--   Sat        09:00–19:00
UPDATE "OpeningHours" SET "opensAt" = '10:00', "closesAt" = '17:00' WHERE "dayOfWeek" = 0;
UPDATE "OpeningHours" SET "opensAt" = '08:30', "closesAt" = '19:00' WHERE "dayOfWeek" = 1;
UPDATE "OpeningHours" SET "opensAt" = '08:30', "closesAt" = '19:00' WHERE "dayOfWeek" = 2;
UPDATE "OpeningHours" SET "opensAt" = '08:30', "closesAt" = '19:00' WHERE "dayOfWeek" = 3;
UPDATE "OpeningHours" SET "opensAt" = '08:30', "closesAt" = '19:00' WHERE "dayOfWeek" = 4;
UPDATE "OpeningHours" SET "opensAt" = '08:30', "closesAt" = '19:00' WHERE "dayOfWeek" = 5;
UPDATE "OpeningHours" SET "opensAt" = '09:00', "closesAt" = '19:00' WHERE "dayOfWeek" = 6;
