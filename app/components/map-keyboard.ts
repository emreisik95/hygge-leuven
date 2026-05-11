import type {
  EaseToOptions,
  FlyToOptions,
  Map as MapLibreMap,
} from "maplibre-gl";

/**
 * Wires complementary keyboard / focus behaviour for the MapLibre container.
 *
 * MapLibre's built-in keyboard handler is disabled in Map.tsx (`keyboard: false`)
 * so the map cannot trap arrow / +/- keys. This helper:
 *   - Removes the container itself from the tab order (the marker remains the
 *     only focusable child via its own `tabindex="0"`).
 *   - Installs a document-level ESC handler that, when focus is inside the map,
 *     blurs the active descendant and moves focus to the page's skip anchor.
 *
 * Returns a cleanup function that removes the listener.
 */
export function setupMapInteractions(
  map: MapLibreMap,
  container: HTMLElement,
  _prefersReducedMotion: boolean,
): () => void {
  // Reference `map` so future popup-aware logic can hook in without a signature
  // change; also silences unused-parameter lints.
  void map;

  container.setAttribute("tabindex", "-1");

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    const active = document.activeElement as HTMLElement | null;
    if (!active || !container.contains(active)) return;

    const fallback =
      document.querySelector<HTMLAnchorElement>("a[href='#landing']") ??
      document.querySelector<HTMLAnchorElement>(".skip-link");

    active.blur();
    fallback?.focus();
  };

  document.addEventListener("keydown", onKeyDown);

  return () => {
    document.removeEventListener("keydown", onKeyDown);
  };
}

/**
 * Programmatic camera move that respects `prefers-reduced-motion`.
 * When reduced motion is requested, the animation is replaced by an instant
 * `jumpTo` to the same target.
 */
export function safeFlyTo(
  map: MapLibreMap,
  options: FlyToOptions,
  prefersReducedMotion: boolean,
): void {
  if (prefersReducedMotion) {
    map.jumpTo({
      center: options.center,
      zoom: options.zoom,
      bearing: options.bearing,
      pitch: options.pitch,
    });
    return;
  }
  map.flyTo(options);
}

/**
 * Same contract as {@link safeFlyTo} but for ease-style transitions.
 */
export function safeEaseTo(
  map: MapLibreMap,
  options: EaseToOptions,
  prefersReducedMotion: boolean,
): void {
  if (prefersReducedMotion) {
    map.jumpTo({
      center: options.center,
      zoom: options.zoom,
      bearing: options.bearing,
      pitch: options.pitch,
    });
    return;
  }
  map.easeTo(options);
}
