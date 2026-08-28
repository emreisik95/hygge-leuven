import {
  MENU_IMAGE_FILENAME,
  readCurrentMenuImage,
} from "@/lib/menu-document";

export const dynamic = "force-dynamic";

export async function GET() {
  const buffer = await readCurrentMenuImage();
  const headers = new Headers([
    ["Content-Type", "image/jpeg"],
    ["Content-Disposition", `inline; filename="${MENU_IMAGE_FILENAME}"`],
    ["Content-Length", String(buffer.length)],
    ["Cache-Control", "no-store"],
    ["X-Content-Type-Options", "nosniff"],
  ]);

  return new Response(new Uint8Array(buffer), { headers });
}
