"use client";

import { useEffect, useState } from "react";
import { clearFavs, readFavs, subscribeFavs } from "@/lib/favorites";

// A small summary line shown in the menu header: how many items the visitor has
// starred, with a one-tap clear. Renders nothing until at least one favourite
// exists, so it stays out of the way for first-time visitors. Pairs with the
// per-item <FavoriteStar/>; both read the same localStorage-backed store.

export function FavoritesBar({
  summaryOne,
  summaryMany,
  clearLabel,
}: {
  summaryOne: string;
  // Carries a "{n}" placeholder, e.g. "{n} favourites saved".
  summaryMany: string;
  clearLabel: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(readFavs().length);
    sync();
    return subscribeFavs(sync);
  }, []);

  if (count === 0) return null;
  const summary = count === 1 ? summaryOne : summaryMany.replace("{n}", String(count));
  return (
    <div className="favorites-bar" role="status">
      <span className="favorites-bar-count">{summary}</span>
      <button type="button" className="favorites-bar-clear" onClick={() => clearFavs()}>
        {clearLabel}
      </button>
    </div>
  );
}
