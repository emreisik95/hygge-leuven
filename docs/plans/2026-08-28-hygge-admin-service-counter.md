# Hygge Admin Service Counter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild every authenticated admin route as one coherent, mobile-first Hygge Service Counter and publish it to the live custom domain.

**Architecture:** Preserve the five-destination admin information architecture and every existing server action. Add a small shared presentational layer for ticket-style page intros, local section navigation, tool cards, status rows, empty states, and responsive action docks; migrate each route onto it in grouped commits. Extend the existing generated object-icon language with one GPT Image 2 master sheet and derived optimized route icons.

**Tech Stack:** Next.js 16 App Router, React 19 server/client components, TypeScript, scoped CSS, Node test runner, Prisma/SQLite, GPT Image 2 local skill script, Coolify.

---

### Task 1: Lock the route-level design contract in tests

**Files:**
- Create: `tests/admin-service-counter.test.mjs`
- Modify: `tests/admin-information-architecture.test.mjs`
- Modify: `tests/admin-mobile-design.test.mjs`

**Step 1: Write the failing shared-primitive test**

Add a test that reads the admin route sources and requires every authenticated route except login to render `AdminPageIntro`. Require the new shared component file to export `AdminPageIntro`, `AdminToolCard`, `AdminStatusList`, `AdminSectionNav`, `AdminActionDock`, and `AdminEmptyState`.

**Step 2: Write the failing icon-inventory test**

Require transparent web icons for `photos`, `instagram`, `translations`, `features`, `admins`, `audit`, and `preview`, each under 60 KB, and require More route source to reference each destination.

**Step 3: Write the failing workflow tests**

Assert that:

- Photos has no nested `<main>` and uses role navigation.
- Instagram uses semantic status rows and `details` for technical setup.
- Audit uses an event list/cards rather than a table.
- Preview renders a review frame and published-state notice.
- Avoidable route-level inline styles are removed from Instagram, Photos, Audit, Translations, and Features pages.

**Step 4: Run the focused tests and confirm red state**

Run:

```bash
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/admin-service-counter.test.mjs tests/admin-information-architecture.test.mjs tests/admin-mobile-design.test.mjs
```

Expected: FAIL because shared primitives and expanded icons do not exist.

**Step 5: Commit the red tests**

```bash
git add tests/admin-service-counter.test.mjs tests/admin-information-architecture.test.mjs tests/admin-mobile-design.test.mjs
git commit -m "test: define full admin service counter contract"
```

### Task 2: Build the shared service-counter primitives

**Files:**
- Create: `app/admin/components/AdminPageIntro.tsx`
- Create: `app/admin/components/AdminToolCard.tsx`
- Create: `app/admin/components/AdminStatusList.tsx`
- Create: `app/admin/components/AdminSectionNav.tsx`
- Create: `app/admin/components/AdminActionDock.tsx`
- Create: `app/admin/components/AdminEmptyState.tsx`
- Modify: `app/admin/admin.css`

**Step 1: Implement `AdminPageIntro`**

Accept `ticket`, `title`, `description`, `icon`, optional `breadcrumb`, optional `status`, and optional action content. Render one semantic header, a link back to More for secondary routes, and an icon image with empty alt text because the adjacent title names the destination.

**Step 2: Implement the task primitives**

- `AdminToolCard`: link, icon, title, description, optional meta/state.
- `AdminStatusList`: semantic list of label/value/tone rows.
- `AdminSectionNav`: labelled anchor list.
- `AdminActionDock`: semantic wrapper for page actions.
- `AdminEmptyState`: heading, explanation, optional action.

**Step 3: Add the base CSS**

Style the service-ticket perforation, object badge, tool card, state dots, section chips/index, action dock, and empty state using existing tokens. Ensure 44 px minimum interactive size, visible focus, 390 px overflow safety, and reduced motion.

**Step 4: Run the focused primitive tests**

Run the Task 1 command. Expected: icon and route migration assertions still fail, shared primitive assertions pass.

**Step 5: Commit**

```bash
git add app/admin/components app/admin/admin.css
git commit -m "feat: add admin service counter primitives"
```

### Task 3: Generate and install the expanded icon family

**Files:**
- Create: `design-assets/hygge-admin-service-counter.png`
- Create: `public/admin/icons/photos.png`
- Create: `public/admin/icons/instagram.png`
- Create: `public/admin/icons/translations.png`
- Create: `public/admin/icons/features.png`
- Create: `public/admin/icons/admins.png`
- Create: `public/admin/icons/audit.png`
- Create: `public/admin/icons/preview.png`
- Modify: `app/admin/admin.css`

