import type { MetadataRoute } from "next";
import { getOrigin } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await getOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin + API are not public content; keep them out of the index.
      disallow: ["/admin", "/api"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
