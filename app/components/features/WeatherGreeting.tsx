"use client";

import { useEffect, useState } from "react";

// Tiny contextual greeting driven by live Leuven weather (Open-Meteo, no API
// key, no tracking). Fails silent: if the fetch errors, nothing renders.
const LAT = 50.8798;
const LNG = 4.7005;

export function WeatherGreeting({ template }: { template: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&current=temperature_2m,weather_code`;
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("weather"))))
      .then((j) => {
        const t = Math.round(j?.current?.temperature_2m);
        const code = j?.current?.weather_code;
        if (!Number.isFinite(t)) return;
        const word = describe(code);
        setText(template.replace("{temp}", `${t}°C`).replace("{sky}", word));
      })
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [template]);

  if (!text) return null;
  return (
    <p className="weather-greeting" role="status">
      {text}
    </p>
  );
}

// Coarse WMO weather-code buckets — enough for a one-word mood.
function describe(code: number): string {
  if (code == null) return "out";
  if (code === 0) return "clear";
  if (code <= 3) return "cloudy";
  if (code <= 48) return "foggy";
  if (code <= 67) return "rainy";
  if (code <= 77) return "snowy";
  if (code <= 82) return "rainy";
  return "stormy";
}
