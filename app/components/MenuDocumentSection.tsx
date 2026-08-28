import type { LocaleCode } from "@/lib/locale";
import {
  MENU_IMAGE_URL,
  MENU_PUBLIC_URL,
  readCurrentMenuTranscript,
} from "@/lib/menu-document";

const COPY: Record<
  LocaleCode,
  { intro: string; open: string; download: string; viewer: string; text: string }
> = {
  EN: {
    intro: "Coffee, tea, seasonal iced drinks, Danish smørrebrød, and sweets from the bar.",
    open: "Open PDF",
    download: "Download PDF",
    viewer: "Hygge seasonal menu",
    text: "Read menu as text",
  },
  NL: {
    intro: "Koffie, thee, seizoensdranken, Deense smørrebrød en zoetigheden van de bar.",
    open: "PDF openen",
    download: "PDF downloaden",
    viewer: "Hygge seizoensmenu",
    text: "Menu als tekst lezen",
  },
  FR: {
    intro: "Café, thé, boissons glacées de saison, smørrebrød danois et douceurs du comptoir.",
    open: "Ouvrir le PDF",
    download: "Télécharger le PDF",
    viewer: "Menu saisonnier Hygge",
    text: "Lire le menu en texte",
  },
};

export async function MenuDocumentSection({
  locale,
  heading,
  tagline,
  skipLabel,
  backToTopLabel,
}: {
  locale: LocaleCode;
  heading: string;
  tagline: string;
  skipLabel: string;
  backToTopLabel: string;
}) {
  const copy = COPY[locale];
  const transcript = await readCurrentMenuTranscript();

  return (
    <section className="pane pane-menu menu-document-section" id="menu" aria-labelledby="menu-heading">
      <a href="#contact" className="skip-link">{skipLabel}</a>
      <div className="menu-document-wrap">
        <header className="menu-head">
          <h2 className="menu-heading" id="menu-heading">{heading}</h2>
          <p className="menu-sub">{tagline}</p>
          <p className="menu-document-intro">{copy.intro}</p>
        </header>

        <div className="menu-document-frame">
          <img
            src={MENU_IMAGE_URL}
            alt={copy.viewer}
            width={1489}
            height={2106}
            loading="lazy"
            decoding="async"
          />
        </div>

        <details className="menu-text-alternative" id="menu-text-alternative">
          <summary>{copy.text}</summary>
          <div className="menu-text-transcript">
            <pre>{transcript}</pre>
          </div>
        </details>

        <div className="menu-document-actions">
          <a href={MENU_PUBLIC_URL} target="_blank" rel="noreferrer" className="btn btn-primary">
            {copy.open}
          </a>
          <a href={MENU_PUBLIC_URL} download className="btn btn-secondary">
            {copy.download}
          </a>
          <a href="#landing" className="back-link">{backToTopLabel}</a>
        </div>
      </div>
    </section>
  );
}
