// Photo gallery pane — a calm, crawlable grid of café photos. Server-rendered
// (no carousel JS): every image and caption is in the initial HTML. Images are
// lazy-loaded with explicit dimensions to avoid layout shift. Falls back to a
// built-in default set so the section looks complete with zero configuration;
// returns null only if an admin ever passes an empty list.

type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
  // "wide" photos span two columns on larger screens for a relaxed, editorial
  // rhythm; everything stays single-column and tappable on mobile.
  wide?: boolean;
};

const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    src: "/assets/table.png",
    alt: "A worn wooden café table set for two, soft daylight across the grain.",
    caption: "A table by the window, kept for slow mornings.",
    wide: true,
  },
  {
    src: "/assets/coffee.png",
    alt: "A flat white in a stoneware cup with a leaf poured into the crema.",
    caption: "Flat whites, oat by default.",
  },
  {
    src: "/assets/bun-photo.png",
    alt: "A golden cardamom bun, sugar-crusted and freshly baked.",
    caption: "Cardamom buns, warm from the oven.",
  },
  {
    src: "/assets/smorrebrod-photo.png",
    alt: "Open-faced smørrebrød on dark rye, layered with seasonal toppings.",
    caption: "Smørrebrød on dark rye, made to order.",
  },
  {
    src: "/assets/bean.png",
    alt: "A scoop of freshly roasted coffee beans, deep brown and glossy.",
    caption: "Single-origin beans, roasted close to home.",
  },
  {
    src: "/assets/illu-chair-v2.png",
    alt: "An illustrated armchair tucked into a quiet reading corner.",
    caption: "A corner to settle into with a book.",
  },
  {
    src: "/assets/illu-hygge-still.png",
    alt: "A still life of candle, cup and pastry — the small comforts of hygge.",
    caption: "Hygge, in the small things.",
    wide: true,
  },
];

export function GalleryGrid({
  heading,
  backToTopLabel,
  skipSectionLabel,
  photos,
}: {
  heading: string;
  backToTopLabel: string;
  skipSectionLabel: string;
  photos?: GalleryPhoto[];
}) {
  const list = photos && photos.length > 0 ? photos : GALLERY_PHOTOS;
  if (list.length === 0) return null;

  return (
    <section className="pane pane-gallery" id="gallery" aria-labelledby="gallery-heading">
      <a href="#landing" className="skip-link">{skipSectionLabel}</a>
      <div className="gallery-wrap">
        <h2 className="gallery-heading" id="gallery-heading">{heading}</h2>
        <ul className="gallery-grid" role="list">
          {list.map((photo) => (
            <li
              key={photo.src}
              className={photo.wide ? "gallery-item gallery-item-wide" : "gallery-item"}
            >
              <figure className="gallery-figure">
                <img
                  className="gallery-img"
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={480}
                />
                <figcaption className="gallery-caption">{photo.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <a href="#landing" className="back-link">{backToTopLabel}</a>
      </div>
    </section>
  );
}
