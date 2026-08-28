import { AdminPageIntro } from "../components/AdminPageIntro";
import { AdminToolCard } from "../components/AdminToolCard";

export const metadata = { title: "More — admin — hygge" };

export default function MorePage() {
  return (
    <>
      <AdminPageIntro
        ticket="05 / Tool shelf"
        title="More"
        description="Publishing, access, and review tools kept together behind the counter."
        icon="/admin-icons/more.png"
      />

      <div className="admin-tool-shelf">
        <section className="admin-tool-group" aria-labelledby="tool-group-publish">
          <div className="admin-tool-group-heading">
            <p className="admin-eyebrow">Keep the site fresh</p>
            <h2 id="tool-group-publish">Publish</h2>
          </div>
          <div className="admin-tool-grid">
            <AdminToolCard href="/admin/photos" icon="/admin-icons/photos-service-counter-2.png" title="Photos" description="Backgrounds, gallery, and image details." />
            <AdminToolCard href="/admin/instagram" icon="/admin-icons/instagram-service-counter-2.png" title="Instagram" description="Connection health and cached café posts." />
            <AdminToolCard href="/admin/translations" icon="/admin-icons/translations-service-counter-2.png" title="Translations" description="Edit English, Dutch, and French site copy." />
            <AdminToolCard href="/admin/features" icon="/admin-icons/features-service-counter-2.png" title="Features" description="Visibility switches and feature content." />
          </div>
        </section>

        <section className="admin-tool-group" aria-labelledby="tool-group-operations">
          <div className="admin-tool-group-heading">
            <p className="admin-eyebrow">People &amp; history</p>
            <h2 id="tool-group-operations">Operations</h2>
          </div>
          <div className="admin-tool-grid">
            <AdminToolCard href="/admin/users" icon="/admin-icons/admins-service-counter-2.png" title="Admins" description="Manage who can work behind the counter." />
            <AdminToolCard href="/admin/audit" icon="/admin-icons/audit-service-counter-2.png" title="Audit" description="Review recent admin changes and actors." />
          </div>
        </section>

        <section className="admin-tool-group" aria-labelledby="tool-group-review">
          <div className="admin-tool-group-heading">
            <p className="admin-eyebrow">Before guests see it</p>
            <h2 id="tool-group-review">Review</h2>
          </div>
          <div className="admin-tool-grid admin-tool-grid-compact">
            <AdminToolCard href="/admin/preview" icon="/admin-icons/preview-service-counter-2.png" title="Preview" description="Review the current admin draft." />
          </div>
        </section>
      </div>
    </>
  );
}
