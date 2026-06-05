import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
  exchangeCodeForShortToken,
  exchangeForLongLived,
  fetchAccountHandle,
  fetchRecentPosts,
  hasInstagramEnv,
  IG_OAUTH_STATE_COOKIE,
} from "@/lib/instagram";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) {
      // OAuth callback hits this in a browser — redirect to login instead of 401.
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    throw e;
  }
  if (!hasInstagramEnv()) {
    return adminRedirect(req, "missing_env");
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const returnedState = url.searchParams.get("state");

  // Verify and consume the CSRF state cookie set by connectInstagram. A missing
  // or mismatched state means this callback wasn't initiated by us — reject it.
  const jar = await cookies();
  const expectedState = jar.get(IG_OAUTH_STATE_COOKIE)?.value;
  jar.delete(IG_OAUTH_STATE_COOKIE);

  if (error) {
    return adminRedirect(req, errorDescription ?? error);
  }
  if (!expectedState || !returnedState || returnedState !== expectedState) {
    return adminRedirect(req, "state_mismatch");
  }
  if (!code) {
    return adminRedirect(req, "missing_code");
  }

  try {
    const short = await exchangeCodeForShortToken(code);
    const long = await exchangeForLongLived(short.accessToken);
    const handle = await fetchAccountHandle(long.accessToken, short.userId);

    // Single-account model: replace any existing row.
    await prisma.instagramAccount.deleteMany({});
    const account = await prisma.instagramAccount.create({
      data: {
        handle,
        accessToken: long.accessToken,
        userId: short.userId,
        tokenExpires: long.expiresAt,
      },
    });

    // Best-effort initial fetch; failures are non-fatal — the admin can retry from the UI.
    try {
      await fetchRecentPosts(account, 9);
    } catch {
      // swallow; surface via admin page state on next load
    }

    return adminRedirect(req, undefined, "connected");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown_error";
    return adminRedirect(req, msg);
  }
}

function adminRedirect(req: NextRequest, error?: string, ok?: string) {
  const dest = new URL("/admin/instagram", req.url);
  if (error) dest.searchParams.set("error", error);
  if (ok) dest.searchParams.set("ok", ok);
  return NextResponse.redirect(dest);
}
