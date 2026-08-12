const SEASONAL_ACCENT_PROPERTY = "--seasonal-accent";

type AccentStyle = Pick<CSSStyleDeclaration, "setProperty" | "removeProperty">;

export function seasonalAccentForMonth(month: number): string {
  if (month >= 2 && month <= 4) return "#7a7d3e"; // spring — olive green
  if (month >= 5 && month <= 7) return "#b3622a"; // summer — warm terracotta
  if (month >= 8 && month <= 10) return "#9a3e22"; // autumn — house default rust
  return "#3f6675"; // winter — cool slate blue
}

export function applySeasonalAccent(style: AccentStyle, month: number): () => void {
  style.setProperty(SEASONAL_ACCENT_PROPERTY, seasonalAccentForMonth(month));
  return () => style.removeProperty(SEASONAL_ACCENT_PROPERTY);
}
