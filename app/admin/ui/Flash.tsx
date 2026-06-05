// Single source of truth for the admin success/error banners. Success uses a
// polite live region; errors use role="alert" (assertive) so they interrupt.
export function Flash({ kind, children }: { kind: "ok" | "err"; children: React.ReactNode }) {
  if (kind === "err") {
    return <div className="flash err" role="alert">{children}</div>;
  }
  return <div className="flash ok" role="status" aria-live="polite">{children}</div>;
}
