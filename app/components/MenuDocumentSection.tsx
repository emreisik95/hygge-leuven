import type { LocaleCode } from "@/lib/locale";
import { MENU_PUBLIC_URL } from "@/lib/menu-document";

const COPY: Record<
  LocaleCode,
  { intro: string; open: string; download: string; fallback: string; viewer: string }
> = {
  EN: {
    intro: "Coffee, tea, seasonal iced drinks, Danish smørrebrød, and sweets from the bar.",
    open: "Open full menu",
    download: "Download PDF",
    fallback: "Your browser cannot display the menu here.",
    viewer: "Hygge seasonal menu PDF",
  },
  NL: {
    intro: "Koffie, thee, seizoensdranken, Deense smørrebrød en zoetigheden van de bar.",
    open: "Volledig menu openen",
    download: "PDF downloaden",
    fallback: "Je browser kan het menu hier niet weergeven.",
    viewer: "Hygge seizoensmenu als PDF",
  },
  FR: {
    intro: "Café, thé, boissons glacées de saison, smørrebrød danois et douceurs du comptoir.",
    open: "Ouvrir le menu complet",
    download: "Télécharger le PDF",
    fallback: "Votre navigateur ne peut pas afficher le menu ici.",
    viewer: "Menu saisonnier Hygge en PDF",
  },
};

export function MenuDocumentSection({
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

        <div className="menu-document-frame">
          <object data={MENU_PUBLIC_URL} type="application/pdf" aria-label={copy.viewer}>
            <p className="menu-document-fallback">
              {copy.fallback}{" "}
              <a href={MENU_PUBLIC_URL} target="_blank" rel="noreferrer">{copy.open}</a>
            </p>
          </object>
        </div>

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
