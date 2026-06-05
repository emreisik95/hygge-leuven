import { TESTIMONIALS } from "@/lib/feature-content";

// Static quote wall. Kept server-rendered (no carousel JS) for resilience and
// to keep all quotes crawlable.
export function Testimonials({
  heading,
  items,
}: {
  heading: string;
  items?: { quote: string; author: string }[];
}) {
  const quotes = items && items.length > 0 ? items : TESTIMONIALS;
  if (quotes.length === 0) return null;
  return (
    <section className="pane pane-quotes" id="testimonials" aria-labelledby="quotes-heading">
      <div className="quotes-wrap">
        <h2 className="quotes-heading" id="quotes-heading">{heading}</h2>
        <ul className="quotes-list" role="list">
          {quotes.map((t) => (
            <li key={t.author} className="quote-card">
              <blockquote className="quote-text">{t.quote}</blockquote>
              <p className="quote-author">— {t.author}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
