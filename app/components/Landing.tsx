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
import Map from "./MapClient";
import { LocaleSwitcher } from "./LocaleSwitcher";

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

function formatHoursWeekend(rows: OpeningHoursRow[], t: StatusT): string | null {
  const sat = rows.find((r) => r.dayOfWeek === 6);
  const sun = rows.find((r) => r.dayOfWeek === 0);
  const satRange = formatRowRange(sat);
  const sunRange = formatRowRange(sun);
  if (!satRange && !sunRange) return null;
  if (satRange && sunRange && satRange === sunRange) return `${t["site.weekendLabel"]} ${satRange}`;
  const parts: string[] = [];
  if (satRange) parts.push(`Sat ${satRange}`);
  if (sunRange) parts.push(`Sun ${sunRange}`);
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
}: LandingProps) {
  const hasMenu = menu.some((cat) => cat.items.length > 0);
  const bgLayers = bgPaths.length > 0 ? bgPaths : [c.bgImagePath];
  const bgDuration = Math.max(15, bgLayers.length * 8);
  const statusLabel = status.isOpen ? t["site.statusOpen"] : t["site.statusClosed"];
  const statusSub = formatStatusSub(status, now, t);
  const hoursTodayLine = formatHoursToday(status, t);
  const hoursWeekendLine = formatHoursWeekend(hoursRows, t);
  const dotAriaLabel = statusLabel;

  return (
    <main className="shell">
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
        <div className="hero">
          <div className="card">
            <h1 className="brand">{c.brandName}</h1>
            <p className="def-label">{c.definitionLabel}</p>
            <p className="def-body">{c.definitionBody}</p>
            <p className="tagline">{c.tagline}</p>
            <img src="/assets/people.png" alt="" aria-hidden="true" className="people" />
            {c.inviteLine || c.inviteSub ? (
              <div className="invite">
                {c.inviteLine ? <p className="invite-line">{c.inviteLine}</p> : null}
                {c.inviteSub ? <p className="invite-sub">{c.inviteSub}</p> : null}
              </div>
            ) : null}
            <a href="#insta" className="scroll-cue" aria-label="See more">
              <ArrowDown />
            </a>
          </div>
        </div>

        <footer className="foot">
          <div className="meta">
            <div className="meta-item">
              <span role="img" aria-label={dotAriaLabel} className={`dot ${status.isOpen ? "" : "closed"}`} />
              <div>
                <div className="label">{statusLabel}</div>
                {statusSub ? <div className="sub">{statusSub}</div> : null}
              </div>
            </div>
            <div className="meta-item">
              <PinIcon />
              <div>
                <div className="label">{c.addressLine1}</div>
                <div className="sub">{c.addressLine2}</div>
              </div>
            </div>
            <div className="meta-item">
              <ClockIcon />
              <div>
                <div className="label">{hoursTodayLine}</div>
                {hoursWeekendLine ? <div className="sub">{hoursWeekendLine}</div> : null}
              </div>
            </div>
          </div>

          <div className="actions">
            {hasMenu ? (
              <a href="#menu" className="btn btn-secondary">
                Menu <ArrowRight />
              </a>
            ) : null}
            <a href="#map" className="btn btn-secondary">
              {c.findUsLabel} <ArrowRight />
            </a>
            <a href="#insta" className="btn btn-primary">
              <InstagramIcon /> {c.instagramHandle}
            </a>
          </div>

          <LocaleSwitcher current={locale} />
        </footer>
      </section>

      <section className="pane pane-insta" id="insta" aria-labelledby="insta-heading">
        <div className="insta-wrap">
          <header className="insta-head">
            <h2 className="insta-heading" id="insta-heading">{c.instaHeading}</h2>
            {c.instaSub ? <p className="insta-sub">{c.instaSub}</p> : null}
          </header>

          <div className="insta-feed">
            {instaPosts.length > 0 ? (
              <ul className="insta-grid" role="list">
                {instaPosts.map((p) => {
                  const alt = p.caption ? truncate(p.caption, 80) : "Instagram post";
                  return (
                    <li key={p.id} className="insta-grid-item">
                      <a href={p.permalink} target="_blank" rel="noreferrer" className="insta-grid-link">
                        <img src={p.mediaUrl} alt={alt} loading="lazy" />
                        <span className="sr-only"> (opens in new tab)</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <a href={c.instagramUrl} target="_blank" rel="noreferrer" className="insta-empty">
                <p>Live feed loads here once a widget is connected.</p>
                <p className="insta-empty-sub">Tap to view @hygge.leuven on Instagram →</p>
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            )}
          </div>

          <div className="insta-cta">
            <a href={c.instagramUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
              <InstagramIcon /> {c.instaCtaLabel}<span className="sr-only"> (opens in new tab)</span>
            </a>
            <a href="#landing" className="back-link">↑ back to top</a>
          </div>
        </div>
      </section>

      {hasMenu ? (
        <section className="pane pane-menu" id="menu" aria-labelledby="menu-heading">
          <a href="#landing" className="skip-link">Skip menu</a>
          <div className="menu-wrap">
            <header className="menu-head">
              <h2 className="menu-heading" id="menu-heading">menu</h2>
              <p className="menu-sub">{c.tagline}</p>
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
                              <span className="menu-item-unavailable-tag">sold out</span>
                            )}
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
              <a href="#landing" className="back-link">↑ back to top</a>
            </div>
          </div>
        </section>
      ) : null}

      <section className="pane pane-map" id="map" aria-labelledby="map-heading">
        <a href="#landing" className="skip-link">Skip map</a>
        <Map lat={c.mapLat} lng={c.mapLng} zoom={c.mapZoom} label={c.brandName} />
        <div className="map-overlay">
          <div className="map-card">
            <h2 className="map-heading" id="map-heading">{c.mapHeading}</h2>
            <p className="map-sub">{c.mapSub}</p>
            <div className="map-actions">
              <a href={c.findUsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
                Open in Google Maps <ArrowRight /><span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
          </div>
          <a href="#landing" className="back-link map-back">↑ back to top</a>
        </div>
      </section>
    </main>
  );
}
