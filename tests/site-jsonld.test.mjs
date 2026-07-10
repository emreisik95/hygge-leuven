import assert from "node:assert/strict";
import test from "node:test";

import { buildCafeJsonLd } from "../lib/cafe-jsonld.ts";

test("does not publish price metadata when the menu has no prices", () => {
  const jsonLd = buildCafeJsonLd({
    origin: "https://example.com",
    description: "A café",
    image: "https://example.com/cafe.jpg",
    instagramUrl: "https://instagram.com/example",
    findUsUrl: "https://maps.example.com/cafe",
    hours: [],
    hasMenu: true,
  });

  assert.equal("priceRange" in jsonLd, false);
  assert.equal("currenciesAccepted" in jsonLd, false);
});
