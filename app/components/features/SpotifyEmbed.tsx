import { SPOTIFY_PLAYLIST_ID } from "@/lib/feature-content";

// Embeds the café playlist via Spotify's official iframe. Lazy-loaded so it
// never blocks the page, and themed dark to match the site.
export function SpotifyEmbed({ heading }: { heading: string }) {
  const src = `https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0`;
  return (
    <div className="spotify">
      <h3 className="spotify-heading">{heading}</h3>
      <iframe
        className="spotify-frame"
        title={heading}
        src={src}
        width="100%"
        height="152"
        loading="lazy"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
