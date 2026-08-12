# Hygge About & Contact Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish the supplied café story and expose the site's existing email contact affordance once a verified public address is configured.

**Architecture:** Keep `AboutStory` as a static Server Component, place it immediately before the Instagram/photo pane, and replace its baked-in placeholder content with the approved copy. Use a Prisma migration to enable the existing feature flag in deployed databases. Preserve the existing `SiteContent.contactEmail` data path and `mailto:` rendering rather than adding a delivery backend.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components, TypeScript, global CSS, Prisma/SQLite, Node test runner.

### Task 1: Lock the approved content and visibility policy with failing tests

**Files:**
- Create: `tests/about-contact.test.mjs`
- Test: `tests/about-contact.test.mjs`

**Step 1: Write the failing test**

Read `app/components/features/AboutStory.tsx`, `lib/feature-labels.ts`, the new migration, and `app/components/Landing.tsx`. Assert the exact owner-provided copy, exact heading, an upsert that enables `aboutStory`, and a guarded `mailto:${c.contactEmail}` link.

**Step 2: Run test to verify it fails**

Run: `node --test tests/about-contact.test.mjs`
Expected: FAIL because the approved copy, heading, and migration are absent.

### Task 2: Replace the placeholder story and enable it

**Files:**
- Modify: `app/components/features/AboutStory.tsx`
- Modify: `lib/feature-labels.ts`
- Modify: `scripts/qa-flag-policy.mjs`
- Modify: `tests/qa-flags.test.mjs`
- Create: `prisma/migrations/20260812090000_publish_about_story/migration.sql`

**Step 1: Implement the minimal content change**

Replace `STORY_PARAGRAPHS`, set `aboutStoryHeading` to `A little about us`, remove `aboutStory` from the owner-retired QA list, and upsert the feature flag to `true` in the migration.

**Step 2: Run targeted tests**

Run: `node --test tests/about-contact.test.mjs tests/qa-flags.test.mjs`
Expected: PASS.

### Task 3: Adapt the story layout to the longer approved copy

**Files:**
- Modify: `app/globals.css`
- Test: `tests/about-contact.test.mjs`

**Step 1: Add a failing layout assertion**

Assert the about pane is top-safe on small screens, the prose width stays readable, and the desktop illustration aligns to the start of the long story.

**Step 2: Run the test to verify RED**

Run: `node --test tests/about-contact.test.mjs`
Expected: FAIL on the missing layout declarations.

**Step 3: Implement the responsive layout**

Update only the `.pane-about` / `.about-*` rules, deriving colour and type from existing tokens. Keep the hand-drawn illustration and ensure the pane can grow naturally beyond one viewport.

**Step 4: Run the test to verify GREEN**

Run: `node --test tests/about-contact.test.mjs`
Expected: PASS.

### Task 4: Configure the public email address

**Files:**
- Modify: deployment data (`Translation.namespace = site.contactEmail`) after the owner confirms the public address.

**Step 1: Confirm the recipient**

Do not infer it from `ADMIN_EMAIL`; the admin address is private configuration, not public content.

**Step 2: Populate and verify**

Publish the confirmed value through the existing content path. Verify the homepage HTML contains exactly one visible contact `mailto:` link with that address.

### Task 5: Verify and deploy

**Files:**
- Verify all changed files.

**Step 1: Run targeted tests**

Run: `node --test tests/about-contact.test.mjs tests/qa-flags.test.mjs`
Expected: PASS.

**Step 2: Run the production build**

Run: `npm run build`
Expected: exit 0.

**Step 3: Visual QA**

Run the built app with a copy of the production-like database. Capture mobile and desktop screenshots and inspect the story, contact card, focus states, and overflow.

**Step 4: Commit and push**

Commit the intentional diff and push it to `origin/main` after integration.

**Step 5: Deploy and verify**

Trigger the Hygge application by its Coolify resource UUID. Wait for deployment status `finished`, then fetch `https://hygge.emre.zip` and verify the approved heading/copy and configured `mailto:` address in the live HTML.
