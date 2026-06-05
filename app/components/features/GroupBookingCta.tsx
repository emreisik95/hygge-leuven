// A "group booking" action for the contact card — opens the visitor's mail
// client pre-addressed with a subject. Server component; only rendered when a
// contact email is configured (the caller guards on that).

export function GroupBookingCta({
  label,
  email,
  subject,
}: {
  label: string;
  email: string;
  subject: string;
}) {
  const href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  return (
    <a href={href} className="btn btn-secondary">
      {label}
    </a>
  );
}
