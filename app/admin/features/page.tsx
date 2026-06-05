import { loadFlags, FLAG_REGISTRY, type FlagGroup, type FlagMeta } from "@/lib/flags";
import { updateFlags } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Features — admin — hygge" };

const GROUP_ORDER: FlagGroup[] = ["Chrome", "Engagement", "Content", "Menu", "Commerce"];

const GROUP_BLURB: Record<FlagGroup, string> = {
  Chrome: "Page-wide controls and overlays.",
  Engagement: "Interactive touches that invite visitors to linger.",
  Content: "Extra sections of editorial content.",
  Menu: "Enhancements to the menu section.",
  Commerce: "Calls to action that move toward a visit or sale.",
};

export default async function FeaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [flags, params] = await Promise.all([loadFlags(), searchParams]);
  const enabledCount = FLAG_REGISTRY.filter((f) => flags[f.key]).length;

  const byGroup = new Map<FlagGroup, FlagMeta[]>();
  for (const meta of FLAG_REGISTRY) {
    const list = byGroup.get(meta.group) ?? [];
    list.push(meta);
    byGroup.set(meta.group, list);
  }

  return (
    <>
      {params.saved ? (
        <div className="flash ok" role="status" aria-live="polite">Features updated.</div>
      ) : null}

      <form action={updateFlags} aria-label="Feature flags">
        <section className="section">
          <h2>Features</h2>
          <p className="hint">
            Turn optional landing-page features on or off. Changes take effect immediately on
            the live site once saved. {enabledCount} of {FLAG_REGISTRY.length} enabled.
          </p>
        </section>

        {GROUP_ORDER.map((group) => {
          const items = byGroup.get(group);
          if (!items || items.length === 0) return null;
          return (
            <section className="section" key={group}>
              <h2>{group}</h2>
              <p className="hint">{GROUP_BLURB[group]}</p>
              <div className="visibility-grid">
                {items.map((meta) => (
                  <label className="toggle toggle-feature" htmlFor={meta.key} key={meta.key}>
                    <input
                      id={meta.key}
                      name={meta.key}
                      type="checkbox"
                      defaultChecked={flags[meta.key]}
                    />
                    <span>
                      <strong>{meta.label}</strong>
                      <span className="toggle-desc">{meta.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          );
        })}

        <button type="submit" className="btn-save">Save features</button>
      </form>
    </>
  );
}
