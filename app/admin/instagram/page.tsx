import { getAccount, hasInstagramEnv } from "@/lib/instagram";
import { prisma } from "@/lib/db";
import {
  connectInstagram,
  disconnectInstagram,
  refreshInstagramNow,
} from "./actions";
import { SubmitButton } from "../ui/SubmitButton";
import { Flash } from "../ui/Flash";

export const dynamic = "force-dynamic";
export const metadata = { title: "Instagram — admin — hygge" };

export default async function InstagramAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; saved?: string }>;
}) {
  const { ok, error, saved } = await searchParams;
  const account = await getAccount();
  const envOk = hasInstagramEnv();
  const cronOk = !!process.env.CRON_SECRET;
  const postCount = await prisma.instagramPost.count();

  return (
    <>
      <h1>Instagram</h1>

      {ok === "connected" ? <Flash kind="ok">Account connected.</Flash> : null}
      {ok === "refreshed" ? <Flash kind="ok">Refreshed{saved ? ` (${saved} posts saved)` : ""}.</Flash> : null}
      {error ? <Flash kind="err">{describeError(error)}</Flash> : null}

      <section className="section">
        <h2>Status</h2>
        <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Env vars (<code>INSTAGRAM_APP_ID</code>, <code>INSTAGRAM_APP_SECRET</code>, <code>INSTAGRAM_REDIRECT_URI</code>): <strong>{envOk ? "OK" : "MISSING"}</strong></li>
          <li><code>CRON_SECRET</code> for /api/instagram/refresh: <strong>{cronOk ? "OK" : "MISSING"}</strong></li>
          <li>Connected account: <strong>{account ? `@${account.handle}` : "(none)"}</strong></li>
          {account?.tokenExpires ? (
            <li>Token expires: <strong>{account.tokenExpires.toISOString().slice(0, 10)}</strong> ({daysUntil(account.tokenExpires)} days)</li>
          ) : null}
          <li>Cached posts: <strong>{postCount}</strong></li>
        </ul>
      </section>

      <section className="section">
        <h2>Connection</h2>
        {account ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <form action={refreshInstagramNow}>
              <SubmitButton pendingLabel="Refreshing…">Refresh now</SubmitButton>
            </form>
            <form action={disconnectInstagram}>
              <SubmitButton style={{ background: "#b33", color: "#fff" }} pendingLabel="Disconnecting…">
                Disconnect
              </SubmitButton>
            </form>
          </div>
        ) : (
          <form action={connectInstagram}>
            <SubmitButton disabled={!envOk} pendingLabel="Connecting…">
              {envOk ? "Connect Instagram" : "Connect Instagram (env missing)"}
            </SubmitButton>
          </form>
        )}
      </section>

      <section className="section">
        <h2>Cron / external refresh</h2>
        <p>POST to <code>/api/instagram/refresh</code> with header <code>x-cron-secret: $CRON_SECRET</code>. Recommended every 30–60 minutes.</p>
        <pre style={{ background: "#f4f1ec", padding: 12, borderRadius: 6, overflowX: "auto", fontSize: 12 }}>
{`curl -X POST \\
  -H "x-cron-secret: $CRON_SECRET" \\
  https://YOUR-DOMAIN/api/instagram/refresh`}
        </pre>
      </section>

      <section className="section">
        <h2>Setup checklist</h2>
        <p>
          The Facebook App + Instagram Business account must be created manually before
          "Connect Instagram" will work. See the{" "}
          <a href="https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login" target="_blank" rel="noreferrer">
            Instagram API with Instagram Login docs
          </a>.
        </p>
        <ol style={{ paddingLeft: 20, lineHeight: 1.7 }}>
          <li>Convert <strong>@hygge.leuven</strong> to a Business or Creator account in the Instagram app (Settings → Account → Switch to Professional).</li>
          <li>Create a Facebook App at <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer">developers.facebook.com/apps</a>. Choose use case "Other" → app type "Business".</li>
          <li>In the app dashboard, add the <strong>Instagram</strong> product and pick "Instagram API setup with Instagram Login".</li>
          <li>Under "Business login settings", set the <strong>OAuth redirect URI</strong> to exactly the value of <code>INSTAGRAM_REDIRECT_URI</code> (e.g. <code>https://YOUR-DOMAIN/api/instagram/callback</code>).</li>
          <li>Add the scope <code>instagram_business_basic</code> to the OAuth permissions.</li>
          <li>Copy the App ID and App Secret to <code>INSTAGRAM_APP_ID</code> / <code>INSTAGRAM_APP_SECRET</code>.</li>
          <li>Generate a strong random string for <code>CRON_SECRET</code>.</li>
          <li>Add yourself as an Instagram tester in the FB App and accept the invite from the IG app (Settings → Apps and websites → Tester invites).</li>
          <li>Restart the server and click <strong>Connect Instagram</strong> above.</li>
        </ol>
      </section>
    </>
  );
}

function describeError(code: string): string {
  switch (code) {
    case "missing_env":
      return "Instagram env vars are not set. See setup checklist below.";
    case "missing_code":
      return "OAuth callback did not return a code.";
    case "no_account":
      return "No Instagram account connected.";
    case "invalid_token":
      return "Stored token is invalid or revoked. Disconnect and reconnect.";
    case "rate_limited":
      return "Instagram rate limit hit. Try again later.";
    default:
      return `Error: ${code}`;
  }
}

function daysUntil(date: Date): number {
  return Math.max(0, Math.round((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
}
