import Link from "next/link";
import {
  getDraftContent,
  getOpeningHours,
  hasUnpublishedDraft,
  summarizeDraft,
} from "@/lib/db";
import {
  updateContent,
  updateHours,
  publishContent,
  discardContentDraft,
} from "./actions";
import { HoursRow } from "./components/HoursRow";
import { decodeErrors } from "@/lib/validation";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const; // Mon..Sun

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — hygge" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    savedHours?: string;
    published?: string;
    discarded?: string;
    errors?: string;
  }>;
}) {
  const [c, hoursRows, dirty, draftSummary, params] = await Promise.all([
    getDraftContent(),
    getOpeningHours(),
    hasUnpublishedDraft(),
    summarizeDraft(),
    searchParams,
  ]);
  const { saved, savedHours, published, discarded, errors: errorsRaw } = params;
  const errors = decodeErrors(errorsRaw);

  const hoursByDow = new Map(hoursRows.map((h) => [h.dayOfWeek, h] as const));

  return (
    <>
      {saved ? <div className="flash ok" role="status" aria-live="polite">Draft saved.</div> : null}
      {savedHours ? <div className="flash ok" role="status" aria-live="polite">Hours saved.</div> : null}
      {published ? <div className="flash ok" role="status" aria-live="polite">Published.</div> : null}
      {discarded ? <div className="flash ok" role="status" aria-live="polite">Draft discarded.</div> : null}
      {Object.keys(errors).length > 0 ? (
        <div className="flash err" role="alert">
          Please fix the errors below.
        </div>
      ) : null}

      {dirty ? (
        <DraftBanner
          summary={draftSummary}
          publishAction={publishContent}
          discardAction={discardContentDraft}
        />
      ) : null}

      <form action={updateContent} aria-label="Site content editor">
        <input type="hidden" name="_visibilityForm" value="1" />

        <section className="section">
          <h2>Visibility</h2>
          <p className="hint">
            Hide individual landing-page sections without deleting their content. Toggles take
            effect after publish.
          </p>
          <div className="visibility-grid">
            <Toggle name="showDefinition" label="Definition (label + body)" defaultChecked={c.showDefinition} />
            <Toggle name="showTagline" label="Tagline (bullet line)" defaultChecked={c.showTagline} />
            <Toggle name="showInvite" label="Invite (line + sub)" defaultChecked={c.showInvite} />
            <Toggle name="showStatus" label="Status row (open/closed)" defaultChecked={c.showStatus} />
            <Toggle name="showAddress" label="Address row" defaultChecked={c.showAddress} />
            <Toggle name="showHours" label="Hours row" defaultChecked={c.showHours} />
          </div>
        </section>

        <section className="section">
          <h2>Hero</h2>
          <Field name="brandName" label="Brand name" defaultValue={c.brandName} />
          <Field name="definitionLabel" label="Dictionary label" defaultValue={c.definitionLabel} />
          <Textarea name="definitionBody" label="Definition body" defaultValue={c.definitionBody} rows={4} />
          <Field name="tagline" label="Tagline (bullet line)" defaultValue={c.tagline} />
          <FieldRow>
            <Field name="inviteLine" label="Invite line" defaultValue={c.inviteLine} />
            <Field name="inviteSub" label="Invite sub" defaultValue={c.inviteSub} />
          </FieldRow>
        </section>

        <section className="section">
          <h2>Address</h2>
          <FieldRow>
            <Field name="addressLine1" label="Address line 1" defaultValue={c.addressLine1} />
            <Field name="addressLine2" label="Address line 2" defaultValue={c.addressLine2} />
          </FieldRow>
        </section>

        <section className="section">
          <h2>Buttons</h2>
          <FieldRow>
            <Field name="findUsLabel" label="Find Us label" defaultValue={c.findUsLabel} />
            <Field name="findUsUrl" label="Find Us URL" type="url" inputMode="url" defaultValue={c.findUsUrl} error={errors.findUsUrl} />
          </FieldRow>
          <FieldRow>
            <Field name="instagramHandle" label="Instagram handle" defaultValue={c.instagramHandle} />
            <Field name="instagramUrl" label="Instagram URL" type="url" inputMode="url" defaultValue={c.instagramUrl} error={errors.instagramUrl} />
          </FieldRow>
        </section>

        <section className="section">
          <h2>Instagram pane</h2>
          <Field name="instaHeading" label="Heading" defaultValue={c.instaHeading} />
          <Field name="instaSub" label="Subheading" defaultValue={c.instaSub} />
          <Field name="instaCtaLabel" label="CTA button label" defaultValue={c.instaCtaLabel} />
          <p className="hint">
            Live feed posts are managed at <Link href="/admin/instagram" className="admin-nav-link">/admin/instagram</Link>.
          </p>
        </section>

        <section className="section">
          <h2>Map</h2>
          <Field name="mapHeading" label="Map heading" defaultValue={c.mapHeading} />
          <Field name="mapSub" label="Map subtext" defaultValue={c.mapSub} />
          <FieldRow>
            <Field name="mapLat" label="Latitude" defaultValue={String(c.mapLat)} error={errors.mapLat} />
            <Field name="mapLng" label="Longitude" defaultValue={String(c.mapLng)} error={errors.mapLng} />
          </FieldRow>
          <Field name="mapZoom" label="Zoom (1-22)" defaultValue={String(c.mapZoom)} error={errors.mapZoom} />
        </section>

        <section className="section">
          <h2>SEO</h2>
          <Field name="metaTitle" label="Meta title" defaultValue={c.metaTitle} />
          <Textarea name="metaDescription" label="Meta description" defaultValue={c.metaDescription} />
        </section>

        <p className="hint">
          Saving stores changes as a <strong>draft</strong>. Use{" "}
          <Link href="/admin/preview" className="admin-nav-link">Preview</Link> to verify, then
          publish from the banner above. Hours, menu, photos and translations publish immediately
          when saved.
        </p>
        <button type="submit" className="btn-save">Save draft</button>
      </form>

      <form action={updateHours} aria-label="Opening hours editor" id="hours">
        <section className="section">
          <h2>Opening hours</h2>
          <p className="hint">
            Set per-day hours. Tick &quot;closed&quot; to mark a day off.
            The landing page derives &quot;open now&quot; status from these times in Europe/Brussels.
            Overnight ranges (e.g. 18:00 – 02:00) are supported — set the close time to the next morning.
          </p>
          <div className="hours-grid" role="group" aria-label="Weekly opening hours">
            {DAY_ORDER.map((dow) => {
              const row = hoursByDow.get(dow);
              const closed = !row || !row.opensAt || !row.closesAt;
              return (
                <HoursRow
                  key={dow}
                  dow={dow}
                  initialClosed={closed}
                  initialOpensAt={row?.opensAt ?? ""}
                  initialClosesAt={row?.closesAt ?? ""}
                  opensError={errors[`hours_${dow}_opensAt`]}
                  closesError={errors[`hours_${dow}_closesAt`]}
                />
              );
            })}
          </div>
          <button type="submit" className="btn-save">Save hours</button>
        </section>
      </form>
    </>
  );
}

