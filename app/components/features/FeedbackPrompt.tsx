"use client";

import { useEffect, useState } from "react";

// A calm, dismissible "how was your visit?" card near the foot of the page. The
// button opens the visitor's mail client with a feedback subject — no form, no
// data collection on our side. Once dismissed (or used), the choice is
// remembered in localStorage so it doesn't nag on return visits. Renders nothing
// on the server and until mounted, to avoid a flash of a card the visitor
// already closed.

const KEY = "hygge.feedback.dismissed.v1";

export function FeedbackPrompt({
  heading,
  body,
  button,
  email,
  subject,
  dismissLabel,
}: {
  heading: string;
  body: string;
  button: string;
  email: string;
  subject: string;
  dismissLabel: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(window.localStorage.getItem(KEY) !== "1");
    } catch {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      // best-effort; closing the card for this session is enough
    }
    setShow(false);
  };

  if (!show) return null;
  const href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  return (
    <section className="pane pane-feedback" aria-labelledby="feedback-heading">
      <div className="feedback-card">
        <button
          type="button"
          className="feedback-close"
          aria-label={dismissLabel}
          onClick={dismiss}
        >
          ×
        </button>
        <h2 className="feedback-heading" id="feedback-heading">
          {heading}
        </h2>
        <p className="feedback-body">{body}</p>
        <a href={href} className="btn btn-primary" onClick={dismiss}>
          {button}
        </a>
      </div>
    </section>
  );
}
