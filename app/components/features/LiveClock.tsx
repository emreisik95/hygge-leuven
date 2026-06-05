"use client";

import { useEffect, useState } from "react";

const TZ = "Europe/Brussels";

// Ticking local café time. Server-rendered markup would drift from the client
// clock, so this stays empty until mounted, then updates every 30s.
export function LiveClock({ locale }: { locale: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: TZ,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [locale]);

  if (!time) return null;
  return (
    <span className="live-clock" aria-hidden="true">
      {time}
    </span>
  );
}
