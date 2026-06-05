import { FAQ_ITEMS } from "@/lib/feature-content";

// Native <details> accordion — no client JS, keyboard-accessible for free.
export function FaqSection({ heading }: { heading: string }) {
  return (
    <section className="pane pane-faq" id="faq" aria-labelledby="faq-heading">
      <a href="#landing" className="skip-link">Skip section</a>
      <div className="faq-wrap">
        <h2 className="faq-heading" id="faq-heading">{heading}</h2>
        <ul className="faq-list" role="list">
          {FAQ_ITEMS.map((item) => (
            <li key={item.q} className="faq-item">
              <details>
                <summary className="faq-q">{item.q}</summary>
                <p className="faq-a">{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
        <a href="#landing" className="back-link">↑ back to top</a>
      </div>
    </section>
  );
}
