/**
 * Seed site text translations (EN/NL/FR) for the 20 SiteContent text fields.
 * Uses overwrite upsert — re-running this updates values to whatever this file contains.
 *
 * Run: npx tsx scripts/seed-site-translations.ts
 */
import { PrismaClient, type Locale } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

type Field =
  | "brandName" | "definitionLabel" | "tagline"
  | "inviteLine" | "inviteSub" | "statusLabel" | "statusSub"
  | "hoursToday" | "hoursWeekend" | "findUsLabel" | "instagramHandle"
  | "instaHeading" | "instaSub" | "instaCtaLabel" | "instaEmbedHtml"
  | "mapHeading" | "mapSub" | "menuBeansNote" | "metaTitle" | "metaDescription";

// Retired copy: the dictionary-definition body and the "why hygge" pane. Rows
// are deleted on every run so re-seeding also cleans up older databases.
const RETIRED_NAMESPACES = ["site.definitionBody", "site.visionHeading", "site.visionBody"];

const NS: Record<Field, string> = {
  brandName: "site.brandName",
  definitionLabel: "site.definitionLabel",
  tagline: "site.tagline",
  inviteLine: "site.inviteLine",
  inviteSub: "site.inviteSub",
  statusLabel: "site.statusLabel",
  statusSub: "site.statusSub",
  hoursToday: "site.hoursToday",
  hoursWeekend: "site.hoursWeekend",
  findUsLabel: "site.findUsLabel",
  instagramHandle: "site.instagramHandle",
  instaHeading: "site.instaHeading",
  instaSub: "site.instaSub",
  instaCtaLabel: "site.instaCtaLabel",
  instaEmbedHtml: "site.instaEmbedHtml",
  mapHeading: "site.mapHeading",
  mapSub: "site.mapSub",
  menuBeansNote: "site.menuBeansNote",
  metaTitle: "site.metaTitle",
  metaDescription: "site.metaDescription",
};

const EN: Record<Field, string> = {
  brandName: "hygge",
  definitionLabel: "Danish [hyü-ge] noun",
  tagline: "• specialty coffee • pastry • danish lunch",
  inviteLine: "Slow down a little.",
  inviteSub: "A quiet corner is waiting.",
  statusLabel: "NOW OPEN",
  statusSub: "SEVEN DAYS A WEEK",
  hoursToday: "TODAY 8:00 – 18:00",
  hoursWeekend: "WEEKEND 9:00 – 19:00",
  findUsLabel: "FIND US",
  instagramHandle: "@hygge.leuven",
  instaHeading: "from the café",
  instaSub: "daily moments — pastries, light, faces",
  instaCtaLabel: "Follow @hygge.leuven",
  instaEmbedHtml: "",
  mapHeading: "come find us",
  mapSub: "Naamsestraat 55, 3000 Leuven",
  menuBeansNote:
    "Every cup here has a passport. Our espresso and americano beans move to a new single origin roughly once a month, and our coffees and teas are chosen origin-first — so there is always a new flavour, a new feeling, waiting. Come back soon; the cup changes with the seasons.",
  metaTitle: "hygge — Danish café in Leuven",
  metaDescription: "Specialty coffee, pastry, and danish lunch. Naamsestraat 55, Leuven.",
};

const NL: Record<Field, string> = {
  brandName: "hygge",
  definitionLabel: "Deens [hyü-ge] zelfstandig naamwoord",
  tagline: "• specialty koffie • patisserie • deense lunch",
  inviteLine: "Even vertragen.",
  inviteSub: "Een rustig hoekje wacht op je.",
  statusLabel: "NU OPEN",
  statusSub: "ZEVEN DAGEN PER WEEK",
  hoursToday: "VANDAAG 8:00 – 18:00",
  hoursWeekend: "WEEKEND 9:00 – 19:00",
  findUsLabel: "VIND ONS",
  instagramHandle: "@hygge.leuven",
  instaHeading: "uit het café",
  instaSub: "dagelijkse momenten — gebak, licht, gezichten",
  instaCtaLabel: "Volg @hygge.leuven",
  instaEmbedHtml: "",
  mapHeading: "kom ons opzoeken",
  mapSub: "Naamsestraat 55, 3000 Leuven",
  menuBeansNote:
    "Elke kop heeft hier een paspoort. Onze espresso- en americanobonen verhuizen ongeveer elke maand naar een nieuwe single origin, en onze koffie en thee kiezen we op herkomst — er wacht dus altijd een nieuwe smaak, een nieuw gevoel. Kom snel terug; de kop verandert met de seizoenen.",
  metaTitle: "hygge — Deens café in Leuven",
  metaDescription: "Specialty koffie, patisserie en deense lunch. Naamsestraat 55, Leuven.",
};

const FR: Record<Field, string> = {
  brandName: "hygge",
  definitionLabel: "Danois [hyü-ge] nom",
  tagline: "• café de spécialité • pâtisserie • déjeuner danois",
  inviteLine: "Prenez le temps.",
  inviteSub: "Un coin tranquille vous attend.",
  statusLabel: "OUVERT",
  statusSub: "SEPT JOURS SUR SEPT",
  hoursToday: "AUJOURD'HUI 8:00 – 18:00",
  hoursWeekend: "WEEK-END 9:00 – 19:00",
  findUsLabel: "NOUS TROUVER",
  instagramHandle: "@hygge.leuven",
  instaHeading: "depuis le café",
  instaSub: "instants du jour — pâtisseries, lumière, visages",
  instaCtaLabel: "Suivez @hygge.leuven",
  instaEmbedHtml: "",
  mapHeading: "venez nous voir",
  mapSub: "Naamsestraat 55, 3000 Leuven",
  menuBeansNote:
    "Chaque tasse a ici son passeport. Nos grains d'espresso et d'americano changent d'origine environ une fois par mois, et nos cafés comme nos thés sont choisis pour leur terroir — il y a donc toujours une nouvelle saveur, une nouvelle émotion à découvrir. Revenez bientôt ; la tasse change avec les saisons.",
  metaTitle: "hygge — café danois à Louvain",
  metaDescription: "Café de spécialité, pâtisserie et déjeuner danois. Naamsestraat 55, Leuven.",
};

async function main() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  const prisma = new PrismaClient({ adapter });

  const all: Array<[Locale, Record<Field, string>]> = [
    ["EN", EN],
    ["NL", NL],
    ["FR", FR],
  ];

  const removed = await prisma.translation.deleteMany({
    where: { namespace: { in: RETIRED_NAMESPACES } },
  });
  if (removed.count > 0) console.log(`Removed ${removed.count} retired translation rows.`);

  let count = 0;
  for (const [locale, dict] of all) {
    for (const [field, value] of Object.entries(dict) as [Field, string][]) {
      if (!value) continue;
      await prisma.translation.upsert({
        where: { namespace_locale: { namespace: NS[field], locale } },
        create: { namespace: NS[field], locale, value },
        update: { value },
      });
      count++;
    }
  }
  console.log(`Upserted ${count} site-text translation rows.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
