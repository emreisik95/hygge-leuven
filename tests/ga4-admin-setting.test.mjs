import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("normalizes a bare GA4 measurement ID", async () => {
  const { GoogleAnalyticsInputSchema } = await import("../lib/analytics.ts");
  const parsed = GoogleAnalyticsInputSchema.safeParse(" g-j20qrkxcsb ");

  assert.equal(parsed.success, true);
  assert.equal(parsed.data, "G-J20QRKXCSB");
});

test("extracts one GA4 measurement ID from Google's complete snippet", async () => {
  const { GoogleAnalyticsInputSchema } = await import("../lib/analytics.ts");
  const snippet = `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-J20QRKXCSB"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-J20QRKXCSB');
    </script>
  `;

  const parsed = GoogleAnalyticsInputSchema.safeParse(snippet);

  assert.equal(parsed.success, true);
  assert.equal(parsed.data, "G-J20QRKXCSB");
});

test("uses an empty value to disable GA4", async () => {
  const { GoogleAnalyticsInputSchema } = await import("../lib/analytics.ts");
  assert.deepEqual(GoogleAnalyticsInputSchema.safeParse("   "), {
    success: true,
    data: "",
  });
});

test("rejects malformed or ambiguous GA4 input", async () => {
  const { GoogleAnalyticsInputSchema } = await import("../lib/analytics.ts");

  assert.equal(GoogleAnalyticsInputSchema.safeParse("<script>alert(1)</script>").success, false);
  assert.equal(GoogleAnalyticsInputSchema.safeParse("G-ONE12345 and G-TWO67890").success, false);
});

test("stores the normalized measurement ID in the existing draft and publish flow", async () => {
  const [prismaSchema, migration, db, siteSchema, actions] = await Promise.all([
    read("prisma/schema.prisma"),
    read("prisma/migrations/20260903090000_add_ga4_measurement_id/migration.sql"),
    read("lib/db.ts"),
    read("lib/schemas/site.ts"),
    read("app/admin/actions.ts"),
  ]);

  assert.match(prismaSchema, /gaMeasurementId\s+String\s+@default\(""\)/);
  assert.match(migration, /ALTER TABLE "SiteContent" ADD COLUMN "gaMeasurementId" TEXT NOT NULL DEFAULT ''/);
  assert.match(db, /\| "gaMeasurementId"/);
  assert.match(db, /gaMeasurementId: row\.gaMeasurementId/);
  assert.match(siteSchema, /GoogleAnalyticsInputSchema/);
  assert.match(siteSchema, /gaMeasurementId:\s*GoogleAnalyticsInputSchema/);
  assert.match(actions, /gaMeasurementId:\s*asString\(formData\.get\("gaMeasurementId"\)\)/);
  assert.match(actions, /gaMeasurementId:\s*parsed\.data\.gaMeasurementId/);
});

test("renders a full-snippet-friendly GA4 field in Content SEO", async () => {
  const content = await read("app/admin/content/page.tsx");

  assert.match(content, /name="gaMeasurementId"/);
  assert.match(content, /label="Google Analytics \(GA4\)"/);
  assert.match(content, /defaultValue=\{c\.gaMeasurementId\}/);
  assert.match(content, /error=\{errors\.gaMeasurementId\}/);
  assert.match(content, /maxLength=\{5000\}/);
  assert.match(content, /full Google tag code/i);
});

test("passes only the published GA4 ID to the real public page", async () => {
  const [page, landing, preview] = await Promise.all([
    read("app/page.tsx"),
    read("app/components/Landing.tsx"),
    read("app/admin/preview/page.tsx"),
  ]);

  assert.match(page, /gaMeasurementId=\{content\.gaMeasurementId\}/);
  assert.match(landing, /gaMeasurementId\?: string/);
  assert.match(landing, /gaMeasurementId=\{preview \? undefined : gaMeasurementId\}/);
  assert.doesNotMatch(preview, /gaMeasurementId=/);
});

test("loads Google Analytics only after an explicit allow choice", async () => {
  const [globalFeatures, analytics, css] = await Promise.all([
    read("app/components/features/GlobalFeatures.tsx"),
    read("app/components/features/GoogleAnalyticsConsent.tsx"),
    read("app/globals.css"),
  ]);

  assert.match(globalFeatures, /import \{ GoogleAnalyticsConsent \}/);
  assert.match(globalFeatures, /gaMeasurementId \? \(/);
  assert.match(globalFeatures, /<GoogleAnalyticsConsent measurementId=\{gaMeasurementId\}/);
  assert.match(globalFeatures, /flags\.cookieConsent/);

  assert.match(analytics, /from "next\/script"/);
  assert.match(analytics, /hygge\.analytics-consent\.v1/);
  assert.match(analytics, /choice === "granted"/);
  assert.match(analytics, /setChoice\("granted"\)/);
  assert.match(analytics, /setChoice\("denied"\)/);
  assert.match(analytics, /Allow analytics/);
  assert.match(analytics, /No thanks/);
  assert.match(analytics, /googletagmanager\.com\/gtag\/js\?id=/);
  assert.match(analytics, /analytics_storage:\s*"granted"/);
  for (const denied of ["ad_storage", "ad_user_data", "ad_personalization"]) {
    assert.match(analytics, new RegExp(`${denied}:\\s*"denied"`));
  }
  assert.doesNotMatch(analytics, /G-J20QRKXCSB/);
  assert.match(css, /\.consent-actions/);
});
