import { prisma } from "@/lib/db";
import type { Locale } from "@prisma/client";

// Opening-hours computation. Uses Intl.DateTimeFormat for timezone correctness so
// the result does not depend on the server's local TZ.
//
// "HH:MM" strings are interpreted in the cafe's timezone (default Europe/Brussels).
// Overnight ranges (closesAt < opensAt, e.g. 18:00 -> 02:00) are supported and
// considered as "today's open window extending past midnight into tomorrow".
//
// The returned `nextChange` is a Date in UTC representing the moment the open/closed
// state will flip. It is computed by walking the schedule day-by-day in the cafe TZ.

export type OpeningHoursRow = {
  dayOfWeek: number; // 0=Sun ... 6=Sat (matches JS Date.getDay and the seeded data)
  opensAt: string | null;
  closesAt: string | null;
};

export type IsOpenReason =
  | "open"
  | "before_open"
  | "after_close"
  | "closed_today";

export type IsOpenResult = {
  isOpen: boolean;
  reason: IsOpenReason;
  nextChange?: Date;
  /** Today's row (in the configured TZ). Useful for rendering "TODAY 8:00 – 18:00". */
  todayRow?: OpeningHoursRow;
};

const DEFAULT_TZ = "Europe/Brussels";

/** Parse "HH:MM" (or "H:MM") into minutes since midnight. Returns null on failure. */
export function parseHHMM(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/** Format minutes-since-midnight as "H:MM" (no leading zero on hour, like "8:00"). */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/** Returns { year, month, day, hour, minute, weekday } for `at` in `timezone`. */
function partsInTimeZone(at: Date, timezone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = fmt.formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  // Intl reports 24h hour as "24" at midnight in some engines; normalize.
  const hourRaw = get("hour");
  const hour = hourRaw === "24" ? 0 : Number(hourRaw);
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour,
    minute: Number(get("minute")),
    weekday: weekdayMap[get("weekday")] ?? 0,
  };
}

/**
 * Build a UTC Date that, when viewed in `timezone`, has wall-clock parts {y, m, d, hh, mm}.
 * Iterative correction handles DST: we make a first guess assuming UTC == TZ, then nudge
 * by the observed offset until the rendered wall-clock matches the target.
 */
function zonedToUtc(
  y: number, m: number, d: number, hh: number, mm: number, timezone: string
): Date {
  // First guess: treat the wall-clock as UTC.
  let guess = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
  for (let i = 0; i < 3; i++) {
    const p = partsInTimeZone(guess, timezone);
    const target = y * 525600 + m * 43800 + d * 1440 + hh * 60 + mm;
    const actual = p.year * 525600 + p.month * 43800 + p.day * 1440 + p.hour * 60 + p.minute;
    const diffMin = target - actual;
    if (diffMin === 0) break;
    guess = new Date(guess.getTime() + diffMin * 60 * 1000);
  }
  return guess;
}

function rowFor(hours: OpeningHoursRow[], dow: number): OpeningHoursRow | undefined {
  return hours.find((h) => h.dayOfWeek === dow);
}

