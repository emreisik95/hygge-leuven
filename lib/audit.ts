import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type AuditOpts = {
  action: string;
  entity: string;
  entityId?: string | number | null;
  before?: unknown;
  after?: unknown;
  diff?: unknown;
  actor?: string;
};

// Resolve the acting user. Falls back to "system" for unattributed writes
// (cron/callbacks where there's no session).
async function resolveActor(explicit?: string): Promise<string> {
  if (explicit) return explicit;
  try {
    const session = await auth();
    return session?.user?.email ?? session?.user?.name ?? "anonymous";
  } catch {
    return "system";
  }
}

function shallowDiff(before: unknown, after: unknown): Record<string, { from: unknown; to: unknown }> {
  const out: Record<string, { from: unknown; to: unknown }> = {};
  const a = (before ?? {}) as Record<string, unknown>;
  const b = (after ?? {}) as Record<string, unknown>;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) {
      out[k] = { from: a[k], to: b[k] };
    }
  }
  return out;
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return JSON.stringify({ unserializable: true });
  }
}

export async function logAudit(opts: AuditOpts): Promise<void> {
  const actor = await resolveActor(opts.actor);
  let diff: string | null = null;
  if (opts.diff !== undefined) diff = safeStringify(opts.diff);
  else if (opts.before !== undefined || opts.after !== undefined) {
    diff = safeStringify(shallowDiff(opts.before, opts.after));
  }

  await prisma.auditLog.create({
    data: {
      actor,
      action: opts.action,
      entity: opts.entity,
      entityId: opts.entityId == null ? null : String(opts.entityId),
      diff,
    },
  });
}
