# Contact Us Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated, responsive Contact Us section before the map and publish `contact@hyggeleuven.be` through the existing site-content path.

**Architecture:** A focused server component renders independently optional email and Instagram channels. `Landing` places it immediately before the map, existing navigation surfaces gain the `contact` anchor, and an idempotent Prisma migration publishes the verified address without exposing or reusing `ADMIN_EMAIL`.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components, TypeScript, global CSS, Prisma 7 with SQLite, Node test runner, Coolify.

## Global Constraints

- The section id is exactly `contact` and its visible heading is exactly `Contact us`.
- The intro is exactly `Questions, collaborations, or just want to say hello? Drop us a line — we’d love to hear from you.`
- The public recipient is exactly `contact@hyggeleuven.be`.
- The primary label is `Email us`; the secondary label is `Instagram`.
- Page order is `menu`, `contact`, `map` wherever those sections are present.
- The section must remain server-rendered and require no client JavaScript.
- Email and Instagram remain independently optional; render nothing only when both channels are absent.
- Do not add a contact form, mail-delivery service, CAPTCHA, message storage, or admin inbox.
- Do not read from, display, or repurpose `ADMIN_EMAIL`.
- Preserve visible keyboard focus, a minimum 44 CSS-pixel target, reduced-motion behavior, and 320 CSS-pixel layouts without horizontal overflow.

---

## File structure

- `app/components/features/ContactSection.tsx` — the complete server-rendered contact landmark and channel fallbacks.
- `app/components/Landing.tsx` — supplies existing site-content values and places Contact Us before the map.
- `lib/feature-labels.ts` — owns the approved visible contact copy and navigation labels.
- `app/components/features/SectionNavDots.tsx` — adds `contact` to the fixed page navigation order.
- `app/components/features/CommandPalette.tsx` — adds `contact` to keyboard navigation order.
- `app/globals.css` — owns the responsive editorial layout for `.pane-contact` and `.contact-*` only.
- `prisma/migrations/20260812120000_publish_contact_email/migration.sql` — publishes the verified public address in `site.contactEmail` for `EN`.
- `tests/contact-section.test.mjs` — source-contract and migration tests for content, ordering, channel guards, and responsive rules.

---

### Task 1: Publish the verified public email

**Files:**
- Create: `tests/contact-section.test.mjs`
- Create: `prisma/migrations/20260812120000_publish_contact_email/migration.sql`

**Interfaces:**
- Consumes: Prisma `Translation(namespace, locale, value, updatedAt)` with unique key `(namespace, locale)`.
- Produces: the `EN` value for `site.contactEmail`, consumed by `getSiteContent()` as `content.contactEmail` in every locale through the existing English fallback.

- [ ] **Step 1: Write the failing migration contract test**

Create `tests/contact-section.test.mjs` with:

```js
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const MIGRATION =
  "prisma/migrations/20260812120000_publish_contact_email/migration.sql";

test("publishes the verified public contact email idempotently", async () => {
  assert.ok(existsSync(MIGRATION), "contact-email migration is missing");
  const migration = await readFile(MIGRATION, "utf8");

  assert.match(
    migration,
    /['"]site\.contactEmail['"]\s*,\s*['"]EN['"]\s*,\s*['"]contact@hyggeleuven\.be['"]/
  );
  assert.match(
    migration,
    /ON CONFLICT\s*\(\s*"namespace"\s*,\s*"locale"\s*\)\s*DO UPDATE/i,
  );
  assert.doesNotMatch(migration, /ADMIN_EMAIL/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test tests/contact-section.test.mjs
```

Expected: FAIL with `contact-email migration is missing`.

- [ ] **Step 3: Add the idempotent migration**

Create `prisma/migrations/20260812120000_publish_contact_email/migration.sql`:

```sql
-- Publish the owner-confirmed public café address. This is visitor-facing
-- content and is deliberately independent from the private ADMIN_EMAIL login.
INSERT INTO "Translation" ("namespace", "locale", "value", "updatedAt")
VALUES ('site.contactEmail', 'EN', 'contact@hyggeleuven.be', CURRENT_TIMESTAMP)
ON CONFLICT ("namespace", "locale") DO UPDATE SET
  "value" = excluded."value",
  "updatedAt" = CURRENT_TIMESTAMP;
```

- [ ] **Step 4: Run the test and verify GREEN**

