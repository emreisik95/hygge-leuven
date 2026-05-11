-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteContent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "brandName" TEXT NOT NULL DEFAULT 'hygge',
    "definitionLabel" TEXT NOT NULL DEFAULT 'Danish [hyü-ge] noun',
    "definitionBody" TEXT NOT NULL DEFAULT 'A feeling of warmth, comfort, and coziness when you feel at peace and able to enjoy simple pleasures and being in the moment.',
    "tagline" TEXT NOT NULL DEFAULT '• specialty coffee • pastry • danish lunch',
    "inviteLine" TEXT NOT NULL DEFAULT 'Slow down a little.',
    "inviteSub" TEXT NOT NULL DEFAULT 'A quiet corner is waiting.',
    "statusLabel" TEXT NOT NULL DEFAULT 'NOW OPEN',
    "statusSub" TEXT NOT NULL DEFAULT 'SEVEN DAYS A WEEK',
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "addressLine1" TEXT NOT NULL DEFAULT 'NAAMSESTRAAT 55P',
    "addressLine2" TEXT NOT NULL DEFAULT 'LEUVEN 3000',
    "hoursToday" TEXT NOT NULL DEFAULT 'TODAY 8:00 – 18:00',
    "hoursWeekend" TEXT NOT NULL DEFAULT 'WEEKEND 9:00 – 19:00',
    "findUsLabel" TEXT NOT NULL DEFAULT 'FIND US',
    "findUsUrl" TEXT NOT NULL DEFAULT 'https://www.google.com/maps?q=Naamsestraat+55P,+3000+Leuven,+Belgium',
    "instagramHandle" TEXT NOT NULL DEFAULT '@hygge.leuven',
    "instagramUrl" TEXT NOT NULL DEFAULT 'https://www.instagram.com/hygge.leuven/',
    "bgImagePath" TEXT NOT NULL DEFAULT '/assets/bg.png',
    "metaTitle" TEXT NOT NULL DEFAULT 'hygge — Danish café in Leuven',
    "metaDescription" TEXT NOT NULL DEFAULT 'Specialty coffee, pastry, and danish lunch. Naamsestraat 55P, Leuven.',
    "instaHeading" TEXT NOT NULL DEFAULT 'from the café',
    "instaSub" TEXT NOT NULL DEFAULT 'daily moments — pastries, light, faces',
    "instaCtaLabel" TEXT NOT NULL DEFAULT 'Follow @hygge.leuven',
    "instaEmbedHtml" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteContent" ("addressLine1", "addressLine2", "bgImagePath", "brandName", "definitionBody", "definitionLabel", "findUsLabel", "findUsUrl", "hoursToday", "hoursWeekend", "id", "instagramHandle", "instagramUrl", "inviteLine", "inviteSub", "isOpen", "metaDescription", "metaTitle", "statusLabel", "statusSub", "tagline", "updatedAt") SELECT "addressLine1", "addressLine2", "bgImagePath", "brandName", "definitionBody", "definitionLabel", "findUsLabel", "findUsUrl", "hoursToday", "hoursWeekend", "id", "instagramHandle", "instagramUrl", "inviteLine", "inviteSub", "isOpen", "metaDescription", "metaTitle", "statusLabel", "statusSub", "tagline", "updatedAt" FROM "SiteContent";
DROP TABLE "SiteContent";
ALTER TABLE "new_SiteContent" RENAME TO "SiteContent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
