export type AdminStatusItem = {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  tone?: "ready" | "missing" | "warning" | "neutral";
};

export function AdminStatusList({
  items,
  ariaLabel = "Status",
}: {
  items: AdminStatusItem[];
  ariaLabel?: string;
}) {
  return (
    <ul className="admin-status-list" aria-label={ariaLabel}>
      {items.map((item) => (
        <li className="admin-status-item" data-tone={item.tone ?? "neutral"} key={item.label}>
          <span className="admin-status-dot" aria-hidden="true" />
          <span className="admin-status-copy">
            <span>{item.label}</span>
            {item.detail ? <small>{item.detail}</small> : null}
          </span>
          <strong>{item.value}</strong>
        </li>
      ))}
    </ul>
  );
}
