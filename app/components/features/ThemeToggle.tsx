"use client";

import { useEffect, useRef, useState } from "react";

const KEY = "hygge-theme";
type Theme = "dark" | "light";

// Floating dark/light switch. The page is beige/light by default; choosing
// "dark" adds data-theme="dark" on <html>, which globals.css overrides read.
//
// With `viewTransition` (the themeTransition flag), the swap no longer snaps:
// the new theme spreads outward from the button as a soft circular wipe — the
// dark theme is the café after sundown, so flipping it should feel like
// dimming real lights. Progressive enhancement only: reduced-motion users and
// browsers without the View Transitions API keep the instant swap.
export function ThemeToggle({
  lightLabel,
  darkLabel,
  viewTransition,
}: {
  lightLabel: string;
  darkLabel: string;
  viewTransition?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let initial: Theme = "light";
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "light" || saved === "dark") initial = saved;
    } catch {
      /* ignore */
    }
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const applyTheme = (next: Theme) => {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  };

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const doc = document as Document & {
      startViewTransition?: (update: () => void) => { ready: Promise<void> };
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!viewTransition || reduce || typeof doc.startViewTransition !== "function") {
      applyTheme(next);
      return;
    }

    // The wipe grows from the button's centre to the farthest viewport corner.
    const rect = btnRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = doc.startViewTransition(() => applyTheme(next));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 420,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {
        /* transition skipped — the theme itself is already applied */
      });
  };

  const goingLight = theme === "dark";
  return (
    <button
      ref={btnRef}
      type="button"
      className="fab-theme"
      aria-label={goingLight ? lightLabel : darkLabel}
      aria-pressed={theme === "light"}
      onClick={toggle}
    >
      {goingLight ? (
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19" />
        </svg>
      ) : (
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
