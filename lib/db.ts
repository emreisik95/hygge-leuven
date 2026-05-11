import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter, log: ["error", "warn"] });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getContent() {
  const existing = await prisma.siteContent.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.siteContent.create({ data: { id: 1 } });
}

export type SiteContent = Awaited<ReturnType<typeof getContent>>;
