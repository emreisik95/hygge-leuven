// UI copy for flag-gated features. Centralised so it's easy to find and, later,
// to migrate into the translation system. English-only for now; every string
// here only ever renders once an admin enables the matching flag.

// Translation namespace for the announcement message. The text is editable from
// the Translations admin (per-locale, EN-fallback); FEATURE_LABELS.announcement
// .message below is the seed/default shown until an admin overrides it.
export const ANNOUNCEMENT_NS = "feature.announcement.message";

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
  galleryHeading: "a look inside",
  pressMentionsHeading: "kind words from around town",
  aboutStoryHeading: "our story",
  coffeeOfWeekHeading: "this week's bean",
  drinkFinderHeading: "find your drink",
  valuesHeading: "what we care about",
  openingTimelineHeading: "this week",
  neighbourhoodGuideHeading: "while you're in leuven",
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
  sectionNav: {
    landing: "Welcome",
    vision: "Our story",
    insta: "Gallery",
    testimonials: "Kind words",
    events: "What's on",
    faq: "Good to know",
    more: "More",
    menu: "Menu",
    map: "Find us",
  },
  a11y: {
    heading: "Accessibility",
    textSize: "Text size",
    increase: "Increase text size",
    decrease: "Decrease text size",
    contrast: "High contrast",
    motion: "Reduce motion",
    close: "Close accessibility panel",
  },
  localeSuggest: {
    message: "Prefer Dutch or French? Switch the language at the top of the page.",
    action: "Choose language",
    close: "Dismiss language suggestion",
  },
  commandPalette: {
    hint: "Jump to…",
    placeholder: "Search sections…",
    empty: "Nothing matches — try another word.",
    sections: {
      landing: "Top of page",
      vision: "Our story",
      insta: "Instagram",
      testimonials: "Kind words",
      events: "What's on",
      faq: "Good to know",
      more: "More",
      menu: "Menu",
      map: "Find us",
    } as Record<string, string>,
  },
  weatherRecommend: {
    hot: "Warm one out there — an iced latte sounds about right. ☕",
    cold: "Cool and calm in Leuven today — come warm up with a hot cocoa. ☕",
    rainy: "Rain's tapping the windows — perfect excuse for a cosy cup inside. ☔",
    dismiss: "Dismiss drink suggestion",
  },
  whatsapp: { label: "Chat with us on WhatsApp" },
} as const;
