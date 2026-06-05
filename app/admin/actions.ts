"use server";

import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin-auth";
import {
  prisma,
  SITE_TEXT_FIELDS,
  siteTextNamespace,
  DEFAULT_LOCALE,
  parseDraft,
  type SiteTextField,
  type SiteDraft,
} from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  asString,
  encodeErrors,
  validateHHMM,
  validateHoursRange,
  type FieldError,
} from "@/lib/validation";
import { SiteContentSchema, zodFieldErrors } from "@/lib/schemas";

const SITE_SCALAR_FIELDS = ["addressLine1", "addressLine2", "findUsUrl", "instagramUrl"] as const;
const NUMBER_FIELDS = ["mapLat", "mapLng", "mapZoom"] as const;
const INT_FIELDS = new Set<string>(["mapZoom"]);
const BOOL_FIELDS = [
  "showDefinition",
  "showTagline",
  "showInvite",
  "showStatus",
  "showAddress",
  "showHours",
] as const;

function pickScalars(formData: FormData): SiteDraft["scalars"] {
  const out: Record<string, string | number | boolean> = {};
  for (const k of SITE_SCALAR_FIELDS) {
    const v = formData.get(k);
    if (typeof v === "string") out[k] = v;
  }
  for (const k of NUMBER_FIELDS) {
    const v = formData.get(k);
    if (typeof v === "string" && v.trim() !== "") {
      const n = INT_FIELDS.has(k) ? parseInt(v, 10) : parseFloat(v);
      if (Number.isFinite(n)) out[k] = n;
    }
  }
  // Visibility booleans only included when the form actually rendered them
  // (sentinel `_visibilityForm=1` so we don't clobber values from forms that
  // omit these fields).
  if (formData.get("_visibilityForm") === "1") {
    for (const k of BOOL_FIELDS) {
      out[k] = formData.get(k) === "on";
    }
  }
  return out as SiteDraft["scalars"];
}

function pickTexts(formData: FormData): SiteDraft["texts"] {
  const texts: NonNullable<SiteDraft["texts"]> = {};
  for (const field of SITE_TEXT_FIELDS as SiteTextField[]) {
    const v = formData.get(field);
    if (typeof v === "string") {
      const ns = siteTextNamespace(field);
      texts[ns] = { ...(texts[ns] ?? {}), [DEFAULT_LOCALE]: v };
    }
  }
  return texts;
}

