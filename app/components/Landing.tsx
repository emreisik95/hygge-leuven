import type { SiteContent, MenuCategoryView } from "@/lib/db";
import { formatPrice } from "@/lib/db";
import type { Locale } from "@prisma/client";
import type { LocaleCode } from "@/lib/locale";
import type { IsOpenResult, OpeningHoursRow, StatusTranslationKey } from "@/lib/hours";
import {
  formatRowRange,
  formatTimeInTimeZone,
  isTomorrow,
  tmpl,
} from "@/lib/hours";
import { OsmMap } from "./OsmMap";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { BeholdWidget } from "./BeholdWidget";
import type { Flags } from "@/lib/flags";
import { dietaryTags } from "@/lib/dietary";
import { FEATURE_LABELS } from "@/lib/feature-labels";
import { GlobalFeatures } from "./features/GlobalFeatures";
import { WeatherGreeting } from "./features/WeatherGreeting";
import { LiveClock } from "./features/LiveClock";
import { ShareButton } from "./features/ShareButton";
import { LoyaltyCard } from "./features/LoyaltyCard";
import { NewsletterSignup } from "./features/NewsletterSignup";
import { GiftCard } from "./features/GiftCard";
import { SpotifyEmbed } from "./features/SpotifyEmbed";
import { FaqSection } from "./features/FaqSection";
import { Testimonials } from "./features/Testimonials";
import { EventsList } from "./features/EventsList";
import { GalleryGrid } from "./features/GalleryGrid";
import { PressMentions } from "./features/PressMentions";
import { AboutStory } from "./features/AboutStory";
import { CoffeeOfWeek } from "./features/CoffeeOfWeek";
import { DrinkFinder } from "./features/DrinkFinder";
import { ValuesStrip } from "./features/ValuesStrip";
import { OpeningTimeline } from "./features/OpeningTimeline";
import { NeighbourhoodGuide } from "./features/NeighbourhoodGuide";
import { MenuSearch } from "./features/MenuSearch";
import { HoursCountdown } from "./features/HoursCountdown";
import { MenuQuickNav } from "./features/MenuQuickNav";
import { AllergenLegend } from "./features/AllergenLegend";
import { FavoriteStar } from "./features/FavoriteStar";
import { FavoritesBar } from "./features/FavoritesBar";
import { PrintMenu } from "./features/PrintMenu";
import { GroupBookingCta } from "./features/GroupBookingCta";
import { TakeawayCta } from "./features/TakeawayCta";
import { FeedbackPrompt } from "./features/FeedbackPrompt";

const CAFE_TZ = "Europe/Brussels";

type StatusT = Record<StatusTranslationKey, string>;

export type InstaPostView = {
  id: string;
  mediaUrl: string;
  permalink: string;
  caption: string | null;
};

export type LandingProps = {
  content: SiteContent;
  instaPosts: InstaPostView[];
  hoursRows: OpeningHoursRow[];
  status: IsOpenResult;
  now: Date;
  statusTranslations: StatusT;
  bgPaths: string[];
  menu: MenuCategoryView[];
  locale: LocaleCode;
  prismaLocale: Locale;
  preview?: boolean;
  beholdFeedId?: string;
  flags: Flags;
  origin: string;
  announcement?: string;
  // Feature copy/content resolved from settings (defaults applied); when omitted
  // the in-code FEATURE_LABELS / feature-content seeds are used.
  featureCopy?: typeof FEATURE_LABELS;
  faq?: { q: string; a: string }[];
  testimonials?: { quote: string; author: string }[];
  events?: { date: string; title: string; detail: string }[];
  spotifyPlaylistId?: string;
};

