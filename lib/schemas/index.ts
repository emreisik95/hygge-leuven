// One schema layer for the admin. Zod is the single source of truth for field
// validation; `zodFieldErrors` adapts a ZodError into the existing
// `FieldError[]` shape so schemas drop into actions that still transport errors
// via the querystring, and the same schemas can later drive client-side
// `maxLength`/`pattern` hints. Replaces the ad-hoc validators in lib/validation.
import type { ZodError } from "zod";
import type { FieldError } from "@/lib/validation";

export function zodFieldErrors(error: ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.map(String).join(".") || "_form",
    message: issue.message,
  }));
}

export * from "./site";
