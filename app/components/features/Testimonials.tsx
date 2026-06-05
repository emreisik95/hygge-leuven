import { TESTIMONIALS } from "@/lib/feature-content";

// Static quote wall. Kept server-rendered (no carousel JS) for resilience and
// to keep all quotes crawlable.
export function Testimonials({ heading }: { heading: string }) {
  return (
    <section className="pane pane-quotes" id="testimonials" aria-labelledby="quotes-heading">
      <div className="quotes-wrap">
        <h2 className="quotes-heading" id="quotes-heading">{heading}</h2>
        <ul className="quotes-list" role="list">
          {TESTIMONIALS.map((t) => (
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
