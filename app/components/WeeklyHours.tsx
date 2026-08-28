import type { LocaleCode } from "@/lib/locale";
import { formatRowRange, type OpeningHoursRow } from "@/lib/hours";

const DAY_LABELS: Record<LocaleCode, string[]> = {
  EN: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  NL: ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"],
  FR: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
};

const GROUP_LABELS: Record<LocaleCode, { weekdays: string; closed: string; heading: string }> = {
  EN: { weekdays: "Monday–Friday", closed: "Closed", heading: "Opening hours" },
  NL: { weekdays: "Maandag–vrijdag", closed: "Gesloten", heading: "Openingsuren" },
  FR: { weekdays: "Lundi–vendredi", closed: "Fermé", heading: "Horaires" },
};

function displayRange(row: OpeningHoursRow | undefined, closed: string): string {
  if (!formatRowRange(row) || !row?.opensAt || !row.closesAt) return closed;
  return `${row.opensAt.padStart(5, "0")} – ${row.closesAt.padStart(5, "0")}`;
}

export function WeeklyHours({ hours, locale }: { hours: OpeningHoursRow[]; locale: LocaleCode }) {
  const rows = new Map(hours.map((row) => [row.dayOfWeek, row]));
  const copy = GROUP_LABELS[locale];
  const weekdays = [1, 2, 3, 4, 5].map((dow) => rows.get(dow));
  const weekdayRanges = weekdays.map((row) => displayRange(row, copy.closed));
  const grouped = new Set(weekdayRanges).size === 1;
  const schedule = grouped
    ? [
        { label: copy.weekdays, value: weekdayRanges[0] },
        { label: DAY_LABELS[locale][6], value: displayRange(rows.get(6), copy.closed) },
        { label: DAY_LABELS[locale][0], value: displayRange(rows.get(0), copy.closed) },
      ]
    : [1, 2, 3, 4, 5, 6, 0].map((dow) => ({
        label: DAY_LABELS[locale][dow],
        value: displayRange(rows.get(dow), copy.closed),
      }));

  return (
    <div className="weekly-hours" aria-labelledby="weekly-hours-heading">
      <h3 id="weekly-hours-heading" className="weekly-hours-heading">{copy.heading}</h3>
      <dl className="weekly-hours-list">
        {schedule.map((entry) => (
          <div className="weekly-hours-row" key={entry.label}>
            <dt>{entry.label}</dt>
            <dd>{entry.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
