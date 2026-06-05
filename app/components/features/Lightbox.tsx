"use client";

import { useEffect, useState } from "react";

// Non-invasive photo lightbox. Rather than re-rendering the Instagram grid, it
// delegates clicks on existing `a.insta-grid-link` anchors: the first click
// opens a full-screen overlay of that image instead of navigating away. The
// underlying links still work with JS disabled or when the flag is off.
export function Lightbox({ closeLabel }: { closeLabel: string }) {
  const [active, setActive] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const link = (e.target as HTMLElement).closest("a.insta-grid-link");
      if (!link) return;
      const img = link.querySelector("img");
      if (!img) return;
      e.preventDefault();
      setActive({ src: img.currentSrc || img.src, alt: img.alt });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  if (!active) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setActive(null)}>
      <button type="button" className="lightbox-close" aria-label={closeLabel} onClick={() => setActive(null)}>
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="lightbox-img" src={active.src} alt={active.alt} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
