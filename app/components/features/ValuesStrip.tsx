// "What we care about" strip — a calm horizontal row of small value props
// (specialty beans, local baking, plant-milk default, unhurried hours). Server
// component: no client JS, fully crawlable. Icons are inline SVG so they inherit
// the cream text colour and need no extra assets. Defaults are baked in so the
// strip looks complete with zero admin configuration; if the list is somehow
// empty it returns null.

type ValueItem = {
  /** Stable key + label. */
  label: string;
  /** One-line description. */
  detail: string;
  /** Inline SVG icon, rendered decoratively (aria-hidden via wrapper). */
  icon: React.ReactNode;
};

function BeanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="7" ry="9" />
      <path d="M9 4.5C12 8 12 16 9 19.5" />
    </svg>
  );
}

function BunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14a9 5 0 0 1 18 0" />
      <path d="M3 14a9 4 0 0 0 18 0" />
      <path d="M8 10.5l1.5 3M12 9.5v4M16 10.5l-1.5 3" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13z" />
      <path d="M5 19c3-5 6-7 10-9" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5l3.5 2" />
    </svg>
  );
}

// Baked-in defaults in the voice of a cozy Copenhagen-style café in Leuven.
const VALUES: ValueItem[] = [
  {
    label: "Specialty beans",
    detail: "Single-origin coffee, roasted small-batch and pulled with care.",
    icon: <BeanIcon />,
  },
  {
    label: "Baked in-house",
    detail: "Cardamom buns and smørrebrød made fresh in our own kitchen.",
    icon: <BunIcon />,
  },
  {
    label: "Oat by default",
    detail: "Plant milk is our house pour — no surcharge, ever.",
    icon: <LeafIcon />,
  },
  {
    label: "Unhurried hours",
    detail: "Linger as long as you like. The good corner is always yours.",
    icon: <ClockIcon />,
  },
];

export function ValuesStrip({
  heading,
  backToTopLabel,
}: {
  heading: string;
  backToTopLabel: string;
}) {
  if (VALUES.length === 0) return null;
  return (
    <section className="pane pane-values" id="values" aria-labelledby="values-heading">
      <div className="values-wrap">
        <h2 className="values-heading" id="values-heading">{heading}</h2>
        <ul className="values-list" role="list">
          {VALUES.map((v) => (
            <li key={v.label} className="value-item">
              <span className="value-icon" aria-hidden="true">{v.icon}</span>
              <h3 className="value-label">{v.label}</h3>
              <p className="value-detail">{v.detail}</p>
            </li>
          ))}
        </ul>
        <a href="#landing" className="back-link">{backToTopLabel}</a>
      </div>
    </section>
  );
}
