"use server";

import { prisma } from "@/lib/db";
import { Locale } from "@prisma/client";
import { logAudit } from "@/lib/audit";

export type SubscribeState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Stores a newsletter opt-in. Idempotent: re-submitting a known address is
// treated as success rather than leaking that the address already exists.
export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const localeRaw = String(formData.get("locale") ?? "EN");
  const locale: Locale = localeRaw === "NL" || localeRaw === "FR" ? (localeRaw as Locale) : "EN";

  if (!EMAIL_RE.test(email) || email.length > 200) {
    return { ok: false, message: "invalid" };
  }

  try {
    await prisma.subscriber.upsert({
      where: { email },
      create: { email, locale },
      update: {}, // already subscribed → no-op
    });
    await logAudit({
      action: "newsletter.subscribe",
      entity: "Subscriber",
      entityId: email,
    });
    return { ok: true, message: "ok" };
  } catch {
    return { ok: false, message: "error" };
  }
}
