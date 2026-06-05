// Press / "kind words from around town" strip. A calm grid of short quotes,
// each with a source attribution. Server-rendered (no carousel JS) so every
// quote stays crawlable and the section is resilient with zero admin config.
//
// Sources are intentionally generic and warm (local notes, a regular, a
// weekend guide) rather than impersonating specific real publications.
//
// Mirrors the restraint of the sibling content panes (Testimonials, EventsList,
// FaqSection): a server component that maps a built-in default array to a
// simple semantic list, ending in the shared global back-link. No skip-link
// here -- like Testimonials/EventsList -- because that control needs the
// locale-aware c.skipSectionLabel (the site is EN/NL/FR), and this section only
// receives the heading + backToTopLabel props.

type PressMention = { quote: string; source: string };

const PRESS_MENTIONS: PressMention[] = [
  {
    quote:
      "The kind of room you mean to leave after one coffee and somehow stay all afternoon. Quietly the cosiest corner in town.",
    source: "Leuven food notes",
  },
  {
    quote:
      "Proper specialty coffee, warm cardamom buns, and not a single thing trying too hard. A little pocket of Copenhagen on Naamsestraat.",
    source: "weekend guide",
  },
  {
    quote:
      "I come in for the filter and the calm. They remember my order and never rush me out the door.",
    source: "a regular",
  },
  {
    quote:
      "Soft light, good bread, slow mornings. If hygge had an address in Leuven, this would be it.",
    source: "neighbourhood letter",
  },
];

// Static press wall. Returns null only if every quote were removed.
export function PressMentions({
  heading,
  backToTopLabel,
}: {
  heading: string;
  backToTopLabel: string;
}) {
  const mentions = PRESS_MENTIONS;
  if (mentions.length === 0) return null;

  return (
    <section className="pane pane-press" id="press" aria-labelledby="press-heading">
      <div className="press-wrap">
        <h2 className="press-heading" id="press-heading">{heading}</h2>
        <ul className="press-list" role="list">
          {mentions.map((m) => (
            <li key={m.source} className="press-card">
              <span className="press-mark" aria-hidden="true">&ldquo;</span>
              <blockquote className="press-quote">{m.quote}</blockquote>
              <cite className="press-source">{m.source}</cite>
            </li>
          ))}
        </ul>
        <a href="#landing" className="back-link">{backToTopLabel}</a>
      </div>
    </section>
  );
}
