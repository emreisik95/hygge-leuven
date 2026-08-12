# Hygge About & Contact Design

## Intent

The subject is Hygge, a Danish-inspired specialty café in Leuven. The page's job is to help a prospective guest understand the café's standards and atmosphere, then give them a direct, trustworthy way to get in touch.

## Approaches considered

1. **Reuse the existing story pane and map contact card (recommended).** Replace the placeholder story with the owner-provided copy, adapt the existing editorial layout to long-form reading, enable the pane, and populate the existing `mailto:` contact once the public address is confirmed. This preserves the visual language and keeps the contact behavior simple and accessible.
2. **Add a separate always-on about page and contact page.** This gives each topic more room but fragments a deliberately single-page site and adds navigation the brief does not require.
3. **Build a server-backed contact form.** This avoids opening a visitor's email client, but needs a delivery provider, spam controls, consent/privacy copy, and a verified recipient. It is more infrastructure than the request warrants.

## Visual system

- **Colour:** reuse the live tokens — café beige `#e6d0b2`, coffee ink `#33241a`, roast accent `#4a3423`, rule `rgba(58,42,31,.28)`, Instagram rust `#9a3e22`.
- **Type:** keep the project's existing display serif for the heading, editorial serif for the story, and sans serif for utility links.
- **Layout:** mobile is one readable column; desktop uses the existing hand-drawn still life as a quiet left rail and a `60ch` prose column on the right. The section grows beyond one viewport when needed rather than shrinking the supplied text.
- **Signature:** the café-table still life remains the one expressive element. Everything else stays typographic and restrained.

## Content and behavior

- The visible heading is exactly “A little about us”.
- The four supplied text blocks render in order without rewriting.
- The story sits immediately before the Instagram/photo pane, and the hero's
  downward cue leads to the story whenever it is enabled.
- The story is server-rendered and crawlable with no client JavaScript.
- The `aboutStory` feature is explicitly enabled by a migration because this copy is now owner-approved.
- The existing map contact list remains the single contact surface. When a public contact address is configured, it renders as a keyboard-accessible `mailto:` link and unlocks the existing email CTAs.
- A private admin login address must never be repurposed or exposed as the café's public contact address.

## Verification

Source tests assert the exact heading/copy, feature enablement migration, and guarded contact behavior. A production build verifies the Next.js integration. Desktop and mobile screenshots verify long-form layout, focusable links, and that no copy is clipped.
