"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import {
  asString,
  encodeErrors,
  validateImageFile,
  type FieldError,
} from "@/lib/validation";
import { encodeUndo, decodeUndo } from "@/lib/undo";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");
const URL_BASE = "/api/uploads";
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_WIDTH = 1600;
const VALID_ROLES = new Set(["background", "hero", "gallery", "menu_item"]);
const ALT_REQUIRED_ROLES = new Set(["hero", "gallery"]);

function redirectErrors(errors: FieldError[], scope: string): never {
  redirect(`/admin/photos?errors=${encodeErrors(errors)}&errScope=${encodeURIComponent(scope)}`);
}

function assertRole(role: string): string {
  if (!VALID_ROLES.has(role)) throw new Error(`Invalid role: ${role}`);
  return role;
}

async function processToWebp(file: File): Promise<{ filename: string; bytes: number }> {
  if (!file || file.size === 0) throw new Error("Empty upload");
  if (file.size > MAX_BYTES) throw new Error("File too large (max 8MB)");
  if (!file.type.startsWith("image/")) throw new Error(`Unsupported type: ${file.type}`);

  const input = Buffer.from(await file.arrayBuffer());
  const webp = await sharp(input)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const hash = crypto.createHash("sha256").update(webp).digest("hex").slice(0, 12);
  const filename = `${hash}.webp`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), webp);
  return { filename, bytes: webp.byteLength };
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/photos");
}

export async function uploadPhoto(formData: FormData) {
  await requireAdmin();
  const role = assertRole(asString(formData.get("role")));
  const alt = asString(formData.get("alt"));
  const file = formData.get("file") as File | null;

  const errors: FieldError[] = [];
  const fileErr = validateImageFile(file, { required: true });
  if (fileErr) errors.push({ field: `upload-${role}-file`, message: fileErr });
  if (ALT_REQUIRED_ROLES.has(role) && !alt.trim()) {
    errors.push({ field: `upload-${role}-alt`, message: "Alt text required for this role" });
  }
  if (errors.length > 0) redirectErrors(errors, `upload-${role}`);
  if (!file) throw new Error("Missing file");

  const { filename } = await processToWebp(file);

  const last = await prisma.photo.findFirst({
    where: { role },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const sortOrder = (last?.sortOrder ?? -1) + 1;

  const created = await prisma.photo.create({
    data: { role, path: `${URL_BASE}/${filename}`, alt, sortOrder },
  });

  await logAudit({
    action: "photo.upload",
    entity: "Photo",
    entityId: created.id,
    diff: { role, path: created.path, alt, sortOrder },
  });

  revalidate();
}

export async function updatePhoto(formData: FormData) {
  await requireAdmin();
  const id = parseInt(asString(formData.get("id")), 10);
  if (!Number.isFinite(id)) throw new Error("Invalid id");

  const data: { alt?: string; role?: string; sortOrder?: number } = {};
  const alt = formData.get("alt");
  const role = formData.get("role");
  const targetRole = typeof role === "string" && role ? assertRole(role) : undefined;
  if (typeof alt === "string") {
    if (targetRole && ALT_REQUIRED_ROLES.has(targetRole) && !alt.trim()) {
      redirectErrors(
        [{ field: `photo-${id}-alt`, message: "Alt text required for this role" }],
        `updatePhoto-${id}`,
      );
    }
    data.alt = alt;
  }
  if (targetRole) data.role = targetRole;
  const sortOrderRaw = formData.get("sortOrder");
  if (typeof sortOrderRaw === "string" && sortOrderRaw.trim() !== "") {
    const n = parseInt(sortOrderRaw, 10);
    if (Number.isFinite(n)) data.sortOrder = n;
  }

  const before = await prisma.photo.findUnique({ where: { id } });
  const after = await prisma.photo.update({ where: { id }, data });
  await logAudit({
    action: "photo.update",
    entity: "Photo",
    entityId: id,
    before: before ? { alt: before.alt, role: before.role, sortOrder: before.sortOrder } : undefined,
    after: { alt: after.alt, role: after.role, sortOrder: after.sortOrder },
  });
  revalidate();
}

export async function deletePhoto(formData: FormData) {
  await requireAdmin();
  const id = parseInt(asString(formData.get("id")), 10);
  if (!Number.isFinite(id)) throw new Error("Invalid id");

  const row = await prisma.photo.findUnique({ where: { id } });
  if (!row) return;

  await prisma.photo.delete({ where: { id } });

  await logAudit({
    action: "photo.delete",
    entity: "Photo",
    entityId: id,
    diff: { role: row.role, path: row.path, alt: row.alt },
  });

  // Keep the underlying file: undo restores by re-creating the row pointing at
  // the same path. Orphaned files left after the undo window expires can be
  // pruned by an out-of-band sweep.
  revalidate();

  const undo = encodeUndo({
    kind: "photo",
    data: { role: row.role, path: row.path, alt: row.alt, sortOrder: row.sortOrder },
  });
  redirect(
    `/admin/photos?undo=${undo}&undoMsg=${encodeURIComponent(`Photo deleted from ${row.role}`)}`,
  );
}

export async function reorderPhotos(formData: FormData) {
  await requireAdmin();
  const ids = asString(formData.get("ids"))
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  if (ids.length === 0) return;

  const rows = await prisma.photo.findMany({ where: { id: { in: ids } } });
  if (rows.length !== ids.length) throw new Error("Unknown photo id in reorder");
  const roleSet = new Set(rows.map((r) => r.role));
  if (roleSet.size !== 1) throw new Error("reorder spans multiple roles");

  await prisma.$transaction(
    ids.map((id, idx) =>
      prisma.photo.update({ where: { id }, data: { sortOrder: idx } }),
    ),
  );
  await logAudit({
    action: "photo.reorder",
    entity: "Photo",
    diff: { role: [...roleSet][0], orderedIds: ids },
  });
  revalidate();
}

export async function restorePhotoFromUndo(formData: FormData) {
  await requireAdmin();
  const raw = asString(formData.get("payload"));
  const undo = decodeUndo(raw);
  if (!undo || undo.kind !== "photo") return;
  const d = undo.data;
  const created = await prisma.photo.create({
    data: { role: d.role, path: d.path, alt: d.alt, sortOrder: d.sortOrder },
  });
  await logAudit({
    action: "photo.restore",
    entity: "Photo",
    entityId: created.id,
    diff: { role: d.role, path: d.path },
  });
  revalidate();
  redirect("/admin/photos");
}

export async function movePhoto(formData: FormData) {
  await requireAdmin();
  const id = parseInt(String(formData.get("id") ?? ""), 10);
  const direction = String(formData.get("direction") ?? "");
  if (!Number.isFinite(id)) throw new Error("Invalid id");
  if (direction !== "up" && direction !== "down") throw new Error("Invalid direction");

  const row = await prisma.photo.findUnique({ where: { id } });
  if (!row) return;

  const neighbor = await prisma.photo.findFirst({
    where:
      direction === "up"
        ? { role: row.role, sortOrder: { lt: row.sortOrder } }
        : { role: row.role, sortOrder: { gt: row.sortOrder } },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await prisma.$transaction([
    prisma.photo.update({ where: { id: row.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.photo.update({ where: { id: neighbor.id }, data: { sortOrder: row.sortOrder } }),
  ]);

  await logAudit({
    action: "photo.move",
    entity: "Photo",
    entityId: id,
    diff: { direction, swappedWith: neighbor.id, role: row.role },
  });

  revalidate();
}