Run:

```bash
node --test tests/contact-section.test.mjs
```

Expected: PASS, 1 test.

- [ ] **Step 5: Prove the migration is repeatable on a disposable database**

Run:

```bash
cp dev.db /tmp/hygge-contact-section.db
sqlite3 /tmp/hygge-contact-section.db < prisma/migrations/20260812120000_publish_contact_email/migration.sql
sqlite3 /tmp/hygge-contact-section.db < prisma/migrations/20260812120000_publish_contact_email/migration.sql
sqlite3 /tmp/hygge-contact-section.db "SELECT namespace, locale, value, COUNT(*) FROM Translation WHERE namespace='site.contactEmail' GROUP BY namespace, locale, value;"
```

Expected: exactly `site.contactEmail|EN|contact@hyggeleuven.be|1`.

- [ ] **Step 6: Commit the migration slice**

```bash
git add tests/contact-section.test.mjs prisma/migrations/20260812120000_publish_contact_email/migration.sql
git commit -m "feat: publish public cafe email"
```

---

### Task 2: Render the dedicated Contact Us landmark

**Files:**
- Create: `app/components/features/ContactSection.tsx`
- Modify: `app/components/Landing.tsx:31-46,614-616`
- Modify: `lib/feature-labels.ts:50-71`
- Modify: `tests/contact-section.test.mjs`

**Interfaces:**
- Consumes: `content.contactEmail`, `content.instagramUrl`, `content.instagramHandle`, `content.newTabLabel`, and `FEATURE_LABELS.contactSection`.
- Produces: `ContactSection(props: ContactSectionProps): React.JSX.Element | null` and a `<section id="contact">` immediately before `<section id="map">`.

- [ ] **Step 1: Add failing component and placement tests**

Append to `tests/contact-section.test.mjs`:

```js
test("renders the approved Contact Us section before the map", async () => {
  const componentPath = "app/components/features/ContactSection.tsx";
  assert.ok(existsSync(componentPath), "ContactSection is missing");

  const [component, landing, labels] = await Promise.all([
    readFile(componentPath, "utf8"),
    readFile("app/components/Landing.tsx", "utf8"),
    readFile("lib/feature-labels.ts", "utf8"),
  ]);

  assert.match(component, /id="contact"/);
  assert.match(component, /aria-labelledby="contact-heading"/);
  assert.match(component, /href=\{`mailto:\$\{email\}`\}/);
  assert.match(component, />\{email\}</);
  assert.match(component, /target="_blank"/);
  assert.match(component, /rel="noreferrer"/);

  const contactPosition = landing.indexOf("<ContactSection");
  const mapPosition = landing.indexOf('<section className="pane pane-map"');
  assert.ok(
    contactPosition >= 0 && contactPosition < mapPosition,
    "Contact Us must render before the map",
  );

  assert.match(labels, /heading:\s*"Contact us"/);
  assert.match(
    labels,
    /intro:\s*"Questions, collaborations, or just want to say hello\? Drop us a line — we’d love to hear from you\."/,
  );
  assert.match(labels, /email:\s*"Email us"/);
  assert.match(labels, /instagram:\s*"Instagram"/);
});

test("keeps email and Instagram independently optional", async () => {
  const component = await readFile(
    "app/components/features/ContactSection.tsx",
    "utf8",
  );

  assert.match(component, /if \(!hasEmail && !hasInstagram\) return null/);
  assert.match(component, /\{hasEmail \? \(/);
  assert.match(component, /\{hasInstagram \? \(/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test tests/contact-section.test.mjs
```

Expected: migration test PASS; component test FAIL with `ContactSection is missing`.

- [ ] **Step 3: Create the focused server component**

Create `app/components/features/ContactSection.tsx`:

