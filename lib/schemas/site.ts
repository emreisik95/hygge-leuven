import { z } from "zod";

// Validates the constrained fields of the site-content editor. Free-form text
// fields (hero copy, headings, …) carry no constraints and are persisted as-is,
// so they are intentionally absent here. All inputs arrive as strings from
// FormData; empty string means "leave blank" and is allowed for every field.

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalHttpUrl = z.union([
  z.literal(""),
  z.string().trim().refine(isHttpUrl, "Must be a valid http(s) URL"),
]);

const optionalNumber = (min: number, max: number, rangeMsg: string, integer = false) =>
  z.union([
    z.literal(""),
    (() => {
      let n = z.coerce.number({ message: "Must be a number" });
      if (integer) n = n.int("Must be a whole number");
      return n.min(min, rangeMsg).max(max, rangeMsg);
    })(),
  ]);

export const SiteContentSchema = z.object({
  findUsUrl: optionalHttpUrl,
  instagramUrl: optionalHttpUrl,
  mapLat: optionalNumber(-90, 90, "Must be between -90 and 90"),
  mapLng: optionalNumber(-180, 180, "Must be between -180 and 180"),
  mapZoom: optionalNumber(1, 22, "Must be between 1 and 22", true),
});

export type SiteContentInput = z.infer<typeof SiteContentSchema>;
