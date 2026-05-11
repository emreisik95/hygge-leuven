"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminNavLink = {
  label: string;
  href: string;
};

export function AdminNav({ links }: { links: AdminNavLink[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin navigation" className="admin-nav">
      <ul className="admin-nav-list">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="admin-nav-link"
                aria-current={active ? "page" : undefined}
                data-active={active ? "true" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
