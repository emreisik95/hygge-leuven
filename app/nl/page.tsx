import type { Metadata } from "next";
import PageContent from "../PageContent";
import { messages } from "../messages";

export const metadata: Metadata = {
  title: messages.nl.meta.title,
  description: messages.nl.meta.description,
  alternates: {
    canonical: "https://hygge.emre.zip/nl",
    languages: {
      en: "https://hygge.emre.zip/",
      nl: "https://hygge.emre.zip/nl",
    },
  },
};

export default function HomeNL() {
  return <PageContent t={messages.nl} locale="nl" />;
}
