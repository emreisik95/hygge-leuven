"use client";

import { useEffect } from "react";

// Subtly shifts the accent colour by meteorological season (northern
// hemisphere). Renders nothing; only sets a CSS custom property on <html>.
export function SeasonalAccent() {
  useEffect(() => {
    const month = new Date().getMonth(); // 0 = Jan
    const accent = seasonAccent(month);
    document.documentElement.style.setProperty("--instagram", accent);
    return () => {
      document.documentElement.style.removeProperty("--instagram");
    };
  }, []);
  return null;
}

function seasonAccent(month: number): string {
  if (month >= 2 && month <= 4) return "#7a7d3e"; // spring — olive green
  if (month >= 5 && month <= 7) return "#b3622a"; // summer — warm terracotta
  if (month >= 8 && month <= 10) return "#9a3e22"; // autumn — house default rust
  return "#3f6675"; // winter — cool slate blue
}
