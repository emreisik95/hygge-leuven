# Hygge Mobile Admin, Menu, Hours, and SEO Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a mobile-first English admin, a persistent inline seasonal-menu PDF, the approved weekly hours, correct production-domain SEO, and a verified temporary-password admin account.

**Architecture:** Keep the existing Next.js App Router, Prisma/SQLite, NextAuth, and Coolify deployment. Replace the empty structured menu experience with a single stable PDF document backed by persistent uploads and a bundled fallback, move the long content form to `/admin/content`, make `/admin` an operational overview, and keep opening hours as the shared source for public UI and JSON-LD. Normalize all production-facing URLs to `https://hyggeleuven.be` while preserving localhost behavior in development.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma 7 with SQLite, NextAuth 5, Node test runner, CSS, Coolify.

**Required runtime:** Run test/build commands with Node 22.22.2 by prefixing commands with `env PATH="/Users/emreisik/.nvm/versions/node/v22.22.2/bin:/usr/local/bin:/usr/bin:/bin"`. Node 22.15 cannot load this repository's directly imported `.ts` test subjects.

---

### Task 1: Lock the canonical production origin and SEO contract

**Files:**
- Create: `lib/public-origin.ts`
- Create: `tests/production-origin.test.mjs`
- Modify: `lib/site.ts`
- Modify: `app/sitemap.ts`
- Modify: `app/robots.ts`

**Step 1: Write the failing origin test**

Test a pure resolver with these assertions:

```js
assert.equal(resolvePublicOrigin({ nodeEnv: "production" }), "https://hyggeleuven.be");
assert.equal(
  resolvePublicOrigin({ nodeEnv: "production", override: "https://hyggeleuven.be/" }),
  "https://hyggeleuven.be",
);
assert.equal(
  resolvePublicOrigin({ nodeEnv: "development", host: "localhost:3000" }),
  "http://localhost:3000",
);
```

Also assert that sitemap and robots both obtain their base through `getOrigin()` and that sitemap contains only the canonical public page.

**Step 2: Run the focused test and verify RED**

Run:

```bash
env PATH="/Users/emreisik/.nvm/versions/node/v22.22.2/bin:/usr/local/bin:/usr/bin:/bin" node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/production-origin.test.mjs
```

Expected: FAIL because `lib/public-origin.ts` does not exist.

**Step 3: Implement the pure resolver and wire it into `getOrigin()`**

Use:

```ts
export const CANONICAL_ORIGIN = "https://hyggeleuven.be";

export function resolvePublicOrigin(input: {
  nodeEnv?: string;
  override?: string;
  forwardedHost?: string | null;
  host?: string | null;
  forwardedProto?: string | null;
}): string {
  const override = input.override?.trim().replace(/\/+$/, "");
  if (override) return override;
  if (input.nodeEnv === "production") return CANONICAL_ORIGIN;
  const host = input.forwardedHost ?? input.host ?? "localhost:3000";
  const proto = input.forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
```

Keep metadata, sitemap, robots, and JSON-LD on this single source of truth.

**Step 4: Run focused and full tests**

Expected: focused PASS, then 27+ total tests PASS.

**Step 5: Commit**

```bash
git add lib/public-origin.ts lib/site.ts app/sitemap.ts app/robots.ts tests/production-origin.test.mjs
git commit -m "fix: canonicalize Hygge production URLs"
```

---

### Task 2: Add a safe, persistent menu-document primitive

**Files:**
- Create: `lib/menu-document.ts`
- Create: `tests/menu-document.test.mjs`
- Create: `app/menu.pdf/route.ts`
- Create: `public/menu/hygge-seasonal-menu.pdf`

**Step 1: Write failing validation tests**

Cover:

- `%PDF-` bytes with `application/pdf` are accepted.
- A spoofed MIME with non-PDF bytes is rejected.
- A valid signature with the wrong declared MIME is rejected.
- Empty and greater-than-10-MB files are rejected.
- the public route declares inline PDF headers and a stable filename.

Use the wished-for API:

```js
const validated = await readValidatedPdf(
  new File([Buffer.from("%PDF-1.4\n")], "menu.pdf", { type: "application/pdf" }),
);
assert.equal(validated.mime, "application/pdf");
```

**Step 2: Run the focused test and verify RED**

Expected: FAIL because `readValidatedPdf` is missing.

**Step 3: Implement minimal validation and atomic persistence**

