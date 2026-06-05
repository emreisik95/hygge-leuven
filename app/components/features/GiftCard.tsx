// Small promo block for gift cards. Links to email so it works with no backend.
export function GiftCard({
  heading,
  body,
  buttonLabel,
  email,
  newTabLabel,
}: {
  heading: string;
  body: string;
  buttonLabel: string;
  email: string;
  newTabLabel: string;
}) {
  const href = email
    ? `mailto:${email}?subject=${encodeURIComponent("Gift card")}`
    : undefined;
  return (
    <div className="giftcard">
      <div className="giftcard-body">
        <h3 className="giftcard-heading">{heading}</h3>
        <p className="giftcard-text">{body}</p>
      </div>
      {href ? (
        <a href={href} className="btn btn-primary">
          {buttonLabel}
          <span className="sr-only"> {newTabLabel}</span>
        </a>
      ) : null}
    </div>
  );
}
