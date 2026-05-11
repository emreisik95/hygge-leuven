// Encodes/decodes a delete-payload into a URL-safe blob. The flash on the
// next page render reads the payload and offers a one-click restore via a
// server action that dispatches by `kind`. Auto-dismissed client-side after
// a few seconds; the row stays deleted if no undo is clicked.

export type UndoPayload =
  | {
      kind: "photo";
      data: { role: string; path: string; alt: string; sortOrder: number };
    }
  | {
      kind: "menuItem";
      data: {
        categoryId: number;
        priceCents: number;
        sortOrder: number;
        available: boolean;
        nameEn: string;
        descriptionEn: string;
      };
    }
  | {
      kind: "menuItemPhoto";
      data: { itemId: number; path: string; alt: string };
    }
  | {
      kind: "menuCategory";
      data: { slug: string; sortOrder: number; labelEn: string };
    };

export function encodeUndo(payload: UndoPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeUndo(raw: string | undefined | null): UndoPayload | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object" && typeof parsed.kind === "string") {
      return parsed as UndoPayload;
    }
  } catch {
    // ignore
  }
  return null;
}
