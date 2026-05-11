type Props = { lat: number; lng: number; zoom: number; label?: string };

export function OsmMap({ lat, lng, zoom, label }: Props) {
  const effectiveZoom = Math.max(zoom, 18);
  const span = 0.0015 * Math.pow(2, 18 - effectiveZoom);
  const bbox = [lng - span, lat - span * 0.6, lng + span, lat + span * 0.6].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <iframe
      className="map-canvas map-iframe"
      src={src}
      title={label ? `Map showing ${label}` : "Map"}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