/** Add `days` to a {y,m,d} tuple via Date arithmetic in UTC (TZ-agnostic). */
function addDays(y: number, m: number, d: number, days: number) {
  const t = new Date(Date.UTC(y, m - 1, d));
  t.setUTCDate(t.getUTCDate() + days);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export function computeIsOpen(
  hours: OpeningHoursRow[],
  now: Date,
  timezone: string = DEFAULT_TZ
): IsOpenResult {
  const p = partsInTimeZone(now, timezone);
  const nowMin = p.hour * 60 + p.minute;
  const today = rowFor(hours, p.weekday);
  const yesterday = rowFor(hours, (p.weekday + 6) % 7);

  // Case A: yesterday's window extended past midnight and we're still inside it.
  if (yesterday) {
    const yOpen = parseHHMM(yesterday.opensAt);
    const yClose = parseHHMM(yesterday.closesAt);
    if (yOpen != null && yClose != null && yClose <= yOpen && nowMin < yClose) {
      // Still inside the overnight window from yesterday.
      const y = addDays(p.year, p.month, p.day, 0);
      const closeAt = zonedToUtc(y.y, y.m, y.d, Math.floor(yClose / 60), yClose % 60, timezone);
      return { isOpen: true, reason: "open", nextChange: closeAt, todayRow: today };
    }
  }

  // Case B: today is fully closed.
  const tOpen = today ? parseHHMM(today.opensAt) : null;
  const tClose = today ? parseHHMM(today.closesAt) : null;
  if (!today || tOpen == null || tClose == null) {
    return {
      isOpen: false,
      reason: "closed_today",
      nextChange: nextOpeningFrom(hours, p, timezone),
      todayRow: today,
    };
  }

  // Case C: today has hours; figure out before/in/after.
  const overnight = tClose <= tOpen;
  if (nowMin < tOpen) {
    // Before today's open.
    const openAt = zonedToUtc(p.year, p.month, p.day, Math.floor(tOpen / 60), tOpen % 60, timezone);
    return { isOpen: false, reason: "before_open", nextChange: openAt, todayRow: today };
  }

  if (overnight) {
    // We're past today's opensAt and closesAt is tomorrow morning.
    const tomorrow = addDays(p.year, p.month, p.day, 1);
    const closeAt = zonedToUtc(tomorrow.y, tomorrow.m, tomorrow.d, Math.floor(tClose / 60), tClose % 60, timezone);
    return { isOpen: true, reason: "open", nextChange: closeAt, todayRow: today };
  }

  // Same-day window.
  if (nowMin < tClose) {
    const closeAt = zonedToUtc(p.year, p.month, p.day, Math.floor(tClose / 60), tClose % 60, timezone);
    return { isOpen: true, reason: "open", nextChange: closeAt, todayRow: today };
  }

  // After today's close.
  return {
    isOpen: false,
    reason: "after_close",
    nextChange: nextOpeningFrom(hours, p, timezone),
    todayRow: today,
  };
}

function nextOpeningFrom(
  hours: OpeningHoursRow[],
  p: { year: number; month: number; day: number; weekday: number },
  timezone: string
): Date | undefined {
  for (let offset = 1; offset <= 7; offset++) {
    const dow = (p.weekday + offset) % 7;
    const row = rowFor(hours, dow);
    const open = row ? parseHHMM(row.opensAt) : null;
    if (open == null) continue;
    const d = addDays(p.year, p.month, p.day, offset);
    return zonedToUtc(d.y, d.m, d.d, Math.floor(open / 60), open % 60, timezone);
  }
  return undefined;
}

/** Format a row's opens/closes pair for display, e.g. "8:00 – 18:00". Returns null if closed. */
export function formatRowRange(row: OpeningHoursRow | undefined): string | null {
  if (!row) return null;
  const o = parseHHMM(row.opensAt);
  const c = parseHHMM(row.closesAt);
  if (o == null || c == null) return null;
  return `${formatMinutes(o)} – ${formatMinutes(c)}`;
}

/** Format a Date's wall-clock hour:minute in the given TZ as "H:MM". */
export function formatTimeInTimeZone(at: Date, timezone: string = DEFAULT_TZ): string {
  const p = partsInTimeZone(at, timezone);
  return `${p.hour}:${p.minute.toString().padStart(2, "0")}`;
}

/** Returns true if `at` falls on a different calendar day than today, in the given TZ. */
export function isTomorrow(at: Date, now: Date, timezone: string = DEFAULT_TZ): boolean {
  const a = partsInTimeZone(at, timezone);
  const n = partsInTimeZone(now, timezone);
  return a.year !== n.year || a.month !== n.month || a.day !== n.day;
}

// --- Translation defaults & loader for the status/hours rendering surface. ---

export const STATUS_TRANSLATION_DEFAULTS = {
  EN: {
    "site.statusOpen": "OPEN NOW",
    "site.statusClosed": "CLOSED",
    "site.untilTime": "until {time}",
    "site.opensAt": "opens {time}",
    "site.opensTomorrow": "opens {time} tomorrow",
    "site.todayLabel": "TODAY",
    "site.weekendLabel": "WEEKEND",
  },
  NL: {
    "site.statusOpen": "NU OPEN",
    "site.statusClosed": "GESLOTEN",
    "site.untilTime": "tot {time}",
    "site.opensAt": "opent {time}",
    "site.opensTomorrow": "opent morgen om {time}",
    "site.todayLabel": "VANDAAG",
    "site.weekendLabel": "WEEKEND",
  },
  FR: {
    "site.statusOpen": "OUVERT",
    "site.statusClosed": "FERMÉ",
    "site.untilTime": "jusqu'à {time}",
    "site.opensAt": "ouvre à {time}",
    "site.opensTomorrow": "ouvre demain à {time}",
    "site.todayLabel": "AUJOURD'HUI",
    "site.weekendLabel": "WEEKEND",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type StatusTranslationKey = keyof typeof STATUS_TRANSLATION_DEFAULTS["EN"];

export const STATUS_TRANSLATION_KEYS = Object.keys(
  STATUS_TRANSLATION_DEFAULTS.EN
) as StatusTranslationKey[];

/**
 * Load the status/hours translation strings for `locale` with EN fallback, then
 * with hardcoded defaults as a final fallback. Returns a plain map keyed by namespace.
 */
export async function loadStatusTranslations(
  locale: Locale
): Promise<Record<StatusTranslationKey, string>> {
  const namespaces = STATUS_TRANSLATION_KEYS as readonly string[];
  const rows = await prisma.translation.findMany({
    where: {
      namespace: { in: namespaces as string[] },
      locale: locale === "EN" ? "EN" : { in: [locale, "EN"] },
    },
  });
  const byNs = new Map<string, { primary?: string; fallback?: string }>();
  for (const r of rows) {
    const slot = byNs.get(r.namespace) ?? {};
    if (r.locale === locale) slot.primary = r.value;
    else if (r.locale === "EN") slot.fallback = r.value;
    byNs.set(r.namespace, slot);
  }
  const out = {} as Record<StatusTranslationKey, string>;
  for (const k of STATUS_TRANSLATION_KEYS) {
    const slot = byNs.get(k);
    out[k] =
      slot?.primary ??
      slot?.fallback ??
      STATUS_TRANSLATION_DEFAULTS[locale][k] ??
      STATUS_TRANSLATION_DEFAULTS.EN[k];
  }
  return out;
}

/** Substitute {placeholder} tokens in a template. Missing keys are left as-is. */
export function tmpl(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

const DAY_LABELS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS_NL = ["Zon", "Maa", "Din", "Woe", "Don", "Vri", "Zat"];
const DAY_LABELS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function dayShortLabel(dow: number, locale: Locale): string {
  const arr =
    locale === "NL" ? DAY_LABELS_NL : locale === "FR" ? DAY_LABELS_FR : DAY_LABELS_EN;
  return arr[dow] ?? "";
}
