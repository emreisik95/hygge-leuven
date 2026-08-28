import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  CANONICAL_ORIGIN,
  resolvePublicOrigin,
} from "../lib/public-origin.ts";

test("uses the Hygge apex as the canonical production origin", () => {
  assert.equal(CANONICAL_ORIGIN, "https://hyggeleuven.be");
  assert.equal(resolvePublicOrigin({ nodeEnv: "production" }), CANONICAL_ORIGIN);
  assert.equal(
    resolvePublicOrigin({
      nodeEnv: "production",
      override: "https://hyggeleuven.be/",
    }),
    CANONICAL_ORIGIN,
  );
});

test("keeps localhost request-aware during development", () => {
  assert.equal(
    resolvePublicOrigin({ nodeEnv: "development", host: "localhost:3000" }),
    "http://localhost:3000",
  );
  assert.equal(
    resolvePublicOrigin({
      nodeEnv: "development",
      forwardedHost: "preview.local:4000",
      forwardedProto: "https",
    }),
    "https://preview.local:4000",
  );
});

test("sitemap and robots share the canonical origin helper", async () => {
  const [sitemap, robots] = await Promise.all([
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
  ]);

  assert.match(sitemap, /getOrigin\(\)/);
  assert.match(robots, /getOrigin\(\)/);
  assert.match(sitemap, /url:\s*`\$\{origin\}\/`/);
  assert.match(robots, /sitemap:\s*`\$\{origin\}\/sitemap\.xml`/);
  assert.doesNotMatch(`${sitemap}\n${robots}`, /hygge\.emre\.zip/);
});
