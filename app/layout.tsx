import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Outfit, Fraunces } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/db";

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
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
  const c = await getContent();
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      type: "website",
      siteName: c.brandName,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#3a2a1f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${outfit.variable} ${fraunces.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
