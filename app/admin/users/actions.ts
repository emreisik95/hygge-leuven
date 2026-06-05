"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdmin, deleteAdmin } from "@/lib/admin-users";
import { logAudit } from "@/lib/audit";

// Add a new DB-backed admin. Email/password validation lives in createAdmin;
// errors flash back via the ?error query param.
export async function addAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");

  const result = await createAdmin(email, password, name);
  if (!result.ok) {
    redirect(`/admin/users?error=${result.error}`);
  }

  await logAudit({ action: "admin.create", entity: "AdminUser", entityId: result.email });
  revalidatePath("/admin/users");
  redirect("/admin/users?saved=added");
}

// Remove a DB-backed admin by id. The env bootstrap admin is not in this table
// and so can never be removed here.
export async function removeAdmin(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    redirect("/admin/users?error=bad_id");
  }

  const email = await deleteAdmin(id);
  if (!email) {
    redirect("/admin/users?error=not_found");
  }

  await logAudit({ action: "admin.delete", entity: "AdminUser", entityId: email });
  revalidatePath("/admin/users");
  redirect("/admin/users?saved=removed");
}
