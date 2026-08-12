"use client";

import { useEffect } from "react";
import { applySeasonalAccent } from "@/lib/seasonal-accent";

// Subtly shifts the accent colour by meteorological season (northern
// hemisphere). Renders nothing; only sets a CSS custom property on <html>.
export function SeasonalAccent() {
  useEffect(() => {
    return applySeasonalAccent(
      document.documentElement.style,
      new Date().getMonth(),
    );
  }, []);
  return null;
}
