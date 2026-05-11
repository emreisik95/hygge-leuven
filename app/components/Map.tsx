"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { mapStyle } from "./map-style";
import { createMarkerElement } from "./MapMarker";
import { setupMapInteractions } from "./map-keyboard";

type Props = { lat: number; lng: number; zoom: number; label?: string };

export default function Map({ lat, lng, zoom, label }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [debugMsg, setDebugMsg] = useState<string>("init");

  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const container = ref.current;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let teardownInteractions: (() => void) | void;

    setDebugMsg("effect-fired");

    (async () => {
      try {
      setDebugMsg("importing maplibre");
      const maplibregl = (await import("maplibre-gl")).default;
      setDebugMsg("imported");

      if (cancelled || !ref.current || mapRef.current) return;

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const map = new maplibregl.Map({
        container,
        style: mapStyle,
        center: [lng, lat],
        zoom,
        attributionControl: false,
        fadeDuration: prefersReducedMotion ? 0 : 300,
        keyboard: false,
        scrollZoom: false,
        boxZoom: false,
        doubleClickZoom: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
      });

      mapRef.current = map;

      const w0 = container.clientWidth;
      const h0 = container.clientHeight;
      setDebugMsg(`pre-resize ${w0}×${h0}`);
      requestAnimationFrame(() => {
        if (cancelled) return;
        map.resize();
        setDebugMsg(`resized ${container.clientWidth}×${container.clientHeight}`);
      });

      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
          customAttribution:
            "© OpenFreeMap © OpenMapTiles © OpenStreetMap contributors",
        }),
      );

      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: false,
          visualizePitch: false,
        }),
        "bottom-right",
      );

      setDebugMsg("constructed");
      map.on("error", (e) => {
        setDebugMsg(`maperr: ${(e as { error?: { message?: string } }).error?.message ?? "unknown"}`);
      });
      map.on("load", () => {
        if (cancelled) return;
        setDebugMsg("loaded");
        new maplibregl.Marker({ element: createMarkerElement(label) })
          .setLngLat([lng, lat])
          .addTo(map);

        teardownInteractions = setupMapInteractions(
          map,
          container,
          prefersReducedMotion,
        );
      });

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          map.resize();
        });
        resizeObserver.observe(container);
      }

      if (typeof IntersectionObserver !== "undefined") {
        intersectionObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                map.resize();
              }
            }
          },
          { threshold: 0.01 },
        );
        intersectionObserver.observe(container);
      }
      } catch (err) {
        setDebugMsg(`thrown: ${err instanceof Error ? err.message : String(err)}`);
      }
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (typeof teardownInteractions === "function") {
        teardownInteractions();
      }
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, zoom, label]);

  return (
    <>
      <div ref={ref} className="map-canvas" />
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          padding: "4px 8px",
          background: "rgba(0,0,0,0.8)",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: 11,
          zIndex: 9999,
          borderRadius: 4,
          pointerEvents: "none",
        }}
      >
        map: {debugMsg}
      </div>
    </>
  );
}
