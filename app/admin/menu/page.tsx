import { getMenuForLocale, formatPrice } from "@/lib/db";
import {
  createCategory,
  createItem,
  updateItem,
  deleteItem,
  deleteCategory,
  moveItem,
  uploadItemPhoto,
  removeItemPhoto,
  reorderItems,
  restoreMenuFromUndo,
  seedDefaultCategories,
} from "./actions";
import { decodeErrors } from "@/lib/validation";
import { ImagePreview } from "../components/ImagePreview";
import { DragReorderList } from "../components/DragReorderList";
import { UndoFlash } from "../components/UndoFlash";
import { SubmitButton } from "../ui/SubmitButton";
import { Flash } from "../ui/Flash";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menu — admin — hygge" };

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ errors?: string; undo?: string; undoMsg?: string; errScope?: string }>;
}) {
  const params = await searchParams;
  const errors = decodeErrors(params.errors);
  const categories = await getMenuForLocale("EN");
  const isEmpty = categories.length === 0;

  return (
    <>
      <h1 className="admin-page-heading">menu</h1>

      {params.undo && params.undoMsg ? (
        <UndoFlash
          payload={params.undo}
          message={params.undoMsg}
          action={restoreMenuFromUndo}
        />
      ) : null}

      {Object.keys(errors).length > 0 ? (
        <Flash kind="err">Please fix the errors below.</Flash>
      ) : null}

      {isEmpty ? (
            <section className="section">
              <h2>Get started</h2>
              <p className="hint" style={{ marginBottom: 12 }}>
                No categories yet. Seed the defaults (Coffee / Pastry / Lunch) or add your own below.
              </p>
              <form action={seedDefaultCategories}>
                <SubmitButton style={{ width: "auto" }} pendingLabel="Seeding…">
                  Seed default categories
                </SubmitButton>
              </form>
            </section>
          ) : null}

          {categories.map((cat) => (
            <section key={cat.id} className="section menu-cat-block" aria-labelledby={`cat-${cat.id}`}>
              <header className="menu-cat-head">
                <h2 id={`cat-${cat.id}`}>
                  {cat.label} <span className="menu-cat-slug">/{cat.slug}</span>
                </h2>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={cat.id} />
                  <SubmitButton
                    className="link-danger"
                    ariaLabel={`Delete category ${cat.label} (also deletes its items)`}
                  >
                    delete category
                  </SubmitButton>
                </form>
              </header>

              {cat.items.length === 0 ? (
                <p className="hint" style={{ marginBottom: 12 }}>
                  No items in {cat.label} yet — add your first below.
                </p>
              ) : (
                <DragReorderList
                  ariaLabel={`Items in ${cat.label}`}
                  className="menu-item-list"
                  itemClassName="menu-item-row"
                  action={reorderItems}
                  items={cat.items.map((it, idx) => ({
                    id: it.id,
                    node: (
                      <>
                        <ItemThumb path={it.photoPath} alt={it.photoAlt || it.name} />

                        <form action={updateItem} className="menu-item-form">
                          <input type="hidden" name="id" value={it.id} />

                          <details className="menu-item-details">
                            <summary>
                              <span className="menu-item-name">
                                {it.name || <em className="muted">(no name)</em>}
                              </span>
                              <span className="menu-item-price">
                                {formatPrice(it.priceCents)}
                              </span>
                            </summary>

                            <div className="menu-item-fields">
                              <div className="field">
                                <label htmlFor={`name-${it.id}`}>Name (EN)</label>
                                <input
                                  id={`name-${it.id}`}
                                  type="text"
                                  name="nameEn"
                                  defaultValue={it.name}
                                  required
                                />
                                <span className="hint">
                                  NL/FR translations live in i18n editor under namespace
                                  {" "}<code>menu.item.{it.id}.name</code>.
                                </span>
                              </div>
                              <div className="field">
                                <label htmlFor={`desc-${it.id}`}>Description (EN, optional)</label>
                                <textarea
                                  id={`desc-${it.id}`}
                                  name="descriptionEn"
                                  defaultValue={it.description}
                                  rows={2}
                                />
                              </div>
                              <div className="field-row">
                                <div className="field">
                                  <label htmlFor={`price-${it.id}`}>Price (EUR)</label>
                                  <input
                                    id={`price-${it.id}`}
                                    type="text"
                                    name="price"
                                    inputMode="decimal"
                                    defaultValue={(it.priceCents / 100).toFixed(2)}
                                    aria-describedby={`price-${it.id}-hint`}
                                    aria-invalid={errors[`item-${it.id}-price`] ? true : undefined}
                                  />
                                  <span id={`price-${it.id}-hint`} className="hint">
                                    Accepts &quot;3.50&quot;, &quot;3,50&quot;, or &quot;€3.50&quot;.
                                  </span>
                                  {errors[`item-${it.id}-price`] ? (
                                    <p className="field-error" role="alert">
                                      {errors[`item-${it.id}-price`]}
                                    </p>
                                  ) : null}
                                </div>
                                <div className="field">
                                  <label htmlFor={`sort-${it.id}`}>Sort order</label>
                                  <input
                                    id={`sort-${it.id}`}
                                    type="number"
                                    name="sortOrder"
                                    defaultValue={it.sortOrder}
                                  />
                                </div>
                              </div>
                              <div className="checkbox-row">
                                <input
                                  id={`avail-${it.id}`}
                                  type="checkbox"
                                  name="available"
                                  defaultChecked={it.available}
                                />
                                <label htmlFor={`avail-${it.id}`} style={{ fontSize: 14 }}>
                                  Available
                                </label>
                              </div>
                              <SubmitButton style={{ width: "auto" }} pendingLabel="Saving…">
                                Save changes
                              </SubmitButton>
                            </div>
                          </details>
                        </form>

                        <div className="menu-item-actions">
                          <ReorderButton itemId={it.id} dir="up" disabled={idx === 0} />
                          <ReorderButton
                            itemId={it.id}
                            dir="down"
                            disabled={idx === cat.items.length - 1}
                          />
                          <PhotoControls
                            itemId={it.id}
                            hasPhoto={!!it.photoPath}
                            altError={errors[`item-${it.id}-alt`]}
                            photoError={errors[`item-${it.id}-photo`]}
                          />
                          <form action={deleteItem}>
                            <input type="hidden" name="id" value={it.id} />
                            <SubmitButton
                              className="link-danger"
                              ariaLabel={`Delete item ${it.name || "(unnamed)"}`}
                            >
                              delete
                            </SubmitButton>
                          </form>
                        </div>
                      </>
                    ),
                  }))}
                />
              )}

              <details className="add-item-wrap" open={!!errors[`newItem-${cat.id}-nameEn`] || !!errors[`newItem-${cat.id}-price`]}>
                <summary className="btn-secondary-inline">+ Add item to {cat.label}</summary>
                <form action={createItem} className="add-item-form">
                  <input type="hidden" name="categoryId" value={cat.id} />
                  <div className="field">
                    <label htmlFor={`new-name-${cat.id}`}>Name (EN)</label>
                    <input
                      id={`new-name-${cat.id}`}
                      type="text"
                      name="nameEn"
                      required
                      aria-invalid={errors[`newItem-${cat.id}-nameEn`] ? true : undefined}
                    />
                    {errors[`newItem-${cat.id}-nameEn`] ? (
                      <p className="field-error" role="alert">{errors[`newItem-${cat.id}-nameEn`]}</p>
                    ) : null}
                  </div>
                  <div className="field">
                    <label htmlFor={`new-desc-${cat.id}`}>Description (EN, optional)</label>
                    <textarea id={`new-desc-${cat.id}`} name="descriptionEn" rows={2} />
                  </div>
                  <div className="field">
                    <label htmlFor={`new-price-${cat.id}`}>Price (EUR)</label>
                    <input
                      id={`new-price-${cat.id}`}
                      type="text"
                      name="price"
                      inputMode="decimal"
                      placeholder="3.50"
                      required
                      aria-invalid={errors[`newItem-${cat.id}-price`] ? true : undefined}
                    />
                    {errors[`newItem-${cat.id}-price`] ? (
                      <p className="field-error" role="alert">{errors[`newItem-${cat.id}-price`]}</p>
                    ) : null}
                  </div>
                  <SubmitButton style={{ width: "auto" }} pendingLabel="Adding…">
                    Add item
                  </SubmitButton>
                </form>
              </details>
            </section>
          ))}

      <section className="section">
        <h2>Add category</h2>
        <form action={createCategory} className="add-cat-form">
          <div className="field-row">
            <div className="field">
              <label htmlFor="new-cat-label">Label (EN)</label>
              <input
                id="new-cat-label"
                type="text"
                name="labelEn"
                placeholder="Drinks"
                aria-invalid={errors.labelEn ? true : undefined}
              />
              {errors.labelEn ? <p className="field-error" role="alert">{errors.labelEn}</p> : null}
            </div>
            <div className="field">
              <label htmlFor="new-cat-slug">
                Slug <span className="hint">(optional, auto from label)</span>
              </label>
              <input
                id="new-cat-slug"
                type="text"
                name="slug"
                placeholder="drinks"
                aria-invalid={errors.slug ? true : undefined}
              />
              {errors.slug ? <p className="field-error" role="alert">{errors.slug}</p> : null}
            </div>
          </div>
          <SubmitButton style={{ width: "auto" }} pendingLabel="Adding…">
            Add category
          </SubmitButton>
        </form>
      </section>
    </>
  );
}

