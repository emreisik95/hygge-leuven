import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { GFS_Didot, Outfit, Fraunces } from "next/font/google";
import "./globals.css";
import { getContentForLocale } from "@/lib/db";
import { LOCALE_COOKIE, parseLocale, toPrismaLocale } from "@/lib/locale";

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

export async function generateMetadata(): Promise<Metadata> {
  const store = await cookies();
  const locale = parseLocale(store.get(LOCALE_COOKIE)?.value);
  const c = await getContentForLocale(toPrismaLocale(locale));
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      type: "website",
      siteName: c.brandName,
      locale: locale.toLowerCase(),
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
