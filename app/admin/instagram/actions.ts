"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import crypto from "crypto";
import {
  buildAuthorizeUrl,
  disconnectAccount,
  fetchRecentPosts,
  getAccount,
  hasInstagramEnv,
  IG_OAUTH_STATE_COOKIE,
  InstagramApiError,
} from "@/lib/instagram";
import { logAudit } from "@/lib/audit";

export async function connectInstagram() {
  await requireAdmin();
  if (!hasInstagramEnv()) {
    redirect("/admin/instagram?error=missing_env");
  }
  // CSRF protection for the OAuth round-trip: stash a random state in an
  // httpOnly cookie now and require the callback to echo it back. sameSite=lax
  // lets the cookie ride the top-level GET navigation back from Instagram.
  const state = crypto.randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set(IG_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
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
