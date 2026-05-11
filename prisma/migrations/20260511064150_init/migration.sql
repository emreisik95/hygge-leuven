-- CreateTable
CREATE TABLE "SiteContent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "brandName" TEXT NOT NULL DEFAULT 'hygge',
    "definitionLabel" TEXT NOT NULL DEFAULT 'Danish [hyü-ge] noun',
    "definitionBody" TEXT NOT NULL DEFAULT 'A feeling of warmth, comfort, and coziness when you feel at peace and able to enjoy simple pleasures and being in the moment.',
    "tagline" TEXT NOT NULL DEFAULT '• specialty coffee • pastry • danish lunch',
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
    "updatedAt" DATETIME NOT NULL
);
