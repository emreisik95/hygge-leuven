import Link from "next/link";
import {
  getDraftContent,
  hasUnpublishedDraft,
  summarizeDraft,
} from "@/lib/db";
import {
  updateContent,
  publishContent,
  discardContentDraft,
} from "./actions";
import { decodeErrors } from "@/lib/validation";
import { Field, TextareaField, FieldRow, Toggle } from "./ui/fields";
import { SubmitButton } from "./ui/SubmitButton";
import { Flash } from "./ui/Flash";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — hygge" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    published?: string;
    discarded?: string;
    error?: string;
    errors?: string;
  }>;
}) {
  const [c, dirty, draftSummary, params] = await Promise.all([
    getDraftContent(),
    hasUnpublishedDraft(),
    summarizeDraft(),
    searchParams,
  ]);
  const { saved, published, discarded, error, errors: errorsRaw } = params;
  const errors = decodeErrors(errorsRaw);

  return (
    <>
      {saved ? <Flash kind="ok">Draft saved.</Flash> : null}
      {published ? <Flash kind="ok">Published.</Flash> : null}
      {discarded ? <Flash kind="ok">Draft discarded.</Flash> : null}
      {error === "publish" ? (
        <Flash kind="err">Publish failed — nothing was changed. Try again.</Flash>
      ) : null}
      {Object.keys(errors).length > 0 ? (
        <Flash kind="err">Please fix the errors below.</Flash>
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
          <TextareaField name="definitionBody" label="Definition body" defaultValue={c.definitionBody} rows={4} />
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
            <Field name="mapLat" label="Latitude" inputMode="decimal" defaultValue={String(c.mapLat)} error={errors.mapLat} />
            <Field name="mapLng" label="Longitude" inputMode="decimal" defaultValue={String(c.mapLng)} error={errors.mapLng} />
          </FieldRow>
          <Field name="mapZoom" label="Zoom (1-22)" inputMode="numeric" defaultValue={String(c.mapZoom)} error={errors.mapZoom} />
        </section>

        <section className="section">
          <h2>SEO</h2>
          <Field name="metaTitle" label="Meta title" defaultValue={c.metaTitle} />
          <TextareaField name="metaDescription" label="Meta description" defaultValue={c.metaDescription} />
        </section>

        <p className="hint">
          Saving stores changes as a <strong>draft</strong>. Use{" "}
          <Link href="/admin/preview" className="admin-nav-link">Preview</Link> to verify, then
          publish from the banner above. Opening hours are edited at{" "}
          <Link href="/admin/hours" className="admin-nav-link">Hours</Link>; menu, photos and
          translations publish immediately when saved.
        </p>
        <SubmitButton pendingLabel="Saving…">Save draft</SubmitButton>
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
            <SubmitButton pendingLabel="Publishing…">Publish</SubmitButton>
          </form>
          <form action={discardAction}>
            <SubmitButton className="btn-save btn-danger-solid" pendingLabel="Discarding…">
              Discard draft
            </SubmitButton>
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
