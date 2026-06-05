"use client";

import { useEffect, useRef, useState } from "react";

// Dismissible top-of-page bar. The dismissal is keyed by the message text, so
// changing the announcement re-shows it even to visitors who closed the old one.
// While open, it publishes its own height as the `--ann-h` CSS variable so the
// page below shifts down by exactly the banner height instead of being covered.
export function AnnouncementBanner({ message, closeLabel }: { message: string; closeLabel: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const storageKey = `hygge-ann:${hash(message)}`;

  useEffect(() => {
    try {
      setOpen(localStorage.getItem(storageKey) !== "1");
    } catch {
      setOpen(true);
    }
  }, [storageKey]);

  // Publish banner height to the page (and keep it in sync on resize/wrap).
  useEffect(() => {
    const root = document.documentElement;
    if (!open) {
      root.style.removeProperty("--ann-h");
      return;
    }
    const el = ref.current;
    if (!el) return;
    const sync = () => root.style.setProperty("--ann-h", `${el.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--ann-h");
    };
  }, [open, message]);

  if (!open || !message.trim()) return null;

  return (
    <div ref={ref} className="ann-banner" role="region" aria-label="Announcement">
      <p className="ann-banner-text">{message}</p>
      <button
        type="button"
        className="ann-banner-close"
        aria-label={closeLabel}
        onClick={() => {
          setOpen(false);
          try {
            localStorage.setItem(storageKey, "1");
          } catch {
            /* private mode: just hide for this view */
          }
        }}
      >
        ×
      </button>
    </div>
  );
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}
