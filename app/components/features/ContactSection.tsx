type ContactSectionProps = {
  heading: string;
  intro: string;
  emailLabel: string;
  instagramLabel: string;
  email: string;
  instagramUrl: string;
  instagramHandle: string;
  newTabLabel: string;
};

export function ContactSection({
  heading,
  intro,
  emailLabel,
  instagramLabel,
  email,
  instagramUrl,
  instagramHandle,
  newTabLabel,
}: ContactSectionProps) {
  const hasEmail = email.trim().length > 0;
  const hasInstagram = instagramUrl.trim().length > 0;
  if (!hasEmail && !hasInstagram) return null;

  return (
    <section
      className="pane pane-contact"
      id="contact"
      aria-labelledby="contact-heading"
    >
      <div className="contact-wrap">
        <div className="contact-copy">
          <h2 className="contact-heading" id="contact-heading">{heading}</h2>
          <p className="contact-intro">{intro}</p>
        </div>

        <div className="contact-channels">
          {hasEmail ? (
            <a className="contact-email" href={`mailto:${email}`}>
              <span className="contact-action-label">{emailLabel}</span>
              <span className="contact-email-address">{email}</span>
            </a>
          ) : null}

          {hasInstagram ? (
            <a
              className="btn btn-secondary contact-instagram"
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              {instagramLabel} · {instagramHandle}
              <span className="sr-only"> {newTabLabel}</span>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
