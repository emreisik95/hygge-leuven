import { prisma } from "@/lib/db";
import type { z } from "zod";

// Low-level access to the generic Setting key→JSON store. Each feature persists
// one row (key = `feature.<flagKey>`) holding a JSON document validated against
// that feature's Zod schema in lib/feature-settings.ts. Absent or invalid rows
// fall back to the in-code default, so the public site never breaks on a bad or
// missing value — it just renders the seed copy.

/** Per-row character ceiling for a serialized settings document. */
export const MAX_SETTING_BYTES = 20_000;

export async function readSettingRaw(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

/** Read + parse + validate a setting, returning `fallback` on any failure. */
export async function readSetting<T>(key: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  const raw = await readSettingRaw(key);
  if (raw == null) return fallback;
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

/** Validate then persist a setting. Throws if the value doesn't match `schema`. */
export async function writeSetting<T>(key: string, schema: z.ZodType<T>, value: T): Promise<void> {
  const data = schema.parse(value);
  const serialized = JSON.stringify(data);
  if (serialized.length > MAX_SETTING_BYTES) {
    throw new Error(`Setting "${key}" is too large (${serialized.length}/${MAX_SETTING_BYTES} bytes).`);
  }
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: serialized },
    update: { value: serialized },
  });
}

/** Read many settings at once, mapping each missing key to its fallback. */
export async function readSettings(keys: string[]): Promise<Map<string, string>> {
  if (keys.length === 0) return new Map();
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  return new Map(rows.map((r) => [r.key, r.value] as const));
}
