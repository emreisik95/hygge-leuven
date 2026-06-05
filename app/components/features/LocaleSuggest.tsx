"use client";

import { useEffect, useState } from "react";

const KEY = "hygge-locale-suggest";

// Gentle, dismissible hint shown only to visitors whose browser prefers Dutch or
// French while the site is currently in English. It points them at the language
// switcher (top-left of the landing section) without ever changing the locale
// itself: the action just dismisses and scrolls to the top. The dismissal is
// stored locally so it never reappears for a visitor who has waved it away.
//
// Rendered as a small, cozy corner toast (matching the cookie-consent card),
// NOT a full-width bar: it floats over content with pointer-events confined to
// the card, so it never occludes the landing pane or the language switcher it
// references, and it reserves no layout space (no shift, no hydration mismatch).
// Fails silent: any storage error simply suppresses the hint.
export function LocaleSuggest({
  locale,
  message,
  actionLabel,
  closeLabel,
}: {
  locale: string;
  message: string;
  actionLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  // Decide visibility on the client only (navigator + localStorage are not
  // available during SSR), so the markup never differs between server and the
  // first client render — both produce null, so there is no hydration mismatch.
  useEffect(() => {
    if (locale !== "EN") return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === "1";
    } catch {
      // Private mode / blocked storage: treat as not-yet-dismissed.
    }
    if (dismissed) return;
    const lang = (navigator.language || "").toLowerCase();
    if (lang.startsWith("nl") || lang.startsWith("fr")) setOpen(true);
  }, [locale]);

  if (!open) return null;

  const dismiss = (scroll: boolean) => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* private mode: just hide for this view */
    }
    if (scroll) {
      const target = document.getElementById("landing") ?? document.body;
      // Honour the OS reduce-motion setting explicitly: scrollIntoView({behavior:
      // "smooth"}) would otherwise force an animated scroll regardless. Matches
      // the SectionNavDots house pattern.
      const reduce =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };

  return (
    <div className="locale-suggest" role="status" aria-label="Language suggestion">
      <p className="locale-suggest-text">{message}</p>
      <div className="locale-suggest-actions">
        <button
          type="button"
          className="locale-suggest-action"
          onClick={() => dismiss(true)}
        >
          {actionLabel}
        </button>
        <button
          type="button"
          className="locale-suggest-close"
          aria-label={closeLabel}
          onClick={() => dismiss(false)}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  );
}
