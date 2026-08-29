# Editable About Us Content Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development to implement this plan task-by-task.

**Goal:** Make the public About Us heading and four paragraphs editable from Admin → Content through the existing draft, preview, and publish workflow.

**Architecture:** Register five additional `site.*` text namespaces and approved defaults in `lib/db.ts`. Render matching fields in the Content form, pass the resolved values through `Landing`, and make `AboutStory` render the supplied content while omitting blank paragraphs.

**Tech Stack:** Next.js App Router, React server components, Prisma SQLite translations, Node test runner.

### Task 1: Lock the admin and public contract with failing tests

**Files:**
- Modify: `tests/about-contact.test.mjs`
- Modify: `tests/admin-service-counter.test.mjs`

**Step 1: Write the failing tests**

Assert that Content navigation includes `#about-us`, the form renders `aboutStoryHeading` and `aboutStoryParagraph1` through `aboutStoryParagraph4`, `lib/db.ts` registers their namespaces/defaults, `Landing` passes the resolved fields, and `AboutStory` accepts paragraphs instead of a module constant.

**Step 2: Run the focused tests**

Run: `node --test tests/about-contact.test.mjs tests/admin-service-counter.test.mjs`

Expected: FAIL because the admin fields and data-driven public props do not exist.

### Task 2: Register editable text and add Content controls

**Files:**
- Modify: `lib/db.ts`
- Modify: `app/admin/content/page.tsx`

**Step 1: Implement the minimal data contract**

Add five `TEXT_NAMESPACES` entries and copy the current approved heading/paragraphs into `SITE_TEXT_DEFAULTS`.

**Step 2: Implement the minimal Content UI**

Add the `About us` section-nav item and a section with one `Field` plus four `TextareaField` controls bound to the draft-overlaid content object.

**Step 3: Run the focused tests**

Run: `node --test tests/about-contact.test.mjs tests/admin-service-counter.test.mjs`

Expected: Public-prop assertions still fail; admin/default assertions pass.

### Task 3: Drive the public About section from stored content

**Files:**
- Modify: `app/components/Landing.tsx`
- Modify: `app/components/features/AboutStory.tsx`

**Step 1: Pass the resolved content**

Build the four-paragraph array from the `SiteContent` fields at the existing `AboutStory` call site.

**Step 2: Render safe paragraph output**

Accept `paragraphs: string[]`, trim/filter blank entries, preserve order, and return `null` when none remain.

**Step 3: Run focused tests**

Run: `node --test tests/about-contact.test.mjs tests/admin-service-counter.test.mjs`

Expected: PASS.

### Task 4: Verify and integrate

**Files:**
- Verify: all changed source and tests

**Step 1: Run full verification**

Run: `NODE_OPTIONS=--experimental-strip-types npm test && npm run build && git diff --check`

Expected: all tests pass, build exits 0, no whitespace errors.

**Step 2: Browser QA**

At mobile width, verify Admin → Content exposes five usable fields and Preview renders their values without overflow. Confirm the public live page remains unchanged until publish.

**Step 3: Commit**

Commit only the design, plan, source, and regression-test files with a focused feature message.
