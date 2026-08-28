export type AdminSectionNavItem = {
  href: string;
  label: string;
  meta?: string;
};

export function AdminSectionNav({
  items,
  ariaLabel = "On this page",
}: {
  items: AdminSectionNavItem[];
  ariaLabel?: string;
}) {
  return (
    <nav className="admin-section-nav" aria-label={ariaLabel}>
      <span className="admin-section-nav-label">On this page</span>
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href}>
              <span>{item.label}</span>
              {item.meta ? <small>{item.meta}</small> : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
