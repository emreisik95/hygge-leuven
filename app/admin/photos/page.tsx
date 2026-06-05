import { prisma } from "@/lib/db";
import {
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  movePhoto,
  reorderPhotos,
  restorePhotoFromUndo,
} from "./actions";
import { decodeErrors } from "@/lib/validation";
import { ImagePreview } from "../components/ImagePreview";
import { DragReorderList } from "../components/DragReorderList";
import { UndoFlash } from "../components/UndoFlash";
import { SubmitButton } from "../ui/SubmitButton";
import { Flash } from "../ui/Flash";

export const dynamic = "force-dynamic";
export const metadata = { title: "Photos — admin" };

type Photo = {
  id: number;
  path: string;
  alt: string;
  role: string;
  sortOrder: number;
};

const ROLES: { key: string; label: string; description: string; readOnly?: boolean }[] = [
  { key: "background", label: "Background", description: "Landing page background photos. Multiple = slow crossfade." },
  { key: "hero", label: "Hero", description: "Reserved for a future landing strip. Stored but not yet rendered." },
  { key: "gallery", label: "Gallery", description: "General gallery pool, available for future use." },
  { key: "menu_item", label: "Menu items", description: "Owned by the menu editor. Read-only here.", readOnly: true },
];

const ALT_REQUIRED_ROLES = new Set(["hero", "gallery"]);

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ errors?: string; undo?: string; undoMsg?: string }>;
}) {
  const params = await searchParams;
  const errors = decodeErrors(params.errors);
  const all = await prisma.photo.findMany({ orderBy: [{ role: "asc" }, { sortOrder: "asc" }] });
  const grouped = new Map<string, Photo[]>();
  for (const r of ROLES) grouped.set(r.key, []);
  for (const p of all) {
    if (!grouped.has(p.role)) grouped.set(p.role, []);
    grouped.get(p.role)!.push(p);
  }

  return (
    <main>
      {params.undo && params.undoMsg ? (
        <UndoFlash payload={params.undo} message={params.undoMsg} action={restorePhotoFromUndo} />
      ) : null}
      {Object.keys(errors).length > 0 ? (
        <Flash kind="err">Please fix the errors below.</Flash>
      ) : null}
          {ROLES.map((r) => {
            const photos = grouped.get(r.key) ?? [];
            return (
              <section className="section" key={r.key}>
                <h2>{r.label}</h2>
                <p className="hint" style={{ marginBottom: 12 }}>{r.description}</p>

                {photos.length === 0 ? (
                  <p className="hint" style={{ marginBottom: 12 }}>
                    No {r.label.toLowerCase()} photos yet — upload your first below.
                  </p>
                ) : r.readOnly ? (
                  <ul className="photo-grid">
                    {photos.map((p) => (
                      <li key={p.id} className="photo-row">
                        <PhotoCard photo={p} role={r} errors={errors} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <DragReorderList
                    className="photo-grid"
                    itemClassName="photo-row"
                    ariaLabel={`${r.label} photos`}
                    action={reorderPhotos}
                    items={photos.map((p, i) => ({
                      id: p.id,
                      node: (
                        <>
                          <PhotoCard photo={p} role={r} errors={errors} />
                          <div className="photo-actions">
                            <form action={movePhoto}>
                              <input type="hidden" name="id" value={p.id} />
                              <input type="hidden" name="direction" value="up" />
                              <SubmitButton className="btn-inline" disabled={i === 0} ariaLabel="Move up">↑</SubmitButton>
                            </form>
                            <form action={movePhoto}>
                              <input type="hidden" name="id" value={p.id} />
                              <input type="hidden" name="direction" value="down" />
                              <SubmitButton className="btn-inline" disabled={i === photos.length - 1} ariaLabel="Move down">↓</SubmitButton>
                            </form>
                            <form action={deletePhoto}>
                              <input type="hidden" name="id" value={p.id} />
                              <SubmitButton className="btn-inline btn-danger" ariaLabel="Delete" pendingLabel="…">
                                Delete
                              </SubmitButton>
                            </form>
                          </div>
                        </>
                      ),
                    }))}
                  />
                )}

                {!r.readOnly && (
                  <form action={uploadPhoto} encType="multipart/form-data" className="upload-zone">
                    <input type="hidden" name="role" value={r.key} />
                    <div className="field">
                      <label htmlFor={`alt-new-${r.key}`}>
                        Alt text {ALT_REQUIRED_ROLES.has(r.key) ? "(required)" : "(optional)"}
                      </label>
                      <input
                        id={`alt-new-${r.key}`}
                        type="text"
                        name="alt"
                        defaultValue=""
                        required={ALT_REQUIRED_ROLES.has(r.key)}
                        aria-invalid={errors[`upload-${r.key}-alt`] ? true : undefined}
                      />
                      {errors[`upload-${r.key}-alt`] ? (
                        <p className="field-error" role="alert">{errors[`upload-${r.key}-alt`]}</p>
                      ) : null}
                    </div>
                    <div className="field">
                      <label htmlFor={`file-${r.key}`}>Upload {r.label.toLowerCase()} photo</label>
                      <ImagePreview
                        inputId={`file-${r.key}`}
                        name="file"
                        accept="image/*"
                        required
                      />
                      <span className="hint">
                        Converted to WebP, resized to 1600px wide. Max 8 MB.
                      </span>
                      {errors[`upload-${r.key}-file`] ? (
                        <p className="field-error" role="alert">{errors[`upload-${r.key}-file`]}</p>
                      ) : null}
                    </div>
                    <SubmitButton pendingLabel="Uploading…">Upload</SubmitButton>
                  </form>
                )}
              </section>
            );
          })}
    </main>
  );
}

function PhotoCard({
  photo,
  role,
  errors,
}: {
  photo: Photo;
  role: { key: string; label: string; readOnly?: boolean };
  errors: Record<string, string>;
}) {
  const altErr = errors[`photo-${photo.id}-alt`];
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.path} alt={photo.alt} className="photo-thumb" />

      <form action={updatePhoto} className="photo-fields">
        <input type="hidden" name="id" value={photo.id} />
        <label className="hint" htmlFor={`alt-${photo.id}`}>Alt text</label>
        <input
          id={`alt-${photo.id}`}
          type="text"
          name="alt"
          defaultValue={photo.alt}
          disabled={role.readOnly}
          required={ALT_REQUIRED_ROLES.has(photo.role)}
          aria-invalid={altErr ? true : undefined}
        />
        {altErr ? <p className="field-error" role="alert">{altErr}</p> : null}
        <label className="hint" htmlFor={`role-${photo.id}`}>Role</label>
        <select
          id={`role-${photo.id}`}
          name="role"
          defaultValue={photo.role}
          disabled={role.readOnly}
        >
          {ROLES.map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
        {!role.readOnly && (
          <SubmitButton className="btn-inline" pendingLabel="Saving…">Save row</SubmitButton>
        )}
      </form>
    </>
  );
}
