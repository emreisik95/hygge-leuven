import Image from "next/image";
import Link from "next/link";

type Breadcrumb = {
  href: string;
  label: string;
};

export function AdminPageIntro({
  ticket,
  title,
  description,
  icon,
  breadcrumb,
  status,
  actions,
}: {
  ticket: string;
  title: string;
  description: string;
  icon: string;
  breadcrumb?: Breadcrumb;
  status?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="admin-page-intro admin-service-ticket">
      {breadcrumb ? (
        <nav className="admin-breadcrumb" aria-label="Breadcrumb">
          <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>
      ) : null}
      <div className="admin-service-ticket-body">
        <span className="admin-page-icon" aria-hidden="true">
          <Image src={icon} alt="" width={72} height={72} priority />
        </span>
        <div className="admin-page-intro-copy">
          <p className="admin-eyebrow">{ticket}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {status || actions ? (
          <div className="admin-page-intro-aside">
            {status}
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

