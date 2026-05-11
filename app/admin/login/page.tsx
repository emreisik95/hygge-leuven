import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in — hygge" };

function safeCallbackUrl(raw: string | undefined): string {
  if (!raw) return "/admin";
  // Only allow same-origin admin paths to prevent open-redirect.
  if (!raw.startsWith("/admin")) return "/admin";
  if (raw.startsWith("//")) return "/admin";
  if (raw === "/admin/login" || raw.startsWith("/admin/login?")) return "/admin";
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const target = safeCallbackUrl(callbackUrl);

  const session = await auth();
  if (session?.user) redirect(target);

  async function login(formData: FormData) {
    "use server";
    const formCallback = formData.get("callbackUrl");
    const dest = safeCallbackUrl(
      typeof formCallback === "string" ? formCallback : undefined,
    );
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: dest,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("NEXT_REDIRECT")) throw err;
      const qs = new URLSearchParams({ error: "1" });
      if (dest !== "/admin") qs.set("callbackUrl", dest);
      redirect(`/admin/login?${qs.toString()}`);
    }
  }

  return (
    <div className="admin-shell login-shell">
      <div className="login-card">
          <h1>admin</h1>
          {error ? (
            <div id="login-error" className="flash err" role="alert" aria-live="assertive">
              Invalid credentials
            </div>
          ) : null}
          <form action={login}>
            <input type="hidden" name="callbackUrl" value={target} />
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
            <button type="submit" className="btn-save">Sign in</button>
          </form>
        </div>
    </div>
  );
}
