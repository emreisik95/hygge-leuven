"use client";

import { useEffect, useState } from "react";

// Dismissible top-of-page bar. The dismissal is keyed by the message text, so
// changing the announcement re-shows it even to visitors who closed the old one.
export function AnnouncementBanner({ message, closeLabel }: { message: string; closeLabel: string }) {
  const [open, setOpen] = useState(false);
  const storageKey = `hygge-ann:${hash(message)}`;

  useEffect(() => {
    try {
      setOpen(localStorage.getItem(storageKey) !== "1");
    } catch {
      setOpen(true);
    }
  }, [storageKey]);

  if (!open || !message.trim()) return null;

  return (
    <div className="ann-banner" role="region" aria-label="Announcement">
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
