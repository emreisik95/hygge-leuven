"use client";

import { useEffect, useState } from "react";

// Floating button that fades in after the visitor scrolls past one viewport and
// smooth-scrolls back to the landing section.
export function BackToTop({ label }: { label: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`fab-top${shown ? " is-shown" : ""}`}
      aria-label={label}
      tabIndex={shown ? 0 : -1}
      onClick={() => {
        const target = document.getElementById("landing") ?? document.body;
        target.scrollIntoView({ behavior: "smooth" });
      }}
    >
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
