# Editable About Us Content

## Goal

Let an administrator edit the existing “A little about us” heading and its four story paragraphs from Admin → Content without changing the public section’s illustration or layout.

## Chosen approach

Store the heading and four paragraphs as five normal site-text namespaces in the existing `Translation` table. This reuses the Content screen’s current draft, preview, publish, discard, audit, locale fallback, and cache revalidation behavior. No schema migration or new editor is needed.

Admin → Content gains an “About us” anchor and section containing one heading input plus four separately labelled textareas. Separate paragraph fields preserve the approved editorial order and are safer to edit on a phone than one delimiter-sensitive textarea. The illustration remains fixed.

The public `AboutStory` component receives the resolved heading and paragraph array from `Landing`. It filters whitespace-only paragraphs before rendering, so an administrator can intentionally remove a paragraph without producing an empty block. If every paragraph is empty, the section renders nothing, preserving the existing empty-state rule.

## Data flow

1. `SITE_TEXT_DEFAULTS` supplies the current approved heading and four paragraphs.
2. `getDraftContent()` overlays pending Content edits for the admin form and Preview.
3. `saveContentDraft()` picks the five fields up automatically through `SITE_TEXT_FIELDS`.
4. `publishContent()` writes them to `Translation` atomically with the rest of the Content draft.
5. `getPublishedContent()` supplies only published values to the public page.

## Verification

- Regression tests prove the Content section exposes all five fields and its anchor.
- Data-flow tests prove the fields are registered site text and are passed from `Landing` into `AboutStory`.
- Component tests prove stored paragraphs render in order and blank paragraphs are omitted.
- Run the complete test suite and production build, then inspect Admin → Content and the public About section at phone width.
