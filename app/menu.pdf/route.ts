import {
  MENU_FILENAME,
  readCurrentMenuPdf,
} from "@/lib/menu-document";

export const dynamic = "force-dynamic";

export async function GET() {
  const buffer = await readCurrentMenuPdf();
  const headers = new Headers([
    ["Content-Type", "application/pdf"],
    ["Content-Disposition", `inline; filename="${MENU_FILENAME}"`],
    ["Content-Length", String(buffer.length)],
    ["Cache-Control", "public, max-age=300, stale-while-revalidate=3600"],
    ["X-Content-Type-Options", "nosniff"],
  ]);

  return new Response(new Uint8Array(buffer), { headers });
}