function ItemThumb({ path, alt }: { path: string | null; alt: string }) {
  if (!path) {
    return <div className="menu-item-thumb menu-item-thumb-empty" aria-hidden="true" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={path} alt={alt} className="menu-item-thumb" />;
}

function ReorderButton({
  itemId,
  dir,
  disabled,
}: {
  itemId: number;
  dir: "up" | "down";
  disabled: boolean;
}) {
  return (
    <form action={moveItem}>
      <input type="hidden" name="id" value={itemId} />
      <input type="hidden" name="dir" value={dir} />
      <SubmitButton className="btn-icon" disabled={disabled} ariaLabel={`Move item ${dir}`}>
        {dir === "up" ? "↑" : "↓"}
      </SubmitButton>
    </form>
  );
}

function PhotoControls({
  itemId,
  hasPhoto,
  altError,
  photoError,
}: {
  itemId: number;
  hasPhoto: boolean;
  altError?: string;
  photoError?: string;
}) {
  return (
    <details className="photo-controls" open={!!altError || !!photoError}>
      <summary className="btn-secondary-inline">{hasPhoto ? "replace photo" : "add photo"}</summary>
      <form action={uploadItemPhoto} encType="multipart/form-data" className="photo-form">
        <input type="hidden" name="id" value={itemId} />
        <div className="field">
          <label htmlFor={`photo-${itemId}`}>Photo</label>
          <ImagePreview
            inputId={`photo-${itemId}`}
            name="photo"
            accept="image/png,image/jpeg,image/webp,image/gif"
            required
          />
          {photoError ? (
            <p className="field-error" role="alert" id={`photo-${itemId}-error`}>{photoError}</p>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor={`alt-${itemId}`}>Alt text</label>
          <input
            id={`alt-${itemId}`}
            type="text"
            name="alt"
            placeholder="Latte in a brown cup"
            required
            aria-invalid={altError ? true : undefined}
          />
          {altError ? <p className="field-error" role="alert">{altError}</p> : null}
        </div>
        <SubmitButton style={{ width: "auto" }} pendingLabel="Uploading…">
          Upload
        </SubmitButton>
      </form>
      {hasPhoto ? (
        <form action={removeItemPhoto} style={{ marginTop: 8 }}>
          <input type="hidden" name="id" value={itemId} />
          <SubmitButton className="link-danger" pendingLabel="Removing…">remove photo</SubmitButton>
        </form>
      ) : null}
    </details>
  );
}
