import Link from "next/link";

export const metadata = { title: "More — admin — hygge" };

export default function MorePage() {
  return (
    <>
      <header className="admin-page-intro">
        <p className="admin-eyebrow">Configuration</p>
        <h1>More</h1>
        <p>Less frequent publishing and account tools.</p>
      </header>
      <nav className="admin-tool-grid" aria-label="Additional admin tools">
        <Link href="/admin/photos">Photos</Link>
        <Link href="/admin/instagram">Instagram</Link>
        <Link href="/admin/translations">Translations</Link>
        <Link href="/admin/features">Features</Link>
        <Link href="/admin/users">Admins</Link>
        <Link href="/admin/audit">Audit</Link>
        <Link href="/admin/preview">Preview</Link>
      </nav>
    </>
  );
}
