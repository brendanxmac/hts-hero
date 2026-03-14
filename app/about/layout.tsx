import { ReactNode } from "react";
import { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "HTS Code Finder for US Importers & Customs Brokers | HTS Hero",
  description:
    "Find the HTS Code for any product in minutes & generate branded, audit-ready classification reports trusted by customs brokers and importers.",
  keywords: [
    "HTS Code Finder",
    "HTS Code Lookup",
    "HTS classification tool",
    "HTS code lookup tool",
    "customs broker classification",
    "CROSS ruling validation",
    "audit-ready classification",
    "tariff classification assistant",
  ],
  openGraph: {
    title: "HTS Code Finder for US Importers & Customs Brokers | HTS Hero",
    description:
      "Find the HTS Code for any product in minutes & generate branded, audit-ready classification reports trusted by customs brokers and importers.",
    url: `https://${config.domainName}/classify`,
    siteName: "HTS Hero",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTS Code Finder for US Importers & Customs Brokers | HTS Hero",
    description:
      "Find the HTS Code for any product in minutes & generate branded, audit-ready classification reports trusted by customs brokers and importers.",
  },
  alternates: {
    canonical: "/classify",
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
