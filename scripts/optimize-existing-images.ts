/**
 * One-off script: re-encode the existing /public/assets/bg.png (~2.3 MB)
 * to /public/uploads/<hash>.webp at <=1600 px wide, then update its Photo row
 * (role="background") to point at the new path.
 *
 * Run: npx tsx scripts/optimize-existing-images.ts
 *      or: node --import tsx scripts/optimize-existing-images.ts
 */
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public", "assets", "bg.png");
const UPLOAD_DIR = path.join(ROOT, "public", "uploads");
const URL_BASE = "/api/uploads";
const MAX_WIDTH = 1600;

async function main() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  const prisma = new PrismaClient({ adapter });

  const buf = await fs.readFile(SRC);
  const beforeBytes = buf.byteLength;

  const optimized = await sharp(buf)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();

  const afterBytes = optimized.byteLength;
  const hash = crypto.createHash("sha256").update(optimized).digest("hex").slice(0, 12);
  const filename = `${hash}.webp`;
  const outAbs = path.join(UPLOAD_DIR, filename);
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(outAbs, optimized);

  const newPath = `${URL_BASE}/${filename}`;
  const existing = await prisma.photo.findFirst({
    where: { role: "background", path: "/assets/bg.png" },
  });
  if (existing) {
    await prisma.photo.update({ where: { id: existing.id }, data: { path: newPath } });
  } else {
    await prisma.photo.create({
      data: { role: "background", path: newPath, sortOrder: 0, alt: "" },
    });
  }

  const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
  console.log(`bg.png: ${kb(beforeBytes)} -> ${kb(afterBytes)} (${filename})`);
  console.log(`updated Photo row -> ${newPath}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
