import { PrismaClient, Locale } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter, log: ["error", "warn"] });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { Locale };
export const DEFAULT_LOCALE: Locale = "EN";
export const SUPPORTED_LOCALES: Locale[] = ["EN", "NL", "FR"];

// Namespaces under which legacy SiteContent text fields live in Translation.
const TEXT_NAMESPACES = {
  brandName: "site.brandName",
  definitionLabel: "site.definitionLabel",
  definitionBody: "site.definitionBody",
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
  visionHeading: "site.visionHeading",
  visionBody: "site.visionBody",
  mapHeading: "site.mapHeading",
  mapSub: "site.mapSub",
  contactHeading: "site.contactHeading",
  contactEmail: "site.contactEmail",
  contactPhone: "site.contactPhone",
  metaTitle: "site.metaTitle",
  metaDescription: "site.metaDescription",
} as const;

export type SiteTextField = keyof typeof TEXT_NAMESPACES;

const SITE_TEXT_DEFAULTS: Record<SiteTextField, string> = {
  brandName: "hygge",
  definitionLabel: "Danish [hyü-ge] noun",
  definitionBody: "a feeling of cozy contentment.",
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
  visionHeading: "why hygge",
  visionBody:
    "Hygge is the Danish art of cosy contentment — warmth over noise, presence over hurry. We made this corner of Leuven to slow you down: honest specialty coffee, pastry straight from the oven, and a seat that feels like a friend's kitchen. Stay a while.",
  mapHeading: "come find us",
  mapSub: "Naamsestraat 55, 3000 Leuven",
  contactHeading: "say hello",
  contactEmail: "",
  contactPhone: "",
  metaTitle: "hygge — Danish café in Leuven",
  metaDescription: "Specialty coffee, pastry, and danish lunch. Naamsestraat 55, Leuven.",
};

async function getSiteRow() {
  const existing = await prisma.siteContent.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.siteContent.create({ data: { id: 1 } });
}

async function loadSiteTexts(locale: Locale): Promise<Record<SiteTextField, string>> {
  const namespaces = Object.values(TEXT_NAMESPACES);
  // Fetch requested locale + EN fallback in one query.
  const rows = await prisma.translation.findMany({
    where: {
      namespace: { in: namespaces },
      locale: locale === DEFAULT_LOCALE ? DEFAULT_LOCALE : { in: [locale, DEFAULT_LOCALE] },
    },
  });
  const byNs = new Map<string, { primary?: string; fallback?: string }>();
  for (const r of rows) {
    const slot = byNs.get(r.namespace) ?? {};
    if (r.locale === locale) slot.primary = r.value;
    else if (r.locale === DEFAULT_LOCALE) slot.fallback = r.value;
    byNs.set(r.namespace, slot);
  }
  const out = {} as Record<SiteTextField, string>;
  for (const [field, ns] of Object.entries(TEXT_NAMESPACES) as [SiteTextField, string][]) {
    const slot = byNs.get(ns);
    out[field] = slot?.primary ?? slot?.fallback ?? SITE_TEXT_DEFAULTS[field];
  }
  return out;
}

async function getBackgroundPath(): Promise<string> {
  const bg = await prisma.photo.findFirst({
    where: { role: "background" },
    orderBy: { sortOrder: "asc" },
  });
  return bg?.path ?? "/assets/bg.png";
}

// SiteContent draft snapshot. When non-null in SiteContent.draftJson, it represents
// in-progress edits that have NOT yet been published. Translation rows + SiteContent
// scalar columns continue to hold the LIVE/published state.
export type SiteDraft = {
  scalars?: Partial<Pick<
    Awaited<ReturnType<typeof getSiteRow>>,
    | "isOpen"
    | "addressLine1"
    | "addressLine2"
    | "findUsUrl"
    | "instagramUrl"
    | "mapLat"
    | "mapLng"
    | "mapZoom"
    | "showDefinition"
    | "showTagline"
    | "showInvite"
    | "showStatus"
    | "showAddress"
    | "showHours"
  >>;
  // texts: { "site.brandName": { EN: "hygge", NL: "hygge" } }
  texts?: Record<string, Partial<Record<Locale, string>>>;
  savedAt?: string;
};

export function parseDraft(raw: string | null): SiteDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as SiteDraft;
  } catch {
    // fall through
  }
  return null;
}

type ContentSource = "published" | "draft";

