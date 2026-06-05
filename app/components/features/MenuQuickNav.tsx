"use client";

import { useEffect, useState } from "react";

// A horizontal row of chips that jump to each menu category. Plain in-page
// anchors keep it working without JS; on top of that we add smooth scrolling
// and an "in view" highlight via IntersectionObserver. Categories are passed in
// pre-filtered (only those with items) so a chip never points at an empty list.

export function MenuQuickNav({
  categories,
  label,
}: {
  categories: { id: string; label: string }[];
  label: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length === 0) return;
    const sections = categories
      .map((c) => document.getElementById(`menu-cat-${c.id}`))
      .filter((el): el is HTMLElement => el != null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id.replace(/^menu-cat-/, ""));
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.5, 1] },
    );
    for (const el of sections) observer.observe(el);
    return () => observer.disconnect();
  }, [categories]);

  if (categories.length < 2) return null;

  const onJump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(`menu-cat-${id}`);
    if (!el) return; // let the browser follow the href normally
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  };

  return (
    <nav className="menu-quicknav" aria-label={label}>
      <ul className="menu-quicknav-list" role="list">
        {categories.map((c) => (
          <li key={c.id}>
            <a
              href={`#menu-cat-${c.id}`}
              className={`menu-quicknav-chip${activeId === c.id ? " is-active" : ""}`}
              aria-current={activeId === c.id ? "true" : undefined}
              onClick={(e) => onJump(e, c.id)}
            >
              {c.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
