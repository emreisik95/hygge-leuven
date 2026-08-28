"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminNavLink = {
  label: string;
  href: string;
};

const MORE_ROUTES = [
  "/admin/photos",
  "/admin/instagram",
  "/admin/translations",
  "/admin/features",
  "/admin/users",
  "/admin/audit",
  "/admin/preview",
];

export function AdminNav({ links }: { links: AdminNavLink[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin navigation" className="admin-nav">
      <ul className="admin-nav-list">
        {links.map((link) => {
          const active = link.href === "/admin"
            ? pathname === "/admin"
            : link.href === "/admin/more"
              ? pathname === "/admin/more" || MORE_ROUTES.some((route) => pathname.startsWith(route))
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="admin-nav-link"
                aria-current={active ? "page" : undefined}
                data-active={active ? "true" : undefined}
              >
                <span className="admin-nav-icon" aria-hidden="true" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
