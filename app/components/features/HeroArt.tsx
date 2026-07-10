// The café-corner illustration from the takeaway-cup sticker, shown big beside
// the hero wordmark on wide screens and hidden on phones (the hero is already
// busy there). Sits directly on the beige ground — same trick as TakeawayCup:
// it must stay a direct child of .pane-landing, because revealOnScroll leaves a
// transform on .card that would hijack the absolute positioning.

export function HeroArt({ label }: { label: string }) {
  return (
    <div className="hero-art" role="img" aria-label={label}>
      {/* Intrinsic size of assets/hero-art.webp; keeps layout stable pre-load. */}
      <img src="/assets/hero-art.webp" alt="" width={372} height={344} />
    </div>
  );
}
