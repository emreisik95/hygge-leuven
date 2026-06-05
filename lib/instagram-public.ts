// Real-time, login-free Instagram feed.
//
// Reads the PUBLIC web profile JSON that instagram.com itself calls to render a
// profile grid (the same `x-ig-app-id` the website uses). No OAuth, no Graph
// API, no stored token. This is an UNOFFICIAL endpoint: Instagram may rate-limit
// or block a given server IP, or change the shape without notice. Every caller
// must therefore treat an empty result as "fall back to the seeded grid", never
// as an error that breaks the page.
//
// Image URLs returned by Instagram are short-lived, signed CDN links that also
// block hot-linking from other origins. So we never put them in <img src>
// directly — the page points <img> at /api/insta/image?s=<shortcode>, which
// resolves the *current* signed URL server-side and streams the bytes from our
// own origin (see app/api/insta/image/route.ts).

const IG_APP_ID = "936619743392459"; // public web app id used by instagram.com
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

// The account to show. Defaults to hygge's handle; overridable without a rebuild.
export const PUBLIC_USERNAME = (
  process.env.INSTAGRAM_PUBLIC_USERNAME?.trim() || "hygge.leuven"
).toLowerCase();

export type PublicPost = {
  shortcode: string;
  permalink: string;
  displayUrl: string; // current signed CDN url (expires) — proxied, never sent raw
  isVideo: boolean;
  caption: string | null;
  timestamp: number; // unix seconds
};

type Entry = { at: number; posts: PublicPost[] };

const TTL_MS = 30 * 60 * 1000; // refresh at most twice an hour
// Survive HMR / multiple imports within one server process.
const g = globalThis as unknown as { __igPublicFeed?: Map<string, Entry> };
const store = g.__igPublicFeed ?? (g.__igPublicFeed = new Map<string, Entry>());

type IgEdge = {
  node?: {
    shortcode?: string;
    display_url?: string;
    is_video?: boolean;
    taken_at_timestamp?: number;
    edge_media_to_caption?: { edges?: { node?: { text?: string } }[] };
  };
};

async function fetchProfile(username: string): Promise<PublicPost[]> {
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(
    username,
  )}`;
  const res = await fetch(url, {
    headers: {
      "x-ig-app-id": IG_APP_ID,
      "user-agent": UA,
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "x-requested-with": "XMLHttpRequest",
      // Instagram rejects requests whose Sec-Fetch-* headers look cross-site
      // ("SecFetch Policy violation"). Node's fetch adds them automatically, so
      // we must present as a same-origin XHR from instagram.com itself.
      referer: `https://www.instagram.com/${username}/`,
      origin: "https://www.instagram.com",
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
    },
    cache: "no-store", // we own the TTL below
  });
  if (!res.ok) throw new Error(`instagram web_profile_info ${res.status}`);
  const json = (await res.json()) as {
    data?: { user?: { edge_owner_to_timeline_media?: { edges?: IgEdge[] } } };
  };
  const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges ?? [];
  const posts: PublicPost[] = [];
  for (const e of edges) {
    const n = e.node;
    if (!n?.shortcode || !n.display_url) continue;
    posts.push({
      shortcode: n.shortcode,
      permalink: `https://www.instagram.com/p/${n.shortcode}/`,
      displayUrl: n.display_url,
      isVideo: !!n.is_video,
      caption: n.edge_media_to_caption?.edges?.[0]?.node?.text ?? null,
      timestamp: n.taken_at_timestamp ?? 0,
    });
  }
  return posts;
}

// Full cached/fresh list for a username, with stale-on-error fallback.
async function getAll(username: string): Promise<PublicPost[]> {
  const key = username.toLowerCase();
  const cached = store.get(key);
  const now = Date.now();
  if (cached && now - cached.at < TTL_MS) return cached.posts;
  try {
    const posts = await fetchProfile(key);
    if (posts.length > 0) {
      store.set(key, { at: now, posts });
      return posts;
    }
    return cached?.posts ?? []; // empty payload → keep last-good
  } catch {
    return cached?.posts ?? []; // blocked/error → serve stale, never throw
  }
}

// Most-recent posts for the configured account. Returns [] when unavailable so
// callers fall back to the seeded grid.
export async function getPublicFeed(limit = 9): Promise<PublicPost[]> {
  const posts = await getAll(PUBLIC_USERNAME);
  return posts.slice(0, limit);
}

// Resolve a shortcode to its current signed CDN url (for the image proxy).
// Only resolves posts that belong to the configured account — the proxy can
// therefore never be coerced into fetching arbitrary URLs/hosts.
export async function resolveImageUrl(shortcode: string): Promise<string | null> {
  const posts = await getAll(PUBLIC_USERNAME);
  return posts.find((p) => p.shortcode === shortcode)?.displayUrl ?? null;
}
