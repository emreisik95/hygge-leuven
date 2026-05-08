import SmoothScroll from "./smooth-scroll";
import type { Locale, Messages } from "./messages";

const IG_URL = "https://www.instagram.com/hygge.leuven/";
const MAPS_URL =
  "https://www.google.com/maps?q=Naamsestraat+55P,+3000+Leuven,+Belgium";

function ArrowScribble({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      className={className}
      width="74"
      height="36"
      viewBox="0 0 74 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      <path d="M2 18 C 14 6, 32 6, 46 16 C 54 22, 60 26, 68 24" />
      <path d="M62 18 L 68 24 L 62 30" />
    </svg>
  );
}

function Asterisk({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M7 1 V13" />
      <path d="M1 7 H13" />
      <path d="M2.5 2.5 L11.5 11.5" />
      <path d="M11.5 2.5 L2.5 11.5" />
    </svg>
  );
}

function HandUnderline({ width = 220 }: { width?: number }) {
  return (
    <svg
      className="hand-underline"
      width={width}
      height="14"
      viewBox={`0 0 ${width} 14`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d={`M 4 8 C ${width * 0.25} 3, ${width * 0.5} 12, ${
          width * 0.75
        } 6 S ${width - 4} 9, ${width - 4} 8`}
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function LangSwitch({ locale }: { locale: Locale }) {
  return (
    <div className="lang-switch" aria-label="Language">
      <a
        href="/"
        className={locale === "en" ? "active" : ""}
        aria-current={locale === "en" ? "page" : undefined}
      >
        EN
      </a>
      <span className="sep" aria-hidden="true">
        ·
      </span>
      <a
        href="/nl"
        className={locale === "nl" ? "active" : ""}
        aria-current={locale === "nl" ? "page" : undefined}
        hrefLang="nl"
      >
        NL
      </a>
    </div>
  );
}

export default function PageContent({
  t,
  locale,
}: {
  t: Messages;
  locale: Locale;
}) {
  return (
    <>
      <SmoothScroll />
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Top bar */}
      <header className="frame">
        <div className="bar">
          <a href={locale === "nl" ? "/nl#top" : "#top"} className="mark reveal d-1">
            <span className="word">hygge</span>
            <span className="sub">{t.meta.title.replace(/^hygge — /, "")}</span>
          </a>
          <nav className="top-nav reveal d-2" aria-label="Primary">
            <a href="#story">{t.nav.story}</a>
            <a href="#serve">{t.nav.serve}</a>
            <a href="#visit">{t.nav.visit}</a>
            <a href={IG_URL} target="_blank" rel="noopener noreferrer">
              {t.nav.instagram}
            </a>
          </nav>
          <div className="bar-end reveal d-3">
            <LangSwitch locale={locale} />
            <a href="#visit" className="pill solid">
              <span>{t.nav.visitUs}</span>
              <span className="arr">→</span>
            </a>
          </div>
        </div>
      </header>

      <div className="rule" />

      {/* Status row */}
      <div className="frame">
        <div className="status-row">
          <span className="left">
            <span className="pulse" />
            {t.status.open}
          </span>
          <span>{t.status.address}</span>
        </div>
      </div>

      <div className="rule" />

      <main id="main">
        {/* HERO */}
        <section className="frame" id="top">
          <div className="hero">
            <div className="hero-left">
              <p className="tagline reveal d-1">
                {t.hero.tagline1}
                <br />
                {t.hero.tagline2}
              </p>
              <h1 className="wordmark reveal d-2">hygge</h1>
              <span className="marginalia opened">
                {t.status.open.split(" · ")[0]}
                <br />
                <span className="scribble">
                  <ArrowScribble flip />
                </span>
              </span>
              <div className="pron reveal d-3">
                <span className="gloss">{t.hero.pronGloss}</span>
              </div>
            </div>

            <div className="hero-mid reveal d-2">
              <div className="illu">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/figures.png"
                  alt="two figures carrying a coffee cup and a slice of cake"
                  width={1200}
                  height={1200}
                  fetchPriority="high"
                />
              </div>
            </div>

            <div className="hero-right reveal d-4">
              <h2 className="headline">{t.hero.headline}</h2>
              <p className="copy">{t.hero.copy}</p>
              <ul className="hours-mini">
                <li>
                  <span className="day">{t.hero.today}</span>
                  <span className="time">{t.hero.todayHours}</span>
                </li>
                <li>
                  <span className="day">{t.hero.weekend}</span>
                  <span className="time">{t.hero.weekendHours}</span>
                </li>
              </ul>
              <div className="ctas">
                <a href="#visit" className="pill">
                  <span>{t.nav.findUs}</span>
                  <span className="arr">→</span>
                </a>
                <a
                  href={IG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill clay"
                >
                  <InstagramIcon />
                  <span>@hygge.leuven</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="marquee" id="serve" aria-hidden="true">
          <div className="marquee-track">
            {Array.from({ length: 2 }).map((_, dup) => (
              <div className="marquee-item" key={dup}>
                {t.marquee.map((item, i) => (
                  <span key={`${dup}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 56 }}>
                    <span>{item}</span>
                    <span className="marquee-dot" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <section className="frame" id="story">
          <div className="story">
            <div className="story-text">
              <div className="num numeral">{t.story.num}</div>
              <h2>
                {t.story.h2Pre}
                <em>{t.story.h2Em}</em>
              </h2>
              <HandUnderline width={260} />
              <p className="lead">{t.story.p1}</p>
              <p>{t.story.p2}</p>
              <p>{t.story.p3}</p>
            </div>
            <div className="story-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="photo"
                src="/assets/coffee.png"
                alt="a top-down cup of black coffee"
                width={1200}
                height={1200}
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <div className="rule" />

        {/* Pillars */}
        <section className="frame">
          <div className="pillars">
            <div className="pillars-head">
              <div>
                <div className="numeral">{t.pillars.num}</div>
                <h2>
                  {t.pillars.h2Pre}
                  <em>{t.pillars.h2Em}</em>
                </h2>
                <HandUnderline width={300} />
              </div>
              <p className="aside">
                <Asterisk /> {t.pillars.aside}
              </p>
            </div>
            <div className="pillars-grid">
              {t.pillars.items.map((item, i) => {
                const src =
                  i === 0
                    ? "/assets/coffee.png"
                    : i === 1
                    ? "/assets/smorrebrod-photo.png"
                    : "/assets/bun-photo.png";
                const w = i === 0 ? 1200 : 800;
                return (
                  <article className="pillar" key={i}>
                    <div className="num numeral">{item.eyebrow}</div>
                    <div className="pillar-icon">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        width={w}
                        height={w}
                        loading="lazy"
                      />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <div className="rule" />

        {/* Visit */}
        <section className="frame" id="visit">
          <div className="visit">
            <div className="visit-info">
              <div className="num numeral">{t.visit.num}</div>
              <h2>
                {t.visit.h2Pre}
                <em>{t.visit.h2Em}</em>
              </h2>
              <HandUnderline width={340} />
              <p className="address">
                Naamsestraat 55P
                <br />
                3000 Leuven · Belgium
              </p>
              <p className="address-meta">{t.visit.addressMeta}</p>

              <div className="visit-block">
                <div>
                  <h4>{t.visit.hours}</h4>
                  <ul className="hours">
                    <li>
                      <span className="day">{t.visit.days.mt}</span>
                      <span className="time">{t.visit.hoursLines.mt}</span>
                    </li>
                    <li>
                      <span className="day">{t.visit.days.fr}</span>
                      <span className="time">{t.visit.hoursLines.fr}</span>
                    </li>
                    <li>
                      <span className="day">{t.visit.days.sa}</span>
                      <span className="time">{t.visit.hoursLines.sa}</span>
                    </li>
                    <li>
                      <span className="day">{t.visit.days.su}</span>
                      <span className="time">{t.visit.hoursLines.su}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4>{t.visit.sayHej}</h4>
                  <ul className="hours">
                    <li>
                      <a href="mailto:hej@hygge-leuven.be">hej@hygge-leuven.be</a>
                    </li>
                    <li>
                      <a href={IG_URL} target="_blank" rel="noopener noreferrer">
                        @hygge.leuven
                      </a>
                    </li>
                  </ul>
                  <div className="visit-actions" style={{ marginTop: 18 }}>
                    <a
                      className="pill"
                      href={MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{t.visit.openInMaps}</span>
                      <span className="arr">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="map-frame">
              <iframe
                title="Hygge on the map — Naamsestraat 55P, Leuven"
                loading="lazy"
                src="https://www.openstreetmap.org/export/embed.html?bbox=4.69820%2C50.87505%2C4.70350%2C50.87740&layer=mapnik&marker=50.87625%2C4.70085"
              />
              <span className="map-pin-floating" aria-hidden="true">
                <span className="dot" />
                <span className="label">hygge · Naamsestraat 55P</span>
              </span>
              <a
                className="map-link"
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Hygge in Google Maps"
              />
            </div>
          </div>
        </section>

        {/* Feed */}
        <section className="frame">
          <div className="feed">
            <div className="feed-intro">
              <div className="numeral">{t.feed.num}</div>
              <h2>{t.feed.h2}</h2>
              <HandUnderline width={320} />
              <p>{t.feed.body}</p>
              <a
                className="pill solid"
                href={IG_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
                <span>@hygge.leuven</span>
                <span className="arr">→</span>
              </a>
              <p className="feed-tags">
                <span>#hygge</span>
                <span>#leuven</span>
                <span>#smørrebrød</span>
                <span>#specialtycoffee</span>
              </p>
            </div>

            <a
              className="ig-card"
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the @hygge.leuven Instagram profile"
            >
              <div className="ig-head">
                <span className="ig-avatar" aria-hidden="true">
                  h
                </span>
                <span className="ig-handle">
                  <span className="name" translate="no">
                    {t.feed.handle}
                  </span>
                  <span className="meta">{t.feed.bio}</span>
                </span>
                <span className="ig-follow">{t.feed.follow}</span>
              </div>

              <div className="ig-grid">
                <div className="ig-tile word">
                  <span className="word-mark">hygge</span>
                  <span className="pron-mini">{t.feed.tiles.pron}</span>
                </div>
                <div className="ig-tile coming">
                  <span className="small">{t.feed.tiles.open}</span>
                  <span className="label">
                    Naamsestraat 55P
                    <br />
                    3000 Leuven
                  </span>
                </div>
                <div className="ig-tile illu">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/figures.png"
                    alt=""
                    width={1200}
                    height={1200}
                    loading="lazy"
                  />
                </div>
                <div className="ig-tile illu">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/bun-photo.png"
                    alt=""
                    width={1254}
                    height={1254}
                    loading="lazy"
                  />
                </div>
                <div className="ig-tile bullet">
                  <strong>{t.feed.tiles.coffeeBullet}</strong>
                  <span>{t.feed.tiles.coffeeText}</span>
                </div>
                <div className="ig-tile handwritten">
                  <span>{t.feed.tiles.smorrebrod}</span>
                  <span className="arrow">
                    <ArrowScribble />
                  </span>
                </div>
              </div>

              <div className="ig-foot">
                <span>
                  <span translate="no">@hygge.leuven</span> · {t.feed.igFoot}
                </span>
                <span aria-hidden="true">↗</span>
              </div>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="foot">
        <div className="foot-grid">
          <div className="foot-mark">
            <span className="word">hygge</span>
            <p>{t.footer.tagline}</p>
          </div>
          <div className="foot-col">
            <h5>{t.footer.visit}</h5>
            <ul>
              <li>Naamsestraat 55P</li>
              <li>3000 Leuven</li>
              <li>Belgium</li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>{t.footer.hours}</h5>
            <ul>
              <li>{t.footer.hoursMt}</li>
              <li>{t.footer.hoursFs}</li>
              <li>{t.footer.hoursSu}</li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>{t.footer.elsewhere}</h5>
            <ul>
              <li>
                <a href={IG_URL} target="_blank" rel="noopener noreferrer">
                  {t.footer.instagram}
                </a>
              </li>
              <li>
                <a href="mailto:hej@hygge-leuven.be">hej@hygge-leuven.be</a>
              </li>
              <li>
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                  {t.footer.googleMaps}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          <span>{t.footer.bottomLeft}</span>
          <span>{t.footer.bottomRight}</span>
        </div>
      </footer>
    </>
  );
}
