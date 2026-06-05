// Default content for the flag-gated content sections (FAQ, testimonials,
// events). Kept here so copy lives in one place and can later move into the
// admin/translation system. All sections default OFF, so this only renders
// once an admin enables the matching flag.

export type FaqItem = { q: string; a: string };
export type Testimonial = { quote: string; author: string };
export type CafeEvent = { date: string; title: string; detail: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Do you have oat / plant milk?",
    a: "Always. Oat is our house default for flat whites and lattes at no extra charge.",
  },
  {
    q: "Is there wifi?",
    a: "Yes — free wifi, and plenty of corners to settle into with a laptop or a book.",
  },
  {
    q: "Are you vegetarian friendly?",
    a: "Most of our pastries and several smørrebrød are vegetarian; ask the counter for the day's options.",
  },
  {
    q: "Can I bring my dog?",
    a: "Well-behaved dogs are welcome inside and on the terrace. There's a water bowl by the door.",
  },
  {
    q: "Do you take card?",
    a: "Card and contactless are welcome. There's no minimum spend.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  { quote: "The coziest corner in Leuven. The cardamom bun alone is worth the trip.", author: "Lotte" },
  { quote: "Proper specialty coffee and a room that makes you want to stay all afternoon.", author: "Bram" },
  { quote: "Feels like a friend's kitchen in Copenhagen, somehow dropped into Naamsestraat.", author: "Sofie" },
];

export const EVENTS: CafeEvent[] = [
  { date: "Every Friday", title: "Filter flight", detail: "Three single-origin pours, side by side, 16:00–18:00." },
  { date: "First Sunday", title: "Slow morning", detail: "Quiet hours, no laptops, fresh cardamom buns from 9:00." },
];

// Public Spotify playlist embedded by the café-playlist flag. A playlist URI is
// safe to hard-code; swap the id to change the playlist.
export const SPOTIFY_PLAYLIST_ID = "37i9dQZF1DX4WYpdgoIcn6"; // "Chill Lofi" public playlist
