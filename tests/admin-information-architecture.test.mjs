import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("uses five task-focused primary admin destinations", async () => {
  const [layout, nav] = await Promise.all([
    read("app/admin/layout.tsx"),
    read("app/admin/components/admin-nav.tsx"),
  ]);

  for (const [label, href] of [
    ["Overview", "/admin"],
    ["Content", "/admin/content"],
    ["Menu", "/admin/menu"],
    ["Hours", "/admin/hours"],
    ["More", "/admin/more"],
  ]) {
    assert.match(layout, new RegExp(`label: ["']${label}["'], href: ["']${href}["']`));
  }
  assert.match(nav, /aria-current=\{active \? "page"/);
  assert.match(nav, /MORE_ROUTES/);
  assert.match(nav, /link\.href === "\/admin\/more"/);
  assert.match(layout, /href="\/"/);
  assert.doesNotMatch(layout, /hygge\.emre\.zip/);
});

test("makes overview operational and moves editing to Content", async () => {
  const [overview, content, statusRail] = await Promise.all([
    read("app/admin/page.tsx"),
    read("app/admin/content/page.tsx"),
    read("app/admin/components/AdminStatusRail.tsx"),
  ]);

  assert.match(overview, /Good (morning|afternoon|evening)/i);
  assert.match(overview, /Quick actions/);
  assert.match(overview, /Current menu/);
  assert.match(overview, /Opening today/);
  assert.match(overview, /<AdminStatusRail/);
  assert.match(content, /Site content editor/);
  assert.match(content, /Save draft/);
  assert.match(statusRail, /Live/);
  assert.match(statusRail, /Draft/);
});

test("groups secondary tools under More", async () => {
  const more = await read("app/admin/more/page.tsx");
  for (const label of ["Photos", "Instagram", "Translations", "Features", "Admins", "Audit"]) {
    assert.match(more, new RegExp(`(?:title=["']${label}["']|>${label}<)`));
  }
});

test("returns content draft actions to the Content screen", async () => {
  const actions = await read("app/admin/actions.ts");
  assert.match(actions, /redirect\("\/admin\/content\?saved=1"\)/);
  assert.match(actions, /redirect\("\/admin\/content\?published=1"\)/);
  assert.match(actions, /redirect\("\/admin\/content\?discarded=1"\)/);
  assert.match(actions, /revalidatePath\("\/admin\/content"\)/);
});

test("content editor resolves shared admin actions and UI after its route move", async () => {
  const content = await read("app/admin/content/page.tsx");
  assert.match(content, /from "\.\.\/actions"/);
  assert.match(content, /from "\.\.\/ui\/fields"/);
  assert.match(content, /from "\.\.\/ui\/SubmitButton"/);
  assert.match(content, /from "\.\.\/ui\/Flash"/);
});

test("all authenticated screens use the same service-ticket page introduction", async () => {
  const routes = [
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

  for (const route of routes) {
    assert.match(await read(route), /<AdminPageIntro\b/, `${route} must use AdminPageIntro`);
  }
});
