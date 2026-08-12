import assert from "node:assert/strict";
import test from "node:test";

import { KEEP_OFF_KEYS, RETIRED_KEYS } from "../scripts/qa-flag-policy.mjs";

test("keeps owner-retired editorial panes off during QA sweeps", () => {
  assert.deepEqual(KEEP_OFF_KEYS, [
    "testimonials",
    "pressMentions",
    "valuesStrip",
    "takeawayCup",
    "heroArt",
  ]);
});

test("continues deleting removed weather and timeline flags", () => {
  assert.deepEqual(RETIRED_KEYS, ["weatherGreeting", "weatherRecommend", "openingTimeline"]);
});
