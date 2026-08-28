"use client";

import { useState } from "react";

export type AdminHoursRow = {
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
};

type ScheduleDay = AdminHoursRow & { closed: boolean };

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
const WEEKDAY_DOWS = [1, 2, 3, 4, 5] as const;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function normalizeRows(rows: AdminHoursRow[]): ScheduleDay[] {
  const byDow = new Map(rows.map((row) => [row.dayOfWeek, row]));
  return DAY_ORDER.map((dayOfWeek) => {
    const row = byDow.get(dayOfWeek);
    const opensAt = row?.opensAt ?? "";
    const closesAt = row?.closesAt ?? "";
    return {
      dayOfWeek,
      opensAt,
      closesAt,
      closed: !opensAt || !closesAt,
    };
  });
}

function weekdaysMatch(days: ScheduleDay[]) {
  const weekdays = days.filter((day) => WEEKDAY_DOWS.includes(day.dayOfWeek as 1 | 2 | 3 | 4 | 5));
  const first = weekdays[0];
  return Boolean(
    first &&
      weekdays.every(
        (day) =>
          day.closed === first.closed &&
          day.opensAt === first.opensAt &&
          day.closesAt === first.closesAt,
      ),
  );
}

function fieldNames(day: ScheduleDay) {
  return {
    closed: `hours_${day.dayOfWeek}_closed`,
    opensAt: `hours_${day.dayOfWeek}_opensAt`,
    closesAt: `hours_${day.dayOfWeek}_closesAt`,
  };
}

function SubmissionFields({ days }: { days: ScheduleDay[] }) {
  return (
    <>
      {DAY_ORDER.map((dow) => {
        const day = days.find((candidate) => candidate.dayOfWeek === dow)!;
        const names = fieldNames(day);
        return (
          <span key={dow} hidden>
            {day.closed ? <input type="hidden" name={names.closed} value="on" /> : null}
            <input type="hidden" name={names.opensAt} value={day.opensAt ?? ""} />
            <input type="hidden" name={names.closesAt} value={day.closesAt ?? ""} />
          </span>
        );
      })}
    </>
  );
}

function ScheduleControls({
  id,
  label,
  days,
  dows,
  errors,
  onChange,
}: {
  id: string;
  label: string;
  days: ScheduleDay[];
  dows: readonly number[];
  errors: Record<string, string>;
  onChange: (dows: readonly number[], patch: Partial<ScheduleDay>) => void;
}) {
  const day = days.find((candidate) => candidate.dayOfWeek === dows[0])!;
  const openError = dows.map((dow) => errors[`hours_${dow}_opensAt`]).find(Boolean);
  const closeError = dows.map((dow) => errors[`hours_${dow}_closesAt`]).find(Boolean);
  const closedId = `${id}-closed`;
  const opensId = `${id}-opens`;
  const closesId = `${id}-closes`;

  return (
    <fieldset className="hours-group-card">
      <legend>{label}</legend>
      <label className="hours-closed-toggle" htmlFor={closedId}>
        <input
          id={closedId}
          type="checkbox"
          checked={day.closed}
          onChange={(event) => onChange(dows, { closed: event.target.checked })}
        />
        Closed
      </label>
      <div className="hours-time-pair">
        <label htmlFor={opensId}>
          Opens
          <input
            id={opensId}
            type="time"
            value={day.opensAt ?? ""}
            disabled={day.closed}
            onChange={(event) => onChange(dows, { opensAt: event.target.value })}
            aria-invalid={openError ? true : undefined}
          />
          {openError ? <span className="field-error" role="alert">{openError}</span> : null}
        </label>
        <label htmlFor={closesId}>
          Closes
          <input
            id={closesId}
            type="time"
            value={day.closesAt ?? ""}
            disabled={day.closed}
            onChange={(event) => onChange(dows, { closesAt: event.target.value })}
            aria-invalid={closeError ? true : undefined}
          />
          {closeError ? <span className="field-error" role="alert">{closeError}</span> : null}
        </label>
      </div>
    </fieldset>
  );
}

export function GroupedHoursEditor({
  hoursRows,
  errors,
}: {
  hoursRows: AdminHoursRow[];
  errors: Record<string, string>;
}) {
  const [days, setDays] = useState(() => normalizeRows(hoursRows));
  const [individual, setIndividual] = useState(() => !weekdaysMatch(normalizeRows(hoursRows)));

  function updateDays(dows: readonly number[], patch: Partial<ScheduleDay>) {
    setDays((current) =>
      current.map((day) => (dows.includes(day.dayOfWeek) ? { ...day, ...patch } : day)),
    );
  }

  return (
    <div className="grouped-hours-editor">
      <SubmissionFields days={days} />

      <div className="hours-editor-heading">
        <p className="hint">
          Times use Leuven local time. Overnight ranges are supported.
        </p>
        <button
          className="button button-secondary hours-editor-mode"
          type="button"
          onClick={() => setIndividual((current) => !current)}
        >
          {individual ? "Use grouped editor" : "Edit days individually"}
        </button>
      </div>

      <div className="hours-group-list" role="group" aria-label="Weekly opening hours">
        {individual ? (
          DAY_ORDER.map((dow) => (
            <ScheduleControls
              key={dow}
              id={`day-${dow}`}
              label={DAY_NAMES[dow]}
              days={days}
              dows={[dow]}
              errors={errors}
              onChange={updateDays}
            />
          ))
        ) : (
          <>
            <ScheduleControls
              id="weekdays"
              label="Monday – Friday"
              days={days}
              dows={WEEKDAY_DOWS}
              errors={errors}
              onChange={updateDays}
            />
            <ScheduleControls
              id="saturday"
              label="Saturday"
              days={days}
              dows={[6]}
              errors={errors}
              onChange={updateDays}
            />
            <ScheduleControls
              id="sunday"
              label="Sunday"
              days={days}
              dows={[0]}
              errors={errors}
              onChange={updateDays}
            />
          </>
        )}
      </div>
    </div>
  );
}
