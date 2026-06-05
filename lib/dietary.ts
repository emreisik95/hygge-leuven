// Heuristic dietary tags derived from a menu item's name + description. The
// data model has no dietary column, so we infer common markers from keywords.
// Deliberately conservative — a missing tag is better than a wrong one for an
// allergen-adjacent claim, so only explicit words match.

export type DietaryTag = { code: string; label: string };

const RULES: { code: string; label: string; words: RegExp }[] = [
  { code: "vg", label: "Vegan", words: /\b(vegan)\b/i },
  { code: "v", label: "Vegetarian", words: /\b(vegetarian|veggie)\b/i },
  { code: "gf", label: "Gluten-free", words: /\b(gluten[\s-]?free|gf)\b/i },
  { code: "df", label: "Dairy-free", words: /\b(dairy[\s-]?free|oat milk|lactose[\s-]?free)\b/i },
];

// The full set of tags we can infer, in registry order — used by the optional
// allergen legend so the key shown to visitors always matches what dietaryTags
// can actually produce.
export const DIETARY_LEGEND: DietaryTag[] = RULES.map(({ code, label }) => ({ code, label }));

export function dietaryTags(name: string, description: string): DietaryTag[] {
  const hay = `${name} ${description}`;
  const out: DietaryTag[] = [];
  for (const rule of RULES) {
    if (rule.words.test(hay)) out.push({ code: rule.code, label: rule.label });
  }
  return out;
}
