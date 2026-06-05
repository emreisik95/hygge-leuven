import { z } from "zod";
import type { FlagKey } from "@/lib/flags";
import { FEATURE_LABELS } from "@/lib/feature-labels";
import { FAQ_ITEMS, TESTIMONIALS, EVENTS, SPOTIFY_PLAYLIST_ID } from "@/lib/feature-content";
import { readSettings, writeSetting } from "@/lib/settings";

// ---------------------------------------------------------------------------
// Editable feature settings — a declarative registry.
//
// Each flag-gated feature that has copy or content gets ONE spec describing its
// editable fields. The same spec drives (a) the inline editor in /admin/features,
// (b) the Zod schema used to validate saves, (c) the defaults, and (d) the
// merge that overlays stored values onto the in-code copy/content for the public
// site. Add a field here and it appears in the admin UI and takes effect on the
// site — no per-feature wiring.
//
// A field whose `name` is a dotted path "folds back" into FEATURE_LABELS (so the
// existing components keep reading L.x.y, now override-aware). Standalone fields
// (e.g. the Spotify id) and list content (FAQ/testimonials/events) are read via
// the dedicated resolvers below.
// ---------------------------------------------------------------------------

const MAX_LINE = 300;
const MAX_BLOCK = 2000;
const MAX_LIST = 20;

export type FieldKind = "text" | "textarea";

export type ScalarField = {
  /** Either a dotted path into FEATURE_LABELS (copy) or a standalone key. */
  name: string;
  label: string;
  kind: FieldKind;
  hint?: string;
  /** True when `name` is a FEATURE_LABELS path to fold back into site copy. */
  copyPath: boolean;
  /** Default for standalone (non-copyPath) fields; copyPath defaults derive from FEATURE_LABELS. */
  fallback?: string;
};

export type ListSubField = { name: string; label: string; kind: FieldKind };

export type ContentKey = "faq" | "testimonials" | "events";

export type ListSpec = {
  contentKey: ContentKey;
  itemNoun: string;
  fields: ListSubField[];
  max: number;
};

export type FeatureSettingsSpec = {
  flag: FlagKey;
  title: string;
  blurb?: string;
  fields: ScalarField[];
  list?: ListSpec;
};

const copy = (name: string, label: string, kind: FieldKind = "text", hint?: string): ScalarField => ({
  name,
  label,
  kind,
  hint,
  copyPath: true,
});

