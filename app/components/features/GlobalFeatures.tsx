"use client";

import type { Flags } from "@/lib/flags";
import { FEATURE_LABELS as L } from "@/lib/feature-labels";
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
export function GlobalFeatures({ flags }: { flags: Flags }) {
  return (
    <>
      {flags.announcementBanner ? (
        <AnnouncementBanner message={L.announcement.message} closeLabel={L.announcement.close} />
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
