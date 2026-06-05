import { cookies } from "next/headers";
import { getPublishedContent, getOpeningHours, getPhotos, getMenuForLocale } from "@/lib/db";
import { LOCALE_COOKIE, parseLocale, toPrismaLocale } from "@/lib/locale";
import { getRecentPostsForRender } from "@/lib/instagram";
import { computeIsOpen, loadStatusTranslations } from "@/lib/hours";
import { getOrigin, buildCafeJsonLd, jsonLdScript } from "@/lib/site";
import { Landing } from "./components/Landing";

const CAFE_TZ = "Europe/Brussels";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = await cookies();
  const locale = parseLocale(store.get(LOCALE_COOKIE)?.value);
  const prismaLocale = toPrismaLocale(locale);
  const [content, instaPosts, hoursRows, statusTranslations, bgPhotos, menu] = await Promise.all([
    getPublishedContent(prismaLocale),
    getRecentPostsForRender(9),
    getOpeningHours(),
    loadStatusTranslations(prismaLocale),
    getPhotos("background"),
    getMenuForLocale(prismaLocale),
  ]);

  const now = new Date();
  const status = computeIsOpen(hoursRows, now, CAFE_TZ);

  const origin = await getOrigin();
  const jsonLd = buildCafeJsonLd({
    origin,
    description: content.metaDescription,
    image: `${origin}/assets/og.png`,
    instagramUrl: content.instagramUrl,
    findUsUrl: content.findUsUrl,
    hours: hoursRows,
    hasMenu: menu.some((cat) => cat.items.length > 0),
    email: content.contactEmail || undefined,
    phone: content.contactPhone || undefined,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <Landing
        content={content}
        instaPosts={instaPosts}
        hoursRows={hoursRows}
        status={status}
        now={now}
        statusTranslations={statusTranslations}
        bgPaths={bgPhotos.map((p) => p.path)}
        menu={menu}
        locale={locale}
        prismaLocale={prismaLocale}
        beholdFeedId={process.env.BEHOLD_FEED_ID ?? ""}
      />
    </>
  );
}
