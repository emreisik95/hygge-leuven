import { NextResponse } from "next/server";
import { resolveImageUrl } from "@/lib/instagram-public";

export const dynamic = "force-dynamic";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

// Streams an Instagram CDN image through our own origin so the browser never
// touches the short-lived, hot-link-protected signed URL directly. Takes only a
// shortcode (?s=) — the URL is resolved server-side from the cached public feed,
// so this is not an open proxy.
export async function GET(req: Request): Promise<NextResponse> {
  const shortcode = new URL(req.url).searchParams.get("s")?.trim() ?? "";
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(shortcode)) {
    return new NextResponse("bad request", { status: 400 });
  }

  try {
    const target = await resolveImageUrl(shortcode);
    if (!target) return placeholder();

    const upstream = await fetch(target, {
      headers: { "user-agent": UA, referer: "https://www.instagram.com/" },
      cache: "no-store",
    });
    if (!upstream.ok || !upstream.body) return placeholder();

    const buf = new Uint8Array(await upstream.arrayBuffer());
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "image/jpeg",
        // Cache hard at the edge/browser: the underlying signed URL rotates, but
        // the rendered bytes don't, so this avoids re-hitting Instagram per view.
        "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return placeholder();
  }
}

// Neutral local fallback so a single failed tile degrades to café imagery
// rather than a broken image. Relative Location is resolved by the browser
// against the current origin.
function placeholder(): NextResponse {
  return new NextResponse(null, {
    status: 302,
    headers: { location: "/assets/insta/01.jpg" },
  });
}
