export type Locale = "en" | "nl";

export type Messages = {
  meta: { title: string; description: string };
  nav: {
    story: string;
    serve: string;
    visit: string;
    instagram: string;
    visitUs: string;
    findUs: string;
  };
  status: { open: string; address: string };
  hero: {
    tagline1: string;
    tagline2: string;
    pronGloss: string;
    headline: string;
    copy: string;
    today: string;
    weekend: string;
    todayHours: string;
    weekendHours: string;
  };
  marquee: string[];
  story: {
    num: string;
    h2Pre: string;
    h2Em: string;
    p1: string;
    p2: string;
    p3: string;
  };
  pillars: {
    num: string;
    h2Pre: string;
    h2Em: string;
    aside: string;
    items: { eyebrow: string; title: string; copy: string }[];
  };
  visit: {
    num: string;
    h2Pre: string;
    h2Em: string;
    addressMeta: string;
    hours: string;
    sayHej: string;
    openInMaps: string;
    days: { mt: string; fr: string; sa: string; su: string };
    hoursLines: { mt: string; fr: string; sa: string; su: string };
  };
  feed: {
    num: string;
    label: string;
    h2: string;
    body: string;
    handle: string;
    bio: string;
    follow: string;
    tiles: {
      pron: string;
      open: string;
      coffeeBullet: string;
      coffeeText: string;
      smorrebrod: string;
    };
    igFoot: string;
  };
  footer: {
    tagline: string;
    visit: string;
    hours: string;
    elsewhere: string;
    hoursMt: string;
    hoursFs: string;
    hoursSu: string;
    instagram: string;
    googleMaps: string;
    bottomLeft: string;
    bottomRight: string;
  };
};

