import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getContent } from "@/lib/db";
import { updateContent, logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const c = await getContent();
  const { saved } = await searchParams;

  return (
    <div className="admin-shell">
      <div className="admin-wrap">
        <header className="admin-header">
          <h1>hygge — admin</h1>
          <form action={logout}>
            <button type="submit" className="signout-link">Sign out</button>
          </form>
        </header>

        {saved ? <div className="flash ok">Saved.</div> : null}

        <form action={updateContent} encType="multipart/form-data">
          <section>
            <h2 className="serif" style={{ fontSize: 22, color: "var(--tan)", marginBottom: 16 }}>
              Hero
            </h2>
            <Field name="brandName" label="Brand name" defaultValue={c.brandName} />
            <FieldRow>
              <Field name="definitionLine1" label="Definition line 1" defaultValue={c.definitionLine1} />
              <Field name="definitionLine2" label="Definition line 2" defaultValue={c.definitionLine2} />
            </FieldRow>
            <Textarea name="heroLine" label="Hero line (use newline for line break)" defaultValue={c.heroLine} />
            <Textarea name="subtitle" label="Subtitle" defaultValue={c.subtitle} />
          </section>

          <section className="section">
            <h2>Status</h2>
            <div className="checkbox-row">
              <input id="isOpen" name="isOpen" type="checkbox" defaultChecked={c.isOpen} />
              <label htmlFor="isOpen" style={{ fontSize: 14, color: "var(--ink)" }}>Show as open</label>
            </div>
            <FieldRow>
              <Field name="statusLabel" label="Status label" defaultValue={c.statusLabel} />
              <Field name="statusSub" label="Status sub" defaultValue={c.statusSub} />
            </FieldRow>
          </section>

          <section className="section">
            <h2>Address & Hours</h2>
            <FieldRow>
              <Field name="addressLine1" label="Address line 1" defaultValue={c.addressLine1} />
              <Field name="addressLine2" label="Address line 2" defaultValue={c.addressLine2} />
            </FieldRow>
            <FieldRow>
              <Field name="hoursToday" label="Hours today" defaultValue={c.hoursToday} />
              <Field name="hoursWeekend" label="Hours weekend" defaultValue={c.hoursWeekend} />
            </FieldRow>
          </section>

          <section className="section">
            <h2>Buttons</h2>
            <FieldRow>
              <Field name="findUsLabel" label="Find Us label" defaultValue={c.findUsLabel} />
              <Field name="findUsUrl" label="Find Us URL" type="url" defaultValue={c.findUsUrl} />
            </FieldRow>
            <FieldRow>
              <Field name="instagramHandle" label="Instagram handle" defaultValue={c.instagramHandle} />
              <Field name="instagramUrl" label="Instagram URL" type="url" defaultValue={c.instagramUrl} />
            </FieldRow>
          </section>

          <section className="section">
            <h2>Images</h2>
            <div className="field">
              <label>Background image</label>
              {c.bgImagePath ? <img src={c.bgImagePath} alt="" className="thumb" /> : null}
              <input type="file" name="bgImage" accept="image/*" />
              <span className="hint">Current: {c.bgImagePath || "(none)"}. Upload to replace.</span>
            </div>
            <div className="field">
              <label>People illustration</label>
              {c.peopleImagePath ? <img src={c.peopleImagePath} alt="" className="thumb" /> : null}
              <input type="file" name="peopleImage" accept="image/*" />
              <span className="hint">Current: {c.peopleImagePath || "(none)"}. Upload to replace.</span>
            </div>
          </section>

          <section className="section">
            <h2>SEO</h2>
            <Field name="metaTitle" label="Meta title" defaultValue={c.metaTitle} />
            <Textarea name="metaDescription" label="Meta description" defaultValue={c.metaDescription} />
          </section>

          <button type="submit" className="btn-save">Save changes</button>
        </form>
      </div>
    </div>
  );
}

function Field({
  name, label, defaultValue, type = "text",
}: { name: string; label: string; defaultValue?: string; type?: string }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} />
    </div>
  );
}

function Textarea({
  name, label, defaultValue,
}: { name: string; label: string; defaultValue?: string }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} />
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="field-row">{children}</div>;
}
