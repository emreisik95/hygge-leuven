import { loadFlags, FLAG_REGISTRY, type FlagGroup, type FlagMeta, type FlagKey } from "@/lib/flags";
import { updateFlags } from "./actions";
import { getFeatureSettingsForAdmin, type AdminSettingGroup } from "@/lib/feature-settings";
import { Toggle } from "../ui/fields";
import { SubmitButton } from "../ui/SubmitButton";
import { Flash } from "../ui/Flash";
import { FeaturePreview } from "./FeaturePreview";
import { FeatureSettingsEditor } from "./FeatureSettingsEditor";
import { AdminActionDock } from "../components/AdminActionDock";
import { AdminPageIntro } from "../components/AdminPageIntro";
import { AdminSectionNav } from "../components/AdminSectionNav";

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
      <AdminPageIntro
        ticket="09 / Feature board"
        title="Features"
        description="Choose what guests can see, then edit the copy behind each optional experience."
        icon="/admin-icons/features.png"
        breadcrumb={{ href: "/admin/more", label: "More" }}
        status={<span className="admin-ticket-status" data-tone="live">{enabledCount} of {FLAG_REGISTRY.length} enabled</span>}
      />

      {params.saved ? <Flash kind="ok">Features updated.</Flash> : null}
      {params.error === "invalid" ? (
        <Flash kind="err">Some settings were invalid (too long or malformed) — not saved.</Flash>
      ) : null}
      {params.error === "bad_items" ? (
        <Flash kind="err">Could not read the list items — not saved.</Flash>
      ) : null}

      <AdminSectionNav
        items={[
          ...GROUP_ORDER.map((group) => ({ href: `#features-${group.toLowerCase()}`, label: group })),
          { href: "#feature-preview", label: "Preview" },
          { href: "#feature-copy", label: "Content & copy" },
        ]}
        ariaLabel="Feature workspace"
      />

      <form action={updateFlags} aria-label="Feature flags" className="features-flag-form">
        <section className="section features-board-intro">
          <div>
            <p className="admin-eyebrow">Visibility board</p>
            <h2>Live feature switches</h2>
          </div>
          <p className="hint">
            Turn optional landing-page features on or off. Saved changes take effect immediately.
          </p>
        </section>

        {GROUP_ORDER.map((group) => {
          const items = byGroup.get(group);
          if (!items || items.length === 0) return null;
          return (
            <section className="section feature-flag-group" id={`features-${group.toLowerCase()}`} key={group}>
              <div className="feature-group-heading">
                <h2>{group}</h2>
                <span className="admin-ticket-status">{items.filter((meta) => flags[meta.key]).length} on</span>
              </div>
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

        <AdminActionDock>
          <p className="admin-action-dock-copy">Save all visibility switches together.</p>
          <SubmitButton pendingLabel="Saving…">Save features</SubmitButton>
        </AdminActionDock>
      </form>

      <div id="feature-preview" className="feature-preview-anchor">
        <FeaturePreview />
      </div>

      <section id="feature-copy" className="features-copy-intro">
        <p className="admin-eyebrow">Words behind the switches</p>
        <h2>Content &amp; copy</h2>
        <p className="hint">
          Edit each feature without leaving this page. Saving updates its content immediately;
          use the switches above to decide whether visitors see it.
        </p>
      </section>

      {GROUP_ORDER.map((group) => {
        const groups = settingsByGroup.get(group);
        if (!groups || groups.length === 0) return null;
        return (
          <section className="settings-group" id={`feature-copy-${group.toLowerCase()}`} key={`set-${group}`}>
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
