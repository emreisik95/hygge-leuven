"use client";

import { useId, useState } from "react";
import { updateFeatureSettings } from "./actions";
import { SubmitButton } from "../ui/SubmitButton";
import type { AdminSettingGroup, ListSubField } from "@/lib/feature-settings";

// Inline editor for one feature's copy + content, rendered on the Features page
// so an admin can tweak settings without leaving. Scalar fields post as
// `f::<name>`; list rows are kept in React state and serialized into a single
// hidden `items` JSON field on submit.
export function FeatureSettingsEditor({
  group,
  open,
}: {
  group: AdminSettingGroup;
  open?: boolean;
}) {
  const baseId = useId();
  const initialItems = Array.isArray(group.values.items)
    ? (group.values.items as Record<string, string>[])
    : [];
  const [items, setItems] = useState<Record<string, string>[]>(initialItems);

  const list = group.list;

  function updateItem(i: number, name: string, value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [name]: value } : it)));
  }
  function addItem() {
    if (!list) return;
    const blank: Record<string, string> = {};
    for (const f of list.fields) blank[f.name] = "";
    setItems((prev) => [...prev, blank]);
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <details className="section feature-settings" id={group.flag} open={open}>
      <summary className="feature-settings-summary">
        <span className="feature-settings-title">{group.title}</span>
        <span className="feature-settings-meta">
          {list ? `${items.length} ${list.itemNoun}${items.length === 1 ? "" : "s"} · ` : ""}edit
        </span>
      </summary>

      <form action={updateFeatureSettings} className="feature-settings-form">
        <input type="hidden" name="flag" value={group.flag} />
        {group.blurb ? <p className="hint">{group.blurb}</p> : null}

        {group.fields.map((f) => {
          const fieldId = `${baseId}-${f.name}`;
          const value = typeof group.values[f.name] === "string" ? (group.values[f.name] as string) : "";
          return (
            <div className="field" key={f.name}>
              <label htmlFor={fieldId}>{f.label}</label>
              {f.kind === "textarea" ? (
                <textarea id={fieldId} name={`f::${f.name}`} defaultValue={value} rows={3} />
              ) : (
                <input id={fieldId} type="text" name={`f::${f.name}`} defaultValue={value} />
              )}
              {f.hint ? <span className="hint">{f.hint}</span> : null}
            </div>
          );
        })}

        {list ? (
          <div className="settings-list">
            <input type="hidden" name="items" value={JSON.stringify(items)} />
            {items.map((item, i) => (
              <div className="settings-list-row" key={i}>
                <div className="settings-list-fields">
                  {list.fields.map((sf: ListSubField) => {
                    const id = `${baseId}-${i}-${sf.name}`;
                    return (
                      <div className="field" key={sf.name}>
                        <label htmlFor={id}>{sf.label}</label>
                        {sf.kind === "textarea" ? (
                          <textarea
                            id={id}
                            rows={2}
                            value={item[sf.name] ?? ""}
                            onChange={(e) => updateItem(i, sf.name, e.target.value)}
                          />
                        ) : (
                          <input
                            id={id}
                            type="text"
                            value={item[sf.name] ?? ""}
                            onChange={(e) => updateItem(i, sf.name, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="settings-list-actions">
                  <button type="button" className="btn-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                  <button type="button" className="btn-icon" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
                  <button type="button" className="link-danger" onClick={() => removeItem(i)}>remove</button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-secondary-inline"
              onClick={addItem}
              disabled={items.length >= list.max}
            >
              + Add {list.itemNoun}
            </button>
          </div>
        ) : null}

        <SubmitButton pendingLabel="Saving…">Save {group.title}</SubmitButton>
      </form>
    </details>
  );
}
