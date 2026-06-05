import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Feature flags
//
// Every optional landing-page feature is gated by a key in FLAG_REGISTRY. The
// live state is the registry default (all OFF) overlaid with any rows present
// in the FeatureFlag table, so a fresh database renders exactly as before this
// system existed. Admins flip flags at /admin/features; nothing here reads the
// network or env, so the set of features is fully data-driven and auditable.
// ---------------------------------------------------------------------------

export const FLAG_KEYS = [
  "announcementBanner",
  "darkMode",
  "scrollProgress",
  "backToTop",
  "cookieConsent",
  "pwaInstall",
  "weatherGreeting",
  "liveClock",
  "loyaltyCard",
  "photoLightbox",
  "socialShare",
  "seasonalAccent",
  "faqSection",
  "testimonials",
  "eventsList",
  "menuDietaryTags",
  "menuSearch",
  "reservationCta",
  "giftCardCta",
  "spotifyEmbed",
  "newsletterSignup",
  "mapDirectionsCta",
  "sectionNavDots",
  "revealOnScroll",
  "a11yToolbar",
  "localeSuggest",
  "commandPalette",
  "seasonalParticles",
  "weatherRecommend",
  "whatsappCta",
  "galleryGrid",
  "pressMentions",
  "aboutStory",
  "coffeeOfWeek",
  "drinkFinder",
  "valuesStrip",
  "openingTimeline",
  "neighbourhoodGuide",
  "hoursCountdown",
  "menuQuickNav",
  "allergenLegend",
  "menuFavorites",
  "printMenu",
  "groupBookingCta",
  "takeawayCta",
  "feedbackPrompt",
] as const;

export type FlagKey = (typeof FLAG_KEYS)[number];

export type Flags = Record<FlagKey, boolean>;

export type FlagGroup = "Chrome" | "Engagement" | "Content" | "Menu" | "Commerce";

export type FlagMeta = {
  key: FlagKey;
  label: string;
  description: string;
  group: FlagGroup;
  /** Default state on a database with no row for this key. */
  default: boolean;
};