export async function getContentForLocale(
  locale: Locale,
  opts: { source?: ContentSource } = {},
) {
  const source = opts.source ?? "published";
  const [row, texts, bgImagePath] = await Promise.all([
    getSiteRow(),
    loadSiteTexts(locale),
    getBackgroundPath(),
  ]);

  // Apply draft overlay on top of published values for admin preview.
  let scalars = {
    isOpen: row.isOpen,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    findUsUrl: row.findUsUrl,
    instagramUrl: row.instagramUrl,
    mapLat: row.mapLat,
    mapLng: row.mapLng,
    mapZoom: row.mapZoom,
    showDefinition: row.showDefinition,
    showTagline: row.showTagline,
    showInvite: row.showInvite,
    showStatus: row.showStatus,
    showAddress: row.showAddress,
    showHours: row.showHours,
  };
  let textOverlay = texts;

  if (source === "draft") {
    const draft = parseDraft(row.draftJson);
    if (draft) {
      if (draft.scalars) scalars = { ...scalars, ...draft.scalars };
      if (draft.texts) {
        const overlaid = { ...texts };
        for (const [field, ns] of Object.entries(TEXT_NAMESPACES) as [SiteTextField, string][]) {
          const candidate = draft.texts[ns]?.[locale] ?? draft.texts[ns]?.[DEFAULT_LOCALE];
          if (typeof candidate === "string") overlaid[field] = candidate;
        }
        textOverlay = overlaid;
      }
    }
  }

  return {
    id: row.id,
    ...scalars,
    publishedAt: row.publishedAt,
    draftJson: row.draftJson,
    updatedAt: row.updatedAt,
    bgImagePath,
    locale,
    ...textOverlay,
  };
}

export async function getContent() {
  return getContentForLocale(DEFAULT_LOCALE);
}

// Convenience: published view for the live landing page.
export async function getPublishedContent(locale: Locale = DEFAULT_LOCALE) {
  return getContentForLocale(locale, { source: "published" });
}

// Convenience: draft-overlay view for /admin/preview and the admin editor.
export async function getDraftContent(locale: Locale = DEFAULT_LOCALE) {
  return getContentForLocale(locale, { source: "draft" });
}

// Returns true if there is a non-empty draft snapshot pending publish.
export async function hasUnpublishedDraft(): Promise<boolean> {
  const row = await prisma.siteContent.findUnique({
    where: { id: 1 },
    select: { draftJson: true },
  });
  const draft = parseDraft(row?.draftJson ?? null);
  if (!draft) return false;
  const hasScalars = !!draft.scalars && Object.keys(draft.scalars).length > 0;
  const hasTexts = !!draft.texts && Object.keys(draft.texts).length > 0;
  return hasScalars || hasTexts;
}

// Returns a list of {label, from, to} entries describing what the draft would
// change relative to the currently-published values. Used by the admin banner.
export async function summarizeDraft(): Promise<{ field: string; from: string; to: string }[]> {
  const row = await getSiteRow();
  const draft = parseDraft(row.draftJson);
  if (!draft) return [];

  const out: { field: string; from: string; to: string }[] = [];
  if (draft.scalars) {
    for (const [k, v] of Object.entries(draft.scalars)) {
      const live = (row as Record<string, unknown>)[k];
      if (JSON.stringify(live) !== JSON.stringify(v)) {
        out.push({ field: k, from: String(live ?? ""), to: String(v ?? "") });
      }
    }
  }

  if (draft.texts) {
    const namespaces = Object.keys(draft.texts);
    if (namespaces.length > 0) {
      const liveRows = await prisma.translation.findMany({
        where: { namespace: { in: namespaces } },
      });
      const liveByKey = new Map<string, string>(
        liveRows.map((r) => [`${r.namespace}|${r.locale}`, r.value]),
      );
      for (const [ns, perLocale] of Object.entries(draft.texts)) {
        for (const [loc, v] of Object.entries(perLocale)) {
          const live = liveByKey.get(`${ns}|${loc}`) ?? "";
          if (live !== v) out.push({ field: `${ns} (${loc})`, from: live, to: v ?? "" });
        }
      }
    }
  }
  return out;
}

export type SiteContent = Awaited<ReturnType<typeof getContent>>;

export async function getOpeningHours() {
  return prisma.openingHours.findMany({ orderBy: { dayOfWeek: "asc" } });
}

