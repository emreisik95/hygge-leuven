// One-off integration helper. Reads a workflow artifact JSON (the `.output`
// file produced by a Workflow run), writes each feature's component file into
// app/components/features/, and appends each feature's cssAppend block to
// app/globals.css. Structured edits to flags.ts / GlobalFeatures / Landing /
// feature-labels are done by hand — this only handles the safe, mechanical
// parts (new files + pure CSS append) so integration stays deterministic and
// free of the parallel-write races that corrupted the tree earlier.
//
// Usage: node scripts/integrate-batch.mjs <artifact.output> <featuresDir> <cssFile> <label>

import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const [, , artifactPath, featuresDir, cssFile, label] = process.argv;
if (!artifactPath || !featuresDir || !cssFile || !label) {
  console.error("usage: node integrate-batch.mjs <artifact> <featuresDir> <cssFile> <label>");
  process.exit(1);
}

const raw = readFileSync(artifactPath, "utf8");
const parsed = JSON.parse(raw);
const features = parsed.result.features;

let cssChunks = `\n\n/* ===================================================================\n   ${label} feature CSS — appended by scripts/integrate-batch.mjs\n   =================================================================== */\n`;

for (const f of features) {
  const file = join(featuresDir, f.componentFileName);
  let src = f.componentSource;
  if (!src.endsWith("\n")) src += "\n";
  writeFileSync(file, src, "utf8");
  console.log(`wrote ${f.componentFileName} (${src.length}b)`);
  if (f.cssAppend && f.cssAppend.trim()) {
    cssChunks += f.cssAppend.endsWith("\n") ? f.cssAppend : f.cssAppend + "\n";
  }
}

appendFileSync(cssFile, cssChunks, "utf8");
console.log(`appended ${cssChunks.length}b CSS to ${cssFile}`);

// Emit the weave snippets so the structured files can be edited by hand.
console.log("\n========== WEAVE SNIPPETS ==========");
for (const f of features) {
  console.log(`\n### ${f.key}  [${f.mountLocation}]  needsCopy=${!!f.needsCopy}`);
  console.log(`import: ${f.importLine}`);
  console.log(`registryLabel: ${f.registryLabel}`);
  console.log(`registryDescription: ${f.registryDescription}`);
  console.log(`mount:\n${f.mountSnippet}`);
  if (f.copyLiteral && f.copyLiteral.trim()) console.log(`copy:\n${f.copyLiteral}`);
  if (f.extraProps && f.extraProps.length) {
    console.log(`extraProps: ${JSON.stringify(f.extraProps)}`);
  }
}
