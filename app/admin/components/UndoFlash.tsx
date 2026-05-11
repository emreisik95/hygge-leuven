"use client";

import { useEffect, useState } from "react";

type Props = {
  payload: string;
  message: string;
  // Server action: form posts ?payload field, handler decodes and restores.
  action: (formData: FormData) => Promise<void> | void;
  ttlMs?: number;
};

export function UndoFlash({ payload, message, action, ttlMs = 6000 }: Props) {
  const [visible, setVisible] = useState(true);
  const [remaining, setRemaining] = useState(Math.ceil(ttlMs / 1000));

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const left = Math.max(0, ttlMs - (Date.now() - start));
      setRemaining(Math.ceil(left / 1000));
      if (left <= 0) {
        setVisible(false);
        clearInterval(tick);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [ttlMs]);

  if (!visible) return null;

  return (
    <div className="flash flash-undo" role="status" aria-live="polite">
      <span className="flash-undo-msg">{message}</span>
      <form action={action} style={{ display: "inline" }}>
        <input type="hidden" name="payload" value={payload} />
        <button type="submit" className="flash-undo-btn">
          Undo ({remaining}s)
        </button>
      </form>
    </div>
  );
}
