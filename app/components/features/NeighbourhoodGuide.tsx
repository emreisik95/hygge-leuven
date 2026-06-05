// "While you're in Leuven" guide. A calm grid of nearby spots a guest might
// wander to before or after a coffee. Server-rendered (no client JS): the list
// is static, fully crawlable, and resilient. Entries are category-style with no
// fabricated business names, each carrying a short detail and a walk time.

type GuideSpot = {
  // Short, lowercase-friendly place label, e.g. "the old market square".
  name: string;
  // One warm sentence on why it's worth the detour.
  detail: string;
  // Human walk time, kept short, e.g. "4 min walk".
  walk: string;
};

const NEIGHBOURHOOD_SPOTS: GuideSpot[] = [
  {
    name: "the old market square",
    detail:
      "Leuven's long, open square — locals call it the longest bar in Europe. Lovely with a takeaway coffee in hand.",
    walk: "4 min walk",
  },
  {
    name: "the town park",
    detail:
      "Winding paths, big trees and a quiet pond. Our go-to for a slow morning or a pastry on a bench.",
    walk: "8 min walk",
  },
  {
    name: "the old bookshop lane",
    detail:
      "A handful of secondhand and design bookshops tucked down a side street. Easy to lose an hour here.",
    walk: "6 min walk",
  },
  {
    name: "the city museum",
    detail:
      "A calm, well-lit collection of old masters and local history. Small enough to enjoy in a single visit.",
    walk: "10 min walk",
  },
  {
    name: "the great beguinage",
    detail:
      "Cobbled lanes and brick courtyards by the water — a UNESCO-listed pocket of stillness in the city.",
    walk: "12 min walk",
  },
];

// Small inline walking glyph; decorative, so hidden from assistive tech.
function WalkIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable={false}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="4" r="2" />
      <path d="M11 8l-2 4 3 2 1 6" />
      <path d="M9 12l-3 1-2 4" />
      <path d="M14 14l3 1 2 4" />
    </svg>
  );
}

export function NeighbourhoodGuide({
  heading,
  backToTopLabel,
  spots,
}: {
  heading: string;
  backToTopLabel: string;
  spots?: GuideSpot[];
}) {
  const list = spots && spots.length > 0 ? spots : NEIGHBOURHOOD_SPOTS;
  if (list.length === 0) return null;
  return (
    <section
      className="pane pane-guide"
      id="guide"
      aria-labelledby="guide-heading"
    >
      <div className="guide-wrap">
        <h2 className="guide-heading" id="guide-heading">{heading}</h2>
        <ul className="guide-list" role="list">
          {list.map((spot) => (
            <li key={spot.name} className="guide-card">
              <div className="guide-card-head">
                <h3 className="guide-name">{spot.name}</h3>
                <span className="guide-walk">
                  <WalkIcon /> {spot.walk}
                </span>
              </div>
              <p className="guide-detail">{spot.detail}</p>
            </li>
          ))}
        </ul>
        <a href="#landing" className="back-link">{backToTopLabel}</a>
      </div>
    </section>
  );
}
