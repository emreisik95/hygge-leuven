import { getContent } from "@/lib/db";

export const dynamic = "force-dynamic";

function PinIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export default async function Home() {
  const c = await getContent();

  return (
    <main className="shell">
      <div className="bg" style={{ backgroundImage: `url(${c.bgImagePath})` }} />

      <section className="hero">
        <h1 className="brand">{c.brandName}</h1>

        <p className="def">
          <span className="first">{c.definitionLine1}</span>
          <br />
          {c.definitionLine2}
        </p>

        {c.peopleImagePath ? (
          <img src={c.peopleImagePath} alt="" className="people" />
        ) : null}

        <h2 className="kettle">{c.heroLine}</h2>
        <p className="subtitle">{c.subtitle}</p>
      </section>

      <footer className="foot">
        <div className="meta">
          <div className="meta-item">
            <span className={`dot ${c.isOpen ? "" : "closed"}`} />
            <div>
              <div className="label">{c.statusLabel}</div>
              <div className="sub">{c.statusSub}</div>
            </div>
          </div>
          <div className="meta-item">
            <PinIcon />
            <div>
              <div className="label">{c.addressLine1}</div>
              <div className="sub">{c.addressLine2}</div>
            </div>
          </div>
          <div className="meta-item">
            <ClockIcon />
            <div>
              <div className="label">{c.hoursToday}</div>
              <div className="sub">{c.hoursWeekend}</div>
            </div>
          </div>
        </div>

        <div className="actions">
          <a href={c.findUsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
            {c.findUsLabel} <ArrowRight />
          </a>
          <a href={c.instagramUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
            <InstagramIcon /> {c.instagramHandle}
          </a>
        </div>
      </footer>
    </main>
  );
}
