-- Publish the owner-approved schedule. Upsert every day so this repairs rows
-- that were deleted, closed, or edited in an earlier production database.
INSERT INTO "OpeningHours" ("dayOfWeek", "opensAt", "closesAt") VALUES
  (0, '10:00', '17:00'),
  (1, '08:30', '19:00'),
  (2, '08:30', '19:00'),
  (3, '08:30', '19:00'),
  (4, '08:30', '19:00'),
  (5, '08:30', '19:00'),
  (6, '09:00', '19:00')
ON CONFLICT("dayOfWeek") DO UPDATE SET
  "opensAt" = excluded."opensAt",
  "closesAt" = excluded."closesAt";