// Source of truth for what each flag does. Order here drives the admin UI.
export const FLAG_REGISTRY: FlagMeta[] = [
  {
    key: "announcementBanner",
    label: "Announcement banner",
    description: "Dismissible bar at the top of the page for holiday hours or news.",
    group: "Chrome",
    default: false,
  },
  {
    key: "darkMode",
    label: "Dark / light toggle",
    description: "Floating control to switch theme; remembers the visitor's choice.",
    group: "Chrome",
    default: false,
  },
  {
    key: "scrollProgress",
    label: "Scroll progress bar",
    description: "Thin progress indicator that fills as the visitor scrolls the page.",
    group: "Chrome",
    default: false,
  },
  {
    key: "backToTop",
    label: "Back-to-top button",
    description: "Floating button that appears after scrolling and returns to the top.",
    group: "Chrome",
    default: false,
  },
  {
    key: "cookieConsent",
    label: "Cookie consent",
    description: "Lightweight, dismissible consent notice stored in the browser.",
    group: "Chrome",
    default: false,
  },
  {
    key: "seasonalAccent",
    label: "Seasonal accent",
    description: "Tints the accent colour by season (spring/summer/autumn/winter).",
    group: "Chrome",
    default: false,
  },
  {
    key: "pwaInstall",
    label: "Install app prompt",
    description: "Offers an 'Add to home screen' button on supported devices.",
    group: "Engagement",
    default: false,
  },
  {
    key: "weatherGreeting",
    label: "Weather greeting",
    description: "Shows the current Leuven weather as a small contextual greeting.",
    group: "Engagement",
    default: false,
  },
  {
    key: "liveClock",
    label: "Live café clock",
    description: "Ticking local (Europe/Brussels) time next to the open/closed status.",
    group: "Engagement",
    default: false,
  },
  {
    key: "loyaltyCard",
    label: "Digital loyalty card",
    description: "A coffee stamp card the visitor fills in on their own device.",
    group: "Engagement",
    default: false,
  },
  {
    key: "photoLightbox",
    label: "Photo lightbox",
    description: "Opens Instagram photos in a full-screen overlay instead of a new tab.",
    group: "Engagement",
    default: false,
  },
  {
    key: "socialShare",
    label: "Share buttons",
    description: "Native share / copy-link control so visitors can pass the page on.",
    group: "Engagement",
    default: false,
  },
  {
    key: "faqSection",
    label: "FAQ section",
    description: "Accordion of common questions (wifi, dietary, reservations…).",
    group: "Content",
    default: false,
  },
  {
    key: "testimonials",
    label: "Testimonials",
    description: "A short rotating set of guest quotes.",
    group: "Content",
    default: false,
  },
  {
    key: "eventsList",
    label: "Upcoming events",
    description: "Highlights tastings, live music or workshops with dates.",
    group: "Content",
    default: false,
  },
  {
    key: "spotifyEmbed",
    label: "Café playlist",
    description: "Embeds the café's Spotify playlist so visitors can listen along.",
    group: "Content",
    default: false,
  },
  {
    key: "menuDietaryTags",
    label: "Menu dietary tags",
    description: "Shows veg / vegan / gluten-free badges on menu items.",
    group: "Menu",
    default: false,
  },
  {
    key: "menuSearch",
    label: "Menu search",
    description: "Instant filter box at the top of the menu section.",
    group: "Menu",
    default: false,
  },
  {
    key: "reservationCta",
    label: "Reservation button",
    description: "Adds a 'Reserve a table' action to the contact card.",
    group: "Commerce",
    default: false,
  },
  {
    key: "giftCardCta",
    label: "Gift card promo",
    description: "A small block promoting gift cards.",
    group: "Commerce",
    default: false,
  },
  {
    key: "newsletterSignup",
    label: "Newsletter signup",
    description: "Email capture form that stores opt-ins for a future newsletter.",
    group: "Commerce",
    default: false,
  },
  {
    key: "mapDirectionsCta",
    label: "Directions shortcut",
    description: "Adds a one-tap 'Get directions' button to the map card.",
    group: "Commerce",
    default: false,
  },
  {
    key: "sectionNavDots",
    label: "Section nav dots",
    description:
      "Shows a vertical column of dots on the right edge (desktop) that mark the page sections and highlight the one in view.",
    group: "Chrome",
    default: false,
  },
  {
    key: "revealOnScroll",
    label: "Reveal on scroll",
    description: "Fades and rises content blocks gently into view as the visitor scrolls.",
    group: "Chrome",
    default: false,
  },
  {
    key: "a11yToolbar",
    label: "Accessibility toolbar",
    description:
      "Floating control letting visitors adjust text size, high contrast, and reduced motion, remembered in their browser.",
    group: "Chrome",
    default: false,
  },
  {
    key: "localeSuggest",
    label: "Language suggestion",
    description:
      "Hints Dutch- and French-speaking visitors towards the language switcher when the page is in English.",
    group: "Chrome",
    default: false,
  },
  {
    key: "commandPalette",
    label: "Command palette",
    description:
      "Adds a keyboard quick-jump palette (open with \"/\" or Cmd/Ctrl+K) that filters and smooth-scrolls to on-page sections.",
    group: "Chrome",
    default: false,
  },
  {
    key: "seasonalParticles",
    label: "Seasonal particles",
    description: "Subtle falling snow, leaves or petals themed by the current season (nothing in summer).",
    group: "Chrome",
    default: false,
  },
  {
    key: "weatherRecommend",
    label: "Weather drink suggestion",
    description:
      "Shows a small dismissible note suggesting an iced, warm, or cosy drink based on the live Leuven weather.",
    group: "Engagement",
    default: false,
  },
  {
    key: "whatsappCta",
    label: "WhatsApp button",
    description:
      "Shows a floating WhatsApp button linking to the café's contact number when a phone number is configured.",
    group: "Engagement",
    default: false,
  },
  {
    key: "galleryGrid",
    label: "Photo gallery",
    description: "A scrollable grid of café photos with captions, lazy-loaded for a quick first paint.",
    group: "Content",
    default: false,
  },
  {
    key: "pressMentions",
    label: "Press mentions",
    description: "A short strip of kind words from around town, each with a source attribution.",
    group: "Content",
    default: false,
  },
  {
    key: "aboutStory",
    label: "Our story",
    description:
      "A short, warm note on the café's philosophy — hygge, slow mornings and Danish baking — paired with an illustration.",
    group: "Content",
    default: false,
  },
  {
    key: "coffeeOfWeek",
    label: "Coffee of the week",
    description: "Features this week's single-origin bean with its origin, roast and tasting notes.",
    group: "Content",
    default: false,
  },
  {
    key: "drinkFinder",
    label: "Drink finder quiz",
    description: "A short three-question quiz that recommends a café drink to the visitor.",
    group: "Engagement",
    default: false,
  },
  {
    key: "valuesStrip",
    label: "What we care about",
    description:
      "A calm strip of small value cards — specialty beans, in-house baking, oat by default and unhurried hours.",
    group: "Content",
    default: false,
  },
  {
    key: "openingTimeline",
    label: "Opening hours timeline",
    description:
      "A visual weekly chart of opening hours with a bar per day on a shared time axis, highlighting today.",
    group: "Content",
    default: false,
  },
  {
    key: "neighbourhoodGuide",
    label: "Neighbourhood guide",
    description:
      "Lists a few nearby Leuven spots — a square, a park, a bookshop, a museum — each with a short note and a walk time.",
    group: "Content",
    default: false,
  },
  {
    key: "hoursCountdown",
    label: "Hours countdown",
    description:
      "Shows a live 'opens in / closes in' countdown next to the open/closed status on the landing card.",
    group: "Engagement",
    default: false,
  },
  {
    key: "menuQuickNav",
    label: "Menu quick-nav",
    description:
      "A row of chips at the top of the menu that jump to each category and highlight the one in view.",
    group: "Menu",
    default: false,
  },
  {
    key: "allergenLegend",
    label: "Dietary legend",
    description:
      "A small key under the menu header explaining the veg / vegan / gluten-free / dairy-free tag letters.",
    group: "Menu",
    default: false,
  },
  {
    key: "menuFavorites",
    label: "Menu favourites",
    description:
      "Lets visitors star menu items (saved on their own device) with a count badge and one-tap clear in the menu header.",
    group: "Menu",
    default: false,
  },
  {
    key: "printMenu",
    label: "Print menu",
    description:
      "Adds a 'Print menu' button that prints a clean, isolated copy of just the menu section.",
    group: "Menu",
    default: false,
  },
  {
    key: "groupBookingCta",
    label: "Group booking",
    description:
      "Adds a 'Group booking' action to the contact card that opens a pre-addressed enquiry email.",
    group: "Commerce",
    default: false,
  },
  {
    key: "takeawayCta",
    label: "Takeaway button",
    description:
      "Adds an 'Order takeaway' action that calls the café (or emails when no number is set) to order ahead.",
    group: "Commerce",
    default: false,
  },
  {
    key: "feedbackPrompt",
    label: "Feedback prompt",
    description:
      "A calm, dismissible 'how was your visit?' card near the foot of the page that opens a feedback email.",
    group: "Engagement",
    default: false,
  },
];

