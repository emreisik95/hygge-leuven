"use client";

import type { Flags } from "@/lib/flags";
import type { LocaleCode } from "@/lib/locale";
import { FEATURE_LABELS } from "@/lib/feature-labels";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { ScrollProgress } from "./ScrollProgress";
import { BackToTop } from "./BackToTop";
import { CookieConsent } from "./CookieConsent";
import { ThemeToggle } from "./ThemeToggle";
import { PwaInstall } from "./PwaInstall";
import { SeasonalAccent } from "./SeasonalAccent";
import { Lightbox } from "./Lightbox";
import { SectionNavDots } from "./SectionNavDots";
import { RevealOnScroll } from "./RevealOnScroll";
import { A11yToolbar } from "./A11yToolbar";
import { LocaleSuggest } from "./LocaleSuggest";
import { CommandPalette } from "./CommandPalette";
import { SeasonalParticles } from "./SeasonalParticles";
import { WeatherRecommend } from "./WeatherRecommend";
import { WhatsappCta } from "./WhatsappCta";

// Single mount point for the page-wide client "chrome" features. Each renders
// only when its flag is on; the floating controls share a fixed stack via CSS
// so they don't overlap.
export function GlobalFeatures({
  flags,
  announcementMessage,
  copy,
  locale,
  phone,
}: {
  flags: Flags;
  // Resolved from translations (EN-fallback) server-side; defaults to the seed.
  announcementMessage?: string;
  // Feature copy resolved from settings; defaults to the in-code seed.
  copy?: typeof FEATURE_LABELS;
  // Active locale — drives the Dutch/French language suggestion.
  locale: LocaleCode;
  // Café contact number for the WhatsApp button; empty string hides it.
  phone?: string;
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
      {flags.seasonalParticles ? <SeasonalParticles /> : null}
      {flags.photoLightbox ? <Lightbox closeLabel={L.lightboxClose} /> : null}
      {flags.revealOnScroll ? <RevealOnScroll /> : null}
      {flags.sectionNavDots ? <SectionNavDots labels={L.sectionNav} /> : null}
      {flags.commandPalette ? (
        <CommandPalette
          hint={L.commandPalette.hint}
          placeholder={L.commandPalette.placeholder}
          empty={L.commandPalette.empty}
          sections={L.commandPalette.sections}
        />
      ) : null}
      {flags.localeSuggest ? (
        <LocaleSuggest
          locale={locale}
          message={L.localeSuggest.message}
          actionLabel={L.localeSuggest.action}
          closeLabel={L.localeSuggest.close}
        />
      ) : null}
      {flags.weatherRecommend ? (
        <WeatherRecommend
          hot={L.weatherRecommend.hot}
          cold={L.weatherRecommend.cold}
          rainy={L.weatherRecommend.rainy}
          dismiss={L.weatherRecommend.dismiss}
        />
      ) : null}

      <div className="fab-stack" aria-label="Page controls">
        {flags.pwaInstall ? <PwaInstall label={L.pwaInstall} /> : null}
        {flags.darkMode ? <ThemeToggle lightLabel={L.theme.toLight} darkLabel={L.theme.toDark} /> : null}
        {flags.a11yToolbar ? <A11yToolbar copy={L.a11y} /> : null}
        {flags.whatsappCta && phone ? <WhatsappCta phone={phone} label={L.whatsapp.label} /> : null}
        {flags.backToTop ? <BackToTop label={L.backToTop} /> : null}
      </div>

      {flags.cookieConsent ? (
        <CookieConsent message={L.cookie.message} acceptLabel={L.cookie.accept} />
      ) : null}
    </>
  );
}
