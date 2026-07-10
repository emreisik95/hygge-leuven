// Owner-curated QA policy. These panes stay off even when the helper enables
// every other flag, so the local review matches the intended public edit.
export const KEEP_OFF_KEYS = [
  "testimonials",
  "pressMentions",
  "aboutStory",
  "valuesStrip",
  // Owner call (2026-07-10 voice note): the illustrated takeaway cup is out,
  // and the hero-side interior illustration was tried and declined.
  "takeawayCup",
  "heroArt",
];

// Removed features should not leave stale rows in either local database.
export const RETIRED_KEYS = ["weatherGreeting", "weatherRecommend", "openingTimeline"];