const REGISTRY_BY_KEY = new Map<FlagKey, FlagMeta>(FLAG_REGISTRY.map((f) => [f.key, f]));
const VALID_KEYS = new Set<string>(FLAG_KEYS);

export function isFlagKey(value: string): value is FlagKey {
  return VALID_KEYS.has(value);
}

// Registry defaults, used both as the base for loadFlags and as a safe fallback
// if the database is unreachable.
function defaultFlags(): Flags {
  const out = {} as Flags;
  for (const meta of FLAG_REGISTRY) out[meta.key] = meta.default;
  return out;
}

// Resolved flag state: registry defaults overlaid with persisted rows. Unknown
// keys lingering in the table (e.g. a removed feature) are ignored.
export async function loadFlags(): Promise<Flags> {
  const flags = defaultFlags();
  try {
    const rows = await prisma.featureFlag.findMany();
    for (const row of rows) {
      if (isFlagKey(row.key)) flags[row.key] = row.enabled;
    }
  } catch {
    // Table missing / DB down → registry defaults keep the page rendering.
  }
  return flags;
}

// Persist one flag. Returns the previous value so callers can audit the change.
export async function setFlag(key: FlagKey, enabled: boolean): Promise<boolean> {
  const before = await prisma.featureFlag.findUnique({ where: { key } });
  await prisma.featureFlag.upsert({
    where: { key },
    create: { key, enabled },
    update: { enabled },
  });
  return before?.enabled ?? REGISTRY_BY_KEY.get(key)?.default ?? false;
}
