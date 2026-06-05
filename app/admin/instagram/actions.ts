"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import {
  buildAuthorizeUrl,
  disconnectAccount,
  fetchRecentPosts,
  getAccount,
  hasInstagramEnv,
  InstagramApiError,
} from "@/lib/instagram";
import { logAudit } from "@/lib/audit";

export async function connectInstagram() {
  await requireAdmin();
  if (!hasInstagramEnv()) {
    redirect("/admin/instagram?error=missing_env");
  }
  // CSRF state is not strictly necessary here (single admin user, redirect URI fixed),
  // but harmless to include — Facebook echoes it back unchanged.
  const state = crypto.randomBytes(16).toString("hex");
  await logAudit({
    action: "instagram.connect.initiate",
    entity: "InstagramAccount",
  });
  redirect(buildAuthorizeUrl(state));
}

export async function disconnectInstagram() {
  await requireAdmin();
  const account = await getAccount();
  await disconnectAccount();
  await logAudit({
    action: "instagram.disconnect",
    entity: "InstagramAccount",
    entityId: account?.id ?? null,
    diff: { handle: account?.handle ?? null },
  });
  revalidatePath("/admin/instagram");
  revalidatePath("/");
}

export async function refreshInstagramNow() {
  await requireAdmin();
  const account = await getAccount();
  if (!account) {
    redirect("/admin/instagram?error=no_account");
  }
  try {
    const result = await fetchRecentPosts(account, 9);
    await logAudit({
      action: "instagram.refresh",
      entity: "InstagramAccount",
      entityId: account.id,
      diff: { saved: result.saved, refreshed: result.refreshed, handle: account.handle },
    });
    revalidatePath("/admin/instagram");
    revalidatePath("/");
    redirect(`/admin/instagram?ok=refreshed&saved=${result.saved}`);
  } catch (e) {
    if (e instanceof InstagramApiError) {
      const msg = e.isInvalidToken() ? "invalid_token" : e.isRateLimited() ? "rate_limited" : e.message;
      redirect(`/admin/instagram?error=${encodeURIComponent(msg)}`);
    }
    throw e;
  }
}
