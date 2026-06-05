"use client";

import { useEffect, useRef, useState } from "react";

const KEY = "hygge-a11y";

// Text scale is applied as CSS `zoom` on the scrolling content container
// (.shell) via the --user-zoom custom property. This site sizes type in px and
// viewport units, so a root font-size would NOT scale it; `zoom` proportionally
// scales px text and spacing, reflows naturally, and leaves the fixed control
// stack untouched. Browsers without `zoom` simply ignore it (graceful no-op).
// Clamped to gentle fixed steps so layout never breaks.
const STEPS = [0.9, 1, 1.1, 1.2, 1.3] as const;
const DEFAULT_STEP = 1; // index into STEPS → 100%

type Prefs = { step: number; contrast: boolean; motion: boolean };

const DEFAULTS: Prefs = { step: DEFAULT_STEP, contrast: false, motion: false };

function clampStep(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_STEP;
  return Math.max(0, Math.min(STEPS.length - 1, Math.round(n)));
}

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      step: clampStep(typeof parsed.step === "number" ? parsed.step : DEFAULT_STEP),
      contrast: parsed.contrast === true,
      motion: parsed.motion === true,
    };
  } catch {
    return DEFAULTS;
  }
}

// Mirror prefs onto <html> so globals.css hooks can react. Renders nothing
// here; this is the single place that touches the document.
function applyPrefs(p: Prefs) {
  const root = document.documentElement;
  root.style.setProperty("--user-zoom", String(STEPS[p.step]));
  if (p.contrast) root.setAttribute("data-contrast", "high");
  else root.removeAttribute("data-contrast");
  if (p.motion) root.setAttribute("data-reduce-motion", "on");
  else root.removeAttribute("data-reduce-motion");
}

type Copy = {
  heading: string;
  textSize: string;
  increase: string;
  decrease: string;
  contrast: string;
  motion: string;
  close: string;
};

// Floating accessibility control. Opens a small popover with text-size
// stepping, a high-contrast toggle and a reduce-motion toggle. Choices persist
// in localStorage and are re-applied to <html> on mount. Fails silent on any
// storage error; never renders until hydrated to avoid a flash.
export function A11yToolbar({ copy }: { copy: Copy }) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Apply persisted prefs once on mount.
  useEffect(() => {
    const p = readPrefs();
    setPrefs(p);
    applyPrefs(p);
    setReady(true);
    // The visitor's chosen prefs intentionally persist for the session; there
    // is nothing transient to tear down on unmount.
  }, []);

  const update = (next: Prefs) => {
    setPrefs(next);
    applyPrefs(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  // Close on Escape and on outside pointer-down while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!ready) return null;

  const atMin = prefs.step <= 0;
  const atMax = prefs.step >= STEPS.length - 1;
  const pct = Math.round(STEPS[prefs.step] * 100);

  return (
    <div className="a11y-tb">
      <button
        ref={buttonRef}
        type="button"
        className="a11y-tb-btn"
        aria-label={copy.heading}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? "a11y-tb-panel" : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4" r="1.6" />
          <path d="M4 7h16M9 21l3-8 3 8M9 11.5h6" />
        </svg>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id="a11y-tb-panel"
          className="a11y-tb-panel"
          role="dialog"
          aria-modal="false"
          aria-label={copy.heading}
          tabIndex={-1}
        >
          <div className="a11y-tb-head">
            <h2 className="a11y-tb-title">{copy.heading}</h2>
            <button
              type="button"
              className="a11y-tb-close"
              aria-label={copy.close}
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>

          <div className="a11y-tb-row">
            <span className="a11y-tb-label" id="a11y-tb-size">{copy.textSize}</span>
            <div className="a11y-tb-size" role="group" aria-labelledby="a11y-tb-size">
              <button
                type="button"
                className="a11y-tb-step"
                aria-label={copy.decrease}
                disabled={atMin}
                onClick={() => update({ ...prefs, step: clampStep(prefs.step - 1) })}
              >
                A<span aria-hidden="true">–</span>
              </button>
              <span className="a11y-tb-pct" aria-live="polite">{pct}%</span>
              <button
                type="button"
                className="a11y-tb-step"
                aria-label={copy.increase}
                disabled={atMax}
                onClick={() => update({ ...prefs, step: clampStep(prefs.step + 1) })}
              >
                A<span aria-hidden="true">+</span>
              </button>
            </div>
          </div>

          <div className="a11y-tb-row">
            <span className="a11y-tb-label" id="a11y-tb-contrast">{copy.contrast}</span>
            <button
              type="button"
              className={`a11y-tb-switch${prefs.contrast ? " is-on" : ""}`}
              role="switch"
              aria-checked={prefs.contrast}
              aria-labelledby="a11y-tb-contrast"
              onClick={() => update({ ...prefs, contrast: !prefs.contrast })}
            >
              <span className="a11y-tb-knob" aria-hidden="true" />
            </button>
          </div>

          <div className="a11y-tb-row">
            <span className="a11y-tb-label" id="a11y-tb-motion">{copy.motion}</span>
            <button
              type="button"
              className={`a11y-tb-switch${prefs.motion ? " is-on" : ""}`}
              role="switch"
              aria-checked={prefs.motion}
              aria-labelledby="a11y-tb-motion"
              onClick={() => update({ ...prefs, motion: !prefs.motion })}
            >
              <span className="a11y-tb-knob" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
