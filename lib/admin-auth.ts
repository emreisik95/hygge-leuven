import { auth } from "@/auth";

export class AdminAuthError extends Error {
  constructor(public response: Response) {
    super("Unauthorized");
  }
}

/**
 * Throws an `AdminAuthError` carrying a 401 Response when the request is
 * not authenticated. Returns the session otherwise.
 *
 * Usage in `app/api/admin/<x>/route.ts`:
 *
 *   try { await requireAdmin(); }
 *   catch (e) { if (e instanceof AdminAuthError) return e.response; throw e; }
 *
 * Or more concisely with `requireAdminOr401`.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new AdminAuthError(
      new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": "Session" },
      }),
    );
  }
  return session;
}

/**
 * Returns either the session or a 401 Response. Caller checks with
 * `if (result instanceof Response) return result;`.
 */
export async function requireAdminOr401() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Session" },
    });
  }
  return session;
}
