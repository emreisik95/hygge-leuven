import { headers } from "next/headers";

// Single source of truth for the site's public origin and structured data.
// The origin is derived from the incoming request so canonical / Open Graph /
// JSON-LD URLs are correct on whatever domain the container is served from,
// with NEXT_PUBLIC_SITE_URL as an explicit override for builds behind proxies
// that strip forwarded headers.

export async function getOrigin(): Promise<string> {
  const override = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (override) return override;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Verified NAP (name / address / phone) constants. Kept here so every surface —
// JSON-LD, meta, the rendered address — stays byte-consistent, which is what
// local search ranking rewards.
export const CAFE = {
  name: "hygge",
  legalName: "hygge",
  street: "Naamsestraat 55",
  postalCode: "3000",
  locality: "Leuven",
  region: "Vlaams-Brabant",
  country: "BE",
  lat: 50.876568,
  lng: 4.700649,
  priceRange: "€€",
  currenciesAccepted: "EUR",
  servesCuisine: ["Coffee", "Danish", "Pastry", "Brunch"],
} as const;

const SCHEMA_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

type HoursRowLite = {
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
};

type CafeJsonLdInput = {
  origin: string;
  description: string;
  image: string;
  instagramUrl: string;
  findUsUrl: string;
  hours: HoursRowLite[];
  hasMenu: boolean;
  email?: string;
  phone?: string;
};

// CafeOrCoffeeShop is the most specific schema.org type for a café and is a
// recognised Google rich-result entity. We include everything Google reads for
// a local business: address, geo, hours, sameAs, price, cuisine, contact.
export function buildCafeJsonLd(input: CafeJsonLdInput): Record<string, unknown> {
  const openingHoursSpecification = input.hours
    .filter((r) => r.opensAt && r.closesAt)
    .map((r) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${SCHEMA_DAYS[r.dayOfWeek]}`,
      opens: r.opensAt,
      closes: r.closesAt,
    }));

  const sameAs = [input.instagramUrl].filter(Boolean);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${input.origin}/#cafe`,
    name: CAFE.name,
    description: input.description,
    url: `${input.origin}/`,
    image: input.image,
    logo: `${input.origin}/icon.svg`,
    priceRange: CAFE.priceRange,
    currenciesAccepted: CAFE.currenciesAccepted,
    servesCuisine: [...CAFE.servesCuisine],
    address: {
      "@type": "PostalAddress",
      streetAddress: CAFE.street,
      postalCode: CAFE.postalCode,
      addressLocality: CAFE.locality,
      addressRegion: CAFE.region,
      addressCountry: CAFE.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: CAFE.lat,
      longitude: CAFE.lng,
    },
    hasMap: input.findUsUrl,
    sameAs,
    areaServed: { "@type": "City", name: CAFE.locality },
  };

  if (openingHoursSpecification.length > 0) {
    jsonLd.openingHoursSpecification = openingHoursSpecification;
  }
  if (input.hasMenu) jsonLd.hasMenu = `${input.origin}/#menu`;
  if (input.email) jsonLd.email = input.email;
  if (input.phone) jsonLd.telephone = input.phone;

  return jsonLd;
}

// Serialise JSON-LD for inline injection, escaping `<` to neutralise any XSS via
// admin-editable strings (per Next.js JSON-LD guidance).
export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
