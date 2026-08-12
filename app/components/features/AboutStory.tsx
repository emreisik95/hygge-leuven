// "Our story" pane — a short, warm note on the café's philosophy. Server-
// rendered (no client JS): the copy lives in a const below so the section looks
// complete with zero admin configuration, and stays fully crawlable.

// Owner-approved café story. Each entry is one supplied text block, kept here
// so the section remains server-rendered, crawlable, and independent of admin
// configuration. If this array were ever emptied the section returns null,
// matching the house "render nothing rather than empty" rule.
const STORY_PARAGRAPHS: string[] = [
  "We’re a café with a big soft spot for good things. Good coffee. Good tea. Good food. Slow mornings. Long conversations. Cozy corners when you need one. We’re quite simple about what we serve: if we don’t like it ourselves, we won’t put it on your table. Everything we choose has to be something we genuinely enjoy — not just something that looks good on a menu.",
  "For our coffee, we proudly work with Caffenation, an Antwerp-born specialty coffee roaster that shares our love for quality, curiosity and doing things with care. Your espresso and Americano won’t taste exactly the same every few months — and that’s intentional. We change these beans roughly every month, choosing new coffees with different origins, characters and flavours so there’s always something new to discover. For our milk-based coffees, however, we keep our house beans consistent, so your favourite cappuccino tastes just the way you remember it.",
  "For tea, we chose A.C. Perch’s — Scandinavia’s oldest tea shop, with a tradition dating back to 1835. They have been serving the Danish Royal Household for generations and were officially appointed Royal Purveyor to the Danish Court in 2002. We like that kind of history, but even more, we like what’s in the cup: carefully selected teas made with the same respect for quality that we try to bring to everything we do.",
  "We care about the little things. The ingredients, the preparation, the atmosphere, the people sitting around the table. We love what we do, and we hope that somewhere between your first sip and your last bite, you can feel that too.",
];

export function AboutStory({
  heading,
  backToTopLabel,
}: {
  heading: string;
  backToTopLabel: string;
}) {
  if (STORY_PARAGRAPHS.length === 0) return null;
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
          {STORY_PARAGRAPHS.map((para, i) => (
            <p key={i} className="about-body">{para}</p>
          ))}
          <a href="#landing" className="back-link">{backToTopLabel}</a>
        </div>
      </div>
    </section>
  );
}
