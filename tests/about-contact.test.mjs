import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("registers the complete owner-approved about story as editable site copy", async () => {
  const source = await readFile("lib/db.ts", "utf8");
  const paragraphs = [
    "We’re a café with a big soft spot for good things. Good coffee. Good tea. Good food. Slow mornings. Long conversations. Cozy corners when you need one. We’re quite simple about what we serve: if we don’t like it ourselves, we won’t put it on your table. Everything we choose has to be something we genuinely enjoy — not just something that looks good on a menu.",
    "For our coffee, we proudly work with Caffenation, an Antwerp-born specialty coffee roaster that shares our love for quality, curiosity and doing things with care. Your espresso and Americano won’t taste exactly the same every few months — and that’s intentional. We change these beans roughly every month, choosing new coffees with different origins, characters and flavours so there’s always something new to discover. For our milk-based coffees, however, we keep our house beans consistent, so your favourite cappuccino tastes just the way you remember it.",
    "For tea, we chose A.C. Perch’s — Scandinavia’s oldest tea shop, with a tradition dating back to 1835. They have been serving the Danish Royal Household for generations and were officially appointed Royal Purveyor to the Danish Court in 2002. We like that kind of history, but even more, we like what’s in the cup: carefully selected teas made with the same respect for quality that we try to bring to everything we do.",
    "We care about the little things. The ingredients, the preparation, the atmosphere, the people sitting around the table. We love what we do, and we hope that somewhere between your first sip and your last bite, you can feel that too.",
  ];

  let cursor = -1;
  for (const paragraph of paragraphs) {
    const position = source.indexOf(paragraph);
    assert.ok(position > cursor, `missing or out-of-order paragraph: ${paragraph.slice(0, 48)}…`);
    cursor = position;
  }

  assert.match(source, /aboutStoryHeading:\s*"site\.aboutStoryHeading"/);
  assert.match(source, /aboutStoryHeading:\s*"A little about us"/);
  for (let index = 1; index <= 4; index += 1) {
    assert.match(source, new RegExp(`aboutStoryParagraph${index}:\\s*"site\\.aboutStoryParagraph${index}"`));
  }
});

test("publishes the approved about story with its requested heading", async () => {
  const migrationPath =
    "prisma/migrations/20260812090000_publish_about_story/migration.sql";
  const [labels, qaPolicy] = await Promise.all([
    readFile("lib/feature-labels.ts", "utf8"),
    readFile("scripts/qa-flag-policy.mjs", "utf8"),
  ]);

  assert.match(labels, /aboutStoryHeading:\s*"A little about us"/);
  assert.doesNotMatch(qaPolicy, /^\s*"aboutStory",\s*$/m);
  assert.ok(existsSync(migrationPath), "about-story publishing migration is missing");

  const migration = await readFile(migrationPath, "utf8");
  assert.match(migration, /['"]aboutStory['"]\s*,\s*true/);
  assert.match(migration, /ON CONFLICT\s*\(\s*"key"\s*\)\s*DO UPDATE/i);
});

test("lets the long story flow in a readable responsive editorial layout", async () => {
  const css = await readFile("app/globals.css", "utf8");
  const aboutRules = css.slice(css.indexOf("/* ───── about / our-story pane ───── */"));

  assert.match(aboutRules, /\.pane-about\s*\{[^}]*justify-content:\s*flex-start/s);
  assert.match(aboutRules, /\.pane-about\s*\{[^}]*background:\s*var\(--bg\)/s);
  assert.match(
    aboutRules,
    /\.pane-about\s*\{[^}]*scroll-margin-block-start:\s*var\(--ann-h\)/s,
  );
  assert.match(aboutRules, /\.about-prose\s*\{[^}]*max-width:\s*62ch/s);
  assert.match(aboutRules, /\.about-body:first-of-type\s*\{/);
  assert.match(
    aboutRules,
    /@media\s*\(min-width:\s*760px\)[\s\S]*?\.about-figure\s*\{[^}]*position:\s*sticky/s,
  );
});

test("uses the regenerated transparent line illustration for the about story", async () => {
  const source = await readFile("app/components/features/AboutStory.tsx", "utf8");

  assert.match(source, /src="\/assets\/illu-hygge-still-line\.png"/);
  assert.ok(
    existsSync("public/assets/illu-hygge-still-line.png"),
    "regenerated about illustration is missing",
  );
});

test("renders the admin-managed about story in order and omits blank paragraphs", async () => {
  const [about, landing] = await Promise.all([
    readFile("app/components/features/AboutStory.tsx", "utf8"),
    readFile("app/components/Landing.tsx", "utf8"),
  ]);

  assert.doesNotMatch(about, /const STORY_PARAGRAPHS/);
  assert.match(about, /paragraphs:\s*string\[\]/);
  assert.match(about, /const visibleParagraphs = paragraphs/);
  assert.match(about, /\.map\(\(paragraph\) => paragraph\.trim\(\)\)/);
  assert.match(about, /\.filter\(Boolean\)/);
  assert.match(about, /visibleParagraphs\.map/);

  assert.match(landing, /heading=\{c\.aboutStoryHeading\}/);
  for (let index = 1; index <= 4; index += 1) {
    assert.match(landing, new RegExp(`c\\.aboutStoryParagraph${index}`));
  }
});

test("routes the hero scroll cue only to an about story that can render", async () => {
  const landing = await readFile("app/components/Landing.tsx", "utf8");

  assert.match(landing, /const aboutStoryParagraphs = \[/);
  assert.match(
    landing,
    /const hasAboutStory =\s*flags\.aboutStory\s*&&\s*Boolean\(\s*c\.aboutStoryHeading\.trim\(\)/s,
  );
  assert.match(landing, /aboutStoryParagraphs\.some\(\(paragraph\) => paragraph\.trim\(\)\)/);
  assert.match(landing, /href=\{hasAboutStory \? "#about" : "#insta"\}/);
  assert.match(landing, /\{hasAboutStory \? \(/);
});

test("keeps the public email affordance guarded until its recipient is configured", async () => {
  const [landing, defaults] = await Promise.all([
    readFile("app/components/Landing.tsx", "utf8"),
    readFile("lib/db.ts", "utf8"),
  ]);

  assert.match(landing, /\{c\.contactEmail \? \(/);
  assert.match(landing, /href=\{`mailto:\$\{c\.contactEmail\}`\}/);
  assert.match(defaults, /contactEmail:\s*""/);
});

test("includes the about story in both site navigation surfaces", async () => {
  const [landing, dots, palette, labels] = await Promise.all([
    readFile("app/components/Landing.tsx", "utf8"),
    readFile("app/components/features/SectionNavDots.tsx", "utf8"),
    readFile("app/components/features/CommandPalette.tsx", "utf8"),
    readFile("lib/feature-labels.ts", "utf8"),
  ]);

  const aboutPosition = landing.indexOf("hasAboutStory ? (");
  const photosPosition = landing.indexOf('<section className="pane pane-insta"');
  assert.ok(aboutPosition >= 0 && aboutPosition < photosPosition, "about story must render before photos");
  assert.match(landing, /href=\{hasAboutStory \? "#about" : "#insta"\} className="scroll-cue"/);

  const orderedIds = /"vision",\s*"about",\s*"insta"/s;
  assert.match(dots, orderedIds);
  assert.match(palette, orderedIds);
  assert.match(labels, /sectionNav:\s*\{[\s\S]*?about:\s*"About us"/);
  assert.match(labels, /commandPalette:[\s\S]*?sections:\s*\{[\s\S]*?about:\s*"About us"/);
});
