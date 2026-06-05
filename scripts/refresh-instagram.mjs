#!/usr/bin/env node
// Refresh the landing gallery with real @hygge.leuven posts.
//
// Instagram blocks anonymous requests from the production datacenter IP, so we
// fetch from a developer machine (allowed) and BAKE the result into the repo:
// images are downloaded to public/assets/insta/ig-<shortcode>.jpg and metadata
// to lib/instagram-feed.json. The live site then serves real posts as local
// static assets — no Instagram calls at request time.
//
// Run:  node scripts/refresh-instagram.mjs [username] [count]
// Then: commit the changed images + lib/instagram-feed.json and push/deploy.

import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";

const run = promisify(execFile);

const USERNAME = (process.argv[2] || "hygge.leuven").toLowerCase();
const COUNT = Number(process.argv[3] || 9);
const REPO = process.cwd();
const IMG_DIR = path.join(REPO, "public", "assets", "insta");
const MANIFEST = path.join(REPO, "lib", "instagram-feed.json");

const IG_APP_ID = "936619743392459";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

async function fetchProfile(username) {
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
  const res = await fetch(url, {
    headers: {
      "x-ig-app-id": IG_APP_ID,
      "user-agent": UA,
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "x-requested-with": "XMLHttpRequest",
      referer: `https://www.instagram.com/${username}/`,
      origin: "https://www.instagram.com",
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
    },
  });
  if (!res.ok) throw new Error(`web_profile_info HTTP ${res.status}: ${(await res.text()).slice(0, 120)}`);
  const json = await res.json();
  const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges ?? [];
  return edges
    .map((e) => e.node)
    .filter((n) => n?.shortcode && n.display_url)
    .map((n) => ({
      shortcode: n.shortcode,
      permalink: `https://www.instagram.com/p/${n.shortcode}/`,
      displayUrl: n.display_url,
      isVideo: !!n.is_video,
      caption: n.edge_media_to_caption?.edges?.[0]?.node?.text ?? null,
      timestamp: n.taken_at_timestamp ?? 0,
    }));
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "user-agent": UA, referer: "https://www.instagram.com/" } });
  if (!res.ok) throw new Error(`image HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const tmp = path.join(os.tmpdir(), `ig-${path.basename(dest)}`);
  await fs.writeFile(tmp, buf);
  // Downscale longest side to 1080 (object-fit: cover squares it in the grid).
  try {
    await run("sips", ["-Z", "1080", "-s", "format", "jpeg", tmp, "--out", dest]);
  } catch {
    await fs.copyFile(tmp, dest); // sips unavailable → ship original
  }
  await fs.rm(tmp, { force: true });
}

async function main() {
  console.log(`→ fetching @${USERNAME} …`);
  const posts = (await fetchProfile(USERNAME)).slice(0, COUNT);
  if (posts.length === 0) throw new Error("no posts returned (IP blocked?)");
  console.log(`  got ${posts.length} posts`);

  await fs.mkdir(IMG_DIR, { recursive: true });
  const manifest = [];
  for (const p of posts) {
    const file = `ig-${p.shortcode}.jpg`;
    process.stdout.write(`  ↓ ${p.shortcode} … `);
    await download(p.displayUrl, path.join(IMG_DIR, file));
    console.log("ok");
    manifest.push({
      shortcode: p.shortcode,
      permalink: p.permalink,
      caption: p.caption,
      image: `/assets/insta/${file}`,
      isVideo: p.isVideo,
      timestamp: p.timestamp,
    });
  }

  await fs.writeFile(
    MANIFEST,
    JSON.stringify({ username: USERNAME, fetchedAt: new Date().toISOString(), posts: manifest }, null, 2) + "\n",
  );
  console.log(`✓ wrote ${manifest.length} posts → lib/instagram-feed.json`);
  console.log("  commit the new images + manifest, then push to deploy.");
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
