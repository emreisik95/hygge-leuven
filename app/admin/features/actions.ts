"use server";

import { auth } from "@/auth";
import { loadFlags, setFlag, FLAG_KEYS } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

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
