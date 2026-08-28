import { listAdmins } from "@/lib/admin-users";
import { addAdmin, removeAdmin } from "./actions";
import { SubmitButton } from "../ui/SubmitButton";
import { Flash } from "../ui/Flash";
import { AdminPageIntro } from "../components/AdminPageIntro";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admins — admin — hygge" };

const BOOTSTRAP_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@hygge.local").toLowerCase();

const ERRORS: Record<string, string> = {
  invalid_email: "That doesn’t look like a valid email address.",
  weak_password: "Password must be at least 10 characters.",
  exists: "An admin with that email already exists.",
  bad_id: "Could not identify which admin to remove.",
  not_found: "That admin no longer exists.",
};

const SAVED: Record<string, string> = {
  added: "Admin added — they can sign in now.",
  removed: "Admin removed.",
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [admins, params] = await Promise.all([listAdmins(), searchParams]);

  return (
    <>
      <AdminPageIntro
        ticket="10 / Counter keys"
        title="Admins"
        description="Manage the people who can publish changes to the site."
        icon="/admin-icons/admins-service-counter-2.png"
        breadcrumb={{ href: "/admin/more", label: "More" }}
        status={<span className="admin-ticket-status">{admins.length + 1} accounts</span>}
      />

      {params.saved && SAVED[params.saved] ? (
        <Flash kind="ok">{SAVED[params.saved]}</Flash>
      ) : null}
      {params.error && ERRORS[params.error] ? (
        <Flash kind="err">{ERRORS[params.error]}</Flash>
      ) : null}

      <section className="section admin-member-section">
        <div className="admin-member-heading">
          <div>
            <p className="admin-eyebrow">Current access</p>
            <h2>Admin accounts</h2>
          </div>
          <span className="admin-ticket-status">Full access</span>
        </div>
        <p className="hint">
          People who can sign in to this panel. Each has full access. The
          bootstrap admin (set via environment) always works and can’t be removed
          here — use it to recover access if needed.
        </p>

        <ul className="admin-user-list" role="list">
          <li className="admin-member-card">
            <div className="admin-user-main">
              <span className="admin-user-email">{BOOTSTRAP_EMAIL}</span>
              <span className="admin-user-name">Bootstrap admin</span>
            </div>
            <span className="admin-user-tag">env · permanent</span>
          </li>

          {admins.map((a) => (
            <li className="admin-member-card" key={a.id}>
              <div className="admin-user-main">
                <span className="admin-user-email">{a.email}</span>
                <span className="admin-user-name">
                  {a.name ? a.name : "—"} · added {formatDate(a.createdAt)}
                </span>
              </div>
              <form action={removeAdmin}>
                <input type="hidden" name="id" value={a.id} />
                <SubmitButton className="link-danger" pendingLabel="Removing…">
                  remove
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="section admin-add-member">
        <p className="admin-eyebrow">New counter key</p>
        <h2>Add an admin</h2>
        <p className="hint">
          They sign in with this email and password. Share the password with them
          over a secure channel — it’s stored only as a bcrypt hash and can’t be
          shown again.
        </p>
        <form action={addAdmin} className="admin-user-form">
          <div className="field">
            <label htmlFor="new-email">Email</label>
            <input id="new-email" type="email" name="email" required autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor="new-name">Name (optional)</label>
            <input id="new-name" type="text" name="name" autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor="new-password">Password</label>
            <input
              id="new-password"
              type="password"
              name="password"
              required
              minLength={10}
              autoComplete="new-password"
            />
            <span className="hint">At least 10 characters.</span>
          </div>
          <SubmitButton pendingLabel="Adding…">Add admin</SubmitButton>
        </form>
      </section>
    </>
  );
}
