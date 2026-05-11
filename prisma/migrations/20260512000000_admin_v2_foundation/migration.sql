-- CreateTable: Translation
CREATE TABLE "Translation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "namespace" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "Translation_namespace_locale_key" ON "Translation"("namespace", "locale");

-- CreateTable: OpeningHours
CREATE TABLE "OpeningHours" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayOfWeek" INTEGER NOT NULL,
    "opensAt" TEXT,
    "closesAt" TEXT
);
CREATE UNIQUE INDEX "OpeningHours_dayOfWeek_key" ON "OpeningHours"("dayOfWeek");

-- CreateTable: Photo
CREATE TABLE "Photo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "refId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Photo_role_sortOrder_idx" ON "Photo"("role", "sortOrder");

-- CreateTable: MenuCategory
CREATE TABLE "MenuCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX "MenuCategory_slug_key" ON "MenuCategory"("slug");

-- CreateTable: MenuItem
CREATE TABLE "MenuItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "photoId" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "available" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "MenuItem_categoryId_sortOrder_idx" ON "MenuItem"("categoryId", "sortOrder");

-- CreateTable: InstagramAccount
CREATE TABLE "InstagramAccount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "handle" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenExpires" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable: InstagramPost
CREATE TABLE "InstagramPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mediaUrl" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "caption" TEXT,
    "mediaType" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: AuditLog
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "diff" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data migration: copy SiteContent text fields into Translation rows for EN locale.
-- These INSERTs run BEFORE we drop the old columns. We use INSERT OR IGNORE so that
-- re-running on a partially-migrated state is safe (unique on namespace+locale).
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.brandName', 'EN', "brandName", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.definitionLabel', 'EN', "definitionLabel", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.definitionBody', 'EN', "definitionBody", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.tagline', 'EN', "tagline", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.inviteLine', 'EN', "inviteLine", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.inviteSub', 'EN', "inviteSub", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.statusLabel', 'EN', "statusLabel", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.statusSub', 'EN', "statusSub", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.hoursToday', 'EN', "hoursToday", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.hoursWeekend', 'EN', "hoursWeekend", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.findUsLabel', 'EN', "findUsLabel", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.instagramHandle', 'EN', "instagramHandle", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.instaHeading', 'EN', "instaHeading", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.instaSub', 'EN', "instaSub", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.instaCtaLabel', 'EN', "instaCtaLabel", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.instaEmbedHtml', 'EN', "instaEmbedHtml", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.mapHeading', 'EN', "mapHeading", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.mapSub', 'EN', "mapSub", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.metaTitle', 'EN', "metaTitle", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;
INSERT OR IGNORE INTO "Translation" ("namespace", "locale", "value", "updatedAt")
SELECT 'site.metaDescription', 'EN', "metaDescription", CURRENT_TIMESTAMP FROM "SiteContent" WHERE "id" = 1;

-- Migrate bgImagePath into a Photo row with role=background.
INSERT INTO "Photo" ("path", "alt", "role", "sortOrder", "refId", "createdAt")
SELECT "bgImagePath", '', 'background', 0, NULL, CURRENT_TIMESTAMP
FROM "SiteContent" WHERE "id" = 1 AND "bgImagePath" IS NOT NULL AND "bgImagePath" != '';

-- Seed OpeningHours with sensible defaults: Sun & Sat 09:00-19:00, Mon-Fri 08:00-18:00.
INSERT INTO "OpeningHours" ("dayOfWeek", "opensAt", "closesAt") VALUES (0, '09:00', '19:00');
INSERT INTO "OpeningHours" ("dayOfWeek", "opensAt", "closesAt") VALUES (1, '08:00', '18:00');
INSERT INTO "OpeningHours" ("dayOfWeek", "opensAt", "closesAt") VALUES (2, '08:00', '18:00');
INSERT INTO "OpeningHours" ("dayOfWeek", "opensAt", "closesAt") VALUES (3, '08:00', '18:00');
INSERT INTO "OpeningHours" ("dayOfWeek", "opensAt", "closesAt") VALUES (4, '08:00', '18:00');
INSERT INTO "OpeningHours" ("dayOfWeek", "opensAt", "closesAt") VALUES (5, '08:00', '18:00');
INSERT INTO "OpeningHours" ("dayOfWeek", "opensAt", "closesAt") VALUES (6, '09:00', '19:00');

-- RedefineTables: shrink SiteContent to keep only non-text fields.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteContent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "addressLine1" TEXT NOT NULL DEFAULT 'NAAMSESTRAAT 55',
    "addressLine2" TEXT NOT NULL DEFAULT 'LEUVEN 3000',
    "findUsUrl" TEXT NOT NULL DEFAULT 'https://www.google.com/maps?q=Naamsestraat+55,+3000+Leuven,+Belgium',
    "instagramUrl" TEXT NOT NULL DEFAULT 'https://www.instagram.com/hygge.leuven/',
    "mapLat" REAL NOT NULL DEFAULT 50.876568,
    "mapLng" REAL NOT NULL DEFAULT 4.700649,
    "mapZoom" INTEGER NOT NULL DEFAULT 16,
    "publishedAt" DATETIME,
    "draftJson" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteContent" ("id", "isOpen", "addressLine1", "addressLine2", "findUsUrl", "instagramUrl", "mapLat", "mapLng", "mapZoom", "updatedAt")
SELECT "id", "isOpen", "addressLine1", "addressLine2", "findUsUrl", "instagramUrl", "mapLat", "mapLng", "mapZoom", "updatedAt" FROM "SiteContent";
DROP TABLE "SiteContent";
ALTER TABLE "new_SiteContent" RENAME TO "SiteContent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
