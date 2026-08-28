import Image from "next/image";
import Link from "next/link";

export function AdminToolCard({
  href,
  icon,
  title,
  description,
  meta,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  meta?: React.ReactNode;
}) {
  return (
    <Link className="admin-tool-card" href={href}>
      <span className="admin-tool-icon" aria-hidden="true">
        <Image src={icon} alt="" width={64} height={64} />
      </span>
      <span className="admin-tool-copy">
        <strong>{title}</strong>
        <span>{description}</span>
        {meta ? <small>{meta}</small> : null}
      </span>
      <span className="admin-tool-arrow" aria-hidden="true">→</span>
    </Link>
  );
}

