"use server";

import { createHash } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import {
  MenuDocumentError,
  persistMenuPdf,
  readValidatedPdf,
} from "@/lib/menu-document";

function errorCode(error: MenuDocumentError): string {
  if (/required/i.test(error.message)) return "missing";
  if (/too large/i.test(error.message)) return "size";
  if (/unsupported type/i.test(error.message)) return "type";
  return "invalid";
}

export async function replaceMenuDocument(formData: FormData) {
  await requireAdmin();
  const file = formData.get("menuDocument");
  if (!(file instanceof File)) redirect("/admin/menu?error=missing");

  let validated: Awaited<ReturnType<typeof readValidatedPdf>>;
  try {
    validated = await readValidatedPdf(file);
  } catch (error) {
    if (error instanceof MenuDocumentError) {
      redirect(`/admin/menu?error=${errorCode(error)}`);
    }
    throw error;
  }

  try {
    await persistMenuPdf(validated.buffer);
  } catch {
    redirect("/admin/menu?error=write");
  }

  await logAudit({
    action: "menu.document.replace",
    entity: "MenuDocument",
    entityId: "current",
    diff: {
      bytes: validated.buffer.length,
      sha256: createHash("sha256").update(validated.buffer).digest("hex"),
    },
  });

  revalidatePath("/");
  revalidatePath("/menu.pdf");
  revalidatePath("/admin");
  revalidatePath("/admin/menu");
  redirect("/admin/menu?saved=1");
}
