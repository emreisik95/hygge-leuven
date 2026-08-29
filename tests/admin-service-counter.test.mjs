import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const AUTHENTICATED_ROUTES = [
  "app/admin/page.tsx",
  "app/admin/content/page.tsx",
  "app/admin/menu/page.tsx",
  "app/admin/hours/page.tsx",
  "app/admin/more/page.tsx",
  "app/admin/photos/page.tsx",
  "app/admin/instagram/page.tsx",
  "app/admin/translations/page.tsx",
  "app/admin/features/page.tsx",
  "app/admin/users/page.tsx",
  "app/admin/audit/page.tsx",
  "app/admin/preview/page.tsx",
];

test("gives every authenticated admin route the shared service-ticket introduction", async () => {
  for (const route of AUTHENTICATED_ROUTES) {
    const source = await read(route);
    assert.match(source, /<AdminPageIntro\b/, `${route} must render AdminPageIntro`);
  }
});

test("provides the complete shared service-counter primitive set", async () => {
  const primitives = [
    ["app/admin/components/AdminPageIntro.tsx", /export function AdminPageIntro/],
    ["app/admin/components/AdminToolCard.tsx", /export function AdminToolCard/],
    ["app/admin/components/AdminStatusList.tsx", /export function AdminStatusList/],
    ["app/admin/components/AdminSectionNav.tsx", /export function AdminSectionNav/],
    ["app/admin/components/AdminActionDock.tsx", /export function AdminActionDock/],
    ["app/admin/components/AdminEmptyState.tsx", /export function AdminEmptyState/],
  ];

  for (const [path, exportedComponent] of primitives) {
    await access(new URL(`../${path}`, import.meta.url));
    assert.match(await read(path), exportedComponent);
  }
});

test("makes the long Content editor locally navigable with one page action dock", async () => {
  const content = await read("app/admin/content/page.tsx");
  assert.match(content, /<AdminSectionNav\b/);
  assert.match(content, /<AdminActionDock\b/);
  for (const id of ["visibility", "hero", "about-us", "address", "buttons", "instagram-pane", "menu-note", "map", "seo"]) {
    assert.match(content, new RegExp(`id=["']${id}["']`));
    assert.match(content, new RegExp(`href:\\s*["']#${id}["']`));
  }
  assert.match(content, /name="aboutStoryHeading"/);
  for (let index = 1; index <= 4; index += 1) {
    assert.match(content, new RegExp(`name=["']aboutStoryParagraph${index}["']`));
  }
  assert.match(content, /<SubmitButton pendingLabel="Saving…">Save draft<\/SubmitButton>/);
});

test("installs a web-sized illustrated icon for every secondary tool", async () => {
  const more = await read("app/admin/more/page.tsx");
  for (const icon of ["photos", "instagram", "translations", "features", "admins", "audit", "preview"]) {
    const path = new URL(`../public/admin-icons/${icon}-service-counter-2.png`, import.meta.url);
    const iconStat = await stat(path);
    assert.ok(iconStat.size > 0, `${icon} icon must not be empty`);
    assert.ok(iconStat.size < 60 * 1024, `${icon} icon should stay web-sized`);
    assert.match(more, new RegExp(`/admin-icons/${icon}-service-counter-2\\.png`));
  }
});

test("locks the approved secondary icon vocabulary to its generated artwork", async () => {
  const manifest = JSON.parse(await read("public/admin-icons/manifest.json"));
  assert.equal(manifest.source, "design-assets/hygge-admin-secondary-icons.png");
  assert.deepEqual(manifest.icons, {
    photos: "instant camera with a framed café photo",
    instagram: "phone with photo tiles, without a social logo",
    translations: "overlapping English, Dutch, and French menu cards",
    features: "brass-and-sage toggle board",
    admins: "admin profile with café messages and settings",
    audit: "bound ledger with a checked entry",
    preview: "tiny café window and storefront",
  });
});

