"use client";

import { useActionState } from "react";
import { subscribe, type SubscribeState } from "./newsletter-actions";

export type NewsletterCopy = {
  heading: string;
  body: string;
  placeholder: string;
  button: string;
  success: string;
  invalid: string;
  error: string;
};

// Progressive-enhancement email capture. Posts to the `subscribe` server action
// via useActionState, so it submits without client JS too (the inline status
// just won't update until navigation in that case).
export function NewsletterSignup({ locale, copy }: { locale: string; copy: NewsletterCopy }) {
  const [state, formAction, pending] = useActionState<SubscribeState, FormData>(subscribe, null);

  const status =
    state == null
      ? null
      : state.ok
        ? copy.success
        : state.message === "invalid"
          ? copy.invalid
          : copy.error;

  return (
    <div className="newsletter">
      <h3 className="newsletter-heading">{copy.heading}</h3>
      <p className="newsletter-body">{copy.body}</p>
      <form action={formAction} className="newsletter-form">
        <input type="hidden" name="locale" value={locale} />
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="newsletter-input"
          placeholder={copy.placeholder}
          aria-label={copy.placeholder}
        />
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {copy.button}
        </button>
      </form>
      {status ? (
        <p className={`newsletter-status${state?.ok ? " is-ok" : " is-err"}`} role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
    </div>
  );
}
