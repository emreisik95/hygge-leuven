"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  asString,
  encodeErrors,
  validatePriceRaw,
  validateImageFile,
  type FieldError,
} from "@/lib/validation";
import {
  persistImage,
  rawImageFilename,
  readValidatedImage,
  unlinkByUrl,
  UPLOAD_URL_BASE,
} from "@/lib/images";
import { encodeUndo } from "@/lib/undo";

function redirectErrors(errors: FieldError[], scope: string): never {
  redirect(`/admin/menu?errors=${encodeErrors(errors)}&errScope=${encodeURIComponent(scope)}`);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function categoryNamespace(slug: string) {
  return `menu.category.${slug}`;
}

function itemNameNamespace(id: number) {
  return `menu.item.${id}.name`;
}

function itemDescriptionNamespace(id: number) {
  return `menu.item.${id}.description`;
}

function revalidateMenu() {
  revalidatePath("/");
  revalidatePath("/admin/menu");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const slugRaw = asString(formData.get("slug")).trim();
  const labelEn = asString(formData.get("labelEn")).trim();
  if (!slugRaw && !labelEn) {
    redirectErrors([{ field: "labelEn", message: "Label or slug required" }], "createCategory");
  }
  const slug = slugify(slugRaw || labelEn);
  if (!slug) {
    redirectErrors([{ field: "slug", message: "Invalid slug" }], "createCategory");
  }

  const sortRaw = formData.get("sortOrder");
  const sortOrder = typeof sortRaw === "string" && sortRaw.trim() !== ""
    ? parseInt(sortRaw, 10) || 0
    : (await prisma.menuCategory.count()) * 10;

  const cat = await prisma.menuCategory.upsert({
    where: { slug },
    create: { slug, sortOrder },
    update: { sortOrder },
  });

  if (labelEn) {
    await prisma.translation.upsert({
      where: { namespace_locale: { namespace: categoryNamespace(slug), locale: "EN" } },
      create: { namespace: categoryNamespace(slug), locale: "EN", value: labelEn },
      update: { value: labelEn },
    });
  }

  await logAudit({
    action: "menu.category.upsert",
    entity: "MenuCategory",
    entityId: cat.id,
    diff: { slug, sortOrder, labelEn: labelEn || null },
  });

  revalidateMenu();
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = parseInt(asString(formData.get("id")), 10);
  if (!Number.isFinite(id)) throw new Error("Invalid id");

  const cat = await prisma.menuCategory.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!cat) return;

  const labelRow = await prisma.translation.findUnique({
    where: { namespace_locale: { namespace: categoryNamespace(cat.slug), locale: "EN" } },
  });
  const undoEligible = cat.items.length === 0;

  // Hard delete items (and their translations + photos).
  for (const item of cat.items) {
    await deleteItemInternal(item.id);
  }
  await prisma.translation.deleteMany({ where: { namespace: categoryNamespace(cat.slug) } });
  await prisma.menuCategory.delete({ where: { id } });
  await logAudit({
    action: "menu.category.delete",
    entity: "MenuCategory",
    entityId: id,
    diff: { slug: cat.slug, removedItemCount: cat.items.length },
  });
  revalidateMenu();

  if (undoEligible) {
    const undo = encodeUndo({
      kind: "menuCategory",
      data: { slug: cat.slug, sortOrder: cat.sortOrder, labelEn: labelRow?.value ?? "" },
    });
    redirect(
      `/admin/menu?undo=${undo}&undoMsg=${encodeURIComponent(`Category "${labelRow?.value ?? cat.slug}" deleted`)}`,
    );
  }
}

export async function createItem(formData: FormData) {
  await requireAdmin();
  const categoryId = parseInt(asString(formData.get("categoryId")), 10);
  if (!Number.isFinite(categoryId)) throw new Error("Invalid category");

  // Guard against a dangling FK: the category could have been deleted (e.g. in
  // another tab) between page render and form submit. Without this the item
  // would be created pointing at a non-existent category.
  const category = await prisma.menuCategory.findUnique({ where: { id: categoryId } });
  if (!category) throw new Error(`Category ${categoryId} no longer exists`);

  const nameEn = asString(formData.get("nameEn")).trim();
  const descriptionEn = asString(formData.get("descriptionEn")).trim();
  const priceRaw = asString(formData.get("price"));
  const priceParse = validatePriceRaw(priceRaw);

  const errors: FieldError[] = [];
  if (!nameEn) errors.push({ field: `newItem-${categoryId}-nameEn`, message: "Required" });
  if ("error" in priceParse) {
    errors.push({ field: `newItem-${categoryId}-price`, message: priceParse.error });
  }
  if (errors.length > 0) redirectErrors(errors, `createItem-${categoryId}`);
  const priceCents = (priceParse as { cents: number }).cents;

  const tail = await prisma.menuItem.findFirst({
    where: { categoryId },
    orderBy: { sortOrder: "desc" },
  });
  const sortOrder = (tail?.sortOrder ?? -10) + 10;

  const item = await prisma.menuItem.create({
    data: { categoryId, priceCents, sortOrder },
  });

  await prisma.translation.upsert({
    where: { namespace_locale: { namespace: itemNameNamespace(item.id), locale: "EN" } },
    create: { namespace: itemNameNamespace(item.id), locale: "EN", value: nameEn },
    update: { value: nameEn },
  });

  if (descriptionEn) {
    await prisma.translation.upsert({
      where: { namespace_locale: { namespace: itemDescriptionNamespace(item.id), locale: "EN" } },
      create: { namespace: itemDescriptionNamespace(item.id), locale: "EN", value: descriptionEn },
      update: { value: descriptionEn },
    });
  }

  await logAudit({
    action: "menu.item.create",
    entity: "MenuItem",
    entityId: item.id,
    diff: { categoryId, nameEn, descriptionEn: descriptionEn || null, priceCents, sortOrder },
  });

  revalidateMenu();
}

