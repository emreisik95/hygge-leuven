import type { Locale } from "@prisma/client";

export const LOCALES = ["EN", "NL", "FR"] as const;
export type LocaleCode = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: LocaleCode = "EN";

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  EN: "EN",
  NL: "NL",
  FR: "FR",
};

export const LOCALE_NAMES: Record<LocaleCode, string> = {
  EN: "English",
  NL: "Nederlands",
  FR: "Français",
};

export const LOCALE_COOKIE = "hygge_locale";

export function isLocale(value: unknown): value is LocaleCode {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function parseLocale(value: unknown): LocaleCode {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function toPrismaLocale(value: LocaleCode): Locale {
  return value as Locale;
}
