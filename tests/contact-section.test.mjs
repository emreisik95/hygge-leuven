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
    /['"]site\.contactEmail['"]\s*,\s*['"]EN['"]\s*,\s*['"]contact@hyggeleuven\.be['"]/,
  );
  assert.match(
    migration,
    /ON CONFLICT\s*\(\s*"namespace"\s*,\s*"locale"\s*\)\s*DO UPDATE/i,
  );
  assert.doesNotMatch(migration, /ADMIN_EMAIL/);
});

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
  const componentPath = "app/components/features/ContactSection.tsx";
  assert.ok(existsSync(componentPath), "ContactSection is missing");
  const component = await readFile(
    componentPath,
    "utf8",
  );

  assert.match(component, /if \(!hasEmail && !hasInstagram\) return null/);
  assert.match(component, /\{hasEmail \? \(/);
  assert.match(component, /\{hasInstagram \? \(/);
});
