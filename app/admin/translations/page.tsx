import { prisma, siteTextNamespace, SITE_TEXT_FIELDS } from "@/lib/db";
import { LOCALES, LOCALE_LABELS, LOCALE_NAMES, type LocaleCode } from "@/lib/locale";
import { updateTranslations } from "./actions";
import { decodeErrors } from "@/lib/validation";
import { CountedTextarea } from "../components/CountedTextarea";
import { SubmitButton } from "../ui/SubmitButton";
import { Flash } from "../ui/Flash";

export const dynamic = "force-dynamic";
export const metadata = { title: "Translations — hygge" };

type Group = {
  title: string;
  namespaces: { namespace: string; label: string }[];
};

async function buildExpectedGroups(): Promise<Group[]> {
  const siteGroup: Group = {
    title: "Site copy",
    namespaces: SITE_TEXT_FIELDS.map((field) => ({
      namespace: siteTextNamespace(field),
      label: field,
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

  const groups = [siteGroup];
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
      {saved ? <Flash kind="ok">Saved.</Flash> : null}
      {Object.keys(errors).length > 0 ? (
        <Flash kind="err">Some fields need attention — see the highlighted rows.</Flash>
      ) : null}

      <p className="hint" style={{ marginBottom: 16 }}>
        Empty NL/FR fields fall back to EN at render time. Clear a field to remove the override.
      </p>

      {groups.map((group) => {
        const groupNs = group.namespaces.map((n) => n.namespace).join("\n");
        return (
          <form
            key={group.title}
            action={updateTranslations}
            aria-label={`${group.title} translations`}
            className="section"
          >
            <h2>{group.title}</h2>
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

              {group.namespaces.map(({ namespace, label }) => {
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
                      const value = values[code] ?? "";
                      const rowsAttr = Math.max(2, Math.min(8, Math.ceil((value.length || 1) / 48)));
                      return (
                        <div key={code} className="tx-cell" role="cell">
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

            <SubmitButton pendingLabel="Saving…">Save {group.title}</SubmitButton>
          </form>
        );
      })}
    </>
  );
}
