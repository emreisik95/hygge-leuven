import { DIETARY_LEGEND } from "@/lib/dietary";

// A small key explaining the dietary tag letters used across the menu. Pulls
// the same list that drives the inline tags, so the legend can never drift from
// what the menu actually shows. Server component — no interactivity needed.

export function AllergenLegend({ heading, note }: { heading: string; note: string }) {
  if (DIETARY_LEGEND.length === 0) return null;
  return (
    <div className="allergen-legend" aria-label={heading}>
      <span className="allergen-legend-heading">{heading}</span>
      <ul className="allergen-legend-list" role="list">
        {DIETARY_LEGEND.map((tag) => (
          <li key={tag.code} className="allergen-legend-item">
            <span className="diet-tag" aria-hidden="true">
              {tag.code}
            </span>
            <span className="allergen-legend-label">{tag.label}</span>
          </li>
        ))}
      </ul>
      <p className="allergen-legend-note">{note}</p>
    </div>
  );
}
