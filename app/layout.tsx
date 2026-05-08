import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Outfit, Fraunces } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "hygge — Danish café in Leuven",
  description:
    "A Danish café in the heart of Leuven. Specialty coffee, smørrebrød, and pastry on Naamsestraat 55P.",
  openGraph: {
    title: "hygge — Danish café in Leuven",
    description:
      "Specialty coffee, smørrebrød, and pastry. Naamsestraat 55P, Leuven.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#e2d2b3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${outfit.variable} ${fraunces.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
