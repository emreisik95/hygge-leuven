// "Our story" pane — server-rendered, crawlable, and fed by the same
// draft/preview/publish content pipeline as the rest of the landing page.

export function AboutStory({
  heading,
  paragraphs,
  backToTopLabel,
}: {
  heading: string;
  paragraphs: string[];
  backToTopLabel: string;
}) {
  const visibleParagraphs = paragraphs
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  if (!heading.trim() || visibleParagraphs.length === 0) return null;

  return (
    <section className="pane pane-about" id="about" aria-labelledby="about-heading">
      <div className="about-wrap">
        <figure className="about-figure">
          <img
            src="/assets/illu-hygge-still-line.png"
            alt="A still life of a steaming cup, a candle and a pastry on a quiet café table."
            className="sr-only"
            loading="lazy"
            decoding="async"
            width={520}
            height={520}
          />
          <span className="about-illu" aria-hidden="true" />
        </figure>
        <div className="about-prose">
          <h2 className="about-heading" id="about-heading">{heading}</h2>
          {visibleParagraphs.map((para, i) => (
            <p key={i} className="about-body">{para}</p>
          ))}
          <a href="#landing" className="back-link">{backToTopLabel}</a>
        </div>
      </div>
    </section>
  );
}
