"use client";

import { useEffect, useState } from "react";
import { readFavs, subscribeFavs, toggleFav } from "@/lib/favorites";

// A single star toggle rendered beside a menu item. Favourites live only in the
// visitor's browser (see lib/favorites). Starts un-pressed on the server and
// syncs from localStorage after mount, so the markup is identical on both sides.

export function FavoriteStar({
  id,
  name,
  addLabel,
  removeLabel,
}: {
  id: string;
  name: string;
  addLabel: string;
  removeLabel: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readFavs().includes(id));
    sync();
    return subscribeFavs(sync);
  }, [id]);

  const label = `${saved ? removeLabel : addLabel} — ${name}`;
  return (
    <button
      type="button"
      className={`fav-star${saved ? " is-saved" : ""}`}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? removeLabel : addLabel}
      onClick={() => setSaved(toggleFav(id).includes(id))}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="16" height="16">
        <path
          d="M12 17.3l-5.4 3.1 1.4-6.1-4.6-4 6.2-.5L12 4l2.4 5.8 6.2.5-4.6 4 1.4 6.1z"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
