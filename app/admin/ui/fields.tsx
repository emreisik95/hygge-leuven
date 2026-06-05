// Presentational form primitives shared across every admin editor. These were
// previously redefined inline in each page.tsx with subtly different markup and
// inconsistent error/aria wiring; this is the single source of truth.
//
// Uniform contract: { name, label, defaultValue, error?, hint?, required? }.
// When `error` is set the control gets aria-invalid + aria-describedby pointing
// at the rendered message; `hint` is likewise linked via aria-describedby so
// screen readers announce it.

import type { InputHTMLAttributes } from "react";

type InputMode = InputHTMLAttributes<HTMLInputElement>["inputMode"];

function describedBy(name: string, hasError: boolean, hasHint: boolean): string | undefined {
  const ids = [hasHint ? `${name}-hint` : null, hasError ? `${name}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

export function Field({
  name,
  label,
  defaultValue,
  type = "text",
  inputMode,
  error,
  hint,
  required,
  maxLength,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  inputMode?: InputMode;
  error?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number;
}) {
  const description = describedBy(name, !!error, !!hint);
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        inputMode={inputMode}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={description}
      />
      {hint ? <p id={`${name}-hint`} className="hint">{hint}</p> : null}
      {error ? <p id={`${name}-error`} className="field-error" role="alert">{error}</p> : null}
    </div>
  );
}

export function TextareaField({
  name,
  label,
  defaultValue,
  rows,
  error,
  hint,
  required,
  maxLength,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
  error?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number;
}) {
  const description = describedBy(name, !!error, !!hint);
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={description}
      />
      {hint ? <p id={`${name}-hint`} className="hint">{hint}</p> : null}
      {error ? <p id={`${name}-error`} className="field-error" role="alert">{error}</p> : null}
    </div>
  );
}

export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="field-row">{children}</div>;
}

export function Toggle({
  name,
  label,
  defaultChecked,
  description,
  className = "toggle",
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
  description?: string;
  className?: string;
}) {
  return (
    <label className={className} htmlFor={name}>
      <input id={name} name={name} type="checkbox" defaultChecked={defaultChecked} />
      <span>
        <strong>{label}</strong>
        {description ? <span className="toggle-desc">{description}</span> : null}
      </span>
    </label>
  );
}
