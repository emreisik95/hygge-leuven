/**
 * MapMarker — branded café pin for MapLibre.
 *
 * Returns a raw HTMLElement (not a React component) so it can be passed
 * directly to `new maplibregl.Marker({ element })` from a useEffect after
 * MapLibre has loaded.
 *
 * Class names referenced here (.hygge-marker, .hygge-marker-pin,
 * .hygge-marker-label, .hygge-marker-pulse) are styled in app/globals.css.
 */

export function createMarkerElement(label?: string): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "hygge-marker";
  wrapper.setAttribute("role", "img");
  wrapper.setAttribute("aria-label", `${label ?? "café"} — pinned location`);
  wrapper.setAttribute("tabindex", "0");

  // SVG: 32x40 viewBox.
  // Pin head is a soft teardrop (rounded top, tapered base) sitting on
  // a small base shadow. Inside the head: a minimal coffee-cup silhouette
  // with two faint steam curls, all rendered as cream strokes/fills on the
  // warm-rust pin body so the glyph reads at small sizes.
  const pinSvg = `
    <svg
      class="hygge-marker-pin"
      viewBox="0 0 32 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <!-- Teardrop pin body: rounded head, tapered tip at bottom -->
      <path
        d="M16 1.5
           C 8.27 1.5 2 7.77 2 15.5
           C 2 21.6 6.1 26.4 10.4 30.2
           C 13.1 32.6 15.1 35.4 16 38.5
           C 16.9 35.4 18.9 32.6 21.6 30.2
           C 25.9 26.4 30 21.6 30 15.5
           C 30 7.77 23.73 1.5 16 1.5 Z"
        fill="var(--instagram, #9a3e22)"
        stroke="var(--ink, #f4ead8)"
        stroke-width="1.5"
        stroke-linejoin="round"
      />

      <!-- Steam curls above the cup (subtle, cream) -->
      <path
        d="M12.6 7.6 c 0.6 -1 -0.6 -2 0 -3"
        fill="none"
        stroke="var(--ink, #f4ead8)"
        stroke-width="0.9"
        stroke-linecap="round"
        opacity="0.85"
      />
      <path
        d="M16 7.6 c 0.6 -1 -0.6 -2 0 -3"
        fill="none"
        stroke="var(--ink, #f4ead8)"
        stroke-width="0.9"
        stroke-linecap="round"
        opacity="0.85"
      />
      <path
        d="M19.4 7.6 c 0.6 -1 -0.6 -2 0 -3"
        fill="none"
        stroke="var(--ink, #f4ead8)"
        stroke-width="0.9"
        stroke-linecap="round"
        opacity="0.85"
      />

      <!-- Coffee cup body -->
      <path
        d="M10 10
           h 10
           a 1 1 0 0 1 1 1
           v 6
           a 4 4 0 0 1 -4 4
           h -4
           a 4 4 0 0 1 -4 -4
           v -6
           a 1 1 0 0 1 1 -1 Z"
        fill="var(--ink, #f4ead8)"
        stroke="var(--ink, #f4ead8)"
        stroke-width="0.6"
        stroke-linejoin="round"
      />

      <!-- Cup handle -->
      <path
        d="M21 12.2
           c 2.4 0 2.4 5 0 5"
        fill="none"
        stroke="var(--ink, #f4ead8)"
        stroke-width="1.4"
        stroke-linecap="round"
      />

      <!-- Saucer line under cup -->
      <path
        d="M8.5 22.4 h 13"
        stroke="var(--ink, #f4ead8)"
        stroke-width="1.2"
        stroke-linecap="round"
      />
    </svg>
  `;

  wrapper.innerHTML = `
    <span class="hygge-marker-pulse" aria-hidden="true"></span>
    ${pinSvg}
    ${label ? `<span class="hygge-marker-label">${escapeHtml(label)}</span>` : ""}
  `;

  return wrapper;
}

/**
 * Escape the five HTML-significant characters before injecting user-supplied
 * label text via innerHTML: `&`, `<`, `>`, `"`, `'`.
 */
function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]!,
  );
}
