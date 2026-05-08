import SmoothScroll from "./smooth-scroll";

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

function HandUnderline({
  width = 220,
  align = "left",
}: {
  width?: number;
  align?: "left" | "center";
}) {
  return (
    <svg
      className={`hand-underline${align === "center" ? " is-center" : ""}`}
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

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* ───── Top bar ───── */}
      <header className="frame">
        <div className="bar">
          <a href="#top" className="mark reveal d-1">
            <span className="word">
              hygge
            </span>
            <span className="sub">Danish café · Leuven</span>
          </a>
          <nav className="top-nav reveal d-2" aria-label="Primary">
            <a href="#story">story</a>
            <a href="#serve">what we serve</a>
            <a href="#visit">visit</a>
            <a href={IG_URL} target="_blank" rel="noopener noreferrer">
              instagram
            </a>
          </nav>
          <a href="#visit" className="pill solid reveal d-3">
            <span>visit us</span>
            <span className="arr">→</span>
          </a>
        </div>
      </header>

      <div className="rule" />

      {/* ───── Status row ───── */}
      <div className="frame">
        <div className="status-row">
          <span className="left">
            <span className="pulse" />
            now open · seven days a week
          </span>
          <span>Naamsestraat 55P · Leuven 3000</span>
        </div>
      </div>

      <div className="rule" />

      <main id="main">

      {/* ───── HERO ───── */}
      <section className="frame" id="top">
        <div className="hero">
          <div className="hero-left">
            <p className="tagline reveal d-1">
              a place to hold hands
              <br />
              or hold a cup.
            </p>
            <h1 className="wordmark reveal d-2">
              hygge
            </h1>
            <span className="marginalia opened">
              now open
              <br />
              <span className="scribble">
                <ArrowScribble flip />
              </span>
            </span>
            <div className="pron reveal d-3">
              <span>Danish</span> <span>[hyü‑ge]</span>{" "}
              <span className="pos">noun</span>
              <span className="gloss">a feeling of cozy contentment.</span>
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
            <h2 className="headline">
              come on in, the kettle’s already on.
            </h2>
            <p className="copy">
              specialty coffee, danish lunch, and small soft moments — open seven
              days on Naamsestraat.
            </p>
            <ul className="hours-mini">
              <li>
                <span className="day">today</span>
                <span className="time">8:00 — 18:00</span>
              </li>
              <li>
                <span className="day">weekend</span>
                <span className="time">9:00 — 19:00</span>
              </li>
            </ul>
            <div className="ctas">
              <a href="#visit" className="pill">
                <span>find us</span>
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

      {/* ───── Marquee ───── */}
      <div className="marquee" id="serve" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div className="marquee-item" key={dup}>
              <span>specialty coffee</span>
              <span className="marquee-dot" />
              <span>
                <em>smørrebrød</em>
              </span>
              <span className="marquee-dot" />
              <span>cardamom buns</span>
              <span className="marquee-dot" />
              <span>filter &amp; espresso</span>
              <span className="marquee-dot" />
              <span>
                <em>danish lunch</em>
              </span>
              <span className="marquee-dot" />
              <span>cinnamon swirls</span>
              <span className="marquee-dot" />
            </div>
          ))}
        </div>
      </div>

      {/* ───── Story ───── */}
      <section className="frame" id="story">
        <div className="story">
          <div className="story-text">
            <div className="num numeral">I. — story</div>
            <h2>
              what is <em>hygge?</em>
            </h2>
            <HandUnderline width={260} />
            <p className="lead">
              Hygge — pronounced &ldquo;hyü‑ge&rdquo; — is a Danish word for
              coziness. Slowing down, enjoying the simple moments, feeling at
              home wherever you happen to be.
            </p>
            <p>
              It&apos;s the feeling when you&apos;re wrapped in a blanket with a
              cup of coffee. When laughter fills the room. When the rain taps on
              the window and everything feels just right.
            </p>
            <p>
              We brought a little of it from Copenhagen to Naamsestraat. Stay a
              while.
            </p>
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

      {/* ───── Pillars ───── */}
      <section className="frame">
        <div className="pillars">
          <div className="pillars-head">
            <div>
              <div className="numeral">II. — what we serve</div>
              <h2>
                small things, <em>made slowly.</em>
              </h2>
              <HandUnderline width={300} />
            </div>
            <p className="aside">
              <Asterisk /> menu rotates with the seasons — follow the feed for
              today’s bake.
            </p>
          </div>
          <div className="pillars-grid">
            <article className="pillar">
              <div className="num numeral">no. 01</div>
              <div className="pillar-icon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/coffee.png"
                  alt=""
                  width={1200}
                  height={1200}
                  loading="lazy"
                />
              </div>
              <h3>specialty coffee</h3>
              <p>
                espresso, filter, and slow pour-over. small Belgian roasters,
                seasonal beans, careful hands.
              </p>
            </article>
            <article className="pillar">
              <div className="num numeral">no. 02</div>
              <div className="pillar-icon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/smorrebrod-photo.png"
                  alt=""
                  width={800}
                  height={800}
                  loading="lazy"
                />
              </div>
              <h3>smørrebrød</h3>
              <p>
                open-faced danish sandwiches on dark rye — pickled herring,
                roast beef, egg &amp; shrimp. lunch, all afternoon.
              </p>
            </article>
            <article className="pillar">
              <div className="num numeral">no. 03</div>
              <div className="pillar-icon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/bun-photo.png"
                  alt=""
                  width={800}
                  height={800}
                  loading="lazy"
                />
              </div>
              <h3>pastry &amp; sweets</h3>
              <p>
                cardamom buns, cinnamon swirls, a slice of something with a
                berry on top. baked here every morning.
              </p>
            </article>
          </div>
        </div>
      </section>

      <div className="rule" />

      {/* ───── Visit ───── */}
      <section className="frame" id="visit">
        <div className="visit">
          <div className="visit-info">
            <div className="num numeral">III. — visit</div>
            <h2>
              find us on <em>Naamsestraat.</em>
            </h2>
            <HandUnderline width={340} />
            <p className="address">
              Naamsestraat 55P
              <br />
              3000 Leuven · Belgium
            </p>
            <p className="address-meta">
              two minutes from the Grote Markt, around the corner from St.
              Peter’s. push the door, the bell rings, you’re home.
            </p>

            <div className="visit-block">
              <div>
                <h4>hours</h4>
                <ul className="hours">
                  <li>
                    <span className="day">mon — thu</span>
                    <span className="time">8:00 — 18:00</span>
                  </li>
                  <li>
                    <span className="day">fri</span>
                    <span className="time">8:00 — 19:00</span>
                  </li>
                  <li>
                    <span className="day">sat</span>
                    <span className="time">9:00 — 19:00</span>
                  </li>
                  <li>
                    <span className="day">sun</span>
                    <span className="time">9:00 — 17:00</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4>say hej</h4>
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
                    <span>open in maps</span>
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

      {/* ───── Feed ───── */}
      <section className="frame">
        <div className="feed">
          <div className="feed-intro">
            <div className="numeral">IV. — feed</div>
            <h2>follow along on instagram.</h2>
            <HandUnderline width={320} />
            <p>
              daily bake, the lunch board, the new beans, the corner table on a
              quiet wednesday. small things, made slowly, posted slowly.
            </p>
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
                  hygge.leuven
                </span>
                <span className="meta">Leuven · Danish café</span>
              </span>
              <span className="ig-follow">follow</span>
            </div>

            <div className="ig-grid">
              <div className="ig-tile word">
                <span className="word-mark">
                  hygge
                </span>
                <span className="pron-mini">Danish [hyü‑ge] noun</span>
              </div>
              <div className="ig-tile coming">
                <span className="small">now open</span>
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
                <strong>coffee all day long</strong>
                <span>
                  espresso, filter, slow pour-over. small Belgian roasters.
                </span>
              </div>
              <div className="ig-tile handwritten">
                <span>
                  but what is this
                  <br />
                  smørrebrød??
                </span>
                <span className="arrow">
                  <ArrowScribble />
                </span>
              </div>
            </div>

            <div className="ig-foot">
              <span>
                <span translate="no">@hygge.leuven</span> · open in instagram
              </span>
              <span aria-hidden="true">↗</span>
            </div>
          </a>
        </div>
      </section>

      </main>

      {/* ───── Footer ───── */}
      <footer className="foot">
        <div className="foot-grid">
          <div className="foot-mark">
            <span className="word">
              hygge
            </span>
            <p>
              a Danish café in the heart of Leuven. specialty coffee, smørrebrød,
              and pastry, all day long.
            </p>
          </div>
          <div className="foot-col">
            <h5>visit</h5>
            <ul>
              <li>Naamsestraat 55P</li>
              <li>3000 Leuven</li>
              <li>Belgium</li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>hours</h5>
            <ul>
              <li>mon — thu · 8 – 18</li>
              <li>fri — sat · 8 – 19</li>
              <li>sun · 9 – 17</li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>elsewhere</h5>
            <ul>
              <li>
                <a href={IG_URL} target="_blank" rel="noopener noreferrer">
                  instagram ↗
                </a>
              </li>
              <li>
                <a href="mailto:hej@hygge-leuven.be">hej@hygge-leuven.be</a>
              </li>
              <li>
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                  google maps ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          <span>© hygge leuven · 2026</span>
          <span>made with care in leuven</span>
        </div>
      </footer>
    </>
  );
}
