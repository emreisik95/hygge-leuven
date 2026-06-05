"use client";

import type { Flags } from "@/lib/flags";
import { FEATURE_LABELS } from "@/lib/feature-labels";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { ScrollProgress } from "./ScrollProgress";
import { BackToTop } from "./BackToTop";
import { CookieConsent } from "./CookieConsent";
import { ThemeToggle } from "./ThemeToggle";
import { PwaInstall } from "./PwaInstall";
import { SeasonalAccent } from "./SeasonalAccent";
import { Lightbox } from "./Lightbox";

// Single mount point for the page-wide client "chrome" features. Each renders
// only when its flag is on; the floating controls share a fixed stack via CSS
// so they don't overlap.
export function GlobalFeatures({
  flags,
  announcementMessage,
  copy,
}: {
  flags: Flags;
  // Resolved from translations (EN-fallback) server-side; defaults to the seed.
  announcementMessage?: string;
  // Feature copy resolved from settings; defaults to the in-code seed.
  copy?: typeof FEATURE_LABELS;
}) {
  const L = copy ?? FEATURE_LABELS;
  return (
    <>
      {flags.announcementBanner ? (
        <AnnouncementBanner
          message={announcementMessage ?? L.announcement.message}
          closeLabel={L.announcement.close}
        />
      ) : null}
      {flags.scrollProgress ? <ScrollProgress /> : null}
      {flags.seasonalAccent ? <SeasonalAccent /> : null}
      {flags.photoLightbox ? <Lightbox closeLabel={L.lightboxClose} /> : null}

      <div className="fab-stack" aria-label="Page controls">
        {flags.pwaInstall ? <PwaInstall label={L.pwaInstall} /> : null}
        {flags.darkMode ? <ThemeToggle lightLabel={L.theme.toLight} darkLabel={L.theme.toDark} /> : null}
        {flags.backToTop ? <BackToTop label={L.backToTop} /> : null}
      </div>

      {flags.cookieConsent ? (
        <CookieConsent message={L.cookie.message} acceptLabel={L.cookie.accept} />
      ) : null}
    </>
  );
}