```tsx
type ContactSectionProps = {
  heading: string;
  intro: string;
  emailLabel: string;
  instagramLabel: string;
  email: string;
  instagramUrl: string;
  instagramHandle: string;
  newTabLabel: string;
};

export function ContactSection({
  heading,
  intro,
  emailLabel,
  instagramLabel,
  email,
  instagramUrl,
  instagramHandle,
  newTabLabel,
}: ContactSectionProps) {
  const hasEmail = email.trim().length > 0;
  const hasInstagram = instagramUrl.trim().length > 0;
  if (!hasEmail && !hasInstagram) return null;

  return (
    <section
      className="pane pane-contact"
      id="contact"
      aria-labelledby="contact-heading"
    >
      <div className="contact-wrap">
        <div className="contact-copy">
          <h2 className="contact-heading" id="contact-heading">{heading}</h2>
          <p className="contact-intro">{intro}</p>
        </div>

        <div className="contact-channels">
          {hasEmail ? (
            <a className="contact-email" href={`mailto:${email}`}>
              <span className="contact-action-label">{emailLabel}</span>
              <span className="contact-email-address">{email}</span>
            </a>
          ) : null}

          {hasInstagram ? (
            <a
              className="btn btn-secondary contact-instagram"
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              {instagramLabel} · {instagramHandle}
              <span className="sr-only"> {newTabLabel}</span>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add the approved copy to `FEATURE_LABELS`**

Add this object after `aboutStoryHeading` in `lib/feature-labels.ts`:

```ts
  contactSection: {
    heading: "Contact us",
    intro: "Questions, collaborations, or just want to say hello? Drop us a line — we’d love to hear from you.",
    email: "Email us",
    instagram: "Instagram",
  },
```

- [ ] **Step 5: Place the component in `Landing`**

Import it beside `AboutStory`:

```ts
import { ContactSection } from "./features/ContactSection";
```

Immediately before the existing map section, render:

```tsx
      <ContactSection
        heading={L.contactSection.heading}
        intro={L.contactSection.intro}
        emailLabel={L.contactSection.email}
        instagramLabel={L.contactSection.instagram}
        email={c.contactEmail}
        instagramUrl={c.instagramUrl}
        instagramHandle={c.instagramHandle}
        newTabLabel={c.newTabLabel}
      />
