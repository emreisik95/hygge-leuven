// "Our story" pane — a short, warm note on the café's philosophy. Server-
// rendered (no client JS): the copy lives in a const below so the section looks
// complete with zero admin configuration, and stays fully crawlable.

// Baked-in default copy in the voice of a cozy Copenhagen-style café in Leuven.
// Each entry is one short paragraph. If this array were ever emptied the
// section returns null, matching the house "render nothing rather than empty"
// rule.
const STORY_PARAGRAPHS: string[] = [
  "Hygge is a Danish word for the warmth of small, unhurried moments — a candle lit against a grey afternoon, a second cup poured without checking the time. We built this little room in Leuven to keep a few of those moments aside for you.",
  "Mornings here are slow on purpose. We pull specialty coffee from roasters we know by name, and bake in the Danish way: cardamom buns, rye smørrebrød, the kind of pastry that asks you to sit down for it. Nothing rushed, nothing fussy.",
  "Stay as long as you like. Bring a book, a friend, or just yourself. A good café isn't only about the coffee — it's about having somewhere that feels like a kitchen you happen not to have to tidy.",
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
            src="/assets/illu-hygge-still.png"
            alt="A still life of a steaming cup, a candle and a pastry on a quiet café table."
            className="about-illu"
            loading="lazy"
            decoding="async"
            width={520}
            height={520}
          />
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