// ── the registry ──────────────────────────────────────────────────────────
export const FEATURE_SETTINGS_SPECS: FeatureSettingsSpec[] = [
  {
    flag: "darkMode",
    title: "Dark mode toggle",
    fields: [copy("theme.toLight", "“Switch to light” label"), copy("theme.toDark", "“Switch to dark” label")],
  },
  {
    flag: "backToTop",
    title: "Back to top",
    fields: [copy("backToTop", "Button label")],
  },
  {
    flag: "cookieConsent",
    title: "Cookie consent",
    fields: [copy("cookie.message", "Message", "textarea"), copy("cookie.accept", "Accept button")],
  },
  {
    flag: "pwaInstall",
    title: "Install app",
    fields: [copy("pwaInstall", "Button label")],
  },
  {
    flag: "weatherGreeting",
    title: "Weather greeting",
    fields: [
      copy("weatherTemplate", "Template", "textarea", "Use {temp} and {sky} as placeholders."),
    ],
  },
  {
    flag: "loyaltyCard",
    title: "Coffee card",
    fields: [
      copy("loyalty.heading", "Heading"),
      copy("loyalty.hint", "Hint", "textarea"),
      copy("loyalty.reward", "Reward message", "textarea"),
      copy("loyalty.reset", "Reset label"),
    ],
  },
  {
    flag: "photoLightbox",
    title: "Photo lightbox",
    fields: [copy("lightboxClose", "Close label")],
  },
  {
    flag: "socialShare",
    title: "Social share",
    fields: [copy("share.share", "Share label"), copy("share.copied", "“Copied” label")],
  },
  {
    flag: "faqSection",
    title: "FAQ section",
    blurb: "Common questions shown in an accordion.",
    fields: [copy("faqHeading", "Section heading")],
    list: {
      contentKey: "faq",
      itemNoun: "question",
      max: MAX_LIST,
      fields: [
        { name: "q", label: "Question", kind: "text" },
        { name: "a", label: "Answer", kind: "textarea" },
      ],
    },
  },
  {
    flag: "testimonials",
    title: "Testimonials",
    blurb: "Short guest quotes.",
    fields: [copy("testimonialsHeading", "Section heading")],
    list: {
      contentKey: "testimonials",
      itemNoun: "quote",
      max: MAX_LIST,
      fields: [
        { name: "quote", label: "Quote", kind: "textarea" },
        { name: "author", label: "Author", kind: "text" },
      ],
    },
  },
  {
    flag: "eventsList",
    title: "Events",
    blurb: "Upcoming tastings, live music or workshops.",
    fields: [copy("eventsHeading", "Section heading")],
    list: {
      contentKey: "events",
      itemNoun: "event",
      max: MAX_LIST,
      fields: [
        { name: "date", label: "Date", kind: "text" },
        { name: "title", label: "Title", kind: "text" },
        { name: "detail", label: "Detail", kind: "textarea" },
      ],
    },
  },
  {
    flag: "menuSearch",
    title: "Menu search",
    fields: [
      copy("menuSearch.placeholder", "Placeholder"),
      copy("menuSearch.noResults", "No-results message", "textarea"),
    ],
  },
  {
    flag: "reservationCta",
    title: "Reserve a table",
    fields: [copy("reservation.label", "Button label"), copy("reservation.subject", "Email subject")],
  },
  {
    flag: "giftCardCta",
    title: "Gift card",
    fields: [
      copy("giftCard.heading", "Heading"),
      copy("giftCard.body", "Body", "textarea"),
      copy("giftCard.button", "Button label"),
    ],
  },
  {
    flag: "spotifyEmbed",
    title: "Café playlist",
    fields: [
      copy("spotifyHeading", "Section heading"),
      {
        name: "playlistId",
        label: "Spotify playlist ID",
        kind: "text",
        copyPath: false,
        fallback: SPOTIFY_PLAYLIST_ID,
        hint: "The id after /playlist/ in the share URL.",
      },
    ],
  },
  {
    flag: "newsletterSignup",
    title: "Newsletter signup",
    fields: [
      copy("newsletter.heading", "Heading"),
      copy("newsletter.body", "Body", "textarea"),
      copy("newsletter.placeholder", "Email placeholder"),
      copy("newsletter.button", "Button label"),
      copy("newsletter.success", "Success message"),
      copy("newsletter.invalid", "Invalid-email message"),
      copy("newsletter.error", "Error message"),
    ],
  },
  {
    flag: "mapDirectionsCta",
    title: "Get directions",
    fields: [copy("directions", "Button label")],
  },
];

export const SPECS_BY_FLAG: Map<FlagKey, FeatureSettingsSpec> = new Map(
  FEATURE_SETTINGS_SPECS.map((s) => [s.flag, s] as const),
);

export function settingKey(flag: FlagKey): string {
  return `feature.${flag}`;
}

// ── dotted-path helpers (copy fold-back) ────────────────────────────────────
function deepGet(obj: unknown, path: string): string {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    if (cur && typeof cur === "object" && part in cur) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return "";
    }
  }
  return typeof cur === "string" ? cur : "";
}

function deepSet(obj: Record<string, unknown>, path: string, value: string): void {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const next = cur[part];
    if (!next || typeof next !== "object") cur[part] = {};
    cur = cur[part] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

const CONTENT_DEFAULTS: Record<ContentKey, Record<string, string>[]> = {
  faq: FAQ_ITEMS as unknown as Record<string, string>[],
  testimonials: TESTIMONIALS as unknown as Record<string, string>[],
  events: EVENTS as unknown as Record<string, string>[],
};

// ── per-spec schema + defaults ──────────────────────────────────────────────
function scalarMax(kind: FieldKind): number {
  return kind === "textarea" ? MAX_BLOCK : MAX_LINE;
}

/** Zod schema for a stored settings document. All fields optional → partial docs
 *  validate and missing keys fall back to defaults at merge time. */
export function schemaForSpec(spec: FeatureSettingsSpec): z.ZodType<Record<string, unknown>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of spec.fields) shape[f.name] = z.string().max(scalarMax(f.kind)).optional();
  if (spec.list) {
    const itemShape: Record<string, z.ZodTypeAny> = {};
    for (const sf of spec.list.fields) itemShape[sf.name] = z.string().max(scalarMax(sf.kind));
    shape.items = z.array(z.object(itemShape)).max(spec.list.max).optional();
  }
  return z.object(shape).strip();
}

