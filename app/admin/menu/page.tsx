import {
  getCurrentMenuMetadata,
  MENU_PUBLIC_URL,
} from "@/lib/menu-document";
import { replaceMenuDocument } from "./actions";
import { Flash } from "../ui/Flash";
import { SubmitButton } from "../ui/SubmitButton";
import { AdminPageIntro } from "../components/AdminPageIntro";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menu — admin — hygge" };

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Choose a PDF before uploading.",
  type: "Only PDF documents are accepted.",
  size: "The menu PDF must be smaller than 10 MB.",
  invalid: "That file is not a valid PDF.",
  write: "The upload could not be saved. The current live menu is unchanged.",
};

function sizeLabel(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [metadata, params] = await Promise.all([
    getCurrentMenuMetadata(),
    searchParams,
  ]);

  return (
    <>
      <AdminPageIntro
        ticket="03 / Seasonal document"
        title="Menu"
        description="One PDF controls the menu shown on the public site."
        icon="/admin-icons/menu.png"
        status={<span className="admin-ticket-status" data-tone="live">Live menu</span>}
      />

      {params.saved ? <Flash kind="ok">Menu PDF published.</Flash> : null}
      {params.error ? (
        <Flash kind="err">
          Upload failed. {ERROR_MESSAGES[params.error] ?? ERROR_MESSAGES.invalid}
        </Flash>
      ) : null}

      <section className="section admin-menu-current">
        <div className="admin-section-heading-row">
          <div>
            <p className="admin-eyebrow">Live now</p>
            <h2>Current menu</h2>
          </div>
          <span className="admin-file-badge">
            {sizeLabel(metadata.bytes)} · {metadata.source}
          </span>
        </div>
        <div className="admin-menu-preview">
          <object data={MENU_PUBLIC_URL} type="application/pdf" aria-label="Current seasonal menu PDF">
            <p><a href={MENU_PUBLIC_URL}>Open live menu</a></p>
          </object>
        </div>
        <div className="admin-inline-actions">
          <a href={MENU_PUBLIC_URL} target="_blank" rel="noreferrer" className="btn-secondary-inline">
            Open live menu
          </a>
          <a href={MENU_PUBLIC_URL} download className="btn-secondary-inline">
            Download PDF
          </a>
        </div>
      </section>

      <section className="section">
        <h2>Replace menu PDF</h2>
        <p className="hint">
          Upload the full A4 menu. The current document stays live until the new PDF is fully validated and saved.
        </p>
        <form action={replaceMenuDocument} encType="multipart/form-data" className="admin-menu-upload-form">
          <div className="field">
            <label htmlFor="menu-document">PDF document</label>
            <input
              id="menu-document"
              name="menuDocument"
              type="file"
              accept=".pdf,application/pdf"
              required
            />
            <span className="hint">PDF only · maximum 10 MB</span>
          </div>
          <SubmitButton pendingLabel="Publishing menu…">Replace live menu</SubmitButton>
        </form>
      </section>
    </>
  );
}