export async function updateItem(formData: FormData) {
  await requireAdmin();
  const id = parseInt(asString(formData.get("id")), 10);
  if (!Number.isFinite(id)) throw new Error("Invalid id");

  const data: { priceCents?: number; available?: boolean; sortOrder?: number } = {};

  const priceRaw = asString(formData.get("price"));
  if (priceRaw.trim() !== "") {
    const parsed = validatePriceRaw(priceRaw);
    if ("error" in parsed) {
      redirectErrors([{ field: `item-${id}-price`, message: parsed.error }], `updateItem-${id}`);
    }
    data.priceCents = parsed.cents;
  }
  // Checkboxes: present-only-when-checked semantics.
  data.available = formData.get("available") === "on";

  const sortRaw = formData.get("sortOrder");
  if (typeof sortRaw === "string" && sortRaw.trim() !== "") {
    const n = parseInt(sortRaw, 10);
    if (Number.isFinite(n)) data.sortOrder = n;
  }

  const nameEn = formData.get("nameEn");
  if (typeof nameEn === "string") {
    const v = nameEn.trim();
    if (v) {
      await prisma.translation.upsert({
        where: { namespace_locale: { namespace: itemNameNamespace(id), locale: "EN" } },
        create: { namespace: itemNameNamespace(id), locale: "EN", value: v },
        update: { value: v },
      });
    }
  }

  const descriptionEn = formData.get("descriptionEn");
  if (typeof descriptionEn === "string") {
    const v = descriptionEn.trim();
    if (v) {
      await prisma.translation.upsert({
        where: { namespace_locale: { namespace: itemDescriptionNamespace(id), locale: "EN" } },
        create: { namespace: itemDescriptionNamespace(id), locale: "EN", value: v },
        update: { value: v },
      });
    } else {
      await prisma.translation.deleteMany({
        where: { namespace: itemDescriptionNamespace(id) },
      });
    }
  }

  const before = await prisma.menuItem.findUnique({ where: { id } });
  const after = await prisma.menuItem.update({ where: { id }, data });
  await logAudit({
    action: "menu.item.update",
    entity: "MenuItem",
    entityId: id,
    before: before ? { priceCents: before.priceCents, available: before.available, sortOrder: before.sortOrder } : undefined,
    after: { priceCents: after.priceCents, available: after.available, sortOrder: after.sortOrder },
  });
  revalidateMenu();
}

async function deleteItemInternal(id: number) {
  // Remove the linked photo file + row (best-effort; ignore FS errors).
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) return;
  if (item.photoId) {
    const photo = await prisma.photo.findUnique({ where: { id: item.photoId } });
    await unlinkByUrl(photo?.path);
    await prisma.photo.delete({ where: { id: item.photoId } }).catch(() => {});
  }
  await prisma.translation.deleteMany({
    where: {
      OR: [
        { namespace: itemNameNamespace(id) },
        { namespace: itemDescriptionNamespace(id) },
      ],
    },
  });
  await prisma.menuItem.delete({ where: { id } });
}