export const messages: Record<Locale, Messages> = {
  en: {
    meta: {
      title: "hygge — Danish café in Leuven",
      description:
        "A Danish café in the heart of Leuven. Specialty coffee, smørrebrød, and pastry on Naamsestraat 55P.",
    },
    nav: {
      story: "story",
      serve: "what we serve",
      visit: "visit",
      instagram: "instagram",
      visitUs: "visit us",
      findUs: "find us",
    },
    status: { open: "now open · seven days a week", address: "Naamsestraat 55P · Leuven 3000" },
    hero: {
      tagline1: "a place to hold hands",
      tagline2: "or hold a cup.",
      pronGloss: "a feeling of cozy contentment.",
      headline: "come on in, the kettle’s already on.",
      copy: "specialty coffee, danish lunch, and small soft moments — open seven days on Naamsestraat.",
      today: "today",
      weekend: "weekend",
      todayHours: "8:00 — 18:00",
      weekendHours: "9:00 — 19:00",
    },
    marquee: [
      "specialty coffee",
      "smørrebrød",
      "cardamom buns",
      "filter & espresso",
      "danish lunch",
      "cinnamon swirls",
    ],
    story: {
      num: "I. — story",
      h2Pre: "what is ",
      h2Em: "hygge?",
      p1:
        "Hygge — pronounced “hyü‑ge” — is a Danish word for coziness. Slowing down, enjoying the simple moments, feeling at home wherever you happen to be.",
      p2:
        "It’s the feeling when you’re wrapped in a blanket with a cup of coffee. When laughter fills the room. When the rain taps on the window and everything feels just right.",
      p3:
        "We brought a little of it from Copenhagen to Naamsestraat. Stay a while.",
    },
    pillars: {
      num: "II. — what we serve",
      h2Pre: "small things, ",
      h2Em: "made slowly.",
      aside: "menu rotates with the seasons — follow the feed for today’s bake.",
      items: [
        {
          eyebrow: "no. 01",
          title: "specialty coffee",
          copy:
            "espresso, filter, and slow pour-over. small Belgian roasters, seasonal beans, careful hands.",
        },
        {
          eyebrow: "no. 02",
          title: "smørrebrød",
          copy:
            "open-faced danish sandwiches on dark rye — pickled herring, roast beef, egg & shrimp. lunch, all afternoon.",
        },
        {
          eyebrow: "no. 03",
          title: "pastry & sweets",
          copy:
            "cardamom buns, cinnamon swirls, a slice of something with a berry on top. baked here every morning.",
        },
      ],
    },
    visit: {
      num: "III. — visit",
      h2Pre: "find us on ",
      h2Em: "Naamsestraat.",
      addressMeta:
        "two minutes from the Grote Markt, around the corner from St. Peter’s. push the door, the bell rings, you’re home.",
      hours: "hours",
      sayHej: "say hej",
      openInMaps: "open in maps",
      days: { mt: "mon — thu", fr: "fri", sa: "sat", su: "sun" },
      hoursLines: {
        mt: "8:00 — 18:00",
        fr: "8:00 — 19:00",
        sa: "9:00 — 19:00",
        su: "9:00 — 17:00",
      },
    },
    feed: {
      num: "IV. — feed",
      label: "today, on the gram",
      h2: "follow along on instagram.",
      body: "daily bake, the lunch board, the new beans, the corner table on a quiet wednesday. small things, made slowly, posted slowly.",
      handle: "hygge.leuven",
      bio: "Leuven · Danish café",
      follow: "follow",
      tiles: {
        pron: "Danish [hyü‑ge] noun",
        open: "now open",
        coffeeBullet: "coffee all day long",
        coffeeText:
          "espresso, filter, slow pour-over. small Belgian roasters.",
        smorrebrod: "but what is this smørrebrød??",
      },
      igFoot: "open in instagram",
    },
    footer: {
      tagline:
        "a Danish café in the heart of Leuven. specialty coffee, smørrebrød, and pastry, all day long.",
      visit: "visit",
      hours: "hours",
      elsewhere: "elsewhere",
      hoursMt: "mon — thu · 8 – 18",
      hoursFs: "fri — sat · 8 – 19",
      hoursSu: "sun · 9 – 17",
      instagram: "instagram ↗",
      googleMaps: "google maps ↗",
      bottomLeft: "© hygge leuven · 2026",
      bottomRight: "made with care in leuven",
    },
  },
  nl: {
    meta: {
      title: "hygge — Deens café in Leuven",
      description:
        "Een Deens café in het hart van Leuven. Specialty koffie, smørrebrød en gebak in de Naamsestraat 55P.",
    },
    nav: {
      story: "verhaal",
      serve: "wat we serveren",
      visit: "bezoek",
      instagram: "instagram",
      visitUs: "kom langs",
      findUs: "vind ons",
    },
    status: {
      open: "nu geopend · zeven dagen per week",
      address: "Naamsestraat 55P · Leuven 3000",
    },
    hero: {
      tagline1: "een plek om handen te houden",
      tagline2: "of een kopje vast te houden.",
      pronGloss: "een gevoel van knusse tevredenheid.",
      headline: "kom binnen, de ketel staat al op.",
      copy: "specialty koffie, deense lunch en kleine zachte momenten — zeven dagen open in de Naamsestraat.",
      today: "vandaag",
      weekend: "weekend",
      todayHours: "8:00 — 18:00",
      weekendHours: "9:00 — 19:00",
    },
    marquee: [
      "specialty koffie",
      "smørrebrød",
      "kardemombroodjes",
      "filter & espresso",
      "deense lunch",
      "kaneelbroodjes",
    ],
    story: {
      num: "I. — verhaal",
      h2Pre: "wat is ",
      h2Em: "hygge?",
      p1:
        "Hygge — uitgesproken als “hyü‑ge” — is een Deens woord voor gezelligheid. Het is rustig aan doen, genieten van de kleine dingen, je thuis voelen waar je ook bent.",
      p2:
        "Het is dat gevoel als je in een dekentje gewikkeld zit met een kopje koffie. Als de kamer vol gelach is. Als de regen tegen het raam tikt en alles precies klopt.",
      p3:
        "We hebben er een beetje meegenomen van Kopenhagen naar de Naamsestraat. Blijf gerust een tijdje.",
    },
    pillars: {
      num: "II. — wat we serveren",
      h2Pre: "kleine dingen, ",
      h2Em: "rustig gemaakt.",
      aside: "het menu verandert met de seizoenen — volg de feed voor wat we vandaag bakken.",
      items: [
        {
          eyebrow: "nr. 01",
          title: "specialty koffie",
          copy:
            "espresso, filter en langzame pour-over. kleine Belgische branders, seizoensbonen, zorgvuldige handen.",
        },
        {
          eyebrow: "nr. 02",
          title: "smørrebrød",
          copy:
            "open deense boterhammen op donker roggebrood — gepekelde haring, rosbief, ei & garnaal. lunch, de hele middag.",
        },
        {
          eyebrow: "nr. 03",
          title: "gebak & zoetigheid",
          copy:
            "kardemombroodjes, kaneelbroodjes, een plakje met een bes erop. elke ochtend hier vers gebakken.",
        },
      ],
    },
    visit: {
      num: "III. — bezoek",
      h2Pre: "vind ons in de ",
      h2Em: "Naamsestraat.",
      addressMeta:
        "twee minuten van de Grote Markt, om de hoek van Sint-Pieter. duw de deur open, de bel rinkelt, je bent thuis.",
      hours: "openingstijden",
      sayHej: "zeg hej",
      openInMaps: "bekijk op de kaart",
      days: { mt: "ma — do", fr: "vr", sa: "za", su: "zo" },
      hoursLines: {
        mt: "8:00 — 18:00",
        fr: "8:00 — 19:00",
        sa: "9:00 — 19:00",
        su: "9:00 — 17:00",
      },
    },
    feed: {
      num: "IV. — feed",
      label: "vandaag, op insta",
      h2: "volg ons op instagram.",
      body: "dagelijks vers gebakken, het lunchbord, de nieuwe bonen, het hoektafeltje op een rustige woensdag. kleine dingen, rustig gemaakt, rustig gepost.",
      handle: "hygge.leuven",
      bio: "Leuven · Deens café",
      follow: "volg",
      tiles: {
        pron: "Deens [hyü‑ge] zelfstandig naamwoord",
        open: "nu geopend",
        coffeeBullet: "koffie de hele dag",
        coffeeText:
          "espresso, filter, langzame pour-over. kleine Belgische branders.",
        smorrebrod: "maar wat is smørrebrød??",
      },
      igFoot: "open in instagram",
    },
    footer: {
      tagline:
        "een Deens café in het hart van Leuven. specialty koffie, smørrebrød en gebak, de hele dag door.",
      visit: "bezoek",
      hours: "openingstijden",
      elsewhere: "elders",
      hoursMt: "ma — do · 8 – 18",
      hoursFs: "vr — za · 8 – 19",
      hoursSu: "zo · 9 – 17",
      instagram: "instagram ↗",
      googleMaps: "google maps ↗",
      bottomLeft: "© hygge leuven · 2026",
      bottomRight: "met zorg gemaakt in leuven",
    },
  },
};
