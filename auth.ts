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
        if (email !== ADMIN_EMAIL.toLowerCase()) return null;
        let ok = false;
        if (ADMIN_PASSWORD_HASH) {
          ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        } else if (ADMIN_PASSWORD) {
          ok = password === ADMIN_PASSWORD;
        }
        if (!ok) return null;
        return { id: "admin", email: ADMIN_EMAIL, name: "Admin" };
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
