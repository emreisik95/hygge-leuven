// Lightweight form-validation helpers. We deliberately avoid zod (no new deps)
// and instead expose tiny field validators that return either a parsed value
// or an error string. Callers compose these and bubble errors to the UI via
// a redirect with `?errors=<field>:<msg>|<field>:<msg>` in the query string.

export type FieldError = { field: string; message: string };

export class ValidationError extends Error {
  constructor(public readonly errors: FieldError[]) {
    super(errors.map((e) => `${e.field}: ${e.message}`).join("; "));
  }
}

export function encodeErrors(errors: FieldError[]): string {
  return errors
    .map((e) => `${encodeURIComponent(e.field)}:${encodeURIComponent(e.message)}`)
    .join("|");
}

export function decodeErrors(raw: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  for (const part of raw.split("|")) {
    const idx = part.indexOf(":");
    if (idx < 0) continue;
    const field = decodeURIComponent(part.slice(0, idx));
    const message = decodeURIComponent(part.slice(idx + 1));
    if (field) out[field] = message;
  }
  return out;
}

export function fieldErrorProps(
  errors: Record<string, string>,
  field: string,
): { "aria-invalid"?: true; "aria-describedby"?: string } {
  if (!errors[field]) return {};
  return { "aria-invalid": true, "aria-describedby": `${field}-error` };
}

// ── primitive validators ─────────────────────────────────────────────────────

export function asString(raw: FormDataEntryValue | null): string {
  return typeof raw === "string" ? raw : "";
}

export function validateUrl(raw: string, opts: { allowEmpty?: boolean } = {}): string | null {
  const v = raw.trim();
  if (!v) return opts.allowEmpty ? null : "Required";
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "Must be http(s) URL";
    return null;
  } catch {
    return "Not a valid URL";
  }
}

export function validateLat(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "Required";
  const n = Number(v);
  if (!Number.isFinite(n)) return "Must be a number";
  if (n < -90 || n > 90) return "Must be between -90 and 90";
  return null;
}

export function validateLng(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "Required";
  const n = Number(v);
  if (!Number.isFinite(n)) return "Must be a number";
  if (n < -180 || n > 180) return "Must be between -180 and 180";
  return null;
}

export function validateZoom(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "Required";
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) return "Must be an integer";
  if (n < 1 || n > 22) return "Must be between 1 and 22";
  return null;
}

const HHMM = /^(\d{1,2}):(\d{2})$/;

export function validateHHMM(raw: string): string | null {
  if (!raw) return "Required";
  const m = HHMM.exec(raw);
  if (!m) return "Use HH:MM";
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return "Invalid time";
  return null;
}

// Allow either same-day (closes > opens) or overnight (closes < opens). Reject equal.
export function validateHoursRange(opens: string, closes: string): string | null {
  if (opens === closes) return "Open and close cannot be equal";
  return null;
}

export function validatePriceRaw(raw: string): { cents: number } | { error: string } {
  if (!raw.trim()) return { error: "Required" };
  const cleaned = raw.replace(/[^\d.,-]/g, "").replace(",", ".");
  if (!cleaned) return { error: "Invalid price" };
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n) || n < 0) return { error: "Must be a positive number" };
  return { cents: Math.round(n * 100) };
}

const ALLOWED_IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function validateImageFile(file: File | null, opts: { required?: boolean } = {}): string | null {
  if (!file || file.size === 0) return opts.required ? "File required" : null;
  if (!ALLOWED_IMAGE_MIMES.has(file.type)) {
    if (!file.type.startsWith("image/")) return `Unsupported type: ${file.type || "unknown"}`;
  }
  if (file.size > MAX_IMAGE_BYTES) return "File too large (max 8MB)";
  return null;
}

export const MAX_TRANSLATION_CHARS = 2000;

export function validateTextLength(raw: string, max: number): string | null {
  if (raw.length > max) return `Too long (${raw.length}/${max})`;
  return null;
}
