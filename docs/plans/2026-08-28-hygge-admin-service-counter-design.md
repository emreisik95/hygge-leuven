# Hygge Admin Service Counter — Approved Design

**Date:** 2026-08-28
**Status:** Approved
**Scope:** Every authenticated admin route, shared admin navigation, and supporting visual assets

## Outcome

Turn the remaining admin screens into one coherent, mobile-first operations workspace without changing the content model, authentication model, or server-action contracts. The experience should feel like Hygge Leuven’s working service book: calm, tactile, unmistakably café-specific, and fast enough for a staff member to use between customers.

The existing five-item information architecture remains the stable backbone:

- Overview
- Content
- Menu
- Hours
- More

Secondary tools remain grouped under More. The redesign improves their presentation and workflow instead of expanding the bottom navigation.

## Visual direction

The chosen direction is **Hygge Service Counter**. Its signature element is a compact “service ticket” header on every page: a numbered eyebrow, an illustrated object badge, a clear task title, a one-sentence explanation, and optional status/action affordances. This replaces inconsistent bare headings while keeping the interface operational rather than decorative.

The object icon family extends the approved hand-inked, warm café illustration style already used in the five primary navigation destinations. GPT Image 2 will generate one coherent expanded icon sheet using the existing master as the visual reference. Web assets will be cropped, transparent, and optimized from that source.

### Palette

- Receipt: `#FBFAF6`
- Espresso: `#30251F`
- Oat: `#E9DDC9`
- Butter ticket: `#F1CF72`
- Chalkboard sage: `#54705D`
- Lingonberry: `#A33B43`

These existing approved colors stay in place. The distinctive move is not a new generic café palette; it is the service-ticket hierarchy and physical counter-object icon language.

### Typography

- Editorial role: the project’s existing serif face for page titles and major section labels.
- Operational role: the project’s existing sans face for controls, data, status, and body text.
- Utility role: compact uppercase sans labels with generous tracking for ticket numbers, state, and metadata.

## Expanded icon set

The generated sheet must contain isolated, clearly separated objects with consistent viewpoint, line weight, muted color, transparent or easily removable background, and no text:

- Overview: coffee cup
- Content: café notebook
- Menu: croissant
- Hours: service clock
- More: coffee beans
- Photos: instant camera / framed café photograph
- Instagram: small phone with photo tiles, without copying the Instagram logo
- Translations: three stacked conversation cards
- Features: brass-and-sage toggle board
- Admins: café keyring with two keys
- Audit: bound ledger with a checked entry
- Preview: tiny café window / storefront frame

The final web icons should remain legible at 22–36 px, use transparent PNGs, and stay below 60 KB each where practical.

## Application shell

### Desktop

The 248 px primary rail remains fixed. The content canvas may expand from 920 px to approximately 1120 px for routes that benefit from a side index or wide operational data. Pages use a consistent service-ticket intro followed by task surfaces. Complex editors can use a two-column layout with a 220–260 px sticky local index/status rail and a flexible main column.

```text
┌──────────────┬────────────────────────────────────────────────────┐
│ hygge admin  │  [object]  07 / TRANSLATIONS       status/action  │
│ Overview     │            Site copy in three languages           │
│ Content      ├──────────────┬─────────────────────────────────────┤
│ Menu         │ local index  │ task cards / editor                │
│ Hours        │ or status    │                                     │
│ More         │              │                                     │
│              │              │                                     │
│ View site    │              │                                     │
└──────────────┴──────────────┴─────────────────────────────────────┘
```

### Mobile

The approved fixed five-item bottom navigation remains. Secondary routes show a compact `More / Tool` breadcrumb above the service ticket so the user never loses orientation. Forms stack to one column. Primary save/publish actions become a sticky action dock only where there is a single page-level form; row-level and destructive actions remain with their objects.

```text
┌──────────────────────────┐
│ More / Photos            │
│ [camera]  PHOTOS         │
│ Manage the café imagery  │
├──────────────────────────┤
│ section chips / status   │
│                          │
│ task card                │
│ task card                │
│                          │
├──────────────────────────┤
│ sticky page action       │
├──────────────────────────┤
│ Ovr Content Menu Hrs More│
└──────────────────────────┘
```

## Shared components

Introduce small presentational primitives rather than duplicating markup:

