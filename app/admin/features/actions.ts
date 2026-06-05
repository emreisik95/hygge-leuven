"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { loadFlags, setFlag, FLAG_KEYS, type FlagKey } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { SPECS_BY_FLAG, saveFeatureSetting } from "@/lib/feature-settings";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Persist the whole flag form in one shot. Checkboxes absent from the POST mean
// "off"; only flags whose value actually changed are written and audited.
export async function updateFlags(formData: FormData) {
  await requireAdmin();

  const current = await loadFlags();
  const changes: { key: string; from: boolean; to: boolean }[] = [];

  for (const key of FLAG_KEYS) {
    const next = formData.get(key) === "on";
    if (next !== current[key]) {
      await setFlag(key, next);
      changes.push({ key, from: current[key], to: next });
    }
  }

  if (changes.length > 0) {
    await logAudit({ action: "flags.update", entity: "FeatureFlag", diff: changes });
    // Flags change what the public page renders.
    revalidatePath("/");
    revalidatePath("/admin/preview");
  }
  revalidatePath("/admin/features");
  redirect("/admin/features?saved=1");
}

// Persist one feature's editable copy/content. Scalar fields arrive as
// `f::<name>`; list rows arrive as a single JSON `items` field maintained by the
// inline editor. The document is validated against the feature's Zod schema in
// saveFeatureSetting (which throws on bad input).
export async function updateFeatureSettings(formData: FormData) {
  await requireAdmin();

  const flag = formData.get("flag");
  if (typeof flag !== "string") throw new Error("Missing flag");
  const spec = SPECS_BY_FLAG.get(flag as FlagKey);
  if (!spec) throw new Error(`Unknown feature: ${flag}`);

  const doc: Record<string, unknown> = {};
  for (const field of spec.fields) {
    const raw = formData.get(`f::${field.name}`);
    doc[field.name] = typeof raw === "string" ? raw : "";
  }
  if (spec.list) {
    const itemsRaw = formData.get("items");
    if (typeof itemsRaw === "string" && itemsRaw.trim() !== "") {
      let parsed: unknown;
      try {
        parsed = JSON.parse(itemsRaw);
      } catch {
        redirect(`/admin/features?error=bad_items#${flag}`);
      }
      doc.items = parsed;
    } else {
      doc.items = [];
    }
  }

  try {
    await saveFeatureSetting(spec.flag, doc);
  } catch {
    redirect(`/admin/features?error=invalid#${flag}`);
  }

  await logAudit({ action: "feature.settings.update", entity: "Setting", entityId: spec.flag });
  revalidatePath("/");
  revalidatePath("/admin/preview");
  revalidatePath("/admin/features");
  redirect(`/admin/features?saved=1#${flag}`);
}
