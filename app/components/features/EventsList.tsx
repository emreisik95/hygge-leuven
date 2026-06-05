import { EVENTS } from "@/lib/feature-content";

// Upcoming recurring happenings. Rendered as a definition-style list.
export function EventsList({
  heading,
  events,
}: {
  heading: string;
  events?: { date: string; title: string; detail: string }[];
}) {
  const list = events && events.length > 0 ? events : EVENTS;
  if (list.length === 0) return null;
  return (
    <section className="pane pane-events" id="events" aria-labelledby="events-heading">
      <div className="events-wrap">
        <h2 className="events-heading" id="events-heading">{heading}</h2>
        <ul className="events-list" role="list">
          {list.map((e) => (
            <li key={e.title} className="event-item">
              <span className="event-date">{e.date}</span>
              <div className="event-body">
                <h3 className="event-title">{e.title}</h3>
                <p className="event-detail">{e.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
