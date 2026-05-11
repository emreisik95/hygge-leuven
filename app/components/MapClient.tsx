"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <div className="map-canvas" aria-hidden="true" />,
});

type Props = { lat: number; lng: number; zoom: number; label?: string };

export default function MapClient(props: Props) {
  return <Map {...props} />;
}