/** The full default document for a spec (copy defaults + content defaults). */
export function defaultDocForSpec(spec: FeatureSettingsSpec): Record<string, unknown> {
  const doc: Record<string, unknown> = {};
  for (const f of spec.fields) {
    doc[f.name] = f.copyPath ? deepGet(FEATURE_LABELS, f.name) : (f.fallback ?? "");
  }
  if (spec.list) doc.items = CONTENT_DEFAULTS[spec.list.contentKey];
  return doc;
}

function mergeDoc(spec: FeatureSettingsSpec, stored: string | undefined): Record<string, unknown> {
  const base = defaultDocForSpec(spec);
  if (!stored) return base;
  try {
    const parsed = schemaForSpec(spec).safeParse(JSON.parse(stored));
    if (!parsed.success) return base;
    // Overlay only the keys the admin actually set.
    return { ...base, ...parsed.data };
  } catch {
    return base;
  }
}

// ── public-site resolvers ───────────────────────────────────────────────────
export type FeatureCopy = typeof FEATURE_LABELS;

type Resolved = {
  copy: FeatureCopy;
  faq: { q: string; a: string }[];
  testimonials: { quote: string; author: string }[];
  events: { date: string; title: string; detail: string }[];
  spotifyPlaylistId: string;
};

/** Resolve every feature's editable copy + content in one batched read. Returns
 *  a FEATURE_LABELS-shaped `copy` object plus the content lists, all overlaid
 *  with any stored overrides. Used by the home page and the admin preview. */
export async function resolveFeatureSettings(): Promise<Resolved> {
  const keys = FEATURE_SETTINGS_SPECS.map((s) => settingKey(s.flag));
  const rows = await readSettings(keys);

  const merged = new Map<FlagKey, Record<string, unknown>>();
  for (const spec of FEATURE_SETTINGS_SPECS) {
    merged.set(spec.flag, mergeDoc(spec, rows.get(settingKey(spec.flag))));
  }

  // Clone FEATURE_LABELS and fold copy-path overrides into it.
  const copyOut = structuredClone(FEATURE_LABELS) as unknown as Record<string, unknown>;
  for (const spec of FEATURE_SETTINGS_SPECS) {
    const doc = merged.get(spec.flag)!;
    for (const f of spec.fields) {
      if (f.copyPath && typeof doc[f.name] === "string") deepSet(copyOut, f.name, doc[f.name] as string);
    }
  }

  const faqDoc = merged.get("faqSection")!;
  const tDoc = merged.get("testimonials")!;
  const eDoc = merged.get("eventsList")!;
  const sDoc = merged.get("spotifyEmbed")!;

  return {
    copy: copyOut as unknown as FeatureCopy,
    faq: (faqDoc.items as { q: string; a: string }[]) ?? [],
    testimonials: (tDoc.items as { quote: string; author: string }[]) ?? [],
    events: (eDoc.items as { date: string; title: string; detail: string }[]) ?? [],
    spotifyPlaylistId: (sDoc.playlistId as string) || SPOTIFY_PLAYLIST_ID,
  };
}

// ── admin: current values + save ────────────────────────────────────────────
export type AdminSettingGroup = {
  flag: FlagKey;
  title: string;
  blurb?: string;
  fields: ScalarField[];
  list?: ListSpec;
  values: Record<string, unknown>;
};

/** Current (stored-or-default) document for every spec, for the admin editor. */
export async function getFeatureSettingsForAdmin(): Promise<AdminSettingGroup[]> {
  const keys = FEATURE_SETTINGS_SPECS.map((s) => settingKey(s.flag));
  const rows = await readSettings(keys);
  return FEATURE_SETTINGS_SPECS.map((spec) => ({
    flag: spec.flag,
    title: spec.title,
    blurb: spec.blurb,
    fields: spec.fields,
    list: spec.list,
    values: mergeDoc(spec, rows.get(settingKey(spec.flag))),
  }));
}

/** Persist one feature's settings document (validated against its schema). */
export async function saveFeatureSetting(flag: FlagKey, doc: Record<string, unknown>): Promise<void> {
  const spec = SPECS_BY_FLAG.get(flag);
  if (!spec) throw new Error(`Unknown feature settings flag: ${flag}`);
  await writeSetting(settingKey(flag), schemaForSpec(spec), doc);
}
