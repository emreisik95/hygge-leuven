"use client";

import { useEffect, useState } from "react";
import type { LocaleCode } from "@/lib/locale";
import type { OpeningHoursRow } from "@/lib/hours";

// parseHHMM / formatMinutes are inlined (not imported from @/lib/hours) on
// purpose: this is a Client Component, and @/lib/hours top-imports prisma →
// better-sqlite3, which must never enter the browser bundle. The two helpers
// below are pure and kept byte-identical to their lib/hours.ts originals.
function parseHHMM(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

// A visual weekly opening-hours overview. Each weekday (Mon..Sun) gets a row with
// a horizontal bar spanning its open->close window across a shared time axis, plus
// the textual range. Closed days are shown muted. Today is highlighted client-side
// (Europe/Brussels): the component renders the full, crawlable grid on the server,
// and only adds the "is-today" marker after mount, which avoids hydration drift from
// the server's clock. Returns null if there are no hours to show.

const CAFE_TZ = "Europe/Brussels";
const BCP47: Record<LocaleCode, string> = { EN: "en-GB", NL: "nl-BE", FR: "fr-BE" };

// Mon..Sun display order, mapped to JS day-of-week indices (0=Sun..6=Sat).
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

// Localised full weekday name for a day-of-week index (0=Sunday). 2024-01-07 is a Sunday.
function weekdayName(dow: number, locale: LocaleCode): string {
  const ref = new Date(Date.UTC(2024, 0, 7 + dow));
  return new Intl.DateTimeFormat(BCP47[locale], { weekday: "long", timeZone: "UTC" }).format(ref);
}

// Today's day-of-week (0=Sun..6=Sat) in the café timezone, computed client-side.
function todayDowInCafeTz(): number {
  const en = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: CAFE_TZ }).format(
    new Date(),
  );
  const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const idx = order.indexOf(en);
  return idx >= 0 ? idx : -1;
}

// A row's open/close in minutes since midnight, normalising overnight windows
// (close <= open, e.g. 18:00 -> 02:00) by extending past 24h so the bar reads left→right.
function rowSpan(row: OpeningHoursRow): { open: number; close: number } | null {
  const o = parseHHMM(row.opensAt);
  let c = parseHHMM(row.closesAt);
  if (o == null || c == null) return null;
  if (c <= o) c += 24 * 60; // overnight
  return { open: o, close: c };
}

// A small set of round hour ticks for the shared axis (every few hours).
function buildTicks(axisMin: number, axisMax: number): number[] {
  const startH = Math.floor(axisMin / 60);
  const endH = Math.ceil(axisMax / 60);
  const span = endH - startH;
  const step = span <= 8 ? 2 : span <= 14 ? 3 : 4;
  const ticks: number[] = [];
  for (let h = startH; h <= endH; h += step) ticks.push(h * 60);
  if (ticks[ticks.length - 1] !== endH * 60) ticks.push(endH * 60);
  return ticks;
}

function tickLabel(min: number): string {
  const h = Math.floor(min / 60) % 24;
  return `${h}:00`;
}

export function OpeningTimeline({
  heading,
  backToTopLabel,
  hoursRows,
  locale,
}: {
  heading: string;
  backToTopLabel: string;
  hoursRows: OpeningHoursRow[];
  locale: LocaleCode;
}) {
  const [today, setToday] = useState<number>(-1);

  useEffect(() => {
    setToday(todayDowInCafeTz());
  }, []);

  if (!hoursRows || hoursRows.length === 0) return null;

  // Rows in Mon..Sun order, each paired with its computed span (or null = closed).
  const ordered = DISPLAY_ORDER.map((dow) => {
    const row = hoursRows.find((r) => r.dayOfWeek === dow);
    const span = row ? rowSpan(row) : null;
    return { dow, span };
  });

  // Shared axis bounds across all open days. If nothing is open, there's nothing to chart.
  const opens = ordered.flatMap((d) => (d.span ? [d.span.open] : []));
  const closes = ordered.flatMap((d) => (d.span ? [d.span.close] : []));
  if (opens.length === 0) return null;

  // Pad the axis out to whole hours for tidy ticks.
  const axisMin = Math.floor(Math.min(...opens) / 60) * 60;
  const axisMax = Math.ceil(Math.max(...closes) / 60) * 60;
  const axisSpan = Math.max(1, axisMax - axisMin);
  const ticks = buildTicks(axisMin, axisMax);

  const pct = (min: number) => ((min - axisMin) / axisSpan) * 100;

  return (
    <section
      className="pane pane-opening-timeline"
      id="opening-timeline"
      aria-labelledby="opening-timeline-heading"
    >
      <div className="otl-wrap">
        <h2 className="otl-heading" id="opening-timeline-heading">
          {heading}
        </h2>

        <div className="otl-chart">
          {/* Axis ticks are decorative; every row also carries a textual range for SR users. */}
          <div className="otl-axis" aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} className="otl-tick" style={{ left: `${pct(t)}%` }}>
                <span className="otl-tick-label">{tickLabel(t)}</span>
              </span>
            ))}
          </div>

          <ul className="otl-rows" role="list">
            {ordered.map(({ dow, span }) => {
              const name = weekdayName(dow, locale);
              const isToday = dow === today;
              const open = span ? formatMinutes(span.open % (24 * 60)) : null;
              const close = span ? formatMinutes(span.close % (24 * 60)) : null;
              const rangeText = span ? `${open} – ${close}` : "closed";
              return (
                <li
                  key={dow}
                  className={`otl-row${isToday ? " is-today" : ""}${span ? "" : " is-closed"}`}
                  aria-current={isToday ? "date" : undefined}
                >
                  <span className="otl-day">
                    {name}
                    {isToday ? <span className="otl-today-tag">today</span> : null}
                  </span>
                  <span className="otl-track" aria-hidden="true">
                    {span ? (
                      <span
                        className="otl-bar"
                        style={{
                          left: `${pct(span.open)}%`,
                          width: `${pct(span.close) - pct(span.open)}%`,
                        }}
                      />
                    ) : (
                      <span className="otl-bar-empty" />
                    )}
                  </span>
                  <span className={`otl-range${span ? "" : " is-closed"}`}>{rangeText}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <a href="#landing" className="back-link">
          {backToTopLabel}
        </a>
      </div>
    </section>
  );
}