`lib/menu-document.ts` must export:

```ts
export const MENU_FILENAME = "hygge-seasonal-menu.pdf";
export const MENU_PUBLIC_URL = "/menu.pdf";
export const MAX_MENU_BYTES = 10 * 1024 * 1024;
export async function readValidatedPdf(file: File): Promise<{ buffer: Buffer; mime: "application/pdf" }>;
export async function persistMenuPdf(buffer: Buffer): Promise<void>;
export async function readCurrentMenuPdf(): Promise<Buffer>;
```

Persistent storage is `${UPLOAD_DIR}/menu/${MENU_FILENAME}`. Write a temporary sibling and atomically rename it only after validation. `readCurrentMenuPdf` falls back to `public/menu/${MENU_FILENAME}`. The route returns `Content-Type: application/pdf`, `Content-Disposition: inline`, cache validators, and `X-Content-Type-Options: nosniff`.

Copy the supplied source PDF unchanged into `public/menu/hygge-seasonal-menu.pdf`.

**Step 4: Run focused and full tests**

Expected: all PASS.

**Step 5: Commit**

```bash
git add lib/menu-document.ts app/menu.pdf/route.ts public/menu/hygge-seasonal-menu.pdf tests/menu-document.test.mjs
git commit -m "feat: serve a validated seasonal menu PDF"
```

---

### Task 3: Publish the inline menu section and visible weekly hours

**Files:**
- Create: `app/components/MenuDocumentSection.tsx`
- Create: `app/components/WeeklyHours.tsx`
- Create: `tests/public-menu-hours.test.mjs`
- Modify: `app/components/Landing.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `lib/cafe-jsonld.ts`

**Step 1: Write failing public-surface tests**

Assert the rendered source contains:

- a permanent `#menu` section even when structured menu rows are empty;
- an `<object type="application/pdf" data="/menu.pdf">` or equivalent inline embed;
- `Open full menu` and `Download PDF` links;
- a normal HTML heading and descriptive paragraph;
- a weekly-hours list in the Location card;
- `hasMenu: https://hyggeleuven.be/#menu` in JSON-LD;
- responsive PDF CSS with a mobile-safe aspect ratio and fallback controls.

**Step 2: Run and verify RED**

Expected: FAIL because the PDF section and weekly schedule do not exist.

**Step 3: Implement the public components**

`MenuDocumentSection` is server-rendered and receives existing translated labels where applicable. Embed `/menu.pdf`, keep the fallback links in normal DOM, and retain `id="menu"` for navigation and structured data.

`WeeklyHours` renders Monday-Friday, Saturday, and Sunday when ranges match; otherwise it renders individual days. Reuse `formatRowRange` and locale-aware day formatting.

Replace the structured-menu-only visibility condition with the always-available bundled PDF document. Structured rows may remain available to internal code but are not rendered in the primary public menu section.

**Step 4: Run focused and full tests**

Expected: all PASS.

**Step 5: Commit**

```bash
git add app/components/MenuDocumentSection.tsx app/components/WeeklyHours.tsx app/components/Landing.tsx app/page.tsx app/globals.css lib/cafe-jsonld.ts tests/public-menu-hours.test.mjs
git commit -m "feat: publish menu PDF and weekly hours"
```

---

### Task 4: Seed the approved opening hours idempotently

**Files:**
- Create: `prisma/migrations/20260828090000_set_opening_hours/migration.sql`
- Create: `tests/opening-hours-migration.test.mjs`

**Step 1: Write the failing migration test**

Load the migration text into a temporary SQLite database twice. Assert exactly seven rows and these values:

```text
1..5  08:30  19:00
6     09:00  19:00
0     10:00  17:00
```

**Step 2: Run and verify RED**

Expected: FAIL because the migration is missing.

**Step 3: Implement an idempotent SQL upsert**

Use SQLite `INSERT ... ON CONFLICT("dayOfWeek") DO UPDATE` for all seven rows. Do not modify unrelated content.

**Step 4: Run focused and full tests**

Expected: all PASS and applying the SQL twice leaves seven rows.

**Step 5: Commit**

```bash
git add prisma/migrations/20260828090000_set_opening_hours/migration.sql tests/opening-hours-migration.test.mjs
git commit -m "feat: publish approved opening hours"
```

---

### Task 5: Rebuild admin navigation and create the operational overview