export async function deleteItem(formData: FormData) {
  await requireAdmin();
  const id = parseInt(asString(formData.get("id")), 10);
  if (!Number.isFinite(id)) throw new Error("Invalid id");

  // Snapshot before delete so we can offer Undo (does NOT restore the photo).
  const item = await prisma.menuItem.findUnique({ where: { id } });
  const nameRow = item
    ? await prisma.translation.findUnique({
        where: { namespace_locale: { namespace: itemNameNamespace(id), locale: "EN" } },
      })
    : null;
  const descRow = item
    ? await prisma.translation.findUnique({
        where: { namespace_locale: { namespace: itemDescriptionNamespace(id), locale: "EN" } },
      })
    : null;

  await deleteItemInternal(id);
  await logAudit({
    action: "menu.item.delete",
    entity: "MenuItem",
    entityId: id,
  });
  revalidateMenu();

  if (item) {
    const undo = encodeUndo({
      kind: "menuItem",
      data: {
        categoryId: item.categoryId,
        priceCents: item.priceCents,
        sortOrder: item.sortOrder,
        available: item.available,
        nameEn: nameRow?.value ?? "",
        descriptionEn: descRow?.value ?? "",
      },
    });
    redirect(
      `/admin/menu?undo=${undo}&undoMsg=${encodeURIComponent(`Item "${nameRow?.value ?? "(unnamed)"}" deleted`)}`,
    );
  }
}

