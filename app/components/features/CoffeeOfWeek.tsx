// This week's featured single-origin bean. Server-rendered, no client JS — a
// single elegant card with the bean's name, origin, roast and tasting notes.
// Ships with a tasteful default so it looks complete with zero configuration.

type CoffeeFeature = {
  /** Bean / coffee name, e.g. "Yirgacheffe Kochere". */
  name: string;
  /** Origin / region, e.g. "Ethiopia · Yirgacheffe". */
  origin: string;
  /** Roast level, e.g. "Light · washed". */
  roast: string;
  /** A short, warm line about the cup. */
  note: string;
  /** 2–3 tasting notes rendered as pills. */
  tastingNotes: string[];
};

// Baked default: a bright, floral washed Ethiopian — exactly what you'd hope to
// find pulled as a filter on a slow Leuven morning.
const DEFAULT_BEAN: CoffeeFeature = {
  name: "Kochere",
  origin: "Ethiopia · Yirgacheffe",
  roast: "Light roast · washed process",
  note: "Pulled as filter all week. Tea-like and gentle, it blooms as it cools — best taken slow, no rush.",
  tastingNotes: ["jasmine", "bergamot", "stone fruit"],
};

export function CoffeeOfWeek({
  heading,
  backToTopLabel,
  bean,
}: {
  heading: string;
  backToTopLabel: string;
  bean?: CoffeeFeature;
}) {
  const feature = bean ?? DEFAULT_BEAN;
  if (!feature || !feature.name) return null;

  return (
    <section
      className="pane pane-coffeeweek"
      id="coffeeOfWeek"
      aria-labelledby="coffeeOfWeek-heading"
    >
      <div className="coffeeweek-wrap">
        <h2 className="coffeeweek-heading" id="coffeeOfWeek-heading">{heading}</h2>

        <article className="coffeeweek-card">
          <div className="coffeeweek-figure">
            <img
              src="/assets/illu-bean.png"
              alt={`Illustration of a coffee bean for this week's ${feature.name}`}
              className="coffeeweek-img"
              loading="lazy"
              decoding="async"
              width={160}
              height={160}
            />
          </div>

          <div className="coffeeweek-body">
            <h3 className="coffeeweek-name">{feature.name}</h3>

            <dl className="coffeeweek-meta">
              <div className="coffeeweek-meta-row">
                <dt className="coffeeweek-meta-label">origin</dt>
                <dd className="coffeeweek-meta-value">{feature.origin}</dd>
              </div>
              <div className="coffeeweek-meta-row">
                <dt className="coffeeweek-meta-label">roast</dt>
                <dd className="coffeeweek-meta-value">{feature.roast}</dd>
              </div>
            </dl>

            {feature.tastingNotes.length > 0 ? (
              <ul className="coffeeweek-notes" role="list" aria-label="Tasting notes">
                {feature.tastingNotes.map((n) => (
                  <li key={n} className="coffeeweek-pill">{n}</li>
                ))}
              </ul>
            ) : null}

            {feature.note ? <p className="coffeeweek-note">{feature.note}</p> : null}
          </div>
        </article>

        <a href="#landing" className="back-link">{backToTopLabel}</a>
      </div>
    </section>
  );
}
