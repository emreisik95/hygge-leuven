"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <div className="map-canvas" aria-hidden="true" />,
});

type Props = { lat: number; lng: number; zoom: number; label?: string };

export default function MapClient(props: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) {
      setShouldMount(true);
      return;
    }
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShouldMount(true);
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin: "200% 0px 200% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  if (shouldMount) return <Map {...props} />;
  return (
    <div ref={sentinelRef} className="map-canvas" aria-hidden="true" />
  );
}