export async function moveItem(formData: FormData) {
  await requireAdmin();
  const id = parseInt(String(formData.get("id") ?? ""), 10);
  const dir = String(formData.get("dir") ?? "");
  if (!Number.isFinite(id) || (dir !== "up" && dir !== "down")) {
    throw new Error("Invalid move");
  }
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) return;

  const neighbor = await prisma.menuItem.findFirst({
    where: {
      categoryId: item.categoryId,
      sortOrder: dir === "up" ? { lt: item.sortOrder } : { gt: item.sortOrder },
    },
    orderBy: { sortOrder: dir === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await prisma.$transaction([
    prisma.menuItem.update({ where: { id: item.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.menuItem.update({ where: { id: neighbor.id }, data: { sortOrder: item.sortOrder } }),
  ]);
  await logAudit({
    action: "menu.item.move",
    entity: "MenuItem",
    entityId: item.id,
    diff: { dir, swappedWith: neighbor.id },
  });
  revalidateMenu();
}

export async function uploadItemPhoto(formData: FormData) {
  await requireAdmin();
  const id = parseInt(asString(formData.get("id")), 10);
  if (!Number.isFinite(id)) throw new Error("Invalid id");
  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return;

  const fileErr = validateImageFile(file, { required: true });
  if (fileErr) {
    redirectErrors([{ field: `item-${id}-photo`, message: fileErr }], `uploadItemPhoto-${id}`);
  }

  const altRaw = asString(formData.get("alt")).trim();
  if (!altRaw) {
    redirectErrors([{ field: `item-${id}-alt`, message: "Alt text required" }], `uploadItemPhoto-${id}`);
  }

  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) throw new Error("Item not found");

  // Menu photos keep their original bytes (so animated GIFs keep animating),
  // but still pass the magic-byte check before we write anything.
  const { buffer, mime } = await readValidatedImage(file);
  const filename = rawImageFilename(buffer, mime, "menu-");

  // Snapshot the prior photo; only remove it once the new one is committed.
  const prior = item.photoId
    ? await prisma.photo.findUnique({ where: { id: item.photoId } })
    : null;

  // persistImage rolls back the written file if the DB writes throw.
  await persistImage(filename, buffer, async (url) => {
    const photo = await prisma.photo.create({
      data: { path: url, alt: altRaw, role: "menu_item", refId: id, sortOrder: 0 },
    });
    await prisma.menuItem.update({ where: { id }, data: { photoId: photo.id } });
    await logAudit({
      action: "menu.item.photo.upload",
      entity: "MenuItem",
      entityId: id,
      diff: { photoId: photo.id, path: url, alt: altRaw },
    });
  });

  // New photo is live — now retire the old one (row always; file only if the
  // bytes differ, since identical content yields the same filename we just
  // wrote and the new row now points at it).
  if (prior) {
    if (prior.path !== `${UPLOAD_URL_BASE}/${filename}`) await unlinkByUrl(prior.path);
    await prisma.photo.delete({ where: { id: prior.id } }).catch(() => {});
  }

  revalidateMenu();
}

export async function removeItemPhoto(formData: FormData) {
  await requireAdmin();
  const id = parseInt(asString(formData.get("id")), 10);
  if (!Number.isFinite(id)) throw new Error("Invalid id");
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item?.photoId) return;
  const photo = await prisma.photo.findUnique({ where: { id: item.photoId } });

  // Don't unlink the file yet — the undo flow may need to re-attach it. The
  // photo file lives in UPLOAD_DIR; orphaned files get pruned out-of-band.
  const removedPhotoId = item.photoId;
  await prisma.menuItem.update({ where: { id }, data: { photoId: null } });
  await prisma.photo.delete({ where: { id: item.photoId } }).catch(() => {});
  await logAudit({
    action: "menu.item.photo.remove",
    entity: "MenuItem",
    entityId: id,
    diff: { removedPhotoId },
  });
  revalidateMenu();

  if (photo?.path) {
    const undo = encodeUndo({
      kind: "menuItemPhoto",
      data: { itemId: id, path: photo.path, alt: photo.alt },
    });
    redirect(
      `/admin/menu?undo=${undo}&undoMsg=${encodeURIComponent("Photo removed")}`,
    );
  }
}

export async function reorderItems(formData: FormData) {
  await requireAdmin();
  const ids = asString(formData.get("ids"))
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  if (ids.length === 0) return;

  // Verify all ids belong to the same category to avoid accidental cross-cat swaps.
  const items = await prisma.menuItem.findMany({ where: { id: { in: ids } } });
  if (items.length !== ids.length) throw new Error("Unknown item id in reorder");
  const catSet = new Set(items.map((i) => i.categoryId));
  if (catSet.size !== 1) throw new Error("reorder spans multiple categories");

  await prisma.$transaction(
    ids.map((id, idx) =>
      prisma.menuItem.update({ where: { id }, data: { sortOrder: (idx + 1) * 10 } }),
    ),
  );
  await logAudit({
    action: "menu.item.reorder",
    entity: "MenuItem",
    diff: { categoryId: [...catSet][0], orderedIds: ids },
  });
  revalidateMenu();
}

export async function restoreMenuFromUndo(formData: FormData) {
  await requireAdmin();
  const raw = asString(formData.get("payload"));
  const { decodeUndo } = await import("@/lib/undo");
  const undo = decodeUndo(raw);
  if (!undo) return;

  if (undo.kind === "menuItem") {
    const d = undo.data;
    const item = await prisma.menuItem.create({
      data: {
        categoryId: d.categoryId,
        priceCents: d.priceCents,
        sortOrder: d.sortOrder,
        available: d.available,
      },
    });
    if (d.nameEn) {
      await prisma.translation.upsert({
        where: { namespace_locale: { namespace: itemNameNamespace(item.id), locale: "EN" } },
        create: { namespace: itemNameNamespace(item.id), locale: "EN", value: d.nameEn },
        update: { value: d.nameEn },
      });
    }
    if (d.descriptionEn) {
      await prisma.translation.upsert({
        where: { namespace_locale: { namespace: itemDescriptionNamespace(item.id), locale: "EN" } },
        create: { namespace: itemDescriptionNamespace(item.id), locale: "EN", value: d.descriptionEn },
        update: { value: d.descriptionEn },
      });
    }
    await logAudit({
      action: "menu.item.restore",
      entity: "MenuItem",
      entityId: item.id,
    });
  } else if (undo.kind === "menuCategory") {
    const d = undo.data;
    const cat = await prisma.menuCategory.upsert({
      where: { slug: d.slug },
      create: { slug: d.slug, sortOrder: d.sortOrder },
      update: { sortOrder: d.sortOrder },
    });
    if (d.labelEn) {
      await prisma.translation.upsert({
        where: { namespace_locale: { namespace: categoryNamespace(d.slug), locale: "EN" } },
        create: { namespace: categoryNamespace(d.slug), locale: "EN", value: d.labelEn },
        update: { value: d.labelEn },
      });
    }
    await logAudit({ action: "menu.category.restore", entity: "MenuCategory", entityId: cat.id });
  } else if (undo.kind === "menuItemPhoto") {
    const d = undo.data;
    const item = await prisma.menuItem.findUnique({ where: { id: d.itemId } });
    if (!item) return;
    const photo = await prisma.photo.create({
      data: { path: d.path, alt: d.alt, role: "menu_item", refId: d.itemId, sortOrder: 0 },
    });
    await prisma.menuItem.update({ where: { id: d.itemId }, data: { photoId: photo.id } });
    await logAudit({
      action: "menu.item.photo.restore",
      entity: "MenuItem",
      entityId: d.itemId,
    });
  }
  revalidateMenu();
  redirect("/admin/menu");
}

export async function seedDefaultCategories() {
  await requireAdmin();
  const defaults: { slug: string; labelEn: string; sortOrder: number }[] = [
    { slug: "coffee", labelEn: "Coffee", sortOrder: 10 },
    { slug: "pastry", labelEn: "Pastry", sortOrder: 20 },
    { slug: "lunch", labelEn: "Lunch", sortOrder: 30 },
  ];
  for (const d of defaults) {
    await prisma.menuCategory.upsert({
      where: { slug: d.slug },
      create: { slug: d.slug, sortOrder: d.sortOrder },
      update: {},
    });
    await prisma.translation.upsert({
      where: { namespace_locale: { namespace: categoryNamespace(d.slug), locale: "EN" } },
      create: { namespace: categoryNamespace(d.slug), locale: "EN", value: d.labelEn },
      update: {},
    });
  }
  await logAudit({
    action: "menu.seed",
    entity: "MenuCategory",
    diff: { slugs: defaults.map((d) => d.slug) },
  });
  revalidateMenu();
}
