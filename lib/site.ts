import { headers } from "next/headers";

export { CAFE, buildCafeJsonLd, jsonLdScript } from "@/lib/cafe-jsonld";

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
