"use client";

import { useFormStatus } from "react-dom";

// Shared submit button wired to the enclosing <form>'s pending state. Disables
// itself and exposes `aria-busy` while the server action runs so every admin
// form gets double-submit protection and a visible/announced busy state — the
// inventory found only DragReorderList had any pending feedback before.
export function SubmitButton({
  children,
  className = "btn-save",
  pendingLabel,
  disabled,
  style,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  ariaLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      style={style}
      disabled={pending || disabled}
      aria-busy={pending}
      aria-label={ariaLabel}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