function DraftBanner({
  summary,
  publishAction,
  discardAction,
}: {
  summary: { field: string; from: string; to: string }[];
  publishAction: () => Promise<void>;
  discardAction: () => Promise<void>;
}) {
  return (
    <div role="status" aria-live="polite" className="admin-draft-banner">
      <div className="admin-draft-banner-row">
        <strong>Draft has unpublished changes ({summary.length}).</strong>
        <div className="admin-draft-banner-actions">
          <Link href="/admin/preview" className="admin-nav-link">Preview</Link>
          <form action={publishAction}>
            <button type="submit" className="btn-save">Publish</button>
          </form>
          <form action={discardAction}>
            <button type="submit" className="btn-save btn-danger-solid">
              Discard draft
            </button>
          </form>
        </div>
      </div>
      {summary.length > 0 ? (
        <details>
          <summary>What changed</summary>
          <ul>
            {summary.map((entry) => (
              <li key={entry.field}>
                <code>{entry.field}</code>: <s>{entry.from || "(empty)"}</s> → <strong>{entry.to || "(empty)"}</strong>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function Field({
  name, label, defaultValue, type = "text", inputMode, error,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  inputMode?: "text" | "url" | "email" | "tel" | "search" | "numeric" | "decimal" | "none";
  error?: string;
}) {
  const errProps = error ? { "aria-invalid": true as const, "aria-describedby": `${name}-error` } : {};
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} inputMode={inputMode} {...errProps} />
      {error ? <p id={`${name}-error`} className="field-error" role="alert">{error}</p> : null}
    </div>
  );
}

function Textarea({
  name, label, defaultValue, rows,
}: { name: string; label: string; defaultValue?: string; rows?: number }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} rows={rows} />
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="field-row">{children}</div>;
}

function Toggle({
  name, label, defaultChecked,
}: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="toggle" htmlFor={name}>
      <input id={name} name={name} type="checkbox" defaultChecked={defaultChecked} />
      <span>{label}</span>
    </label>
  );
}
