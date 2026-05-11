import { auth, signOut } from "@/auth";
import { AdminNav, type AdminNavLink } from "./components/admin-nav";

export const dynamic = "force-dynamic";

const NAV_LINKS: AdminNavLink[] = [
  { label: "Site", href: "/admin" },
  { label: "Translations", href: "/admin/translations" },
  { label: "Menu", href: "/admin/menu" },
  { label: "Photos", href: "/admin/photos" },
  { label: "Hours", href: "/admin/hours" },
  { label: "Instagram", href: "/admin/instagram" },
  { label: "Audit", href: "/admin/audit" },
  { label: "Preview", href: "/admin/preview" },
];

async function logout() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Unauthenticated requests: render children only (the login page renders
  // its own shell, and proxy redirects all other /admin routes to login).
  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <div className="admin-wrap">
        <header className="admin-header admin-header-shared">
          <h1>hygge — admin</h1>
          <form action={logout}>
            <button type="submit" className="signout-link">Sign out</button>
          </form>
        </header>
        <AdminNav links={NAV_LINKS} />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
