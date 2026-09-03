import { z } from "zod";

const GA4_ID = /\bG-[A-Z0-9]{4,32}\b/g;
const MAX_GOOGLE_TAG_INPUT = 5_000;

export const GoogleAnalyticsInputSchema = z
  .string()
  .trim()
  .max(MAX_GOOGLE_TAG_INPUT, "Google tag code is too long")
  .transform((raw) => {
    if (!raw) return "";
    const ids = [...new Set(raw.toUpperCase().match(GA4_ID) ?? [])];
    return ids.length === 1 ? ids[0] : null;
  })
  .refine((value): value is string => value !== null, {
    message: "Paste one GA4 measurement ID starting with G-",
  });
