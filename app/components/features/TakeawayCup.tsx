// The café's takeaway cup, worn like a signature on the landing pane: a small
// in-flow badge above the wordmark on phones, a big illustrated cup pinned to
// the right side of the hero on wider screens (see .takeaway-cup in globals.css).
// Server-rendered, no client JS.
//
// Artwork resolution happens in the pages via lib/images and falls down a chain:
//   1. cupSrc  — public/assets/cup.<ext>, the full illustrated cup, shown as-is;
//   2. stickerSrc — public/assets/sticker.<ext>, worn by the inline SVG cup;
//   3. neither — the SVG cup with an inline brand sticker, so it never renders
//      empty. Colours lean on the site palette so the cup reads as part of the
//      hero rather than a foreign graphic.

export function TakeawayCup({
  cupSrc,
  stickerSrc,
  label,
}: {
  cupSrc?: string | null;
  stickerSrc?: string | null;
  label: string;
}) {
  if (cupSrc) {
    return (
      <div className="takeaway-cup" role="img" aria-label={label}>
        {/* Intrinsic size of assets/cup.webp; keeps layout stable pre-load. */}
        <img src={cupSrc} alt="" className="takeaway-cup-img" width={503} height={900} />
      </div>
    );
  }

  return (
    <div className="takeaway-cup" role="img" aria-label={label}>
      <svg
        className="takeaway-cup-art"
        viewBox="0 0 120 150"
        fill="none"
        aria-hidden="true"
        focusable={false}
      >
        {/* steam */}
        <path
          className="takeaway-cup-steam"
          d="M49 14c-3 -4 3 -7 0 -11M60 16c-3 -4 3 -7 0 -11M71 14c-3 -4 3 -7 0 -11"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* lid */}
        <path
          d="M22 34c0-4 3-7 7-7h62c4 0 7 3 7 7v4H22v-4z"
          fill="currentColor"
          opacity="0.92"
        />
        <rect x="16" y="38" width="88" height="9" rx="4.5" fill="currentColor" />
        {/* cup body (tapered) */}
        <path
          d="M24 47h72l-8.5 92a8 8 0 0 1-8 7.2H40.5a8 8 0 0 1-8-7.2L24 47z"
          fill="var(--bg, #3a2a1f)"
          stroke="currentColor"
          strokeWidth="3"
        />
        {/* sleeve seams */}
        <path d="M28.5 96h63M30 78h60" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        {/* sticker slot: the real cup sticker when present, brand fallback otherwise */}
        {stickerSrc ? (
          // Die-cut sticker: white paper circle, artwork fitted whole (meet, not
          // slice — the wordmark sits near the edge), a whisper of rotation so it
          // reads as something slapped on a cup rather than printed on it.
          <g transform="rotate(-6 60 97)">
            <clipPath id="takeaway-cup-sticker-clip">
              <circle cx="60" cy="97" r="24" />
            </clipPath>
            <circle cx="60" cy="97" r="24" fill="#fbf7ef" />
            <image
              href={stickerSrc}
              x="38"
              y="75"
              width="44"
              height="44"
              preserveAspectRatio="xMidYMid meet"
              clipPath="url(#takeaway-cup-sticker-clip)"
            />
            <circle cx="60" cy="97" r="24" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.85" />
          </g>
        ) : (
          <>
            <circle cx="60" cy="97" r="24" fill="currentColor" />
            <text
              x="60"
              y="103"
              textAnchor="middle"
              fontFamily="var(--font-serif), Didot, serif"
              fontWeight="700"
              fontSize="17"
              fill="var(--bg, #3a2a1f)"
            >
              hygge
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
