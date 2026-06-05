import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// DB-backed admin accounts. The bootstrap admin (ADMIN_EMAIL env) lives outside
// this table and is checked separately in auth.ts, so this module only ever
// touches the AdminUser rows. Imported dynamically from auth.ts to keep prisma
// (Node-only better-sqlite3) out of the edge/proxy bundle.

export type AdminUserView = {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 10;
const BCRYPT_ROUNDS = 12;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function listAdmins(): Promise<AdminUserView[]> {
  return prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

export async function countAdmins(): Promise<number> {
  return prisma.adminUser.count();
}

export type CreateAdminError = "invalid_email" | "weak_password" | "exists";
export type CreateAdminResult =
  | { ok: true; email: string }
  | { ok: false; error: CreateAdminError };

export async function createAdmin(
  emailRaw: string,
  password: string,
  nameRaw?: string,
): Promise<CreateAdminResult> {
  const email = normalizeEmail(emailRaw);
  if (!EMAIL_RE.test(email)) return { ok: false, error: "invalid_email" };
  if (password.length < MIN_PASSWORD) return { ok: false, error: "weak_password" };

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "exists" };

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const name = nameRaw?.trim() || null;
  await prisma.adminUser.create({ data: { email, passwordHash, name } });
  return { ok: true, email };
}

// Returns the deleted admin's email (for audit) or null if no such row.
export async function deleteAdmin(id: number): Promise<string | null> {
  const row = await prisma.adminUser.findUnique({ where: { id }, select: { email: true } });
  if (!row) return null;
  await prisma.adminUser.delete({ where: { id } });
  return row.email;
}

// Used by the credentials provider. Returns a NextAuth user object on success.
export async function verifyAdminCredentials(
  emailRaw: string,
  password: string,
): Promise<{ id: string; email: string; name: string } | null> {
  const email = normalizeEmail(emailRaw);
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: `admin:${user.id}`, email: user.email, name: user.name ?? user.email };
}
