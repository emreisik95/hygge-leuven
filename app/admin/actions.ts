"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");
const UPLOAD_URL_BASE = "/api/uploads";
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_BYTES = 8 * 1024 * 1024;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

async function saveImage(file: File): Promise<string> {
  if (!file || file.size === 0) throw new Error("Empty upload");
  if (file.size > MAX_BYTES) throw new Error("File too large (max 8MB)");
  if (!ALLOWED.has(file.type)) throw new Error(`Unsupported type: ${file.type}`);

  await ensureUploadDir();
  const ext =
    file.type === "image/jpeg" ? "jpg" :
    file.type === "image/svg+xml" ? "svg" :
    file.type.split("/")[1];
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return `${UPLOAD_URL_BASE}/${name}`;
}

const TEXT_FIELDS = [
  "brandName",
  "definitionLine1",
  "definitionLine2",
  "heroLine",
  "subtitle",
  "statusLabel",
  "statusSub",
  "addressLine1",
  "addressLine2",
  "hoursToday",
  "hoursWeekend",
  "findUsLabel",
  "findUsUrl",
  "instagramHandle",
  "instagramUrl",
  "metaTitle",
  "metaDescription",
] as const;

export async function updateContent(formData: FormData) {
  await requireAdmin();

  const data: Record<string, string | boolean> = {};
  for (const k of TEXT_FIELDS) {
    const v = formData.get(k);
    if (typeof v === "string") data[k] = v;
  }
  data.isOpen = formData.get("isOpen") === "on";

  const bgFile = formData.get("bgImage") as File | null;
  if (bgFile && bgFile.size > 0) {
    data.bgImagePath = await saveImage(bgFile);
  }
  const peopleFile = formData.get("peopleImage") as File | null;
  if (peopleFile && peopleFile.size > 0) {
    data.peopleImagePath = await saveImage(peopleFile);
  }

  await prisma.siteContent.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function clearImage(field: "bgImagePath" | "peopleImagePath") {
  await requireAdmin();
  await prisma.siteContent.update({
    where: { id: 1 },
    data: { [field]: "" },
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
