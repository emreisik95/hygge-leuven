export type MenuLocale = "EN" | "NL" | "FR";
export type MenuItemTextField = "name" | "description" | "origin";

export type MenuTranslationRow = {
  namespace: string;
  locale: MenuLocale;
  value: string;
};

export type MenuItemView = {
  id: number;
  available: boolean;
  sortOrder: number;
  photoId: number | null;
  photoPath: string | null;
  photoAlt: string;
  name: string;
  description: string;
  origin: string;
};

export function categoryTranslationNamespace(slug: string): string {
  return `menu.category.${slug}`;
}

export function itemTranslationNamespace(id: number, field: MenuItemTextField): string {
  return `menu.item.${id}.${field}`;
}

export function itemTranslationNamespaces(id: number): string[] {
  return (["name", "description", "origin"] as const).map((field) =>
    itemTranslationNamespace(id, field),
  );
}

export function pickMenuTranslation(
  rows: MenuTranslationRow[],
  namespace: string,
  locale: MenuLocale,
  fallback: string,
): string {
  let primary: string | undefined;
  let english: string | undefined;
  for (const row of rows) {
    if (row.namespace !== namespace) continue;
    if (row.locale === locale) primary = row.value;
    else if (row.locale === "EN") english = row.value;
  }
  return primary ?? english ?? fallback;
}

export function buildMenuItemView({
  item,
  photo,
  rows,
  locale,
}: {
  item: {
    id: number;
    available: boolean;
    sortOrder: number;
    photoId: number | null;
  };
  photo: { path: string; alt: string } | null;
  rows: MenuTranslationRow[];
  locale: MenuLocale;
}): MenuItemView {
  const namespace = (field: MenuItemTextField) => itemTranslationNamespace(item.id, field);
  return {
    id: item.id,
    available: item.available,
    sortOrder: item.sortOrder,
    photoId: item.photoId,
    photoPath: photo?.path ?? null,
    photoAlt: photo?.alt ?? "",
    name: pickMenuTranslation(rows, namespace("name"), locale, ""),
    description: pickMenuTranslation(rows, namespace("description"), locale, ""),
    origin: pickMenuTranslation(rows, namespace("origin"), locale, ""),
  };
}