export async function getPhotos(role: string) {
  return prisma.photo.findMany({
    where: { role },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getMenu() {
  return prisma.menuCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
}

export type MenuItemView = {
  id: number;
  priceCents: number;
  available: boolean;
  sortOrder: number;
  photoId: number | null;
  photoPath: string | null;
  photoAlt: string;
  name: string;
  description: string;
};

export type MenuCategoryView = {
  id: number;
  slug: string;
  sortOrder: number;
  label: string;
  items: MenuItemView[];
};

function pickTranslation(
  rows: { namespace: string; locale: Locale; value: string }[],
  namespace: string,
  locale: Locale,
  fallback: string,
): string {
  let primary: string | undefined;
  let en: string | undefined;
  for (const r of rows) {
    if (r.namespace !== namespace) continue;
    if (r.locale === locale) primary = r.value;
    else if (r.locale === DEFAULT_LOCALE) en = r.value;
  }
  return primary ?? en ?? fallback;
}

// titleCase: cheap fallback when no EN translation exists for a category slug.
function titleCase(slug: string): string {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function getMenuForLocale(locale: Locale): Promise<MenuCategoryView[]> {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (categories.length === 0) return [];

  const namespaces: string[] = [];
  const photoIds: number[] = [];
  for (const c of categories) {
    namespaces.push(`menu.category.${c.slug}`);
    for (const it of c.items) {
      namespaces.push(`menu.item.${it.id}.name`, `menu.item.${it.id}.description`);
      if (it.photoId) photoIds.push(it.photoId);
    }
  }

  const localeFilter = locale === DEFAULT_LOCALE
    ? DEFAULT_LOCALE
    : { in: [locale, DEFAULT_LOCALE] };

  const [rows, photos] = await Promise.all([
    prisma.translation.findMany({
      where: { namespace: { in: namespaces }, locale: localeFilter },
    }),
    photoIds.length
      ? prisma.photo.findMany({ where: { id: { in: photoIds } } })
      : Promise.resolve([]),
  ]);
  const photoById = new Map(photos.map((p) => [p.id, p] as const));

  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    sortOrder: c.sortOrder,
    label: pickTranslation(rows, `menu.category.${c.slug}`, locale, titleCase(c.slug)),
    items: c.items.map((it) => {
      const photo = it.photoId ? photoById.get(it.photoId) ?? null : null;
      return {
        id: it.id,
        priceCents: it.priceCents,
        available: it.available,
        sortOrder: it.sortOrder,
        photoId: it.photoId,
        photoPath: photo?.path ?? null,
        photoAlt: photo?.alt ?? "",
        name: pickTranslation(rows, `menu.item.${it.id}.name`, locale, ""),
        description: pickTranslation(rows, `menu.item.${it.id}.description`, locale, ""),
      };
    }),
  }));
}

export function formatPrice(cents: number, locale: Locale = DEFAULT_LOCALE): string {
  // Café in Leuven → euros. Use Intl with EU locale for consistent decimal style.
  const localeTag = locale === "EN" ? "en-IE" : locale === "FR" ? "fr-BE" : "nl-BE";
  return new Intl.NumberFormat(localeTag, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

type HoursRow = { dayOfWeek: number; opensAt: string | null; closesAt: string | null };

// computeIsOpen: returns whether the café is open at `now` based on per-day schedule.
// Times are interpreted in the local timezone of `now` (Date object). Null opensAt => closed.
export function computeIsOpen(hours: HoursRow[], now: Date): boolean {
  const dow = now.getDay();
  const today = hours.find((h) => h.dayOfWeek === dow);
  if (!today || !today.opensAt || !today.closesAt) return false;
  const [oh, om] = today.opensAt.split(":").map(Number);
  const [ch, cm] = today.closesAt.split(":").map(Number);
  if (!Number.isFinite(oh) || !Number.isFinite(ch)) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const open = oh * 60 + (om || 0);
  const close = ch * 60 + (cm || 0);
  if (close <= open) {
    // overnight (e.g. 18:00 -> 02:00) — open if after open OR before close
    return minutes >= open || minutes < close;
  }
  return minutes >= open && minutes < close;
}

export async function setTranslation(namespace: string, locale: Locale, value: string) {
  return prisma.translation.upsert({
    where: { namespace_locale: { namespace, locale } },
    create: { namespace, locale, value },
    update: { value },
  });
}

export function siteTextNamespace(field: SiteTextField): string {
  return TEXT_NAMESPACES[field];
}

export const SITE_TEXT_FIELDS = Object.keys(TEXT_NAMESPACES) as SiteTextField[];
