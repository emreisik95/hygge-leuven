"use client";

import { useState } from "react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HoursRow({
  dow,
  initialClosed,
  initialOpensAt,
  initialClosesAt,
  opensError,
  closesError,
}: {
  dow: number;
  initialClosed: boolean;
  initialOpensAt: string;
  initialClosesAt: string;
  opensError?: string;
  closesError?: string;
}) {
  const [closed, setClosed] = useState(initialClosed);

  const dayName = DAY_NAMES[dow] ?? `Day ${dow}`;
  const closedId = `hours_${dow}_closed`;
  const opensId = `hours_${dow}_opensAt`;
  const closesId = `hours_${dow}_closesAt`;

  return (
    <div className="hours-row" role="group" aria-label={`${dayName} opening hours`}>
      <span className="hours-day" aria-hidden="true">{dayName}</span>

      <div className="hours-cell hours-cell-closed">
        <input
          id={closedId}
          name={closedId}
          type="checkbox"
          checked={closed}
          onChange={(e) => setClosed(e.target.checked)}
        />
        <label htmlFor={closedId}>closed</label>
      </div>

      <div className="hours-cell">
        <label htmlFor={opensId} className="sr-only">{dayName} opens at</label>
        <input
          id={opensId}
          name={opensId}
          type="time"
          defaultValue={initialOpensAt}
          disabled={closed}
          aria-label={`${dayName} opens at`}
          aria-invalid={opensError ? true : undefined}
          aria-describedby={opensError ? `${opensId}-error` : undefined}
        />
        {opensError ? <p id={`${opensId}-error`} className="field-error" role="alert">{opensError}</p> : null}
      </div>

      <div className="hours-cell">
        <label htmlFor={closesId} className="sr-only">{dayName} closes at</label>
        <input
          id={closesId}
          name={closesId}
          type="time"
          defaultValue={initialClosesAt}
          disabled={closed}
          aria-label={`${dayName} closes at`}
          aria-invalid={closesError ? true : undefined}
          aria-describedby={closesError ? `${closesId}-error` : undefined}
        />
        {closesError ? <p id={`${closesId}-error`} className="field-error" role="alert">{closesError}</p> : null}
      </div>
    </div>
  );
}
