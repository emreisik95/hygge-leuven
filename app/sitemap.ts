import type { MetadataRoute } from "next";
import { getOrigin } from "@/lib/site";

// Single-page site: one canonical URL. The locale variants (EN/NL/FR) live on
// the same URL via a cookie, so they are advertised as hreflang alternates on
// the single entry rather than as separate <url> entries.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await getOrigin();
  return [
    {
      url: `${origin}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: `${origin}/`,
          nl: `${origin}/`,
          fr: `${origin}/`,
        },
      },
    },
  ];
}
