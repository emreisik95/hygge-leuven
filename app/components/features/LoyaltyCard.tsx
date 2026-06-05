"use client";

import { useEffect, useState } from "react";

const KEY = "hygge-loyalty";
const STAMPS = 8;

// A playful self-service stamp card. State lives entirely in the visitor's
// browser — tapping a cup fills it; reaching the goal reveals a reward line.
// (No real reward is promised; it's a friendly engagement toy.)
export function LoyaltyCard({
  heading,
  hint,
  rewardLine,
  resetLabel,
}: {
  heading: string;
  hint: string;
  rewardLine: string;
  resetLabel: string;
}) {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const n = parseInt(localStorage.getItem(KEY) ?? "0", 10);
      if (Number.isFinite(n)) setCount(Math.max(0, Math.min(STAMPS, n)));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = (n: number) => {
    setCount(n);
    try {
      localStorage.setItem(KEY, String(n));
    } catch {
      /* ignore */
    }
  };

  if (!ready) return null;
  const complete = count >= STAMPS;

  return (
    <div className="loyalty">
      <h3 className="loyalty-heading">{heading}</h3>
      <p className="loyalty-hint">{complete ? rewardLine : hint}</p>
      <div className="loyalty-grid" role="group" aria-label={heading}>
        {Array.from({ length: STAMPS }, (_, i) => {
          const filled = i < count;
          return (
            <button
              key={i}
              type="button"
              className={`loyalty-stamp${filled ? " is-filled" : ""}`}
              aria-pressed={filled}
              aria-label={`${i + 1} / ${STAMPS}`}
              onClick={() => persist(i + 1 === count ? i : i + 1)}
            >
              ☕
            </button>
          );
        })}
      </div>
      {count > 0 ? (
        <button type="button" className="loyalty-reset" onClick={() => persist(0)}>
          {resetLabel}
        </button>
      ) : null}
    </div>
  );
}
