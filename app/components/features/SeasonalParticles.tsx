"use client";

import { useEffect, useState } from "react";

// Season buckets that actually render something. Summer is intentionally absent
// (renders nothing); the rest map to a glyph + a CSS modifier class.
type Falling = "winter" | "autumn" | "spring";

// How many particles to scatter. Kept deliberately low for a calm, understated
// effect (and so the inline-style spans stay cheap).
const COUNT = 14;

// Decorative overlay of slowly falling, season-themed particles (snow in
// winter, leaves in autumn, petals in spring; nothing in summer). All motion is
// pure CSS; every per-particle value is derived deterministically from the
// span index — no randomness — so server and client never disagree and the
// layout is stable. Renders nothing under reduced-motion, on summer, or before
// the season resolves client-side. Purely decorative and never interactive:
// the layer and its spans are pointer-events:none and aria-hidden.
export function SeasonalParticles() {
  const [season, setSeason] = useState<Falling | null>(null);

  useEffect(() => {
    // Honour reduced-motion: render nothing at all rather than freezing a
    // static decorative layer over the page.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    setSeason(fallingSeason(new Date().getMonth())); // 0 = Jan
  }, []);

  if (!season) return null;

  return (
    <div className={`seasonal-particles is-${season}`} aria-hidden="true">
      {Array.from({ length: COUNT }, (_, i) => (
        <span key={i} className="seasonal-particle" style={particleStyle(i)}>
          {GLYPH[season]}
        </span>
      ))}
    </div>
  );
}

// Northern-hemisphere meteorological seasons; summer (Jun–Aug) returns null so
// the component renders nothing.
function fallingSeason(month: number): Falling | null {
  if (month >= 2 && month <= 4) return "spring"; // Mar–May
  if (month >= 5 && month <= 7) return null; // Jun–Aug → no particles
  if (month >= 8 && month <= 10) return "autumn"; // Sep–Nov
  return "winter"; // Dec–Feb
}

const GLYPH: Record<Falling, string> = {
  winter: "❄",
  autumn: "❧",
  spring: "✿",
};

// Deterministic per-particle styling, derived only from the index so there is
// zero randomness and no hydration mismatch. Spreads particles across the
// viewport width and varies fall duration, delay, drift, size and opacity so
// the field doesn't look like a marching grid.
function particleStyle(i: number): React.CSSProperties {
  const left = ((i * 100) / COUNT + (i % 3) * 4) % 100; // 0–100 vw, lightly jittered
  const duration = 16 + (i % 5) * 3; // 16–28s
  const delay = -((i * 1.7) % duration); // negative → mid-animation on first paint
  const drift = `${(i % 2 === 0 ? 1 : -1) * (10 + (i % 4) * 6)}px`; // sideways sway
  const size = 9 + (i % 4) * 3; // 9–18px
  const opacity = 0.18 + (i % 3) * 0.06; // 0.18–0.30

  return {
    left: `${left}vw`,
    fontSize: `${size}px`,
    opacity,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    // Read by the keyframes for the horizontal sway.
    ["--drift" as string]: drift,
  };
}
