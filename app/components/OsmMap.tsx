type Props = { lat: number; lng: number; zoom: number; label?: string };

export function OsmMap({ lat, lng, zoom, label }: Props) {
  const span = Math.max(0.001, 0.6 / Math.pow(2, zoom - 13));
  const bbox = [lng - span, lat - span * 0.6, lng + span, lat + span * 0.6].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <iframe
      className="map-canvas"
      src={src}
      title={label ? `Map showing ${label}` : "Map"}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      style={{ border: 0, display: "block", width: "100%", height: "100%" }}
    />
  );
}