**Files:**
- Create: `app/admin/content/page.tsx`
- Create: `app/admin/more/page.tsx`
- Create: `app/admin/components/AdminStatusRail.tsx`
- Create: `tests/admin-information-architecture.test.mjs`
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/layout.tsx`
- Modify: `app/admin/components/admin-nav.tsx`
- Modify: `app/admin/actions.ts`

**Step 1: Write failing information-architecture tests**

Assert:

- five primary destinations are Overview, Content, Menu, Hours, More;
- `/admin` contains live/draft, opening-status, menu-document, and quick-action cards;
- the content editor lives at `/admin/content`;
- secondary links are grouped on `/admin/more`;
- save/publish redirects return to `/admin/content`;
- `View site` uses `/`, never the old hostname.

**Step 2: Run and verify RED**

Expected: FAIL against the current ten-link nav and long `/admin` form.

**Step 3: Implement minimal route and data restructuring**

Move the existing content editor JSX to `/admin/content`. Make `/admin` query existing helpers for draft state, current hours/open state, menu availability, and Instagram freshness. Build plain server-rendered overview cards and quick links. Keep all current server-side authorization.

`AdminStatusRail` displays Live/Draft, current opening state, and last published time without relying on color alone.

**Step 4: Run focused and full tests**

Expected: all PASS.

**Step 5: Commit**

```bash
git add app/admin/page.tsx app/admin/content/page.tsx app/admin/more/page.tsx app/admin/layout.tsx app/admin/components/admin-nav.tsx app/admin/components/AdminStatusRail.tsx app/admin/actions.ts tests/admin-information-architecture.test.mjs
git commit -m "feat: reorganize admin around daily tasks"
```

---

### Task 6: Replace the admin menu editor with PDF management

**Files:**
- Create: `tests/admin-menu-document.test.mjs`
- Modify: `app/admin/menu/page.tsx`
- Modify: `app/admin/menu/actions.ts`
- Modify: `app/admin/ui/SubmitButton.tsx` only if needed for file-upload pending copy

**Step 1: Write failing admin-menu tests**

Assert the page contains current PDF preview, `Replace menu PDF`, `Open live menu`, and download actions; it must not offer category seeding. Assert the action calls `requireAdmin`, validates through `readValidatedPdf`, persists atomically, audits `menu.document.replace`, revalidates `/` and `/admin/menu`, and returns a useful error state.

**Step 2: Run and verify RED**

Expected: FAIL because the existing category editor is still rendered.

**Step 3: Implement PDF management**

Use a multipart form accepting `.pdf,application/pdf`. Do not remove the current file before the replacement commits. Render the same live `/menu.pdf` inside the admin preview.

**Step 4: Run focused and full tests**

Expected: all PASS.

**Step 5: Commit**

```bash
git add app/admin/menu/page.tsx app/admin/menu/actions.ts app/admin/ui/SubmitButton.tsx tests/admin-menu-document.test.mjs
git commit -m "feat: manage the live menu PDF in admin"
```

---

### Task 7: Build the grouped mobile hours editor

**Files:**
- Create: `app/admin/components/GroupedHoursEditor.tsx`
- Create: `tests/admin-hours-editor.test.mjs`
- Modify: `app/admin/hours/page.tsx`

**Step 1: Write failing editor tests**

Assert the initial grouped controls are Monday-Friday, Saturday, and Sunday; all seven existing form field names remain submitted; and an `Edit days individually` control exposes per-day exceptions without losing values.

**Step 2: Run and verify RED**

Expected: FAIL because seven independent rows are rendered immediately.

**Step 3: Implement the grouped editor**

Use a client component that derives group equality from existing rows. Group changes update hidden/per-day inputs consumed by the existing atomic `updateHours` action. Preserve overnight support and closed-day semantics.

**Step 4: Run focused and full tests**

Expected: all PASS.

**Step 5: Commit**

```bash
git add app/admin/components/GroupedHoursEditor.tsx app/admin/hours/page.tsx tests/admin-hours-editor.test.mjs
git commit -m "feat: simplify mobile hours editing"
```

---

### Task 8: Apply the approved daylight admin design system

**Files:**
- Create: `tests/admin-mobile-design.test.mjs`
- Modify: `app/admin/admin.css`
- Modify: `app/admin/login/page.tsx`
- Modify: `app/admin/ui/fields.tsx` only if semantic hooks are required

**Step 1: Write failing CSS and accessibility contract tests**

Assert the approved six tokens, 48-pixel controls, 16-pixel mobile inputs, fixed bottom navigation under 960 pixels, desktop left rail at 960 pixels, visible focus styles, reduced-motion handling, and absence of horizontal-scroll navigation.

**Step 2: Run and verify RED**

Expected: FAIL against the dark theme and horizontally clipped nav.

**Step 3: Implement the design system**

Rework the scoped `.admin-shell` tokens and layout. Mobile uses a top bar, content padding that clears the fixed bottom navigation, a five-item bottom bar, daylight cards, and the ticket-rail status strip. Desktop uses the same component hierarchy with a left rail. Retain domain-specific classes for photos, translations, features, users, audit, and login.

**Step 4: Run focused and full tests**

Expected: all PASS.

**Step 5: Commit**

```bash
git add app/admin/admin.css app/admin/login/page.tsx app/admin/ui/fields.tsx tests/admin-mobile-design.test.mjs
git commit -m "style: rebuild admin for mobile operations"
```

---

### Task 9: Local integration, build, and visual QA

**Files:**
- Modify only files implicated by failing tests or visual defects, always with a failing regression test first.

**Step 1: Run the complete automated suite**

```bash
env PATH="/Users/emreisik/.nvm/versions/node/v22.22.2/bin:/usr/local/bin:/usr/bin:/bin" npm test
```

Expected: zero failures and no warnings from application tests.

**Step 2: Run production build**

```bash
env PATH="/Users/emreisik/.nvm/versions/node/v22.22.2/bin:/usr/local/bin:/usr/bin:/bin" npm run build
```

Expected: successful Next.js build with `/sitemap.xml`, `/robots.txt`, `/menu.pdf`, public page, and admin routes.

**Step 3: Launch local production-equivalent app**

Create a temporary SQLite database, run Prisma migrations, and start on an unused local port. Do not reuse production data.

**Step 4: Visual review**

Use Chrome at 390 x 844 and desktop width. Capture and inspect Overview, Content, Menu, Hours, More, and the public menu/location sections. Verify no horizontal overflow, obscured bottom content, low-contrast labels, or inaccessible fallback controls.

**Step 5: Run targeted accessibility checks**

Verify keyboard focus order, bottom-nav current-page semantics, form labels, PDF fallback links, reduced motion, and zoom-safe input sizes.

**Step 6: Commit any regression-tested corrections**

```bash
git add <only-corrected-files>
git commit -m "fix: resolve responsive QA findings"
```

---

### Task 10: Integrate, deploy, mutate production data, and prove live state

**Files:**
- No new product files unless production verification exposes a regression; any correction starts with a failing test.

**Step 1: Review branch state and diff**

Run full tests/build again, inspect `git status`, and review the complete diff against `main`.

**Step 2: Integrate the feature branch**

Use `superpowers:finishing-a-development-branch`. Merge only the intended branch commits into `main`, then push `main` to `origin`.

**Step 3: Correct Coolify production-origin environment**

Set the site/auth public URL variables to `https://hyggeleuven.be` without exposing secret values. Keep the existing application UUID and persistent `/data` volume.

