"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

// Known section ids in document order, each paired with a human label key. The
// label text is supplied via the `sections` copy map so it stays translatable;
// only ids actually present in the DOM are listed (optional sections may be
// absent). This is a keyboard-driven quick-jump palette: "/" (when not typing)
// or Cmd/Ctrl+K opens it, arrows navigate, Enter smooth-scrolls, Esc closes.
const SECTION_IDS = [
  "landing",
  "vision",
  "insta",
  "testimonials",
  "events",
  "faq",
  "more",
  "menu",
  "map",
] as const;

type Item = { id: string; label: string };

export function CommandPalette({
  hint,
  placeholder,
  empty,
  sections,
}: {
  hint: string;
  placeholder: string;
  empty: string;
  // Map of section id -> human label. Ids missing from this map fall back to a
  // capitalised id; ids missing from the DOM are skipped entirely.
  sections: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [items, setItems] = useState<Item[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Element focused before opening, so focus can be restored on close.
  const restoreRef = useRef<HTMLElement | null>(null);

  const titleId = useId();

  // Resolve which known sections are actually on the page, in document order.
  const collect = useCallback((): Item[] => {
    return SECTION_IDS.flatMap((id) => {
      if (!document.getElementById(id)) return [];
      const label = sections[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
      return [{ id, label }];
    });
  }, [sections]);

  const close = useCallback(() => setOpen(false), []);

  // Global open shortcuts: "/" (when not typing in a field) or Cmd/Ctrl+K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const k = e.key.toLowerCase();
      const cmdK = k === "k" && (e.metaKey || e.ctrlKey);
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (!cmdK && !slash) return;

      const el = e.target as HTMLElement | null;
      const typing =
        !!el &&
        (el.isContentEditable ||
          el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT");
      // "/" must never hijack typing; Cmd/Ctrl+K may open from anywhere.
      if (slash && typing) return;

      e.preventDefault();
      restoreRef.current = (document.activeElement as HTMLElement) ?? null;
      setItems(collect());
      setQuery("");
      setActive(0);
      setOpen(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [collect]);

  // Move focus to the input on open; restore the prior focus on close.
  useEffect(() => {
    if (!open) {
      const prev = restoreRef.current;
      restoreRef.current = null;
      if (prev && typeof prev.focus === "function") prev.focus();
      return;
    }
    inputRef.current?.focus();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.label.toLowerCase().includes(q));
  }, [items, query]);

  // Keep the active index within the filtered range.
  useEffect(() => {
    setActive((a) => (filtered.length === 0 ? 0 : Math.min(a, filtered.length - 1)));
  }, [filtered.length]);

  // Keep the active option scrolled into view as it changes.
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const node = list?.children[active] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const go = useCallback(
    (item: Item | undefined) => {
      if (!item) return;
      setOpen(false);
      const target = document.getElementById(item.id);
      if (!target) return;
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    },
    [],
  );

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (filtered.length ? (a + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (filtered.length ? (a - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(Math.max(0, filtered.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(filtered[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  if (!open) return null;

  // The listbox is only in the DOM when there are results; keep the combobox's
  // popup-related ARIA in sync with that so aria-controls never dangles and
  // aria-expanded honestly reflects whether a listbox is presented.
  const hasList = filtered.length > 0;
  const listId = `${titleId}-list`;
  const activeId = hasList ? `${titleId}-opt-${active}` : undefined;

  return (
    <div className="cmdk" role="presentation" onMouseDown={close}>
      <div
        className="cmdk-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p id={titleId} className="cmdk-hint">
          {hint}
        </p>
        <input
          ref={inputRef}
          type="text"
          className="cmdk-input"
          placeholder={placeholder}
          aria-label={placeholder}
          role="combobox"
          aria-expanded={hasList}
          aria-controls={hasList ? listId : undefined}
          aria-activedescendant={activeId}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onInputKey}
        />
        {hasList ? (
          <ul ref={listRef} id={listId} className="cmdk-list" role="listbox">
            {filtered.map((item, i) => (
              <li
                key={item.id}
                id={`${titleId}-opt-${i}`}
                className={`cmdk-opt${i === active ? " is-active" : ""}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => go(item)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="cmdk-empty" role="status">
            {empty}
          </p>
        )}
      </div>
    </div>
  );
}
