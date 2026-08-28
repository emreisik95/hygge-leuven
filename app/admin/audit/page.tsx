import { prisma } from "@/lib/db";
import { AdminEmptyState } from "@/app/admin/components/AdminEmptyState";
import { AdminPageIntro } from "@/app/admin/components/AdminPageIntro";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit log — admin — hygge" };

const PAGE_SIZE = 200;

const ACTION_LABELS: Record<string, string> = {
  "admin.create": "Added an admin",
  "admin.delete": "Removed an admin",
  "feature.settings.update": "Updated feature content",
  "flags.update": "Updated feature visibility",
  "hours.update": "Updated opening hours",
  "instagram.connect.initiate": "Started Instagram connection",
  "instagram.disconnect": "Disconnected Instagram",
  "instagram.refresh": "Refreshed Instagram posts",
  "menu.document.replace": "Replaced the café menu",
  "photo.delete": "Deleted a photo",
  "photo.move": "Moved a photo",
  "photo.reorder": "Reordered photos",
  "photo.restore": "Restored a photo",
  "photo.update": "Updated a photo",
  "photo.upload": "Uploaded a photo",
  "site.draft.discard": "Discarded the site draft",
  "site.draft.save": "Saved the site draft",
  "site.publish": "Published the site",
  "translations.update": "Updated translations",
};

type Search = { actor?: string; entity?: string };

function relativeTime(then: Date, now: Date): string {
  const ms = now.getTime() - then.getTime();
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.round(hr / 24);
  if (days < 30) return `${days}d ago`;
  return then.toISOString().slice(0, 10);
}

function formatDiff(diff: string | null): string {
  if (!diff) return "(no diff)";
  try {
    const parsed = JSON.parse(diff);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return diff;
  }
}

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { actor, entity } = await searchParams;
  const where: { actor?: string; entity?: string } = {};
  if (actor) where.actor = actor;
  if (entity) where.entity = entity;

  const [rows, distinctActorsRaw, distinctEntitiesRaw] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
    }),
    prisma.auditLog.findMany({ distinct: ["actor"], select: { actor: true }, take: 50 }),
    prisma.auditLog.findMany({ distinct: ["entity"], select: { entity: true }, take: 50 }),
  ]);
  const distinctActors = distinctActorsRaw.map((r) => r.actor).sort();
  const distinctEntities = distinctEntitiesRaw.map((r) => r.entity).sort();

  const now = new Date();
  const filterActive = !!(actor || entity);

  return (
    <>
      <AdminPageIntro
        ticket="11 / Change ledger"
        title="Audit"
        description={`The latest ${PAGE_SIZE} successful admin changes, kept in newest-first order.`}
        icon="/admin-icons/audit-service-counter-2.png"
        breadcrumb={{ href: "/admin/more", label: "More" }}
        status={<span className="admin-ticket-status">{rows.length} entries</span>}
      />

      <form method="get" className="section audit-filter-bar" aria-label="Filter audit log">
        <div className="audit-filter-fields">
          <div className="field">
            <label htmlFor="filter-actor">Actor</label>
            <select id="filter-actor" name="actor" defaultValue={actor ?? ""}>
              <option value="">Any actor</option>
              {distinctActors.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter-entity">Entity</label>
            <select id="filter-entity" name="entity" defaultValue={entity ?? ""}>
              <option value="">Any entity</option>
              {distinctEntities.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="audit-filter-actions">
          <button type="submit" className="btn-save">Apply filters</button>
          {filterActive ? (
            <a href="/admin/audit" className="admin-nav-link">Clear</a>
          ) : null}
        </div>
      </form>

      {rows.length === 0 ? (
        <AdminEmptyState
          title={filterActive ? "No matching changes" : "No audit entries yet"}
          description={filterActive
            ? "Try clearing one of the filters to widen the change history."
            : "Successful admin updates will appear here as they happen."}
        />
      ) : (
        <ol className="audit-event-list">
          {rows.map((row) => (
            <li key={row.id} className="audit-event-card">
              <div className="audit-event-marker" aria-hidden="true" />
              <div className="audit-event-body">
                <header className="audit-event-heading">
                  <div>
                    <p className="admin-eyebrow">{row.actor}</p>
                    <h2>{actionLabel(row.action)}</h2>
                  </div>
                  <time dateTime={row.createdAt.toISOString()} title={row.createdAt.toISOString()}>
                    {relativeTime(row.createdAt, now)}
                  </time>
                </header>
                <div className="audit-event-meta">
                  <span>{row.entity}</span>
                  <code>{row.action}</code>
                  {row.entityId ? <code>{row.entityId}</code> : null}
                </div>
                {row.diff ? (
                  <details className="audit-event-diff">
                    <summary>View recorded changes</summary>
                    <pre className="audit-diff-code">{formatDiff(row.diff)}</pre>
                  </details>
                ) : (
                  <p className="audit-event-no-diff">No field diff recorded.</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
