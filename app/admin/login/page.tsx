import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/admin");

  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/admin",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("NEXT_REDIRECT")) throw err;
      redirect("/admin/login?error=1");
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-wrap">
        <div className="login-card">
          <h1>admin</h1>
          {error ? <div className="flash err">Invalid credentials</div> : null}
          <form action={login}>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" required autoComplete="username" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-save">Sign in</button>
          </form>
        </div>
      </div>
    </div>
  );
}