```

- [ ] **Step 6: Run the focused test and verify GREEN**

Run:

```bash
node --test tests/contact-section.test.mjs
```

Expected: PASS, 3 tests.

- [ ] **Step 7: Commit the component slice**

```bash
git add app/components/features/ContactSection.tsx app/components/Landing.tsx lib/feature-labels.ts tests/contact-section.test.mjs
git commit -m "feat: add Contact Us section"
```

---

### Task 3: Add Contact Us to both navigation surfaces

**Files:**
- Modify: `app/components/features/SectionNavDots.tsx:14-25`
- Modify: `app/components/features/CommandPalette.tsx:10-21`
- Modify: `lib/feature-labels.ts:71-112`
- Modify: `tests/contact-section.test.mjs`

**Interfaces:**
- Consumes: the `contact` DOM id produced by Task 2.
- Produces: identical `menu`, `contact`, `map` ordering for dot navigation and the command palette, with the visible label `Contact us`.

- [ ] **Step 1: Add the failing navigation test**

Append to `tests/contact-section.test.mjs`:

```js
test("includes Contact Us in both navigation surfaces", async () => {
  const [dots, palette, labels] = await Promise.all([
    readFile("app/components/features/SectionNavDots.tsx", "utf8"),
    readFile("app/components/features/CommandPalette.tsx", "utf8"),
    readFile("lib/feature-labels.ts", "utf8"),
  ]);

  const orderedIds = /"menu",\s*"contact",\s*"map"/s;
  assert.match(dots, orderedIds);
  assert.match(palette, orderedIds);
  assert.match(labels, /sectionNav:\s*\{[\s\S]*?contact:\s*"Contact us"/);
  assert.match(
    labels,
    /commandPalette:[\s\S]*?sections:\s*\{[\s\S]*?contact:\s*"Contact us"/,
  );
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test tests/contact-section.test.mjs
```

Expected: FAIL because `contact` is absent between `menu` and `map`.

- [ ] **Step 3: Add the ordered navigation id**

In both `SectionNavDots.tsx` and `CommandPalette.tsx`, change the final ids to:

```ts
  "more",
  "menu",
  "contact",
  "map",
```

In `FEATURE_LABELS.sectionNav`, add:

```ts
    contact: "Contact us",
```

In `FEATURE_LABELS.commandPalette.sections`, add:

```ts
      contact: "Contact us",
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
node --test tests/contact-section.test.mjs
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit the navigation slice**

```bash
git add app/components/features/SectionNavDots.tsx app/components/features/CommandPalette.tsx lib/feature-labels.ts tests/contact-section.test.mjs
git commit -m "feat: link Contact Us from page navigation"
```

---

### Task 4: Apply the responsive editorial layout

**Files:**
- Modify: `app/globals.css:704`
- Modify: `tests/contact-section.test.mjs`

**Interfaces:**
- Consumes: `.pane-contact`, `.contact-wrap`, `.contact-copy`, `.contact-heading`, `.contact-intro`, `.contact-channels`, `.contact-email`, `.contact-action-label`, `.contact-email-address`, and `.contact-instagram` from Task 2.
- Produces: a one-column mobile layout, an asymmetric two-column layout from 760 CSS pixels, and overflow-safe contact links.

- [ ] **Step 1: Add the failing responsive-layout test**

Append to `tests/contact-section.test.mjs`:

```js
test("lays out Contact Us responsively without email overflow", async () => {
  const css = await readFile("app/globals.css", "utf8");
  const marker = "/* ───── contact pane ───── */";
  assert.ok(css.includes(marker), "contact CSS marker is missing");
  const rules = css.slice(css.indexOf(marker), css.indexOf("/* ───── map pane ───── */"));

  assert.match(rules, /\.pane-contact\s*\{[^}]*background:\s*var\(--bg\)/s);
  assert.match(rules, /\.contact-wrap\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(
    rules,
    /\.contact-email-address\s*\{[^}]*overflow-wrap:\s*anywhere/s,
  );
  assert.match(rules, /min-height:\s*44px/);
  assert.match(
    rules,
    /@media\s*\(min-width:\s*760px\)[\s\S]*?\.contact-wrap\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*0\.9fr\)\s*minmax\(0,\s*1\.1fr\)/s,
  );
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test tests/contact-section.test.mjs
```

Expected: FAIL with `contact CSS marker is missing`.

- [ ] **Step 3: Add the scoped Contact Us rules before the map rules**

Insert this block immediately before `/* ───── map pane ───── */` in `app/globals.css`:

```css
/* ───── contact pane ───── */
.pane-contact {
  background: var(--bg);
  justify-content: center;
  padding: clamp(64px, 10vw, 120px) 24px;
  border-block: 1px solid var(--rule);
  scroll-margin-block-start: var(--ann-h);
}
.contact-wrap {
  width: min(1120px, 92vw);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(36px, 7vw, 88px);
  align-items: end;
}
.contact-copy {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 48ch;
}
.contact-heading {
  margin: 0;
  font-family: var(--font-serif), "Didot LT Pro", Didot, serif;
  font-size: clamp(44px, 9vw, 80px);
  font-weight: 700;
  line-height: 0.96;
  letter-spacing: -0.03em;
  color: var(--tan);
  text-wrap: balance;
}
.contact-intro {
  margin: 0;
  font-family: var(--font-editorial), serif;
  font-size: clamp(18px, 2.8vw, 23px);
  line-height: 1.55;
  color: var(--ink);
  text-wrap: pretty;
}
.contact-channels {
  min-width: 0;
  padding-top: 28px;
  border-top: 1px solid var(--rule-strong);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}
.contact-email {
  width: 100%;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  color: var(--ink);
}
.contact-action-label {
  font-family: var(--font-sans), system-ui, sans-serif;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--tan);
}
.contact-email-address {
  font-family: var(--font-serif), "Didot LT Pro", Didot, serif;
  font-size: clamp(24px, 5.6vw, 48px);
  line-height: 1.08;
  letter-spacing: -0.025em;
  overflow-wrap: anywhere;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
}
.contact-email:hover .contact-email-address,
.contact-email:focus-visible .contact-email-address {
  color: var(--tan);
}
.contact-instagram {
  width: auto;
  min-height: 44px;
}
@media (min-width: 760px) {
  .contact-wrap {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  }
  .contact-channels {
    padding-top: 0;
    padding-left: clamp(28px, 5vw, 72px);
    border-top: 0;
    border-left: 1px solid var(--rule-strong);
  }
}
```

- [ ] **Step 4: Run focused and neighboring tests**

Run:

```bash
node --test tests/contact-section.test.mjs tests/about-contact.test.mjs tests/qa-flags.test.mjs
```

Expected: PASS, including 5 Contact Us tests and all existing About/flag tests.

- [ ] **Step 5: Commit the layout slice**

```bash
git add app/globals.css tests/contact-section.test.mjs
git commit -m "style: lay out Contact Us editorially"
```

---

### Task 5: Verify, publish, and deploy

**Files:**
- Verify: all changed files and production output.
- Publish: `main` on `origin`.
- Deploy: Coolify application UUID `h2hb9lg3li7tt64ydyf0y54q`.

**Interfaces:**
- Consumes: Tasks 1–4 and the previously supplied Coolify credential through non-echoing terminal input.
- Produces: a live Contact Us section at `https://hygge.emre.zip/#contact` with a working `mailto:contact@hyggeleuven.be` anchor.

- [ ] **Step 1: Run all tests with Node's TypeScript stripping enabled**

Run:

```bash
node --experimental-strip-types --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/*.test.mjs
```

Expected: every test PASS. This invocation includes the two existing test files that import `.ts` modules and avoids the baseline `ERR_UNKNOWN_FILE_EXTENSION` failure from plain `npm test` under Node 22.

- [ ] **Step 2: Generate Prisma types and build production output**

Run:

```bash
DATABASE_URL=file:/tmp/hygge-contact-build.db npx prisma generate
DATABASE_URL=file:/tmp/hygge-contact-build.db npm run build
```

Expected: `Compiled successfully`, TypeScript completes, and all routes finish generating. The existing Turbopack NFT warning for `app/api/uploads/[file]/route.ts` may remain; no new warning may be introduced.

- [ ] **Step 3: Run local production visual QA**

Start the built app with the disposable database from Task 1:

```bash
PORT=3107 DATABASE_URL=file:/tmp/hygge-contact-section.db npm run start
```

Inspect at 1440×1000 and 390×844 in light and dark themes. Verify:

- Contact Us is directly before Come find us.
- `contact@hyggeleuven.be` is visible and opens a `mailto:` target.
- Instagram opens the existing Hygge profile in a new tab.
- section dots and command palette both include `Contact us` after `Menu` and before `Find us`.
- no horizontal overflow exists at 390 CSS pixels; additionally emulate 320 CSS pixels for the email wrap.
- both focus rings remain visible and each action is at least 44 CSS pixels high.

- [ ] **Step 4: Review the final diff and repository state**

Run:

```bash
git diff --check
git status --short
git log --oneline -6
```

Expected: no whitespace errors, no untracked generated artifacts, and only intentional Contact Us commits ahead of the published base.

- [ ] **Step 5: Push the completed commits**

Run:

```bash
git push origin main
```

Expected: `origin/main` resolves to the same commit as local `main`.

- [ ] **Step 6: Trigger Coolify without exposing the token**

Read the previously supplied token into `HYGGE_COOLIFY_TOKEN` with terminal echo
disabled. Call the deploy endpoint with
`Authorization: Bearer ${HYGGE_COOLIFY_TOKEN}`, then unset the variable before
closing the terminal session:

```text
GET https://deploy.emre.zip/api/v1/deploy?uuid=h2hb9lg3li7tt64ydyf0y54q&force=true
```

Record only the returned deployment UUID. Poll `/api/v1/deployments/{deployment_uuid}` while filtering the response to `status`, `commit`, `updated_at`, and `finished_at`. Expected final status: `finished`, with `commit` equal to `origin/main`.

- [ ] **Step 7: Verify the production contract**

Fetch the live homepage and assert:

```bash
curl --silent --show-error --location --output /tmp/hygge-contact-live.html --write-out 'status=%{http_code}\n' https://hygge.emre.zip
rg -o "Contact us|contact@hyggeleuven.be|mailto:contact@hyggeleuven.be|id=\"contact\"|id=\"map\"" /tmp/hygge-contact-live.html | sort | uniq -c
node -e "const s=require('fs').readFileSync('/tmp/hygge-contact-live.html','utf8'); const c=s.indexOf('id=\"contact\"'); const m=s.indexOf('id=\"map\"'); if (!(c >= 0 && m > c)) process.exit(1); console.log({contactBeforeMap:true});"
```

Expected: HTTP 200, the approved heading and address are present, at least one exact live `mailto:` target exists, and `contactBeforeMap` is `true`.

- [ ] **Step 8: Mark the thread goal complete**

Only after the production contract passes, mark the persistent goal complete and report the live URL, final commit, deployment status, test result, and visual-QA viewport coverage.
