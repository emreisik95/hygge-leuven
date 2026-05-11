import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit log — admin — hygge" };

const PAGE_SIZE = 200;

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
      <h1>Audit log</h1>
      <p className="hint">
        Last {PAGE_SIZE} entries, newest first. Every successful admin write is logged here.
      </p>

      <form method="get" className="section" aria-label="Filter audit log" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <div className="field" style={{ minWidth: 180 }}>
          <label htmlFor="filter-actor">Actor</label>
          <select id="filter-actor" name="actor" defaultValue={actor ?? ""}>
            <option value="">(any)</option>
            {distinctActors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ minWidth: 180 }}>
          <label htmlFor="filter-entity">Entity</label>
          <select id="filter-entity" name="entity" defaultValue={entity ?? ""}>
            <option value="">(any)</option>
            {distinctEntities.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-save">Apply</button>
        {filterActive ? (
          <a href="/admin/audit" className="admin-nav-link">Clear</a>
        ) : null}
      </form>

      {rows.length === 0 ? (
        <p>No audit entries yet.</p>
      ) : (
        <table className="audit-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>When</th>
              <th style={{ padding: "8px 6px" }}>Actor</th>
              <th style={{ padding: "8px 6px" }}>Action</th>
              <th style={{ padding: "8px 6px" }}>Entity</th>
              <th style={{ padding: "8px 6px" }}>ID</th>
              <th style={{ padding: "8px 6px" }}>Diff</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid #eee", verticalAlign: "top" }}>
                <td style={{ padding: "6px", whiteSpace: "nowrap" }}>
                  <span title={row.createdAt.toISOString()}>{relativeTime(row.createdAt, now)}</span>
                </td>
                <td style={{ padding: "6px" }}>{row.actor}</td>
                <td style={{ padding: "6px", fontFamily: "monospace" }}>{row.action}</td>
                <td style={{ padding: "6px", fontFamily: "monospace" }}>{row.entity}</td>
                <td style={{ padding: "6px" }}>{row.entityId ?? ""}</td>
                <td style={{ padding: "6px" }}>
                  {row.diff ? (
                    <details>
                      <summary>view</summary>
                      <pre style={{ background: "#f4f1ec", padding: 8, borderRadius: 4, overflowX: "auto", fontSize: 12, whiteSpace: "pre-wrap" }}>
                        {formatDiff(row.diff)}
                      </pre>
                    </details>
                  ) : (
                    <span className="hint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
