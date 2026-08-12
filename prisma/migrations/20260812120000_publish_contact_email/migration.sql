-- Publish the owner-confirmed public café address. This is visitor-facing
-- content and is deliberately independent from private admin-login configuration.
INSERT INTO "Translation" ("namespace", "locale", "value", "updatedAt")
VALUES ('site.contactEmail', 'EN', 'contact@hyggeleuven.be', CURRENT_TIMESTAMP)
ON CONFLICT ("namespace", "locale") DO UPDATE SET
  "value" = excluded."value",
  "updatedAt" = CURRENT_TIMESTAMP;
