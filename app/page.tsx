import type { Metadata } from "next";
import PageContent from "./PageContent";
import { messages } from "./messages";

export const metadata: Metadata = {
  title: messages.en.meta.title,
  description: messages.en.meta.description,
  alternates: {
    canonical: "https://hygge.emre.zip/",
    languages: {
      en: "https://hygge.emre.zip/",
      nl: "https://hygge.emre.zip/nl",
    },
  },
};

export default function HomeEN() {
  return <PageContent t={messages.en} locale="en" />;
}
