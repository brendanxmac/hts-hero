import { ReactNode } from "react";
import { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "AI HTS Classification Assistant for Customs Brokers & Importers | HTS Hero",
  description:
    "Classify any product in minutes with AI-powered HTS code suggestions, GRI analysis, legal note review, and CROSS ruling validation. Generate branded, audit-ready classification reports trusted by customs brokers and importers.",
  keywords: [
    "HTS classification tool",
    "AI customs classification",
    "HTS code lookup tool",
    "customs broker classification",
    "GRI analysis tool",
    "CROSS ruling validation",
    "audit-ready classification",
    "tariff classification assistant",
  ],
  openGraph: {
    title: "AI HTS Classification Assistant | HTS Hero",
    description:
      "Classify products with AI-powered suggestions, GRI analysis, and CROSS validation. Audit-ready reports in minutes.",
    url: `https://${config.domainName}/about`,
    siteName: "HTS Hero",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AI HTS Classification Assistant | HTS Hero",
    description:
      "Classify products with AI-powered suggestions, GRI analysis, and CROSS validation. Audit-ready reports in minutes.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
