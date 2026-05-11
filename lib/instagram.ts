import { prisma } from "@/lib/db";
import type { InstagramAccount } from "@prisma/client";

// Instagram Graph API integration.
//
// Out of scope (intentional):
//   - access-token encryption at rest (stored plain in InstagramAccount.accessToken)
//   - webhooks for real-time post updates
//   - comments / likes / story support
//
// Setup the user must do manually (hello@emreisik.dev):
//   1. Create a Facebook App: https://developers.facebook.com/apps/
//   2. Add the "Instagram" product (Business Login).
//   3. Convert the @hygge.leuven IG account to Business or Creator
//      and link it to a Facebook Page that the same FB user owns.
//   4. Configure the OAuth redirect URI in the FB App to match
//      env INSTAGRAM_REDIRECT_URI exactly (e.g. https://hygge.local/api/instagram/callback).
//   5. Set env vars INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_REDIRECT_URI, CRON_SECRET.

export const GRAPH_HOST = "https://graph.instagram.com";
export const OAUTH_HOST = "https://api.instagram.com";

// Scope required for the Instagram Login (Business) flow.
// `instagram_business_basic` lets us read the connected IG business account's profile + media.
export const SCOPES = ["instagram_business_basic"];

const REFRESH_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type FetchedPost = {
  id: string;
  caption: string | null;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string; // ISO
};

export class InstagramApiError extends Error {
  constructor(
    message: string,
    public code?: number,
    public subcode?: number,
    public status?: number,
  ) {
    super(message);
    this.name = "InstagramApiError";
  }
  isInvalidToken() {
    return this.subcode === 467 || this.code === 190;
  }
  isRateLimited() {
    return this.code === 4 || this.code === 17 || this.code === 32;
  }
}

export function buildAuthorizeUrl(state: string): string {
  const appId = required("INSTAGRAM_APP_ID");
  const redirect = required("INSTAGRAM_REDIRECT_URI");
  const url = new URL(`${OAUTH_HOST}/oauth/authorize`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.join(","));
  url.searchParams.set("state", state);
  return url.toString();
}

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

export function hasInstagramEnv(): boolean {
  return !!(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET && process.env.INSTAGRAM_REDIRECT_URI);
}

// Exchange the OAuth `code` for a short-lived access token + IG user id.
export async function exchangeCodeForShortToken(code: string): Promise<{ accessToken: string; userId: string }> {
  const appId = required("INSTAGRAM_APP_ID");
  const appSecret = required("INSTAGRAM_APP_SECRET");
  const redirect = required("INSTAGRAM_REDIRECT_URI");

  const body = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: redirect,
    code,
  });
  const res = await fetch(`${OAUTH_HOST}/oauth/access_token`, {
    method: "POST",
    body,
  });
  const json = (await res.json()) as { access_token?: string; user_id?: string | number; error_message?: string };
  if (!res.ok || !json.access_token || !json.user_id) {
    throw new InstagramApiError(json.error_message ?? "Failed to exchange code", undefined, undefined, res.status);
  }
  return { accessToken: json.access_token, userId: String(json.user_id) };
}

// Upgrade a short-lived (1h) token to a long-lived (60d) token.
export async function exchangeForLongLived(shortToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
  const appSecret = required("INSTAGRAM_APP_SECRET");
  const url = new URL(`${GRAPH_HOST}/access_token`);
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("access_token", shortToken);
  const res = await fetch(url);
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!res.ok || !json.access_token || !json.expires_in) {
    throw new InstagramApiError("Failed to exchange for long-lived token", undefined, undefined, res.status);
  }
  return {
    accessToken: json.access_token,
    expiresAt: new Date(Date.now() + json.expires_in * 1000),
  };
}

// Refresh a still-valid long-lived token, extending it by another 60 days.
export async function refreshLongLivedToken(token: string): Promise<{ accessToken: string; expiresAt: Date }> {
  const url = new URL(`${GRAPH_HOST}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);
  const res = await fetch(url);
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!res.ok || !json.access_token || !json.expires_in) {
    throw new InstagramApiError("Failed to refresh token", undefined, undefined, res.status);
  }
  return {
    accessToken: json.access_token,
    expiresAt: new Date(Date.now() + json.expires_in * 1000),
  };
}

export async function fetchAccountHandle(accessToken: string, userId: string): Promise<string> {
  const url = new URL(`${GRAPH_HOST}/${userId}`);
  url.searchParams.set("fields", "username");
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url);
  const json = (await res.json()) as { username?: string; error?: { message?: string; code?: number; error_subcode?: number } };
  if (!res.ok || !json.username) {
    throw new InstagramApiError(json.error?.message ?? "Failed to fetch handle", json.error?.code, json.error?.error_subcode, res.status);
  }
  return json.username;
}

export async function getAccount(): Promise<InstagramAccount | null> {
  return prisma.instagramAccount.findFirst({ orderBy: { id: "asc" } });
}

export async function disconnectAccount(): Promise<void> {
  await prisma.instagramAccount.deleteMany({});
  await prisma.instagramPost.deleteMany({});
}

// Refresh the long-lived token if it is within 7 days of expiry.
async function maybeRefreshToken(account: InstagramAccount): Promise<InstagramAccount> {
  if (!account.tokenExpires) return account;
  const msUntilExpiry = account.tokenExpires.getTime() - Date.now();
  if (msUntilExpiry > REFRESH_THRESHOLD_MS) return account;
  const refreshed = await refreshLongLivedToken(account.accessToken);
  return prisma.instagramAccount.update({
    where: { id: account.id },
    data: { accessToken: refreshed.accessToken, tokenExpires: refreshed.expiresAt },
  });
}

export async function fetchRecentPosts(account: InstagramAccount, limit = 9): Promise<{ saved: number; refreshed: boolean }> {
  const refreshedAccount = await maybeRefreshToken(account);
  const refreshed = refreshedAccount.accessToken !== account.accessToken;

  const url = new URL(`${GRAPH_HOST}/${refreshedAccount.userId}/media`);
  url.searchParams.set("fields", "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", refreshedAccount.accessToken);

  const res = await fetch(url);
  const json = (await res.json()) as { data?: FetchedPost[]; error?: { message?: string; code?: number; error_subcode?: number } };
  if (!res.ok || !json.data) {
    throw new InstagramApiError(json.error?.message ?? "Failed to fetch media", json.error?.code, json.error?.error_subcode, res.status);
  }

  let saved = 0;
  for (const p of json.data) {
    // For VIDEO posts, prefer thumbnail_url for grid render (mediaUrl points at the .mp4).
    const renderUrl = p.media_type === "VIDEO" && p.thumbnail_url ? p.thumbnail_url : p.media_url;
    await prisma.instagramPost.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        mediaUrl: renderUrl,
        permalink: p.permalink,
        caption: p.caption ?? null,
        mediaType: p.media_type,
        timestamp: new Date(p.timestamp),
      },
      update: {
        mediaUrl: renderUrl,
        permalink: p.permalink,
        caption: p.caption ?? null,
        mediaType: p.media_type,
        timestamp: new Date(p.timestamp),
        fetchedAt: new Date(),
      },
    });
    saved++;
  }
  return { saved, refreshed };
}

export async function getRecentPostsForRender(limit = 9) {
  return prisma.instagramPost.findMany({
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}
