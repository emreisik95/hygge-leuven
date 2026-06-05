"use client";

import { useEffect, useState } from "react";

// Small floating note that reads the live Leuven weather (Open-Meteo, no API
// key, no tracking) and suggests a fitting drink. Three moods: rainy -> cosy,
// cool -> warm cup, warm -> iced. Fails silent (renders null) on any fetch
// error. The dismissal persists for the browser session only.
const LAT = 50.8798;
const LNG = 4.7005;
const KEY = "hygge-weather-recommend";

type Mood = "hot" | "cold" | "rainy";

// House style: all floating-control glyphs are inline SVGs that inherit the
// --ink colour via stroke="currentColor" (see ThemeToggle / BackToTop). We use
// the same here rather than emoji so the icon is colour-token driven and renders
// identically across platforms.
function MoodIcon({ mood }: { mood: Mood }) {
  const common = {
    "aria-hidden": true as const,
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (mood === "rainy") {
    // Cloud with rain
    return (
      <svg {...common}>
        <path d="M7 16a4 4 0 0 1-.5-7.97A5 5 0 0 1 16 7.5a3.5 3.5 0 0 1 .5 6.96" />
        <path d="M9 19l-1 2M13 19l-1 2M17 19l-1 2" />
      </svg>
    );
  }
  if (mood === "cold") {
    // Steaming cup
    return (
      <svg {...common}>
        <path d="M5 11h12v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
        <path d="M17 12h1.5a2.5 2.5 0 0 1 0 5H17" />
        <path d="M8 3.5c-.6.8-.6 1.7 0 2.5M12 3.5c-.6.8-.6 1.7 0 2.5" />
      </svg>
    );
  }
  // Iced cup
  return (
    <svg {...common}>
      <path d="M5 12h12v2a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
      <path d="M17 13h1.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M9 8.5v-2M13 8.5v-2" />
    </svg>
  );
}

export function WeatherRecommend({
  hot,
  cold,
  rainy,
  dismiss,
}: {
  hot: string;
  cold: string;
  rainy: string;
  dismiss: string;
}) {
  const [mood, setMood] = useState<Mood | null>(null);

  useEffect(() => {
    // Honour a session-scoped dismissal before doing any work.
    try {
      if (sessionStorage.getItem(KEY) != null) return;
    } catch {
      /* sessionStorage unavailable — carry on, just won't persist */
    }

    const ctrl = new AbortController();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&current=temperature_2m,weather_code`;
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("weather"))))
      .then((j) => {
        const temp = Number(j?.current?.temperature_2m);
        const code = Number(j?.current?.weather_code);
        if (!Number.isFinite(temp)) return;
        setMood(pickMood(temp, code));
      })
      .catch(() => undefined);
    return () => ctrl.abort();
  }, []);

  if (!mood) return null;

  const text = mood === "rainy" ? rainy : mood === "cold" ? cold : hot;

  const close = () => {
    setMood(null);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <aside className="weather-rec" role="status" aria-label="Drink suggestion">
      <span className="weather-rec-icon" aria-hidden="true">
        <MoodIcon mood={mood} />
      </span>
      <p className="weather-rec-text">{text}</p>
      <button
        type="button"
        className="weather-rec-dismiss"
        aria-label={dismiss}
        onClick={close}
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </aside>
  );
}

// Rain takes priority over temperature (a cosy day is a cosy day). Otherwise a
// single honest threshold: Leuven is a cool maritime climate, so only suggest
// an iced drink when it is genuinely warm (>= 20 C); everything cooler gets the
// warm-cup suggestion, which always reads true. WMO codes 51-67 (drizzle/rain),
// 80-82 (showers) and 95-99 (thunderstorm) count as rainy. Guards against a
// non-finite temperature upstream (handled before this is called).
function pickMood(temp: number, code: number): Mood {
  const rainy =
    (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);
  if (rainy) return "rainy";
  if (temp >= 20) return "hot";
  return "cold";
}
