// Request-independent café identity and structured-data builder. Kept separate
// from lib/site.ts so the output can be verified without a Next request context.
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

export function buildCafeJsonLd(input: CafeJsonLdInput): Record<string, unknown> {
  const openingHoursSpecification = input.hours
    .filter((row) => row.opensAt && row.closesAt)
    .map((row) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${SCHEMA_DAYS[row.dayOfWeek]}`,
      opens: row.opensAt,
      closes: row.closesAt,
    }));

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${input.origin}/#cafe`,
    name: CAFE.name,
    description: input.description,
    url: `${input.origin}/`,
    image: input.image,
    logo: `${input.origin}/icon.svg`,
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
    sameAs: [input.instagramUrl].filter(Boolean),
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

export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
