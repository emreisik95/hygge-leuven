export function AdminActionDock({
  children,
  label = "Page actions",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <aside className="admin-action-dock" aria-label={label}>
      {children}
    </aside>
  );
}

