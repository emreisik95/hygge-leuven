// Client-only helpers backing the "menu favourites" feature. Favourites are a
// list of opaque menu-item ids stored in localStorage; there is no server state.
// Pure (no prisma / no DB import) so it is safe to pull into Client Components
// without dragging better-sqlite3 into the browser bundle. Every mutation fires a
// window event so the count badge and the per-item stars stay in sync without a
// shared React context.

const KEY = "hygge.favs.v1";
export const FAVS_EVENT = "hygge:favs";

export function readFavs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeFavs(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Private mode / quota — favourites are best-effort, never block the UI.
  }
  window.dispatchEvent(new CustomEvent(FAVS_EVENT));
}

export function toggleFav(id: string): string[] {
  const cur = readFavs();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  writeFavs(next);
  return next;
}

export function clearFavs(): void {
  writeFavs([]);
}

// Subscribe to favourite changes from this tab (CustomEvent) and other tabs
// (the native storage event). Returns an unsubscribe function.
export function subscribeFavs(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(FAVS_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(FAVS_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
