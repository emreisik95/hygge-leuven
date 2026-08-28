export const CANONICAL_ORIGIN = "https://hyggeleuven.be";

type PublicOriginInput = {
  nodeEnv?: string;
  override?: string;
  forwardedHost?: string | null;
  host?: string | null;
  forwardedProto?: string | null;
};

export function resolvePublicOrigin(input: PublicOriginInput): string {
  const override = input.override?.trim().replace(/\/+$/, "");
  if (override) return override;
  if (input.nodeEnv === "production") return CANONICAL_ORIGIN;

  const host = input.forwardedHost ?? input.host ?? "localhost:3000";
  const proto =
    input.forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
