import { getAccount, hasInstagramEnv } from "@/lib/instagram";
import { prisma } from "@/lib/db";
import {
  connectInstagram,
  disconnectInstagram,
  refreshInstagramNow,
} from "./actions";
import { SubmitButton } from "../ui/SubmitButton";
import { Flash } from "../ui/Flash";
import { AdminPageIntro } from "../components/AdminPageIntro";
import { AdminStatusList } from "../components/AdminStatusList";

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
      <AdminPageIntro
        ticket="07 / Social feed"
        title="Instagram"
        description="See what is connected, refresh café posts, and finish setup when something is missing."
        icon="/admin/icons/instagram.png"
        breadcrumb={{ href: "/admin/more", label: "More" }}
        status={<span className="admin-ticket-status" data-tone={account ? "live" : "draft"}>{account ? "Connected" : "Setup needed"}</span>}
      />

      {ok === "connected" ? <Flash kind="ok">Account connected.</Flash> : null}
      {ok === "refreshed" ? <Flash kind="ok">Refreshed{saved ? ` (${saved} posts saved)` : ""}.</Flash> : null}
      {error ? <Flash kind="err">{describeError(error)}</Flash> : null}

      <section className="section">
        <h2>Status</h2>
        <AdminStatusList
          ariaLabel="Instagram integration status"
          items={[
            {
              label: "App connection",
              value: envOk ? "Ready" : "Missing",
              detail: "App ID, secret, and redirect address",
              tone: envOk ? "ready" : "missing",
            },
            {
              label: "Automatic refresh",
              value: cronOk ? "Ready" : "Missing",
              detail: "Secure refresh secret",
              tone: cronOk ? "ready" : "missing",
            },
            {
              label: "Account",
              value: account ? `@${account.handle}` : "Not connected",
              tone: account ? "ready" : "missing",
            },
            {
              label: "Access token",
              value: account?.tokenExpires ? `${daysUntil(account.tokenExpires)} days` : "Not available",
              detail: account?.tokenExpires ? `Expires ${account.tokenExpires.toISOString().slice(0, 10)}` : undefined,
              tone: account?.tokenExpires ? (daysUntil(account.tokenExpires) < 14 ? "warning" : "ready") : "neutral",
            },
            {
              label: "Cached posts",
              value: String(postCount),
              detail: "Ready for the public feed",
              tone: postCount > 0 ? "ready" : "neutral",
            },
          ]}
        />
      </section>

      <section className="section">
        <h2>Connection</h2>
        <p className="hint">Connect once, then refresh whenever you want to pull in the latest café posts.</p>
        {account ? (
          <div className="admin-integration-actions">
            <form action={refreshInstagramNow}>
              <SubmitButton pendingLabel="Refreshing…">Refresh now</SubmitButton>
            </form>
            <form action={disconnectInstagram}>
              <SubmitButton className="btn-save btn-danger-solid" pendingLabel="Disconnecting…">
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

      <details className="section admin-disclosure">
        <summary>
          <span><strong>Automatic refresh details</strong><small>Technical setup for scheduled updates</small></span>
        </summary>
        <div className="admin-disclosure-body">
          <p>POST to <code>/api/instagram/refresh</code> with header <code>x-cron-secret: $CRON_SECRET</code>. Recommended every 30–60 minutes.</p>
          <pre className="admin-code-block">
{`curl -X POST \\
  -H "x-cron-secret: $CRON_SECRET" \\
  https://YOUR-DOMAIN/api/instagram/refresh`}
          </pre>
        </div>
      </details>

      <details className="section admin-disclosure">
        <summary>
          <span><strong>Manual setup checklist</strong><small>Only needed before the first connection</small></span>
        </summary>
        <div className="admin-disclosure-body">
          <p>
            The Facebook App and Instagram Business account must be created manually before
            Connect Instagram will work. See the{" "}
            <a href="https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login" target="_blank" rel="noreferrer">
              Instagram API with Instagram Login docs
            </a>.
          </p>
          <ol className="admin-setup-list">
            <li>Convert <strong>@hygge.leuven</strong> to a Business or Creator account in the Instagram app.</li>
            <li>Create a Facebook Business App at <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer">developers.facebook.com/apps</a>.</li>
            <li>Add Instagram API setup with Instagram Login.</li>
            <li>Set the OAuth redirect address to exactly <code>INSTAGRAM_REDIRECT_URI</code>.</li>
            <li>Add the <code>instagram_business_basic</code> permission.</li>
            <li>Copy the App ID and App Secret into the matching environment settings.</li>
            <li>Create a strong <code>CRON_SECRET</code>.</li>
            <li>Accept the Instagram tester invitation.</li>
            <li>Restart the service, then use Connect Instagram above.</li>
          </ol>
        </div>
      </details>
    </>
  );
}

function describeError(code: string): string {
  switch (code) {
    case "missing_env":
      return "Instagram env vars are not set. See setup checklist below.";
    case "missing_code":
      return "OAuth callback did not return a code.";
    case "state_mismatch":
      return "OAuth state check failed (possible CSRF or an expired attempt). Try connecting again.";
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