- `AdminPageIntro`: route icon, eyebrow/ticket number, title, description, breadcrumb, optional status/action slot.
- `AdminToolCard`: illustrated More destination with state/count metadata and clear chevron.
- `AdminStatusList`: compact semantic status rows for integrations and setup checks.
- `AdminSectionNav`: local anchors for long forms, horizontally scrollable chips on mobile and a sticky index on desktop when useful.
- `AdminActionDock`: responsive page-level actions that becomes sticky on mobile.
- `AdminEmptyState`: route-specific empty state with a concise next action.

All components must use semantic elements, visible focus states, 44–48 px touch targets, and reduced-motion behavior.

## Route treatment

### Overview

Keep the operational dashboard and current status rail. Add the service-ticket intro and refine quick actions so secondary tools use the same icon family and state language.

### Content

Keep draft, publish, and discard server actions. Add a local section index for Visibility, Hero, Address, Buttons, Instagram pane, Menu note, Map, and SEO. Move page-level actions into a consistent action dock. Do not alter field names or validation wiring.

### Menu

Keep the direct menu image presentation and PDF replacement workflow. Frame the current menu and replacement task as separate service surfaces; retain live/open/download affordances.

### Hours

Keep `GroupedHoursEditor` and its seven-day field contract. Add the shared intro and make the schedule summary/state easier to scan without adding a second editing model.

### More

Replace the sparse link grid with an illustrated tool shelf. Group tools into:

- Publish: Photos, Instagram, Translations, Features
- Operations: Admins, Audit
- Review: Live preview

Each card shows its custom icon, one-line purpose, and helpful live state when cheaply available.

### Photos

Remove the nested `main`. Add the shared intro, role navigation, compact photo cards, clearer upload drop zones, and meaningful empty states. Preserve upload/update/reorder/delete/undo actions and accessibility requirements for alt text.

### Instagram

Present the integration as a status dashboard. Show Environment, Refresh secret, Account, Token, and Cached posts as semantic status rows. Connection actions sit in one compact action group. Technical cron instructions and the manual setup checklist move into progressive disclosure. Never represent the currently missing environment/account state as connected.

### Translations

Retain editable EN/NL/FR values and current save actions. Add group navigation, a short language legend, and sticky group save behavior on mobile. The English live defaults remain editable fallbacks.

### Features

Add the shared intro, enabled-count status, category navigation, and a clearer split between visibility switches, live preview, and copy/content editors. Retain all 49 feature flags, preview behavior, and per-group server actions. Long groups remain collapsible and keyboard accessible.

### Admins

Add the shared intro and separate current admins from the invitation/add-admin task. Use a compact member list with clear role/status treatment. Keep authenticated mutation guards and existing add/remove contracts.

### Audit

Replace the raw wide desktop table with semantic event cards/timeline that also works on mobile. Filters become a compact toolbar. Each event foregrounds time, actor, and human-readable action/entity; raw diff stays in an expandable code block. Keep the 200-entry query and exact filters.

### Preview

Wrap the public landing preview in an admin review frame with the shared intro, device context, refresh/open-live actions, and a clear notice that the preview reflects published state. Do not duplicate the site or introduce an alternate rendering path.

## Interaction and state rules

- No new database schema or content types.
- No server-action field-name changes.
- Existing permission and authentication guards remain intact.
- Success/error feedback uses the shared accessible live-region components.
- Destructive actions stay visually distinct and require the same explicit interaction as today.
- Missing configuration is shown as an actionable setup state, never as a generic error or fabricated success.
- Long technical details use `details`/`summary` progressive disclosure.
- Motion is limited to subtle state transitions and is disabled under `prefers-reduced-motion`.

## Verification criteria

- Every authenticated admin route uses the same page-intro hierarchy.
- Every More destination has its own generated object icon.
- Secondary routes remain discoverable under More and activate the More primary nav item.
- Desktop and 390 px mobile layouts are visually inspected route by route.
- No horizontal page overflow at 390 px.
- Focus indicators and touch targets remain visible and usable.
- Existing admin tests pass; new structural tests cover the shared primitives, icon inventory, responsive audit cards, progressive Instagram setup, and removal of route-level inline styling where avoidable.
- `npm test` and `npm run build` pass.
- The merged commit is pushed, deployed through the existing Coolify application, and verified on `https://hyggeleuven.be/admin` with fresh production evidence.
