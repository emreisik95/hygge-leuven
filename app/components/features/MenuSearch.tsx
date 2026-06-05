"use client";

import { useEffect, useRef, useState } from "react";

// Instant client-side menu filter. Operates on the already-rendered menu DOM
// (matching `.menu-item` / `.menu-category`) so it needs no data passed in and
// degrades to a no-op when JS is off. Categories with no visible item hide too.
export function MenuSearch({ placeholder, noResults }: { placeholder: string; noResults: string }) {
  const [empty, setEmpty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = document.querySelector(".menu-grid");
    if (!root) return;
    const input = inputRef.current;
    if (!input) return;

    const apply = () => {
      const q = input.value.trim().toLowerCase();
      let anyVisible = false;
      root.querySelectorAll<HTMLElement>(".menu-category").forEach((cat) => {
        let catVisible = false;
        cat.querySelectorAll<HTMLElement>(".menu-item").forEach((item) => {
          const hit = q === "" || (item.textContent ?? "").toLowerCase().includes(q);
          item.hidden = !hit;
          if (hit) catVisible = true;
        });
        cat.hidden = !catVisible;
        if (catVisible) anyVisible = true;
      });
      setEmpty(q !== "" && !anyVisible);
    };

    input.addEventListener("input", apply);
    return () => {
      input.removeEventListener("input", apply);
      // Restore visibility when the filter unmounts (flag toggled off via HMR).
      root.querySelectorAll<HTMLElement>(".menu-item, .menu-category").forEach((el) => {
        el.hidden = false;
      });
    };
  }, []);

  return (
    <div className="menu-search">
      <input
        ref={inputRef}
        type="search"
        className="menu-search-input"
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {empty ? (
        <p className="menu-search-empty" role="status">
          {noResults}
        </p>
      ) : null}
    </div>
  );
}