function PinIcon() {
  return (
    <svg aria-hidden="true" focusable={false} className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" focusable={false} className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg aria-hidden="true" focusable={false} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg aria-hidden="true" focusable={false} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 13l7 7 7-7" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" focusable={false} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" focusable={false} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" focusable={false} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";
}

function formatStatusSub(status: IsOpenResult, now: Date, t: StatusT): string | null {
  if (!status.nextChange) return null;
  const time = formatTimeInTimeZone(status.nextChange, CAFE_TZ);
  if (status.isOpen) return tmpl(t["site.untilTime"], { time });
  if (isTomorrow(status.nextChange, now, CAFE_TZ)) return tmpl(t["site.opensTomorrow"], { time });
  return tmpl(t["site.opensAt"], { time });
}

function formatHoursToday(status: IsOpenResult, t: StatusT): string {
  const range = formatRowRange(status.todayRow);
  return range ? `${t["site.todayLabel"]} ${range}` : t["site.todayLabel"];
}

const BCP47: Record<LocaleCode, string> = { EN: "en-GB", NL: "nl-BE", FR: "fr-BE" };

// Localised short weekday name (e.g. EN "Sat", NL "za", FR "sam.") for a given
// day-of-week index (0 = Sunday). Reference dates: 2024-01-07 is a Sunday.
function shortDayName(dow: number, locale: LocaleCode): string {
  const ref = new Date(Date.UTC(2024, 0, 7 + dow));
  return new Intl.DateTimeFormat(BCP47[locale], { weekday: "short", timeZone: "UTC" }).format(ref);
}

function formatHoursWeekend(rows: OpeningHoursRow[], t: StatusT, locale: LocaleCode): string | null {
  const sat = rows.find((r) => r.dayOfWeek === 6);
  const sun = rows.find((r) => r.dayOfWeek === 0);
  const satRange = formatRowRange(sat);
  const sunRange = formatRowRange(sun);
  if (!satRange && !sunRange) return null;
  if (satRange && sunRange && satRange === sunRange) return `${t["site.weekendLabel"]} ${satRange}`;
  const parts: string[] = [];
  if (satRange) parts.push(`${shortDayName(6, locale)} ${satRange}`);
  if (sunRange) parts.push(`${shortDayName(0, locale)} ${sunRange}`);
  return `${t["site.weekendLabel"]} ${parts.join(" · ")}`;
}

export function Landing({
  content: c,
  instaPosts,
  hoursRows,
  status,
  now,
  statusTranslations: t,
  bgPaths,
  menu,
  locale,
  prismaLocale,
  preview,
  beholdFeedId,
  flags,
  origin,
  announcement,
  featureCopy,
  faq,
  testimonials,
  events,
  spotifyPlaylistId,
}: LandingProps) {
  const L = featureCopy ?? FEATURE_LABELS;
  const hasMenu = menu.some((cat) => cat.items.length > 0);
  const hasEngageBlock =
    flags.loyaltyCard || flags.newsletterSignup || flags.giftCardCta || flags.spotifyEmbed;
  const bgLayers = bgPaths.length > 0 ? bgPaths : [c.bgImagePath];
  const bgDuration = Math.max(15, bgLayers.length * 8);
  const statusLabel = status.isOpen ? t["site.statusOpen"] : t["site.statusClosed"];
  const statusSub = formatStatusSub(status, now, t);
  const hoursTodayLine = formatHoursToday(status, t);
  const hoursWeekendLine = formatHoursWeekend(hoursRows, t, locale);
  const dotAriaLabel = statusLabel;

  return (
    <main className="shell">
      <GlobalFeatures
        flags={flags}
        announcementMessage={announcement}
        copy={L}
        locale={locale}
        phone={c.contactPhone}
      />

      {preview ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            padding: "8px 16px",
            background: "#b33",
            color: "#fff",
            fontSize: 13,
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Preview — showing unpublished draft.{" "}
          <a href="/admin" style={{ color: "#fff", textDecoration: "underline" }}>
            Back to admin
          </a>
        </div>
      ) : null}

      <div aria-hidden="true" className="bg">
        {bgLayers.map((src, i) =>
          bgLayers.length === 1 ? (
            <div
              key={`${src}-${i}`}
              className="bg-layer bg-static"
              style={{ backgroundImage: `url(${src})` }}
            />
          ) : (
            <div
              key={`${src}-${i}`}
              className="bg-layer"
              style={{
                backgroundImage: `url(${src})`,
                animationDuration: `${bgDuration}s`,
                animationDelay: `${(bgDuration / bgLayers.length) * i}s`,
              }}
            />
          ),
        )}
      </div>

      <section className="pane pane-landing" id="landing">
        <LocaleSwitcher current={locale} />
        <div className="hero">
          <div className="card">
            <h1 className="brand">{c.brandName}</h1>
            {c.showDefinition ? (
              <>
                <p className="def-label">{c.definitionLabel}</p>
                <p className="def-body">{c.definitionBody}</p>
              </>
            ) : null}
            {c.showTagline ? <p className="tagline">{c.tagline}</p> : null}
            <img src="/assets/people.png" alt="" aria-hidden="true" className="people" />
            {c.showInvite && (c.inviteLine || c.inviteSub) ? (
              <div className="invite">
                {c.inviteLine ? <p className="invite-line">{c.inviteLine}</p> : null}
                {c.inviteSub ? <p className="invite-sub">{c.inviteSub}</p> : null}
              </div>
            ) : null}
            {flags.weatherGreeting ? <WeatherGreeting template={L.weatherTemplate} /> : null}
            <a href="#insta" className="scroll-cue" aria-label={c.seeMoreLabel}>
              <ArrowDown />
            </a>
          </div>
        </div>

        <footer className="foot">
          {c.showStatus || c.showAddress || c.showHours ? (
            <div className="meta">
              {c.showStatus ? (
                <div className="meta-item">
                  <span role="img" aria-label={dotAriaLabel} className={`dot ${status.isOpen ? "" : "closed"}`} />
                  <div>
                    <div className="label">
                      {statusLabel}
                      {flags.liveClock ? <LiveClock locale={BCP47[locale]} /> : null}
                    </div>
                    {statusSub ? <div className="sub">{statusSub}</div> : null}
                    {flags.hoursCountdown ? (
                      <HoursCountdown
                        isOpen={status.isOpen}
                        nextChangeISO={status.nextChange?.toISOString()}
                        opensInTemplate={L.hoursCountdown.opensIn}
                        closesInTemplate={L.hoursCountdown.closesIn}
                      />
                    ) : null}
                  </div>
                </div>
              ) : null}
              {c.showAddress ? (
                <div className="meta-item">
                  <PinIcon />
                  <div>
                    <div className="label">{c.addressLine1}</div>
                    <div className="sub">{c.addressLine2}</div>
                  </div>
                </div>
              ) : null}
              {c.showHours ? (
                <div className="meta-item">
                  <ClockIcon />
                  <div>
                    <div className="label">{hoursTodayLine}</div>
                    {hoursWeekendLine ? <div className="sub">{hoursWeekendLine}</div> : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="actions">
            {hasMenu ? (
              <a href="#menu" className="btn btn-secondary">
                {c.menuNavLabel} <ArrowRight />
              </a>
            ) : null}
            <a href="#map" className="btn btn-secondary">
              {c.findUsLabel} <ArrowRight />
            </a>
            <a href="#insta" className="btn btn-primary">
              <InstagramIcon /> {c.instagramHandle}
            </a>
            {flags.socialShare ? (
              <ShareButton
                url={origin}
                title={c.brandName}
                shareLabel={L.share.share}
                copiedLabel={L.share.copied}
              />
            ) : null}
          </div>
        </footer>
      </section>

      {c.visionBody ? (
        <section className="pane pane-vision" id="vision" aria-labelledby="vision-heading">
          <div className="vision-wrap">
            <h2 className="vision-heading" id="vision-heading">{c.visionHeading}</h2>
            <p className="vision-body">{c.visionBody}</p>
            <a href="#landing" className="back-link">{c.backToTopLabel}</a>
          </div>
        </section>
      ) : null}

      <section className="pane pane-insta" id="insta" aria-labelledby="insta-heading">
        <div className="insta-wrap">
          <header className="insta-head">
            <h2 className="insta-heading" id="insta-heading">{c.instaHeading}</h2>
            {c.instaSub ? <p className="insta-sub">{c.instaSub}</p> : null}
          </header>

          <div className="insta-feed">
            {beholdFeedId ? (
              <BeholdWidget feedId={beholdFeedId} />
            ) : instaPosts.length > 0 ? (
              <ul className="insta-grid" role="list">
                {instaPosts.map((p) => {
                  const alt = p.caption ? truncate(p.caption, 80) : c.instagramHandle;
                  return (
                    <li key={p.id} className="insta-grid-item">
                      <a href={p.permalink} target="_blank" rel="noreferrer" className="insta-grid-link">
                        <img src={p.mediaUrl} alt={alt} loading="lazy" decoding="async" width={320} height={320} />
                        <span className="sr-only"> {c.newTabLabel}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <a href={c.instagramUrl} target="_blank" rel="noreferrer" className="insta-empty">
                <p>{c.instaEmptyLine}</p>
                <p className="insta-empty-sub">{c.instaEmptySub}</p>
                <span className="sr-only"> {c.newTabLabel}</span>
              </a>
            )}
          </div>

          <div className="insta-cta">
            <a href={c.instagramUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
              <InstagramIcon /> {c.instaCtaLabel}<span className="sr-only"> {c.newTabLabel}</span>
            </a>
            <a href="#landing" className="back-link">{c.backToTopLabel}</a>
          </div>
        </div>
      </section>

      {flags.testimonials ? <Testimonials heading={L.testimonialsHeading} items={testimonials} /> : null}
      {flags.eventsList ? <EventsList heading={L.eventsHeading} events={events} /> : null}
      {flags.faqSection ? <FaqSection heading={L.faqHeading} items={faq} /> : null}

      {flags.aboutStory ? <AboutStory heading={L.aboutStoryHeading} backToTopLabel={c.backToTopLabel} /> : null}
      {flags.valuesStrip ? <ValuesStrip heading={L.valuesHeading} backToTopLabel={c.backToTopLabel} /> : null}
      {flags.galleryGrid ? <GalleryGrid heading={L.galleryHeading} backToTopLabel={c.backToTopLabel} skipSectionLabel={c.skipSectionLabel} /> : null}
      {flags.coffeeOfWeek ? <CoffeeOfWeek heading={L.coffeeOfWeekHeading} backToTopLabel={c.backToTopLabel} /> : null}
      {flags.drinkFinder ? <DrinkFinder heading={L.drinkFinderHeading} backToTopLabel={c.backToTopLabel} /> : null}
      {flags.openingTimeline ? <OpeningTimeline heading={L.openingTimelineHeading} backToTopLabel={c.backToTopLabel} hoursRows={hoursRows} locale={locale} /> : null}
      {flags.pressMentions ? <PressMentions heading={L.pressMentionsHeading} backToTopLabel={c.backToTopLabel} /> : null}
      {flags.neighbourhoodGuide ? <NeighbourhoodGuide heading={L.neighbourhoodGuideHeading} backToTopLabel={c.backToTopLabel} /> : null}

      {hasEngageBlock ? (
        <section className="pane pane-engage" id="more" aria-label="More from the café">
          <div className="engage-wrap">
            {flags.newsletterSignup ? (
              <NewsletterSignup
                locale={prismaLocale}
                copy={{
                  heading: L.newsletter.heading,
                  body: L.newsletter.body,
                  placeholder: L.newsletter.placeholder,
                  button: L.newsletter.button,
                  success: L.newsletter.success,
                  invalid: L.newsletter.invalid,
                  error: L.newsletter.error,
                }}
              />
            ) : null}
            {flags.loyaltyCard ? (
              <LoyaltyCard
                heading={L.loyalty.heading}
                hint={L.loyalty.hint}
                rewardLine={L.loyalty.reward}
                resetLabel={L.loyalty.reset}
              />
            ) : null}
            {flags.giftCardCta ? (
              <GiftCard
                heading={L.giftCard.heading}
                body={L.giftCard.body}
                buttonLabel={L.giftCard.button}
                email={c.contactEmail}
                newTabLabel={c.newTabLabel}
              />
            ) : null}
            {flags.spotifyEmbed ? <SpotifyEmbed heading={L.spotifyHeading} playlistId={spotifyPlaylistId} /> : null}
          </div>
          <a href="#landing" className="back-link">{c.backToTopLabel}</a>
        </section>
      ) : null}

      {hasMenu ? (
        <section className="pane pane-menu" id="menu" aria-labelledby="menu-heading">
          <a href="#landing" className="skip-link">{c.skipSectionLabel}</a>
          <div className="menu-wrap">
            <header className="menu-head">
              <h2 className="menu-heading" id="menu-heading">{c.menuHeading}</h2>
              <p className="menu-sub">{c.tagline}</p>
              {flags.menuSearch ? (
                <MenuSearch
                  placeholder={L.menuSearch.placeholder}
                  noResults={L.menuSearch.noResults}
                />
              ) : null}
              {flags.menuQuickNav ? (
                <MenuQuickNav
                  categories={menu
                    .filter((cat) => cat.items.length > 0)
                    .map((cat) => ({ id: String(cat.id), label: cat.label }))}
                  label={L.menuQuickNav.label}
                />
              ) : null}
              {flags.menuFavorites ? (
                <FavoritesBar
                  summaryOne={L.menuFavorites.summaryOne}
                  summaryMany={L.menuFavorites.summaryMany}
                  clearLabel={L.menuFavorites.clear}
                />
              ) : null}
              {flags.allergenLegend ? (
                <AllergenLegend heading={L.allergen.heading} note={L.allergen.note} />
              ) : null}
            </header>

            <div className="menu-grid">
              {menu.map((cat) => (
                <section
                  key={cat.id}
                  className="menu-category"
                  aria-labelledby={`menu-cat-${cat.id}`}
                >
                  <h3 className="menu-category-heading" id={`menu-cat-${cat.id}`}>
                    {cat.label}
                  </h3>
                  {cat.items.length === 0 ? (
                    <p className="menu-empty">—</p>
                  ) : (
                    <ul className="menu-items" role="list">
                      {cat.items.map((it) => (
                        <li
                          key={it.id}
                          className={
                            it.available ? "menu-item" : "menu-item menu-item-unavailable"
                          }
                        >
                          {it.photoPath ? (
                            <img
                              src={it.photoPath}
                              alt={it.photoAlt}
                              className="menu-item-photo"
                              loading="lazy"
                            />
                          ) : null}
                          <span className="menu-item-title">
                            {it.name || <em>—</em>}
                            {it.available ? null : (
                              <span className="menu-item-unavailable-tag">{c.soldOutLabel}</span>
                            )}
                            {flags.menuDietaryTags
                              ? dietaryTags(it.name, it.description).map((tag) => (
                                  <span
                                    key={tag.code}
                                    className="diet-tag"
                                    title={tag.label}
                                    aria-label={tag.label}
                                  >
                                    {tag.code}
                                  </span>
                                ))
                              : null}
                            {flags.menuFavorites ? (
                              <FavoriteStar
                                id={`${cat.id}:${it.id}`}
                                name={it.name || "this item"}
                                addLabel={L.menuFavorites.add}
                                removeLabel={L.menuFavorites.remove}
                              />
                            ) : null}
                          </span>
                          <span className="menu-price">
                            {formatPrice(it.priceCents, prismaLocale)}
                          </span>
                          {it.description ? <p className="menu-item-desc">{it.description}</p> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <div className="menu-cta">
              {flags.printMenu ? <PrintMenu label={L.printMenu.label} /> : null}
              <a href="#landing" className="back-link">{c.backToTopLabel}</a>
            </div>
          </div>
        </section>
      ) : null}

      <section className="pane pane-map" id="map" aria-labelledby="map-heading">
        <a href="#landing" className="skip-link">{c.skipSectionLabel}</a>
        <OsmMap lat={c.mapLat} lng={c.mapLng} zoom={c.mapZoom} label={c.brandName} />
        <div className="map-overlay">
          <div className="map-card">
            <h2 className="map-heading" id="map-heading">{c.mapHeading}</h2>
            <p className="map-sub">{c.mapSub}</p>

            <div className="map-contact" aria-label={c.contactHeading}>
              <span className="map-contact-label">{c.contactHeading}</span>
              <ul className="map-contact-list" role="list">
                <li>
                  <a href={c.findUsUrl} target="_blank" rel="noreferrer" className="map-contact-link">
                    <PinIcon /> {c.mapSub}<span className="sr-only"> {c.newTabLabel}</span>
                  </a>
                </li>
                <li>
                  <a href={c.instagramUrl} target="_blank" rel="noreferrer" className="map-contact-link">
                    <InstagramIcon /> {c.instagramHandle}<span className="sr-only"> {c.newTabLabel}</span>
                  </a>
                </li>
                {c.contactEmail ? (
                  <li>
                    <a href={`mailto:${c.contactEmail}`} className="map-contact-link">
                      <MailIcon /> {c.contactEmail}
                    </a>
                  </li>
                ) : null}
                {c.contactPhone ? (
                  <li>
                    <a href={`tel:${c.contactPhone.replace(/[^\d+]/g, "")}`} className="map-contact-link">
                      <PhoneIcon /> {c.contactPhone}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>

            <div className="map-actions">
              <a href={c.findUsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
                {c.mapsLinkLabel} <ArrowRight /><span className="sr-only"> {c.newTabLabel}</span>
              </a>
              {flags.mapDirectionsCta ? (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${c.mapLat},${c.mapLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                >
                  {L.directions} <ArrowRight /><span className="sr-only"> {c.newTabLabel}</span>
                </a>
              ) : null}
              {flags.reservationCta && c.contactEmail ? (
                <a
                  href={`mailto:${c.contactEmail}?subject=${encodeURIComponent(L.reservation.subject)}`}
                  className="btn btn-primary"
                >
                  {L.reservation.label}
                </a>
              ) : null}
              {flags.groupBookingCta && c.contactEmail ? (
                <GroupBookingCta
                  label={L.groupBooking.label}
                  email={c.contactEmail}
                  subject={L.groupBooking.subject}
                />
              ) : null}
              {flags.takeawayCta && (c.contactPhone || c.contactEmail) ? (
                <TakeawayCta
                  label={L.takeaway.label}
                  phone={c.contactPhone}
                  email={c.contactEmail}
                  subject={L.takeaway.subject}
                />
              ) : null}
            </div>
          </div>
          <a href="#landing" className="back-link map-back">{c.backToTopLabel}</a>
        </div>
      </section>

      {flags.feedbackPrompt && c.contactEmail ? (
        <FeedbackPrompt
          heading={L.feedback.heading}
          body={L.feedback.body}
          button={L.feedback.button}
          email={c.contactEmail}
          subject={L.feedback.subject}
          dismissLabel={L.feedback.dismiss}
        />
      ) : null}
    </main>
  );
}
