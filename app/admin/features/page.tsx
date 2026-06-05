import { loadFlags, FLAG_REGISTRY, type FlagGroup, type FlagMeta, type FlagKey } from "@/lib/flags";
import { updateFlags } from "./actions";
import { getFeatureSettingsForAdmin, type AdminSettingGroup } from "@/lib/feature-settings";
import { Toggle } from "../ui/fields";
import { SubmitButton } from "../ui/SubmitButton";
import { Flash } from "../ui/Flash";
import { FeaturePreview } from "./FeaturePreview";
import { FeatureSettingsEditor } from "./FeatureSettingsEditor";

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
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [flags, settings, params] = await Promise.all([
    loadFlags(),
    getFeatureSettingsForAdmin(),
    searchParams,
  ]);
  const enabledCount = FLAG_REGISTRY.filter((f) => flags[f.key]).length;

  const byGroup = new Map<FlagGroup, FlagMeta[]>();
  const groupOfFlag = new Map<FlagKey, FlagGroup>();
  for (const meta of FLAG_REGISTRY) {
    const list = byGroup.get(meta.group) ?? [];
    list.push(meta);
    byGroup.set(meta.group, list);
    groupOfFlag.set(meta.key, meta.group);
  }

  const settingsByGroup = new Map<FlagGroup, AdminSettingGroup[]>();
  for (const s of settings) {
    const g = groupOfFlag.get(s.flag);
    if (!g) continue;
    const list = settingsByGroup.get(g) ?? [];
    list.push(s);
    settingsByGroup.set(g, list);
  }

  return (
    <>
      {params.saved ? <Flash kind="ok">Features updated.</Flash> : null}
      {params.error === "invalid" ? (
        <Flash kind="err">Some settings were invalid (too long or malformed) — not saved.</Flash>
      ) : null}
      {params.error === "bad_items" ? (
        <Flash kind="err">Could not read the list items — not saved.</Flash>
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
                  <Toggle
                    key={meta.key}
                    name={meta.key}
                    label={meta.label}
                    description={meta.description}
                    defaultChecked={flags[meta.key]}
                    className="toggle toggle-feature"
                  />
                ))}
              </div>
            </section>
          );
        })}

        <SubmitButton pendingLabel="Saving…">Save features</SubmitButton>
      </form>

      <FeaturePreview />

      <h2 className="admin-page-heading" style={{ marginTop: 8 }}>content &amp; copy</h2>
      <p className="hint" style={{ marginBottom: 16 }}>
        Edit the text and content for each feature here — no need to leave the page. Saving a
        feature updates the live site immediately (enable its toggle above to show it).
      </p>

      {GROUP_ORDER.map((group) => {
        const groups = settingsByGroup.get(group);
        if (!groups || groups.length === 0) return null;
        return (
          <section className="settings-group" key={`set-${group}`}>
            <h3 className="settings-group-heading">{group}</h3>
            {groups.map((g) => (
              <FeatureSettingsEditor key={g.flag} group={g} />
            ))}
          </section>
        );
      })}
    </>
  );
}
