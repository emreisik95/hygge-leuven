import { cookies } from "next/headers";
import { getDraftContent, getOpeningHours, getPhotos, getTranslation } from "@/lib/db";
import { ANNOUNCEMENT_NS, FEATURE_LABELS } from "@/lib/feature-labels";
import { LOCALE_COOKIE, parseLocale, toPrismaLocale } from "@/lib/locale";
import { getRecentPostsForRender } from "@/lib/instagram";
import { computeIsOpen, loadStatusTranslations } from "@/lib/hours";
import { getOrigin } from "@/lib/site";
import { loadFlags } from "@/lib/flags";
import { resolveFeatureSettings } from "@/lib/feature-settings";
import { findCupArtSrc, findCupStickerSrc } from "@/lib/images";
import { Landing } from "@/app/components/Landing";
import { AdminPageIntro } from "@/app/admin/components/AdminPageIntro";
import { AdminPreviewFrame } from "@/app/admin/components/AdminPreviewFrame";

const CAFE_TZ = "Europe/Brussels";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preview — admin — hygge" };

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const { embed } = await searchParams;

  if (embed === "1") {
    return (
      <div className="admin-preview-embed">
        <DraftPreviewLanding />
      </div>
    );
  }

  return (
    <>
      <AdminPageIntro
        ticket="12 / Review window"
        title="Preview"
        description="Check the current admin draft at phone or desktop width before publishing it."
        icon="/admin-icons/preview-service-counter-2.png"
        breadcrumb={{ href: "/admin/more", label: "More" }}
        status={<span className="admin-ticket-status" data-tone="draft">Draft view</span>}
      />

      <div className="admin-preview-notice" role="note">
        <strong>Current admin draft</strong>
        <p>
          This preview shows the current admin draft. The live site keeps its published state until you publish.
        </p>
      </div>

      <AdminPreviewFrame src="/admin/preview?embed=1" />
    </>
  );
}

async function DraftPreviewLanding() {
  const store = await cookies();
  const locale = parseLocale(store.get(LOCALE_COOKIE)?.value);
  const prismaLocale = toPrismaLocale(locale);
  const [content, instaPosts, hoursRows, statusTranslations, bgPhotos, flags, origin, announcement, featureSettings, stickerSrc] =
    await Promise.all([
      getDraftContent(prismaLocale),
      getRecentPostsForRender(9),
      getOpeningHours(),
      loadStatusTranslations(prismaLocale),
      getPhotos("background"),
      loadFlags(),
      getOrigin(),
      getTranslation(ANNOUNCEMENT_NS, prismaLocale, FEATURE_LABELS.announcement.message),
      resolveFeatureSettings(),
      findCupStickerSrc(),
    ]);
  const cupSrc = await findCupArtSrc();

  const now = new Date();
  const status = computeIsOpen(hoursRows, now, CAFE_TZ);

  return (
    <Landing
      content={content}
      instaPosts={instaPosts}
      hoursRows={hoursRows}
      status={status}
      now={now}
      statusTranslations={statusTranslations}
      bgPaths={bgPhotos.map((p) => p.path)}
      locale={locale}
      prismaLocale={prismaLocale}
      preview
      beholdFeedId={process.env.BEHOLD_FEED_ID ?? ""}
      flags={flags}
      origin={origin}
      announcement={announcement}
      featureCopy={featureSettings.copy}
      faq={featureSettings.faq}
      testimonials={featureSettings.testimonials}
      events={featureSettings.events}
      spotifyPlaylistId={featureSettings.spotifyPlaylistId}
      cupSrc={cupSrc}
      stickerSrc={stickerSrc}
    />
  );
}
