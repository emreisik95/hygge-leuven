import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import postcss from "postcss";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const stylesheet = postcss.parse(css);

function rootSelectorSpecificity(selector, { theme, contrast }) {
  const matches = selector.split(",").flatMap((part) => {
    const candidate = part.trim();
    if (!/^(?::root|html)(?:\[[^\]]+\])*$/.test(candidate)) return [];

    const wantsDark = candidate.includes('data-theme="dark"');
    const wantsHighContrast = candidate.includes('data-contrast="high"');
    const matchesState =
      (!wantsDark || theme === "dark") &&
      (!wantsHighContrast || contrast);
    if (!matchesState) return [];

    const attributes = candidate.match(/\[[^\]]+\]/g)?.length ?? 0;
    const pseudoClasses = candidate.startsWith(":root") ? 1 : 0;
    const elements = candidate.startsWith("html") ? 1 : 0;
    return [(attributes + pseudoClasses) * 10 + elements];
  });
  return matches.length > 0 ? Math.max(...matches) : -1;
}

function resolveVariable(value, variables, seen = new Set()) {
  const match = value.trim().match(/^var\((--[\w-]+)(?:,\s*(.+))?\)$/);
  if (!match) return value.trim();

  const name = match[1];
  assert.ok(!seen.has(name), `circular CSS variable reference: ${name}`);
  const next = variables.has(name) ? variables.get(name) : match[2];
  assert.ok(next, `missing CSS variable: ${name}`);
  return resolveVariable(next, variables, new Set([...seen, name]));
}

function paletteFor(state, inlineVariables = new Map()) {
  const variables = new Map();
  let sourceOrder = 0;
  stylesheet.walkRules((rule) => {
    const specificity = rootSelectorSpecificity(rule.selector, state);
    if (specificity < 0) return;
    rule.walkDecls(/^--/, (declaration) => {
      sourceOrder += 1;
      const current = variables.get(declaration.prop);
      if (
        !current ||
        specificity > current.specificity ||
        (specificity === current.specificity && sourceOrder > current.sourceOrder)
      ) {
        variables.set(declaration.prop, {
          value: declaration.value,
          specificity,
          sourceOrder,
        });
      }
    });
  });
  for (const [name, value] of inlineVariables) {
    variables.set(name, { value, specificity: 1000, sourceOrder: ++sourceOrder });
  }
  const values = new Map(
    [...variables].map(([name, declaration]) => [name, declaration.value]),
  );
  return Object.fromEntries(
    [...values].map(([name, value]) => [name, resolveVariable(value, values)]),
  );
}

function relativeLuminance(hex) {
  assert.match(hex, /^#[0-9a-f]{6}$/i, `expected an opaque hex colour, got ${hex}`);
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first, second) {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

test("the visitor high-contrast mode stays highly legible in both themes", () => {
  for (const theme of ["light", "dark"]) {
    const palette = paletteFor({ theme, contrast: true });

    for (const foreground of ["--ink", "--tan", "--rule", "--rule-strong"]) {
      assert.ok(
        contrastRatio(palette[foreground], palette["--bg"]) >= 7,
        `${theme} ${foreground} must reach 7:1 against --bg`,
      );
    }

    assert.ok(
      contrastRatio(palette["--on-accent"], palette["--instagram"]) >= 7,
      `${theme} accent content must reach 7:1 against --instagram`,
    );
  }
});

function forcedColorsDeclarations(selector) {
  const declarations = new Map();
  stylesheet.walkAtRules("media", (atRule) => {
    if (!atRule.params.includes("forced-colors: active")) return;
    atRule.walkRules((rule) => {
      if (!rule.selectors?.includes(selector)) return;
      rule.walkDecls((declaration) => {
        declarations.set(declaration.prop, declaration.value);
      });
    });
  });
  return declarations;
}

function declarationsFor(selector) {
  const declarations = new Map();
  stylesheet.walkRules((rule) => {
    if (!rule.selectors?.includes(selector)) return;
    rule.walkDecls((declaration) => {
      declarations.set(declaration.prop, declaration.value);
    });
  });
  return declarations;
}

test("the About illustration keeps non-text contrast in both themes", () => {
  const illustration = declarationsFor(".about-illu");

  assert.equal(illustration.get("background-color"), "var(--tan)");
  assert.match(
    illustration.get("mask") ?? "",
    /url\(\/assets\/illu-hygge-still-line\.png\)/,
    "the transparent illustration must be painted with a theme-aware colour",
  );
  assert.equal(
    illustration.has("opacity"),
    false,
    "extra element opacity must not weaken the already anti-aliased line art",
  );

  for (const theme of ["light", "dark"]) {
    const palette = paletteFor({ theme, contrast: false });
    assert.ok(
      contrastRatio(palette["--tan"], palette["--bg"]) >= 7,
      `${theme} About line art must exceed 7:1 at its solid strokes`,
    );
  }
});

test("native forced-colors keeps masked art and fill-only controls visible", () => {
  assert.equal(
    forcedColorsDeclarations(".people").get("background-color"),
    "CanvasText",
    "the masked hero illustration must use the visitor's system text colour",
  );
  assert.equal(
    forcedColorsDeclarations(".about-illu").get("background-color"),
    "CanvasText",
    "the masked About illustration must use the visitor's system text colour",
  );
  assert.equal(
    forcedColorsDeclarations(".btn-primary").get("border-color"),
    "LinkText",
    "primary links need a visible boundary when their background is forced away",
  );
  assert.equal(
    forcedColorsDeclarations(".scroll-progress-bar").get("background"),
    "Highlight",
    "the progress indicator must survive forced background colours",
  );
});

test("the seasonal accent yields to the visitor high-contrast palette", async () => {
  let seasonalAccentModule = {};
  try {
    seasonalAccentModule = await import("../lib/seasonal-accent.ts");
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND") throw error;
  }

  assert.equal(
    typeof seasonalAccentModule.applySeasonalAccent,
    "function",
    "SeasonalAccent needs a testable preference helper",
  );

  const inlineVariables = new Map();
  const style = {
    setProperty(name, value) {
      inlineVariables.set(name, value);
    },
    removeProperty(name) {
      inlineVariables.delete(name);
    },
  };
  const cleanup = seasonalAccentModule.applySeasonalAccent(style, 6);

  assert.equal(
    paletteFor({ theme: "light", contrast: false }, inlineVariables)["--instagram"],
    "#b3622a",
    "summer keeps its terracotta accent outside high-contrast mode",
  );

  const highContrast = paletteFor(
    { theme: "light", contrast: true },
    inlineVariables,
  );
  assert.equal(highContrast["--instagram"], highContrast["--ink"]);
  assert.ok(
    contrastRatio(highContrast["--on-accent"], highContrast["--instagram"]) >= 7,
  );

  cleanup();
  assert.equal(inlineVariables.has("--seasonal-accent"), false);
});
