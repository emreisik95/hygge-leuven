# Hygge mobile admin, menu PDF, hours, and SEO design

**Date:** 2026-08-28  
**Status:** Approved  
**Production origin:** `https://hyggeleuven.be`

## Objective

Rebuild the Hygge admin as a mobile-first, task-oriented interface while preserving the existing content and publishing capabilities. Publish the supplied seasonal menu PDF inline on the public site, set the requested weekly opening hours, align the site's crawl metadata with the production domain, and create an admin account for `batuhanbacak92@gmail.com` with a secure temporary password.

The public site remains multilingual. The admin interface remains English.

## Information architecture

The authenticated admin becomes one responsive application shell. Mobile uses a fixed five-item bottom navigation; desktop presents the same destinations in a left rail:

- **Overview** — live/draft state, current opening status, active menu document, Instagram freshness, and primary quick actions.
- **Content** — Hero, About, Contact, Location, and SEO editors, split into focused cards instead of one long form.
- **Menu** — PDF-first menu management with preview, replacement, open, and download actions.
- **Hours** — grouped weekday editing with an escape hatch for per-day exceptions.
- **More** — Photos, Instagram, Translations, Features, Admins, Audit, and account actions.

Existing route URLs can remain stable where practical, but the navigation and page hierarchy will reflect the new groups. The admin must remain at `https://hyggeleuven.be/admin`; authentication and redirects must not leak the former `hygge.emre.zip` origin.

## Overview and publishing flow

Overview is the default admin route. It answers the operational questions a café manager has on a phone:

- Is the public site live and are there unpublished changes?
- Is the café currently open, and until when?
- Which menu PDF is live?
- When was Instagram last refreshed?
- What common action should be taken next?

Quick actions open Content, Menu, Hours, and Preview directly. Content editing retains the safe draft/publish distinction. Editors save a draft through a sticky mobile action bar that appears only when relevant. Publishing remains a separate `Review & publish` action so editing a field cannot accidentally change the public site.

## Visual system

The admin direction is a daylight-friendly café service book, not a decorative landing page and not the existing low-contrast dark panel.

### Tokens

- Receipt `#FBFAF6` — main background
- Espresso `#30251F` — primary text
- Oat `#E9DDC9` — surfaces and separators
- Butter `#F1CF72` — active action and attention
- Sage `#54705D` — success and live state
- Lingonberry `#A33B43` — destructive actions and errors

GFS Didot is restricted to the Hygge brand mark. Fraunces is used for restrained section headings, Outfit for controls and copy, and system monospace for hours and operational status. The signature element is a slim café ticket-rail status strip showing live state, unsaved changes, and the last publish time. This is the one expressive device; the rest of the interface stays quiet.

Touch targets are at least 48 pixels. Form inputs render at 16 pixels or larger to avoid iOS zoom. Keyboard focus is always visible, color is never the only state signal, and reduced-motion preferences disable nonessential transitions.

## Menu document flow

The supplied one-page A4 seasonal menu becomes the initial live document. The public page receives a dedicated `#menu` section with:

- a normal HTML heading and short descriptive copy;
- a responsive inline PDF viewer;
- `Open full menu` and `Download PDF` fallbacks;
- a clear fallback when a mobile browser cannot embed PDFs.

The active document is served through a stable public URL rather than exposing storage internals. The admin Menu screen shows the current document and permits replacement. Uploads are limited to 10 MB and accepted only when both the declared type and PDF file signature are valid. A replacement is validated and written atomically before becoming active, so a failed upload never removes the current live menu. Persistent production storage is used for later replacements; the bundled supplied PDF acts as the deployment seed/fallback.

The empty structured product/category editor is removed from the primary experience. It is not required for this release and would duplicate the PDF workflow.

## Opening hours and public presentation

The initial production schedule is:

| Days | Opens | Closes |
| --- | --- | --- |
| Monday–Friday | 08:30 | 19:00 |
| Saturday | 09:00 | 19:00 |
| Sunday | 10:00 | 17:00 |

The database remains the single source of truth. The same seven rows drive:

- current open/closed state and next change in the hero;
- a visible weekly schedule in the public Contact/Location area;
- the admin Hours editor;
- `CafeOrCoffeeShop.openingHoursSpecification` structured data.

The admin starts with the three practical groups above and allows a group to be split into individual days for exceptions. Europe/Brussels remains the authoritative timezone.

## SEO and production origin

SEO work extends the existing Next.js metadata routes rather than creating duplicate infrastructure. The production origin is normalized to `https://hyggeleuven.be` across canonical metadata, Open Graph URLs, JSON-LD identifiers, sitemap, robots, admin authentication redirects, and internal absolute links.

The sitemap contains the canonical public page and accurate modification metadata. Robots allows the public site and disallows admin/API surfaces. The menu section is referenced by structured data through the canonical `#menu` anchor. Opening hours are present in both visible HTML and JSON-LD so search engines and visitors receive the same schedule.

## Admin account

Create exactly one database-backed admin for `batuhanbacak92@gmail.com`. Generate a strong random temporary password and store only its bcrypt hash. If the normalized email already exists, do not create a duplicate. Record the action in the audit log. The temporary password is disclosed to the owner once at handoff so it can be shared over an appropriate secure channel.

The permanent environment-backed bootstrap admin remains untouched and cannot be removed from the panel.

## Errors and safety

Validation errors appear next to the affected field in plain English and are summarized at the top of the relevant card. Save and upload actions show pending and success states with consistent verbs. Existing live content remains available after any failed operation.

Destructive actions require an explicit confirmation and are visually separated from primary actions. Server actions continue to enforce authenticated admin access; client presentation is never treated as authorization.

## Verification

Implementation is complete only after all of the following pass:

- tests for hours persistence and timezone-dependent open state;
- tests for production-origin canonical metadata, sitemap, robots, and JSON-LD;
- tests for PDF type/signature/size validation and safe replacement behavior;
- tests for navigation grouping, critical accessibility rules, and admin account creation;
- production build;
- responsive visual review at 390 x 844 and a desktop viewport;
- Coolify deployment completion;
- live checks for `hyggeleuven.be/admin` origin retention, public hours, menu viewer/download, sitemap, robots, canonical metadata, and structured data;
- production verification that Batuhan's normalized account exists and its temporary password verifies against the stored hash.