test("keeps admin artwork outside the authenticated route namespace", async () => {
  const sources = await Promise.all([
    ...AUTHENTICATED_ROUTES.map((route) => read(route)),
    read("app/admin/admin.css"),
  ]);
  assert.doesNotMatch(sources.join("\n"), /\/admin\/icons\//);
});

test("turns Photos into a navigable workspace without a nested main landmark", async () => {
  const photos = await read("app/admin/photos/page.tsx");
  assert.doesNotMatch(photos, /<main\b/);
  assert.match(photos, /<AdminSectionNav\b/);
  assert.match(photos, /<AdminEmptyState\b/);
});

test("keeps Instagram setup truthful and progressively disclosed", async () => {
  const instagram = await read("app/admin/instagram/page.tsx");
  assert.match(instagram, /<AdminStatusList\b/);
  assert.ok((instagram.match(/<details\b/g) ?? []).length >= 2);
  assert.match(instagram, /envOk \? "ready" : "missing"/);
  assert.match(instagram, /account \? "ready" : "missing"/);
  assert.match(instagram, /const tokenExpired =/);
  assert.match(instagram, /const integrationReady = envOk && !!account && !tokenExpired/);
  assert.match(instagram, /integrationReady \? "Connected"/);
  assert.match(instagram, /tokenExpired\s*\?\s*"Expired"/);
  assert.match(instagram, /tokenExpired \? "Reconnect needed"/);
});

test("keeps translations editable while adding language and group wayfinding", async () => {
  const translations = await read("app/admin/translations/page.tsx");
  assert.match(translations, /<AdminPageIntro\b/);
  assert.match(translations, /<AdminSectionNav\b/);
  assert.match(translations, /className="tx-language-legend"/);
  assert.match(translations, /<AdminActionDock\b/);
  assert.match(translations, /Save \{group\.title\}/);
  assert.match(translations, /code === "EN"/);
});

test("organises Features around enabled state, categories, preview, and copy", async () => {
  const features = await read("app/admin/features/page.tsx");
  assert.match(features, /<AdminPageIntro\b/);
  assert.match(features, /<AdminSectionNav\b/);
  assert.match(features, /<AdminActionDock\b/);
  assert.match(features, /\{enabledCount\} of \{FLAG_REGISTRY\.length\}/);
  assert.match(features, /id="feature-preview"/);
  assert.match(features, /id="feature-copy"/);
});

test("separates current admins from the add-admin task", async () => {
  const users = await read("app/admin/users/page.tsx");
  assert.match(users, /<AdminPageIntro\b/);
  assert.match(users, /className="admin-member-card"/);
  assert.match(users, /className="section admin-add-member"/);
  assert.match(users, /\{admins\.length \+ 1\}/);
});

test("renders audit history as responsive events rather than a desktop table", async () => {
  const audit = await read("app/admin/audit/page.tsx");
  assert.match(audit, /className="audit-event-list"/);
  assert.match(audit, /className="audit-event-card"/);
  assert.doesNotMatch(audit, /<table\b/);
  assert.match(audit, /const PAGE_SIZE = 200/);
  assert.match(audit, /name="actor"/);
  assert.match(audit, /name="entity"/);
  assert.match(audit, /<details className="audit-event-diff"/);
  assert.match(audit, /const ACTION_LABELS/);
  assert.match(audit, /actionLabel\(row\.action\)/);
  assert.match(audit, /<code>\{row\.action\}<\/code>/);
});

test("describes Preview as the current draft on the More shelf", async () => {
  const more = await read("app/admin/more/page.tsx");
  assert.match(more, /title="Preview" description="Review the current admin draft\."/);
});

test("frames Preview as a published-state admin review surface", async () => {
  const [preview, css] = await Promise.all([
    read("app/admin/preview/page.tsx"),
    read("app/admin/admin.css"),
  ]);
  assert.match(preview, /<AdminPreviewFrame\b/);
  assert.match(preview, /src="\/admin\/preview\?embed=1"/);
  assert.match(preview, /if \(embed === "1"\)/);
  assert.match(preview, /className="admin-preview-embed"/);
  assert.match(preview, /published state/i);
  assert.match(preview, /current admin draft/i);
  assert.match(css, /:has\(\.admin-preview-embed\)[\s\S]*\.admin-topbar/);
});

test("provides phone and desktop controls around the real admin preview", async () => {
  const frame = await read("app/admin/components/AdminPreviewFrame.tsx");
  assert.match(frame, /^"use client";/);
  assert.match(frame, /useState<"phone" \| "desktop">/);
  assert.match(frame, /useRef<HTMLIFrameElement>/);
  assert.match(frame, />\s*Phone\s*</);
  assert.match(frame, />\s*Desktop\s*</);
  assert.match(frame, /<iframe\b/);
  assert.match(frame, /src=\{src\}/);
  assert.match(frame, /contentWindow\?\.location\.reload\(\)/);
  assert.match(frame, /href="\/"/);
});

test("keeps the embedded site preview from nesting main landmarks", async () => {
  const landing = await read("app/components/Landing.tsx");
  assert.match(landing, /const Root = preview \? "div" : "main"/);
  assert.match(landing, /<Root className="shell"/);
  assert.match(landing, /<\/Root>/);
});

test("removes avoidable page-level inline layout styles from secondary tools", async () => {
  for (const route of [
    "app/admin/photos/page.tsx",
    "app/admin/instagram/page.tsx",
    "app/admin/translations/page.tsx",
    "app/admin/features/page.tsx",
    "app/admin/audit/page.tsx",
  ]) {
    assert.doesNotMatch(await read(route), /style=\{\{/, `${route} should use shared classes`);
  }
});
