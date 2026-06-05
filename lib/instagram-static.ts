// Static, baked-in Instagram feed.
//
// Instagram blocks anonymous requests from the production datacenter IP, so we
// cannot fetch at request time on the live server. Instead a developer runs
// `node scripts/refresh-instagram.mjs` locally (their IP is allowed), which
// downloads the real @hygge.leuven posts into public/assets/insta/ and writes
// the manifest below. The live site serves those real posts as local static
// assets — no Instagram calls at request time, no signed-URL expiry.
//
// To refresh: re-run the script, commit the new images + manifest, deploy.

import feed from "./instagram-feed.json";
import type { InstaPostView } from "@/app/components/Landing";

type StaticPost = {
  shortcode: string;
  permalink: string;
  caption: string | null;
  image: string;
  isVideo: boolean;
  timestamp: number;
};

type Feed = { username: string; fetchedAt: string; posts: StaticPost[] };

const FEED = feed as Feed;

// Baked posts, newest first, mapped to the render view. Returns [] when the
// manifest is empty so callers fall back to the seeded DB grid.
export function getStaticFeed(limit = 9): InstaPostView[] {
  return [...FEED.posts]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map((p) => ({
      id: p.shortcode,
      mediaUrl: p.image,
      permalink: p.permalink,
      caption: p.caption,
    }));
}