**Step 4: Deploy and wait for completion**

Trigger the Hygge Coolify resource and wait for the deployment status to finish successfully.

**Step 5: Verify public production**

Check:

- `/` returns 200 and canonical metadata references only `hyggeleuven.be`;
- `/admin` remains on `hyggeleuven.be` through authentication;
- `/menu.pdf` returns a PDF with inline/nosniff headers;
- `#menu` contains the inline viewer and fallbacks;
- visible hours exactly match the approved schedule;
- `/sitemap.xml`, `/robots.txt`, and JSON-LD use the canonical domain and correct hours;
- `www` continues to redirect to the apex.

**Step 6: Prepare the temporary admin credential**

Generate a strong random password without printing it to tool output. Navigate the authenticated Admins screen and fill exactly `batuhanbacak92@gmail.com` plus that password.

Immediately before typing or submitting this sensitive account data in Chrome, request action-time confirmation naming the destination and data. After confirmation, submit once.

**Step 7: Verify the admin record**

Verify the normalized email appears exactly once and the stored hash matches the generated temporary password. Confirm an audit event was written. Do not disturb the bootstrap admin.

**Step 8: Final live evidence**

Re-run focused HTTP and Chrome checks after account creation. Report the deployed commit, live URLs, exact hours, account status, and the temporary password once to the owner.

