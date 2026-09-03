# GA4 Admin Setting Design

## Goal

Let an administrator paste either a GA4 measurement ID or Google's complete installation snippet into the existing Content editor, publish the normalized measurement ID, and track only consenting visitors on the public site.

## Chosen approach

The Content screen already owns search presentation and uses a draft/publish workflow, so GA4 belongs in its SEO section rather than in a new top-level admin destination. The database will store only a normalized `G-...` measurement ID on `SiteContent`; arbitrary JavaScript will never be persisted or rendered. A schema helper accepts either the bare ID or a copied Google snippet, extracts one valid ID, uppercases it, and rejects ambiguous or malformed input.

The public home page receives the published ID. Admin preview does not receive it and therefore cannot generate internal page views. A small client component implements basic consent mode: it loads no Google resource until the visitor explicitly allows analytics, remembers allow/reject locally, and initializes Google with advertising storage and personalization denied. Existing informational cookie copy remains in place when analytics is not configured.

## Data flow and failure handling

1. Admin pastes a bare ID or full snippet into Content > SEO.
2. Save validates and normalizes the value into the existing draft JSON.
3. Publish copies it to the live `SiteContent.gaMeasurementId` column and records it in the existing audit trail.
4. The public page passes the published value to `GlobalFeatures`; preview deliberately omits it.
5. The analytics consent component loads `gtag.js` only after a stored or fresh `granted` choice.

Invalid input returns to the field with an accessible error and does not change the draft. An empty value disables GA4 after publish. If local storage is unavailable, analytics remains off and the page continues normally.

## Verification

Test the input normalizer first against bare IDs, full snippets, empty input, malformed IDs, and multiple IDs. Add source-level integration checks for the migration, draft/publish wiring, admin field, preview exclusion, consent buttons, and consent-gated scripts. Then run the focused test, all tests on Node 22.22.2, Prisma generation, production build, and diff checks.
