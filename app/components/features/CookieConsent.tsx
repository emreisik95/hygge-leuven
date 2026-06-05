"use client";

import { useEffect, useState } from "react";

const KEY = "hygge-consent";

// Minimal, self-contained consent notice. The site sets no tracking cookies, so
// this is informational + dismissible; the choice is stored locally only.
export function CookieConsent({
  message,
  acceptLabel,
}: {
  message: string;
  acceptLabel: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setOpen(localStorage.getItem(KEY) == null);
    } catch {
      setOpen(false);
    }
  }, []);

  if (!open) return null;

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "ok");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="consent" role="dialog" aria-live="polite" aria-label="Cookie notice">
      <p className="consent-text">{message}</p>
      <button type="button" className="btn btn-primary consent-accept" onClick={dismiss}>
        {acceptLabel}
      </button>
    </div>
  );
}