**Step 1: Invoke the exact user-named image skill**

From `/Users/emreisik/.agents/skills/gpt-image-2`, run `scripts/gen.sh` with the user’s raw prompt unchanged, the existing `design-assets/hygge-admin-icon-set.png` as the reference image, and the new absolute master output path. Do not substitute another generator.

**Step 2: Inspect the generated master**

Use the image viewer to verify the image is usable, visually coherent with the existing five icons, has no malformed text, and contains enough distinctive visual vocabulary for the expanded tool set. If generation fails, fix only script/runtime invocation issues and rerun with the same raw prompt.

**Step 3: Derive web icons**

Use deterministic image tooling only for cropping, background removal where needed, transparent padding, and PNG optimization. Do not redraw or synthesize with a different image generator. Keep each icon legible at 32 px and below 60 KB where practical.

**Step 4: Wire the icon classes**

Add stable CSS classes/data attributes for all secondary route icons.

**Step 5: Run the icon test**

Run:

```bash
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/admin-service-counter.test.mjs tests/admin-mobile-design.test.mjs
```

Expected: icon inventory assertions PASS.

**Step 6: Commit**

```bash
git add design-assets/hygge-admin-service-counter.png public/admin/icons app/admin/admin.css
git commit -m "feat: add illustrated admin tool icons"
```

