import { headers } from "next/headers";
import { resolvePublicOrigin } from "@/lib/public-origin";

export { CAFE, buildCafeJsonLd, jsonLdScript } from "@/lib/cafe-jsonld";

// Single source of truth for the site's public origin and structured data.
// The origin is derived from the incoming request so canonical / Open Graph /
// JSON-LD URLs are correct on whatever domain the container is served from,
// with NEXT_PUBLIC_SITE_URL as an explicit override for builds behind proxies
// that strip forwarded headers.

export async function getOrigin(): Promise<string> {
  const h = await headers();
  return resolvePublicOrigin({
    nodeEnv: process.env.NODE_ENV,
    override: process.env.NEXT_PUBLIC_SITE_URL,
    forwardedHost: h.get("x-forwarded-host"),
    host: h.get("host"),
    forwardedProto: h.get("x-forwarded-proto"),
  });
}
