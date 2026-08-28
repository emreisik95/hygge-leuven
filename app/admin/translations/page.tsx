import {
  prisma,
  siteTextNamespace,
  SITE_TEXT_DEFAULTS,
  SITE_TEXT_FIELDS,
} from "@/lib/db";
import { ANNOUNCEMENT_NS, FEATURE_LABELS } from "@/lib/feature-labels";
import { LOCALES, LOCALE_LABELS, LOCALE_NAMES, type LocaleCode } from "@/lib/locale";
import { updateTranslations } from "./actions";
import { decodeErrors } from "@/lib/validation";
import { CountedTextarea } from "../components/CountedTextarea";
import { SubmitButton } from "../ui/SubmitButton";
import { Flash } from "../ui/Flash";
import { AdminActionDock } from "../components/AdminActionDock";
import { AdminPageIntro } from "../components/AdminPageIntro";
import { AdminSectionNav } from "../components/AdminSectionNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Translations — hygge" };

type Group = {
  title: string;
  namespaces: { namespace: string; label: string; defaultEn?: string }[];
};

function humanizeField(field: string): string {
  const spaced = field.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function groupId(title: string): string {
  return `translations-${title.toLowerCase().replace(/\s+/g, "-")}`;
}

async function buildExpectedGroups(): Promise<Group[]> {
  const siteGroup: Group = {
    title: "Site copy",
    namespaces: SITE_TEXT_FIELDS.map((field) => ({
      namespace: siteTextNamespace(field),
      label: humanizeField(field),
      defaultEn: SITE_TEXT_DEFAULTS[field],
    })),
  };

  const menuItems = await prisma.menuItem.findMany({
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const menuGroup: Group = {
    title: "Menu items",
    namespaces: menuItems.map((m) => ({
      namespace: `menu.item.${m.id}.name`,
      label: `Item #${m.id} — name`,
    })),
  };

  const featuresGroup: Group = {
    title: "Features",
    namespaces: [{
      namespace: ANNOUNCEMENT_NS,
      label: "Announcement banner",
      defaultEn: FEATURE_LABELS.announcement.message,
    }],
  };

  const groups = [siteGroup, featuresGroup];
  if (menuGroup.namespaces.length > 0) groups.push(menuGroup);
  return groups;
}

async function loadTranslationMap(namespaces: string[]) {
  if (namespaces.length === 0) return new Map<string, Partial<Record<LocaleCode, string>>>();
  const rows = await prisma.translation.findMany({
    where: { namespace: { in: namespaces } },
  });
  const map = new Map<string, Partial<Record<LocaleCode, string>>>();
  for (const r of rows) {
    const slot = map.get(r.namespace) ?? {};
    slot[r.locale as LocaleCode] = r.value;
    map.set(r.namespace, slot);
  }
  return map;
}

export default async function TranslationsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; errors?: string }>;
}) {
  const { saved, errors: errorsRaw } = await searchParams;
  const errors = decodeErrors(errorsRaw);

  const groups = await buildExpectedGroups();
  const allNamespaces = groups.flatMap((g) => g.namespaces.map((n) => n.namespace));
  const valuesByNs = await loadTranslationMap(allNamespaces);

  return (
    <>
      <AdminPageIntro
        ticket="08 / Three languages"
        title="Translations"
        description="Edit English, Dutch, and French public copy in one place."
        icon="/admin/icons/translations.png"
        breadcrumb={{ href: "/admin/more", label: "More" }}
        status={<span className="admin-ticket-status">{allNamespaces.length} text fields</span>}
      />

      {saved ? <Flash kind="ok">Saved.</Flash> : null}
      {Object.keys(errors).length > 0 ? (
        <Flash kind="err">Some fields need attention — see the highlighted rows.</Flash>
      ) : null}

      <div className="tx-language-legend" aria-label="Translation languages">
        {LOCALES.map((code) => (
          <div key={code}>
            <strong>{LOCALE_LABELS[code]}</strong>
            <span>{LOCALE_NAMES[code]}</span>
            <small>{code === "EN" ? "Live fallback" : "Falls back to English when empty"}</small>
          </div>
        ))}
      </div>

      <AdminSectionNav
        items={groups.map((group) => ({
          href: `#${groupId(group.title)}`,
          label: group.title,
          meta: String(group.namespaces.length),
        }))}
        ariaLabel="Translation groups"
      />

      <p className="hint tx-fallback-note">
        Empty Dutch or French fields fall back to English. Clearing built-in English copy restores its original default.
      </p>

      {groups.map((group) => {
        const groupNs = group.namespaces.map((n) => n.namespace).join("\n");
        return (
          <form
            key={group.title}
            action={updateTranslations}
            aria-label={`${group.title} translations`}
            className="section tx-section"
            id={groupId(group.title)}
          >
            <div className="tx-section-heading">
              <div>
                <p className="admin-eyebrow">{group.namespaces.length} fields</p>
                <h2>{group.title}</h2>
              </div>
              <span className="admin-ticket-status">EN · NL · FR</span>
            </div>
            <input type="hidden" name="namespaces" value={groupNs} />

            <div className="tx-table" role="table" aria-label={`${group.title} table`}>
              <div className="tx-row tx-head" role="row">
                <div className="tx-cell tx-key" role="columnheader">Key</div>
                {LOCALES.map((code) => (
                  <div key={code} className="tx-cell" role="columnheader">
                    <span aria-label={LOCALE_NAMES[code]}>{LOCALE_LABELS[code]}</span>
                  </div>
                ))}
              </div>

              {group.namespaces.map(({ namespace, label, defaultEn }) => {
                const values = valuesByNs.get(namespace) ?? {};
                return (
                  <div key={namespace} className="tx-row" role="row">
                    <div className="tx-cell tx-key" role="cell">
                      <div className="tx-key-label">{label}</div>
                      <div className="tx-key-ns">{namespace}</div>
                    </div>
                    {LOCALES.map((code) => {
                      const fieldId = `tx-${namespace.replace(/\W+/g, "-")}-${code}`;
                      const fieldName = `tx::${namespace}::${code}`;
                      const value = values[code] ?? (code === "EN" ? defaultEn ?? "" : "");
                      const rowsAttr = Math.max(2, Math.min(8, Math.ceil((value.length || 1) / 48)));
                      return (
                        <div key={code} className="tx-cell" role="cell">
                          <span className="tx-locale-label">
                            {LOCALE_LABELS[code]} · {LOCALE_NAMES[code]}
                          </span>
                          <label htmlFor={fieldId} className="sr-only">
                            {label} — {LOCALE_NAMES[code]}
                          </label>
                          <CountedTextarea
                            id={fieldId}
                            name={fieldName}
                            defaultValue={value}
                            rows={rowsAttr}
                            lang={code.toLowerCase()}
                            className="tx-textarea"
                            error={errors[fieldName]}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <AdminActionDock label={`${group.title} actions`}>
              <p className="admin-action-dock-copy">Only this translation group will be saved.</p>
              <SubmitButton pendingLabel="Saving…">Save {group.title}</SubmitButton>
            </AdminActionDock>
          </form>
        );
      })}
    </>
  );
}