### Task 4: Migrate the primary daily-operation routes

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/content/page.tsx`
- Modify: `app/admin/menu/page.tsx`
- Modify: `app/admin/hours/page.tsx`
- Modify: `app/admin/admin.css`

**Step 1: Add page intros**

Add the shared service-ticket intro to Overview, Content, Menu, and Hours with route-appropriate ticket numbers, copy, and icons.

**Step 2: Add Content local navigation and action dock**

Give existing sections stable IDs and add `AdminSectionNav`. Wrap draft/publish/discard controls in `AdminActionDock` without changing form actions, field names, validation, or redirect behavior.

**Step 3: Refine Menu and Hours task surfaces**

Keep the current direct menu image/PDF workflow and `GroupedHoursEditor`. Improve hierarchy through classes and shared empty/status treatment only.

**Step 4: Run focused regression tests**

Run:

```bash
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/admin-information-architecture.test.mjs tests/admin-menu-document.test.mjs tests/admin-hours-editor.test.mjs tests/admin-mobile-design.test.mjs
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/admin/page.tsx app/admin/content/page.tsx app/admin/menu/page.tsx app/admin/hours/page.tsx app/admin/admin.css
git commit -m "feat: unify primary admin workspaces"
```

### Task 5: Rebuild More, Photos, and Instagram

**Files:**
- Modify: `app/admin/more/page.tsx`
- Modify: `app/admin/photos/page.tsx`
- Modify: `app/admin/instagram/page.tsx`
- Modify: `app/admin/admin.css`

**Step 1: Build the More tool shelf**

Use `AdminToolCard` to group Publish, Operations, and Review destinations. Reference every expanded icon and add only cheap server-derived state that does not change query behavior materially.

**Step 2: Reshape Photos**

Remove the nested `main`, add page intro and role anchors, compact photo and upload cards, and use `AdminEmptyState` for empty groups. Preserve all action forms, undo handling, drag reorder behavior, alt requirements, file limits, and disabled menu-item rows.

**Step 3: Reshape Instagram**

Use `AdminStatusList` for environment, cron, account, token, and cache states. Keep connect/refresh/disconnect actions intact. Put cron command and manual setup steps into separate `details` disclosures and remove route-level inline styles.

**Step 4: Run focused tests**

Run:

```bash
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/admin-service-counter.test.mjs tests/admin-information-architecture.test.mjs
```

Expected: More, Photos, and Instagram assertions PASS.

**Step 5: Commit**

```bash
git add app/admin/more/page.tsx app/admin/photos/page.tsx app/admin/instagram/page.tsx app/admin/admin.css
git commit -m "feat: rebuild admin publishing tools"
```

### Task 6: Rebuild Translations, Features, and Admins

**Files:**
- Modify: `app/admin/translations/page.tsx`
- Modify: `app/admin/features/page.tsx`
- Modify: `app/admin/features/FeatureSettingsEditor.tsx`
- Modify: `app/admin/users/page.tsx`
- Modify: `app/admin/admin.css`

**Step 1: Reshape Translations**

Add page intro, language legend, group section navigation, stable group IDs, and responsive save treatment. Retain live English defaults, all EN/NL/FR textarea names, and per-group save actions.

**Step 2: Reshape Features**

Add page intro with enabled count, category/local navigation, clear visibility/preview/content grouping, and compact collapsible copy editors. Preserve all 49 flags, existing form actions, and `FeaturePreview` rendering behavior.

**Step 3: Reshape Admins**

Add page intro, a compact semantic member list, and a visually separate add-admin task. Do not change `requireAdmin()` guards or add/remove payloads.

**Step 4: Run focused tests**

Run:

```bash
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/admin-service-counter.test.mjs tests/admin-translations.test.mjs tests/admin-users-security.test.mjs
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/admin/translations/page.tsx app/admin/features/page.tsx app/admin/features/FeatureSettingsEditor.tsx app/admin/users/page.tsx app/admin/admin.css
git commit -m "feat: rebuild admin content tools"
```

### Task 7: Rebuild Audit and Preview

**Files:**
- Modify: `app/admin/audit/page.tsx`
- Modify: `app/admin/preview/page.tsx`
- Create: `app/admin/components/AdminPreviewFrame.tsx`
- Modify: `app/admin/admin.css`

**Step 1: Convert Audit to event cards**

Keep the 200-entry query, actor/entity filters, relative time, raw diff formatter, and newest-first ordering. Replace the table with an ordered semantic event list. Put diff JSON in an expandable `details` block and make filters a compact class-based toolbar.

**Step 2: Frame Preview**

Add the shared page intro, published-state notice, viewport labels, refresh/open-live actions, and an `AdminPreviewFrame` client wrapper around the existing `Landing` preview. Do not create a second public rendering path.

**Step 3: Run focused tests**

Run:

```bash
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/admin-service-counter.test.mjs tests/admin-information-architecture.test.mjs tests/public-menu-hours.test.mjs
```

Expected: PASS.

**Step 4: Commit**

```bash
git add app/admin/audit/page.tsx app/admin/preview/page.tsx app/admin/components/AdminPreviewFrame.tsx app/admin/admin.css
git commit -m "feat: rebuild admin review tools"
```

### Task 8: Complete responsive and accessibility verification

**Files:**
- Modify: `app/admin/admin.css`
- Modify: `tests/admin-service-counter.test.mjs`
- Modify: `tests/admin-mobile-design.test.mjs`

**Step 1: Run the full test suite**

Run:

```bash
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/*.test.mjs
```

Expected: 63 existing tests plus the new service-counter tests PASS.

**Step 2: Run the production build**

Run `npm run build`. Expected: exit 0 with all admin routes compiled.

**Step 3: Run local route-by-route visual QA**

Start the production build locally. Inspect every authenticated route at desktop and 390×844 mobile sizes. Check no horizontal overflow, fixed bottom nav, keyboard focus, sticky actions, empty states, audit diff expansion, Instagram setup disclosure, photo upload cards, feature collapsibles, and preview frame.

**Step 4: Fix only observed regressions and add tests**

For every observed defect, add or tighten a failing structural test before the minimal CSS/markup fix, then rerun focused tests.

**Step 5: Commit polish**

```bash
git add app/admin tests/admin-service-counter.test.mjs tests/admin-mobile-design.test.mjs
git commit -m "fix: complete responsive admin polish"
```

### Task 9: Review, integrate, deploy, and prove live behavior

**Files:**
- Review all changed files from `76f69ae` to branch HEAD.

**Step 1: Invoke required review skills**

Use `superpowers:requesting-code-review`, address validated findings with test-first fixes, then use `superpowers:verification-before-completion`.

**Step 2: Verify branch evidence**

Run full tests, build, `git diff --check`, and confirm `git status` is clean. Record branch HEAD.

**Step 3: Integrate with main**

Use `superpowers:finishing-a-development-branch`. Merge the reviewed branch into local `main` without discarding unrelated work, rerun full tests/build on merged main, and push intended commits to `origin/main`.

**Step 4: Deploy through Coolify**

Trigger the existing application deployment. Poll until it reaches a terminal successful state and confirm the deployed source commit matches pushed `origin/main`.

**Step 5: Verify production route by route**

In authenticated Chrome state, freshly load every admin route on `https://hyggeleuven.be/admin`. Verify desktop and 390 px mobile layouts, generated icons, route hierarchy, missing Instagram setup truth, editable translations, audit cards, preview frame, and live site/menu links. Also verify public home/menu remains healthy.

**Step 6: Close the goal**

Only after fresh production evidence for every requirement, mark the explicit goal complete and report the generated master asset, tests/build, deployed commit, and live URL.
