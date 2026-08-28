export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="admin-empty-state">
      <span className="admin-empty-mark" aria-hidden="true">·</span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {action ? <div className="admin-empty-action">{action}</div> : null}
    </div>
  );
}
