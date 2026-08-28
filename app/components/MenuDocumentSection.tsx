import type { LocaleCode } from "@/lib/locale";
import { MENU_IMAGE_URL, MENU_PUBLIC_URL } from "@/lib/menu-document";

const COPY: Record<
  LocaleCode,
  { intro: string; open: string; download: string; viewer: string; zoom: string }
> = {
  EN: {
    intro: "Coffee, tea, seasonal iced drinks, Danish smørrebrød, and sweets from the bar.",
    open: "Open PDF",
    download: "Download PDF",
    viewer: "Hygge seasonal menu",
    zoom: "Tap the menu to enlarge",
  },
  NL: {
    intro: "Koffie, thee, seizoensdranken, Deense smørrebrød en zoetigheden van de bar.",
    open: "PDF openen",
    download: "PDF downloaden",
    viewer: "Hygge seizoensmenu",
    zoom: "Tik op het menu om te vergroten",
  },
  FR: {
    intro: "Café, thé, boissons glacées de saison, smørrebrød danois et douceurs du comptoir.",
    open: "Ouvrir le PDF",
    download: "Télécharger le PDF",
    viewer: "Menu saisonnier Hygge",
    zoom: "Touchez le menu pour l’agrandir",
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

  return (
    <section className="pane pane-menu menu-document-section" id="menu" aria-labelledby="menu-heading">
      <a href="#contact" className="skip-link">{skipLabel}</a>
      <div className="menu-document-wrap">
        <header className="menu-head">
          <h2 className="menu-heading" id="menu-heading">{heading}</h2>
          <p className="menu-sub">{tagline}</p>
          <p className="menu-document-intro">{copy.intro}</p>
        </header>

        <a
          href={MENU_IMAGE_URL}
          target="_blank"
          rel="noreferrer"
          className="menu-document-image-link"
          aria-label={`${copy.zoom}: ${copy.viewer}`}
        >
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
          <span className="menu-document-zoom-hint">{copy.zoom}</span>
        </a>

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
