import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@hygge.local";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        // 1. Bootstrap admin from env — always available so an operator can
        //    never be locked out, even if the AdminUser table is empty.
        if (email === ADMIN_EMAIL.toLowerCase()) {
          let ok = false;
          if (ADMIN_PASSWORD_HASH) {
            ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
          } else if (ADMIN_PASSWORD) {
            ok = password === ADMIN_PASSWORD;
          }
          if (ok) return { id: "admin", email: ADMIN_EMAIL, name: "Admin" };
        }

        // 2. DB-backed admins. Dynamic import keeps prisma (Node-only
        //    better-sqlite3) out of the proxy/edge bundle — authorize only
        //    runs in the Node auth route, never in the proxy.
        const { verifyAdminCredentials } = await import("@/lib/admin-users");
        return await verifyAdminCredentials(email, password);
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname === "/admin/login") return true;
      if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        return !!auth?.user;
      }
      return true;
    },
  },
});
