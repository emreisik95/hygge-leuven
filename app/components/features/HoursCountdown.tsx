"use client";

import { useEffect, useState } from "react";

// A live "opens in / closes in" countdown shown next to the open/closed status.
// The next-change moment is computed on the server (café timezone aware) and
// passed in as an ISO string; this component only does the ticking, updating
// roughly every 30s. It renders nothing on the server and until mounted, so it
// can never disagree with the server-rendered status line (no hydration drift).

function formatRemaining(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "under a minute";
}

export function HoursCountdown({
  isOpen,
  nextChangeISO,
  opensInTemplate,
  closesInTemplate,
}: {
  isOpen: boolean;
  nextChangeISO?: string;
  // Templates carry a single "{t}" placeholder, e.g. "Opens in {t}".
  opensInTemplate: string;
  closesInTemplate: string;
}) {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  if (!nextChangeISO || nowMs == null) return null;
  const target = Date.parse(nextChangeISO);
  if (!Number.isFinite(target)) return null;
  const diff = target - nowMs;
  if (diff <= 0) return null;

  const template = isOpen ? closesInTemplate : opensInTemplate;
  const text = template.replace("{t}", formatRemaining(diff));
  return (
    <span className="hours-countdown" role="status">
      {text}
    </span>
  );
}
