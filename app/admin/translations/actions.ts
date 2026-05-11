"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LOCALES, toPrismaLocale } from "@/lib/locale";
import { MAX_TRANSLATION_CHARS, encodeErrors, type FieldError } from "@/lib/validation";

// formData layout for a translation row:
//   key:   `tx::<namespace>::<LOCALE>`
//   value: string (may be empty — empty means "delete this row, fall back to EN")
// Plus a single hidden field `namespaces` listing all namespaces present in the form,
// one per line, so we know which rows the editor expected (lets us delete rows that
// were cleared without leaving stale entries).
export async function updateTranslations(formData: FormData) {
  await requireAdmin();

  const namespacesRaw = formData.get("namespaces");
  if (typeof namespacesRaw !== "string") {
    throw new Error("Missing namespaces field");
  }
  const namespaces = namespacesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const upserts: { namespace: string; locale: ReturnType<typeof toPrismaLocale>; value: string }[] = [];
  const deletes: { namespace: string; locale: ReturnType<typeof toPrismaLocale> }[] = [];
  const errors: FieldError[] = [];

  for (const ns of namespaces) {
    for (const code of LOCALES) {
      const fieldName = `tx::${ns}::${code}`;
      const raw = formData.get(fieldName);
      if (typeof raw !== "string") continue;
      const value = raw;
      if (value.length > MAX_TRANSLATION_CHARS) {
        errors.push({
          field: fieldName,
          message: `Too long (${value.length}/${MAX_TRANSLATION_CHARS})`,
        });
        continue;
      }
      if (value === "") {
        deletes.push({ namespace: ns, locale: toPrismaLocale(code) });
      } else {
        upserts.push({ namespace: ns, locale: toPrismaLocale(code), value });
      }
    }
  }

  if (errors.length > 0) {
    redirect(`/admin/translations?errors=${encodeErrors(errors)}`);
  }

  // Snapshot current values for the audit diff before we overwrite.
  const allKeys = [...upserts.map((u) => u.namespace), ...deletes.map((d) => d.namespace)];
  const before = allKeys.length
    ? await prisma.translation.findMany({ where: { namespace: { in: allKeys } } })
    : [];
  const beforeMap = new Map(before.map((r) => [`${r.namespace}|${r.locale}`, r.value] as const));

  await prisma.$transaction([
    ...upserts.map((row) =>
      prisma.translation.upsert({
        where: { namespace_locale: { namespace: row.namespace, locale: row.locale } },
        create: row,
        update: { value: row.value },
      })
    ),
    ...deletes.map((row) =>
      prisma.translation.deleteMany({
        where: { namespace: row.namespace, locale: row.locale },
      })
    ),
  ]);

  const changed: { key: string; from: string | null; to: string | null }[] = [];
  for (const u of upserts) {
    const prior = beforeMap.get(`${u.namespace}|${u.locale}`) ?? null;
    if (prior !== u.value) changed.push({ key: `${u.namespace}|${u.locale}`, from: prior, to: u.value });
  }
  for (const d of deletes) {
    const prior = beforeMap.get(`${d.namespace}|${d.locale}`) ?? null;
    if (prior != null) changed.push({ key: `${d.namespace}|${d.locale}`, from: prior, to: null });
  }

  await logAudit({
    action: "translations.update",
    entity: "Translation",
    diff: { changed, count: changed.length },
  });

  revalidatePath("/");
  revalidatePath("/admin/translations");
  redirect("/admin/translations?saved=1");
}
