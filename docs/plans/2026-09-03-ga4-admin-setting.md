# GA4 Admin Setting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a safe, publishable GA4 setting to the Hygge admin and consent-gated tracking to the public site.

**Architecture:** Extend `SiteContent` with a normalized GA4 measurement ID so the existing Content draft/publish workflow remains authoritative. Pass only the published ID to a client consent component on the real home page; never persist or execute pasted script text, and never track admin preview.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 7/SQLite, Zod 4, Node test runner, `next/script`.

### Task 1: Specify and implement safe GA4 input normalization

**Files:**
- Create: `tests/ga4-admin-setting.test.mjs`
- Create: `lib/analytics.ts`

**Step 1: Write the failing test**

Cover bare `G-...` input, extraction from the copied Google snippet, empty input, malformed values, and snippets containing more than one distinct measurement ID.

**Step 2: Run test to verify it fails**

Run: `PATH=/Users/emreisik/.nvm/versions/node/v22.22.2/bin:$PATH node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/ga4-admin-setting.test.mjs`

Expected: FAIL because `lib/analytics.ts` does not exist.

**Step 3: Write minimal implementation**

Export a bounded Zod schema that transforms valid input to one uppercase GA4 measurement ID and transforms blank input to an empty string. Do not retain arbitrary pasted markup.

**Step 4: Run test to verify it passes**

Run the focused command from Step 2. Expected: PASS.

### Task 2: Put GA4 into the Content draft/publish flow

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260903090000_add_ga4_measurement_id/migration.sql`
- Modify: `lib/db.ts`
- Modify: `lib/schemas/site.ts`
- Modify: `app/admin/actions.ts`
- Modify: `app/admin/content/page.tsx`
- Modify: `app/admin/audit/page.tsx`
- Test: `tests/ga4-admin-setting.test.mjs`

**Step 1: Write failing integration assertions**

Assert the new database column and migration exist, the draft type/overlay includes it, the action validates normalized input, and Content > SEO renders an accessible field that accepts the full snippet length.

**Step 2: Run focused test and verify expected failure**

Expected: FAIL on the missing schema, action, and UI wiring.

**Step 3: Implement the minimal persistence/UI path**

Add `gaMeasurementId` with an empty default, feed the normalized schema output into the draft scalar snapshot, render the field under SEO, and label its audit action through the existing site publish entry.

**Step 4: Generate Prisma client and run focused test**

Run: `PATH=/Users/emreisik/.nvm/versions/node/v22.22.2/bin:$PATH npx prisma generate`

Then run the focused test. Expected: PASS.

### Task 3: Load GA4 only after visitor consent

**Files:**
- Create: `app/components/features/GoogleAnalyticsConsent.tsx`
- Modify: `app/components/features/GlobalFeatures.tsx`
- Modify: `app/components/Landing.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `tests/ga4-admin-setting.test.mjs`

**Step 1: Write failing behavior assertions**

Assert that the public page passes the published ID, preview cannot pass it, the consent UI offers allow and reject, local storage defaults to no choice, and `gtag.js` renders only for a granted choice with all advertising consent denied.

**Step 2: Run focused test and verify expected failure**

Expected: FAIL because the component and public data flow are missing.

**Step 3: Implement the minimal client component**

Render no Google scripts before consent. On allow, persist `granted` and mount the initialization and external scripts in consent-command order; on reject, persist `denied` and keep Google unloaded. Keep the existing informational cookie notice for sites without GA4.

**Step 4: Run focused and full tests**

Expected: focused PASS, then 85 existing tests plus the new tests all PASS on Node 22.22.2.

### Task 4: Production-grade verification

**Files:**
- Verify all changed files

**Step 1: Run type/build checks**

Run: `PATH=/Users/emreisik/.nvm/versions/node/v22.22.2/bin:$PATH npm run build`

Expected: production build succeeds.

**Step 2: Run repository checks**

Run: `git diff --check && git status --short`

Expected: no whitespace errors and only intentional feature, test, migration, and plan files are changed.

**Step 3: Review the complete diff**

Confirm no supplied full script is stored or rendered, no tracking occurs in admin preview, and no measurement ID is hard-coded.
