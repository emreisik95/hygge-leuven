"use client";

import { useEffect } from "react";

// Gently fades-and-rises major content blocks as they enter view. Renders
// nothing: it tags the existing content children, then an IntersectionObserver
// reveals each one as it scrolls into view. Fully a no-op under
// prefers-reduced-motion, and JS-failsafe — the hidden state is only ever added
// by this effect, so without JS (or on error) everything stays visible.
//
// The page scrolls inside the `.shell` container (overflow-y + scroll-snap),
// not the window, so — like SectionNavDots — the observer is rooted on `.shell`
// when present, falling back to the viewport otherwise. Without this the
// viewport-rooted observer never fires for below-the-fold panes inside the snap
// container and their content would stay permanently hidden.
const REVEAL_SELECTOR =
  ".pane .card, .pane .vision-wrap, .pane .insta-wrap, .pane .menu-wrap, .pane .map-card";

export function RevealOnScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    );
    if (targets.length === 0) return;

    // Honour reduced motion (and absent IntersectionObserver) by revealing
    // everything at once, with no transition added.
    if (reduce.matches || typeof IntersectionObserver === "undefined") {
      for (const el of targets) el.classList.add("reveal-shown");
      return;
    }

    // The page scrolls inside `.shell`; observe relative to it when available so
    // panes below the fold are detected. Fall back to the viewport for safety.
    const root = targets[0].closest<HTMLElement>(".shell") ?? null;
    const rootRect = root
      ? root.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight };

    for (const el of targets) {
      el.classList.add("reveal-init");
      // Reveal anything already on screen synchronously (e.g. the above-the-fold
      // landing card), so it never flashes hidden before the async observer
      // callback runs on first paint.
      const rect = el.getBoundingClientRect();
      if (rect.bottom > rootRect.top && rect.top < rootRect.bottom) {
        el.classList.add("reveal-shown");
      }
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("reveal-shown");
          obs.unobserve(el); // reveal once, then stop watching.
        }
      },
      { root, threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    for (const el of targets) {
      if (!el.classList.contains("reveal-shown")) observer.observe(el);
    }

    return () => {
      observer.disconnect();
      for (const el of targets) {
        el.classList.remove("reveal-init");
        el.classList.remove("reveal-shown");
      }
    };
  }, []);

  return null;
}
