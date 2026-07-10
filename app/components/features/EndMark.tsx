"use client";

import { useEffect, useRef, useState } from "react";

// A book's closing "fin." for the homepage: one tiny serif word that fades in
// the first time the visitor reaches the true end of the page (inside the map
// card), then simply stays. The reveal is the only moving part — under reduced
// motion, or without IntersectionObserver, it renders visible from the start.
// Like SectionNavDots, the observer is rooted on the `.shell` scroll container,
// since the page scrolls there rather than in the viewport.
export function EndMark({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const root = el.closest<HTMLElement>(".shell") ?? null;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          obs.disconnect();
        }
      },
      { root, threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <p ref={ref} className={shown ? "end-mark is-shown" : "end-mark"}>
      {text}
    </p>
  );
}