// "Save draft": persist edits to SiteContent.draftJson without publishing.
// The landing page continues to render the previously published values.
export async function saveContentDraft(formData: FormData) {
  await requireAdmin();

  const parsed = SiteContentSchema.safeParse({
    findUsUrl: asString(formData.get("findUsUrl")),
    instagramUrl: asString(formData.get("instagramUrl")),
    mapLat: asString(formData.get("mapLat")),
    mapLng: asString(formData.get("mapLng")),
    mapZoom: asString(formData.get("mapZoom")),
  });
  if (!parsed.success) {
    redirect(`/admin?errors=${encodeErrors(zodFieldErrors(parsed.error))}`);
  }

  const existing = await prisma.siteContent.findUnique({ where: { id: 1 } });
  const prior = parseDraft(existing?.draftJson ?? null) ?? {};
  const draft: SiteDraft = {
    scalars: { ...(prior.scalars ?? {}), ...pickScalars(formData) },
    texts: { ...(prior.texts ?? {}), ...pickTexts(formData) },
    savedAt: new Date().toISOString(),
  };

  await prisma.siteContent.upsert({
    where: { id: 1 },
    create: { id: 1, draftJson: JSON.stringify(draft) },
    update: { draftJson: JSON.stringify(draft) },
  });

  await logAudit({
    action: "site.draft.save",
    entity: "SiteContent",
    entityId: 1,
    diff: { scalarKeys: Object.keys(draft.scalars ?? {}), textKeys: Object.keys(draft.texts ?? {}) },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/preview");
  redirect("/admin?saved=1");
}

// "Publish": atomically apply draftJson to live columns + Translation rows,
// bump publishedAt, clear the draft, and write a single audit row carrying
// the diff. Other entities (hours, menu, photos, instagram, translations
// in /admin/translations) publish immediately when saved.
export async function publishContent() {
  await requireAdmin();

  const existing = await prisma.siteContent.findUnique({ where: { id: 1 } });
  if (!existing) throw new Error("SiteContent missing");
  const draft = parseDraft(existing.draftJson);
  if (!draft) throw new Error("No draft to publish");

  const scalarUpdate = draft.scalars ?? {};
  const textNamespaces = Object.entries(draft.texts ?? {});

  // Build a snapshot of live values for the audit diff before we overwrite.
  const beforeTexts: Record<string, Record<string, string>> = {};
  if (textNamespaces.length > 0) {
    const liveRows = await prisma.translation.findMany({
      where: { namespace: { in: textNamespaces.map(([ns]) => ns) } },
    });
    for (const r of liveRows) {
      beforeTexts[r.namespace] = { ...(beforeTexts[r.namespace] ?? {}), [r.locale]: r.value };
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.siteContent.update({
        where: { id: 1 },
        data: {
          ...scalarUpdate,
          publishedAt: new Date(),
          draftJson: null,
        },
      });
      for (const [namespace, perLocale] of textNamespaces) {
        for (const [locale, value] of Object.entries(perLocale)) {
          if (typeof value !== "string") continue;
          await tx.translation.upsert({
            where: { namespace_locale: { namespace, locale: locale as "EN" | "NL" | "FR" } },
            create: { namespace, locale: locale as "EN" | "NL" | "FR", value },
            update: { value },
          });
        }
      }
    });
  } catch (err) {
    console.error("publishContent transaction failed", err);
    redirect("/admin?error=publish");
  }

  await logAudit({
    action: "site.publish",
    entity: "SiteContent",
    entityId: 1,
    diff: {
      scalars: scalarUpdate,
      texts: draft.texts ?? {},
      previousTexts: beforeTexts,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/preview");
  redirect("/admin?published=1");
}

export async function discardContentDraft() {
  await requireAdmin();
  const existing = await prisma.siteContent.findUnique({ where: { id: 1 } });
  if (existing?.draftJson) {
    await prisma.siteContent.update({
      where: { id: 1 },
      data: { draftJson: null },
    });

    await logAudit({
      action: "site.draft.discard",
      entity: "SiteContent",
      entityId: 1,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/preview");
  }
  redirect("/admin?discarded=1");
}

// Backwards-compat: the existing /admin form posts to `updateContent`. Keep
// that name pointed at saveContentDraft so unsaved code paths keep working.
export const updateContent = saveContentDraft;

export async function updateHours(formData: FormData) {
  await requireAdmin();

  const errors: FieldError[] = [];
  const parsed: { dow: number; opensAt: string | null; closesAt: string | null }[] = [];

  for (let dow = 0; dow < 7; dow++) {
    const closed = formData.get(`hours_${dow}_closed`) === "on";
    if (closed) {
      parsed.push({ dow, opensAt: null, closesAt: null });
      continue;
    }
    const opens = asString(formData.get(`hours_${dow}_opensAt`)).trim();
    const closes = asString(formData.get(`hours_${dow}_closesAt`)).trim();
    const oErr = validateHHMM(opens);
    if (oErr) errors.push({ field: `hours_${dow}_opensAt`, message: oErr });
    const cErr = validateHHMM(closes);
    if (cErr) errors.push({ field: `hours_${dow}_closesAt`, message: cErr });
    if (!oErr && !cErr) {
      const rangeErr = validateHoursRange(opens, closes);
      if (rangeErr) errors.push({ field: `hours_${dow}_closesAt`, message: rangeErr });
    }
    parsed.push({ dow, opensAt: opens, closesAt: closes });
  }

  if (errors.length > 0) {
    redirect(`/admin/hours?errors=${encodeErrors(errors)}`);
  }

  const before = await prisma.openingHours.findMany({ orderBy: { dayOfWeek: "asc" } });
  const after = parsed.map((row) => ({
    dayOfWeek: row.dow,
    opensAt: row.opensAt,
    closesAt: row.closesAt,
  }));

  // All seven days persist together: a partial failure mid-loop would leave
  // the week in a mixed state, so upsert them atomically.
  await prisma.$transaction(
    parsed.map((row) =>
      prisma.openingHours.upsert({
        where: { dayOfWeek: row.dow },
        create: { dayOfWeek: row.dow, opensAt: row.opensAt, closesAt: row.closesAt },
        update: { opensAt: row.opensAt, closesAt: row.closesAt },
      })
    )
  );

  await logAudit({
    action: "hours.update",
    entity: "OpeningHours",
    before: before.map((b) => ({ dayOfWeek: b.dayOfWeek, opensAt: b.opensAt, closesAt: b.closesAt })),
    after,
  });

  revalidatePath("/");
  revalidatePath("/admin/hours");
  redirect("/admin/hours?savedHours=1");
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
