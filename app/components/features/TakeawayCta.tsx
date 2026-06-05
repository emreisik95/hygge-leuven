// A "order takeaway" action for the contact card. The café has no online
// ordering, so this routes to the most direct human channel available: a phone
// call when a number is set, otherwise an email. The caller guards that at least
// one contact method exists. Server component.

export function TakeawayCta({
  label,
  phone,
  email,
  subject,
}: {
  label: string;
  phone?: string;
  email?: string;
  subject: string;
}) {
  const tel = phone ? phone.replace(/[^\d+]/g, "") : "";
  const href = tel
    ? `tel:${tel}`
    : email
      ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
      : null;
  if (!href) return null;
  return (
    <a href={href} className="btn btn-secondary">
      {label}
    </a>
  );
}
