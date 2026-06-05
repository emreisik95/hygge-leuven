"use client";

import { useEffect, useState } from "react";

// Vertical column of dots fixed to the right edge (desktop only) that mirror the
// on-page sections in document order. An IntersectionObserver — rooted on the
// `.shell` scroll container — highlights the dot for the section currently in
// view; clicking a dot smooth-scrolls to it. Sections absent from the DOM are
// skipped, and the rail renders nothing until at least one is found, so it fails
// silent when the page structure changes.

// Known section ids in document order. Optional ones may be missing from the DOM
// and are filtered out at mount; labels resolve from the `labels` prop by id.
const SECTION_IDS = [
  "landing",
  "vision",
  "insta",
  "testimonials",
  "events",
  "faq",
  "more",
  "menu",
  "map",
] as const;

type SectionId = (typeof SECTION_IDS)[number];

type Dot = { id: SectionId; label: string };

export function SectionNavDots({ labels }: { labels: Record<string, string> }) {
  const [dots, setDots] = useState<Dot[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const present: Dot[] = [];
    const elements: HTMLElement[] = [];
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      present.push({ id, label: labels[id] ?? id });
      elements.push(el);
    }
    if (present.length === 0) return; // nothing to point at — render nothing.

    setDots(present);
    setActive(present[0].id);

    if (typeof IntersectionObserver === "undefined") return;

    // The page scrolls inside `.shell`, not the window, so observe relative to
    // it when available; falling back to the viewport keeps this resilient.
    const root = elements[0].closest<HTMLElement>(".shell") ?? null;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const { id } of present) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = id;
          }
        }
        if (best) setActive(best);
      },
      { root, threshold: [0.25, 0.5, 0.75] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [labels]);

  if (dots.length === 0) return null;

  const go = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setActive(id);
  };

  return (
    <nav className="section-dots" aria-label="Section navigation">
      <ul className="section-dots-list">
        {dots.map(({ id, label }) => {
          const isActive = id === active;
          return (
            <li key={id}>
              <button
                type="button"
                className={`section-dot${isActive ? " is-active" : ""}`}
                aria-label={label}
                aria-current={isActive ? "location" : undefined}
                onClick={() => go(id)}
              >
                <span className="section-dot-mark" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
