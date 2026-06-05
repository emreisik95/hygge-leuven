// UI copy for flag-gated features. Centralised so it's easy to find and, later,
// to migrate into the translation system. English-only for now; every string
// here only ever renders once an admin enables the matching flag.

export const FEATURE_LABELS = {
  announcement: {
    message: "Open all week — extended weekend hours through the season. Come cosy up. ☕",
    close: "Dismiss announcement",
  },
  cookie: {
    message:
      "We keep things simple — no tracking cookies, just what's needed to remember your language and theme.",
    accept: "Got it",
  },
  theme: {
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
  },
  backToTop: "Back to top",
  pwaInstall: "Install app",
  share: {
    share: "Share",
    copied: "Link copied",
  },
  lightboxClose: "Close photo",
  weatherTemplate: "Right now in Leuven: {temp}, {sky}. Perfect weather for a coffee.",
  loyalty: {
    heading: "Coffee card",
    hint: "Tap a cup each visit. Fill the card, treat yourself.",
    reward: "Card full — your next coffee is on us. Show this at the counter. 🎉",
    reset: "Reset card",
  },
  menuSearch: {
    placeholder: "Search the menu…",
    noResults: "Nothing matches — try another word.",
  },
  newsletter: {
    heading: "Stay in the loop",
    body: "Seasonal menus, slow mornings, the odd tasting. No noise.",
    placeholder: "you@example.com",
    button: "Subscribe",
    success: "You're in — thanks for joining us.",
    invalid: "That email doesn't look right.",
    error: "Something went wrong. Please try again.",
  },
  faqHeading: "good to know",
  testimonialsHeading: "kind words",
  eventsHeading: "what's on",
  spotifyHeading: "our playlist",
  giftCard: {
    heading: "Gift a little hygge",
    body: "Café gift cards in any amount — coffee, pastry, or a slow lunch for someone you like.",
    button: "Enquire by email",
  },
  reservation: {
    label: "Reserve a table",
    subject: "Table reservation",
  },
  directions: "Get directions",
} as const;
