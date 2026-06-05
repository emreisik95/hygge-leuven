import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { GFS_Didot, Outfit, Fraunces } from "next/font/google";
import "./globals.css";
import { getContentForLocale } from "@/lib/db";
import { LOCALE_COOKIE, parseLocale, toPrismaLocale } from "@/lib/locale";
import { getOrigin, CAFE } from "@/lib/site";

const gfsDidot = GFS_Didot({
  variable: "--font-serif",
  subsets: ["greek", "latin"],
  weight: ["400"],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-editorial",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
});

const OG_LOCALE = { EN: "en_GB", NL: "nl_BE", FR: "fr_BE" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const store = await cookies();
  const locale = parseLocale(store.get(LOCALE_COOKIE)?.value);
  const c = await getContentForLocale(toPrismaLocale(locale));
  const origin = await getOrigin();
  const ogImage = {
    url: "/assets/og.png",
    width: 1200,
    height: 630,
    alt: `${c.brandName} — ${CAFE.street}, ${CAFE.locality}`,
  };

  return {
    metadataBase: new URL(origin),
    title: c.metaTitle,
    description: c.metaDescription,
    applicationName: c.brandName,
    keywords: [
      "café Leuven",
      "koffie Leuven",
      "specialty coffee Leuven",
      "Danish café",
      "brunch Leuven",
      "smørrebrød Leuven",
      "hygge",
    ],
    authors: [{ name: c.brandName }],
    creator: c.brandName,
    publisher: c.brandName,
    alternates: {
      canonical: "/",
      languages: {
        en: "/",
        nl: "/",
        fr: "/",
        "x-default": "/",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      type: "website",
      siteName: c.brandName,
      url: "/",
      locale: OG_LOCALE[locale],
      alternateLocale: Object.values(OG_LOCALE).filter((l) => l !== OG_LOCALE[locale]),
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: c.metaTitle,
      description: c.metaDescription,
      images: [ogImage],
    },
    appleWebApp: {
      capable: true,
      title: c.brandName,
      statusBarStyle: "black-translucent",
    },
    formatDetection: { telephone: false, address: false, email: false },
    other: {
      "geo.region": "BE-VBR",
      "geo.placename": CAFE.locality,
      "geo.position": `${CAFE.lat};${CAFE.lng}`,
      ICBM: `${CAFE.lat}, ${CAFE.lng}`,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#3a2a1f",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const store = await cookies();
  const locale = parseLocale(store.get(LOCALE_COOKIE)?.value);
  return (
    <html
      lang={locale.toLowerCase()}
      className={`${gfsDidot.variable} ${outfit.variable} ${fraunces.variable}`}
    >
      <body>
        <a href="#landing" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
