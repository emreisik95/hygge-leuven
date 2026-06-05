import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "hygge — Danish café in Leuven",
    short_name: "hygge",
    description:
      "Specialty coffee, pastry, and Danish lunch at Naamsestraat 55, Leuven.",
    start_url: "/",
    display: "standalone",
    background_color: "#2b1d14",
    theme_color: "#3a2a1f",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/favicon.ico", type: "image/x-icon", sizes: "48x48" },
    ],
  };
}
