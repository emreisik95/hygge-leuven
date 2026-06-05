-- Seed translations for newly-extracted landing UI labels (EN/NL/FR).
-- Previously these strings were hardcoded English in Landing.tsx, so NL/FR
-- visitors saw English fragments. INSERT OR IGNORE keeps this idempotent and
-- never clobbers values an admin edits later.

INSERT OR IGNORE INTO "Translation" ("namespace","locale","value","updatedAt") VALUES
  ('site.menuHeading','EN','menu',datetime('now')),
  ('site.menuHeading','NL','menu',datetime('now')),
  ('site.menuHeading','FR','menu',datetime('now')),

  ('site.menuNavLabel','EN','Menu',datetime('now')),
  ('site.menuNavLabel','NL','Menu',datetime('now')),
  ('site.menuNavLabel','FR','Menu',datetime('now')),

  ('site.soldOutLabel','EN','sold out',datetime('now')),
  ('site.soldOutLabel','NL','uitverkocht',datetime('now')),
  ('site.soldOutLabel','FR','épuisé',datetime('now')),

  ('site.mapsLinkLabel','EN','Open in Google Maps',datetime('now')),
  ('site.mapsLinkLabel','NL','Openen in Google Maps',datetime('now')),
  ('site.mapsLinkLabel','FR','Ouvrir dans Google Maps',datetime('now')),

  ('site.backToTopLabel','EN','↑ back to top',datetime('now')),
  ('site.backToTopLabel','NL','↑ terug naar boven',datetime('now')),
  ('site.backToTopLabel','FR','↑ retour en haut',datetime('now')),

  ('site.instaEmptyLine','EN','A live feed will appear here soon.',datetime('now')),
  ('site.instaEmptyLine','NL','Hier verschijnt binnenkort een live feed.',datetime('now')),
  ('site.instaEmptyLine','FR','Un flux en direct apparaîtra bientôt ici.',datetime('now')),

  ('site.instaEmptySub','EN','See us on Instagram →',datetime('now')),
  ('site.instaEmptySub','NL','Bekijk ons op Instagram →',datetime('now')),
  ('site.instaEmptySub','FR','Voir sur Instagram →',datetime('now')),

  ('site.seeMoreLabel','EN','See more',datetime('now')),
  ('site.seeMoreLabel','NL','Meer zien',datetime('now')),
  ('site.seeMoreLabel','FR','Voir plus',datetime('now')),

  ('site.skipSectionLabel','EN','Skip section',datetime('now')),
  ('site.skipSectionLabel','NL','Sectie overslaan',datetime('now')),
  ('site.skipSectionLabel','FR','Passer la section',datetime('now')),

  ('site.newTabLabel','EN','(opens in new tab)',datetime('now')),
  ('site.newTabLabel','NL','(opent in nieuw tabblad)',datetime('now')),
  ('site.newTabLabel','FR','(ouvre un nouvel onglet)',datetime('now'));
