import { NextRequest, NextResponse } from "next/server";
import { fetchRecentPosts, getAccount, InstagramApiError } from "@/lib/instagram";

export const dynamic = "force-dynamic";

// POST /api/instagram/refresh
// Header: x-cron-secret: <CRON_SECRET>
//
// Triggers a re-fetch of the last 9 posts. Designed to be hit from a Coolify cron,
// GitHub Action, or external uptime ping. The admin "Refresh now" button does NOT
// call this — it uses a server action (already authed) instead.
export async function POST(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const provided = req.headers.get("x-cron-secret");
  if (provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const account = await getAccount();
  if (!account) {
    return NextResponse.json({ error: "no_account" }, { status: 404 });
  }

  try {
    const result = await fetchRecentPosts(account, 9);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof InstagramApiError) {
      return NextResponse.json(
        {
          error: e.message,
          code: e.code,
          subcode: e.subcode,
          invalidToken: e.isInvalidToken(),
          rateLimited: e.isRateLimited(),
        },
        { status: e.status ?? 500 },
      );
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}
