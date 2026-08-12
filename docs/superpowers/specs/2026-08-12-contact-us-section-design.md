# Contact Us Section Design

**Status:** Approved in conversation on 12 August 2026  
**Public recipient:** `contact@hyggeleuven.be`

## Goal

Give café visitors an unmistakable way to contact Hygge without making them hunt
inside the map card. The new section should feel like a natural closing invitation,
not a generic lead-generation form.

## Chosen approach

Add a dedicated `Contact us` section immediately before the existing `Come find
us` map section. It will offer a direct email link as the primary action and the
café's Instagram profile as the secondary action. No form or mail-delivery backend
is included: the direct `mailto:` route is immediately usable, avoids storing
personal messages, and introduces no spam or consent surface.

The existing map section remains intact. Its compact contact list continues to act
as a useful fallback when a visitor arrives directly at the map anchor; the new
section becomes the prominent contact destination in the page flow and navigation.

## Content

- Heading: `Contact us`
- Intro: `Questions, collaborations, or just want to say hello? Drop us a line — we’d love to hear from you.`
- Primary action label: `Email us`
- Primary address: `contact@hyggeleuven.be`
- Secondary action label: `Instagram`
- Secondary destination: the existing `site.instagramUrl` and `site.instagramHandle`

The email address is visible as text as well as encoded in the `mailto:` link so a
visitor can recognize, copy, or use it in another mail client.

## Placement and navigation

The page order near the end becomes:

1. Menu
2. Contact us
3. Come find us

The section id is `contact`. It is added between `menu` and `map` in both the
fixed section-dot navigation and the command palette. The corresponding label is
`Contact us` in both navigation label maps.

## Visual direction

The section reuses the site's established café-paper palette and type system. It
is a restrained editorial invitation rather than a boxed SaaS contact card:

- a full-width pane derived from the existing `--bg`, `--ink`, `--tan`, and rule
  tokens;
- a large serif heading paired with a narrow editorial paragraph;
- the email address set as the memorable signature, large enough to scan but able
  to wrap safely on narrow phones;
- a quiet primary email action and a secondary Instagram action using the site's
  existing button and focus vocabulary;
- a single hairline rule tying the copy and actions together, with no extra icon
  illustration or decorative card stack.

Desktop uses an asymmetric two-column composition: heading and copy on the left,
contact address and actions on the right. Mobile collapses to one column in reading
order. Both themes use the same semantic tokens, and reduced-motion mode requires
no special behavior because the section adds no animation.

## Component and data flow

Create a server-rendered `ContactSection` component with a small explicit prop
surface:

- `email`
- `instagramUrl`
- `instagramHandle`
- `newTabLabel`
- the four visible labels/copy strings

`Landing` renders the component immediately before the map and supplies data from
the existing site-content object. The component returns `null` only when neither
email nor Instagram is available. If the email is empty, the email address and
email action are omitted while Instagram remains usable; if Instagram is empty,
the inverse applies.

Publish `contact@hyggeleuven.be` through the existing `Translation` content path
by upserting `site.contactEmail` for locale `EN`. Other locales already fall back
to `EN`, so the same verified address is available everywhere without duplicating
locale rows. The migration must be idempotent and must not use the private
`ADMIN_EMAIL` environment variable.

## Accessibility and behavior

- The section is a labelled landmark with `aria-labelledby` pointing to its `h2`.
- The email link is a normal `mailto:contact@hyggeleuven.be` anchor.
- Instagram opens in a new tab with `rel="noreferrer"` and the existing visually
  hidden new-tab label.
- Focus indicators remain visible and controls meet the site's minimum touch size.
- Long email text wraps without horizontal overflow at 320 CSS pixels.
- No JavaScript is required for the section to render or work.

## Verification

Implementation begins with a failing test that proves:

- `ContactSection` is rendered before `#map` with id `contact`;
- both navigation surfaces order `menu`, `contact`, `map`;
- the primary link uses the verified public address and the migration upserts
  `site.contactEmail` idempotently;
- the responsive CSS contains the one-column mobile and two-column desktop rules;
- the component preserves its single-channel fallbacks.

After the tests pass, run the production build, apply the migration to a disposable
copy of the database twice, and visually inspect desktop, mobile, light, and dark
themes. Production verification must confirm a successful Coolify deployment,
HTTP 200 for the page, a visible `Contact us` section before the map, and live HTML
containing `mailto:contact@hyggeleuven.be`.

## Out of scope

- A message form or server-side email delivery service
- CAPTCHA, spam filtering, message persistence, or an admin inbox
- Changes to the café's Instagram account or mail-provider configuration
- Exposing or repurposing any admin login address
