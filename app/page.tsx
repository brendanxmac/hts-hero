import { Metadata } from "next";
import { HomePage } from "../components/HomePage";
import { renderSchemaJsonLd } from "@/libs/seo";
import config from "@/config";

export const metadata: Metadata = {
  title:
    "HTS Hero — Produce Audit-Ready HTS Classifications, Fast!",
  description:
    "Classify any product correctly in minutes, see the duties and tariffs for any import, and check tariff impact on your imports. Trusted by hundreds of customs brokers, freight forwarders, and manufacturers.",
  keywords: [
    "HTS Hero",
    "US import duty calculator",
    "HTS classification",
    "harmonized tariff schedule",
    "tariff calculator",
    "us tariff calculator",
    "customs duty calculator",
    "HTS code lookup",
    "import tariff",
    "trade compliance",
    "customs broker tools",
  ],
  openGraph: {
    title: "HTS Hero — Produce Audit-Ready HTS Classifications, Fast!",
    description:
      "Free tools for importers: calculate duties by HTS code, classify products with AI, and check tariff impacts on your imports.",
    url: `https://${config.domainName}`,
    siteName: "HTS Hero",
    type: "website",
    images: [
      {
        url: `https://${config.domainName}/hero-tariffs.png`,
        width: 1200,
        height: 630,
        alt: "HTS Hero — US Import Duty Calculator & Classification Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HTS Hero — Produce Audit-Ready HTS Classifications, Fast!",
    description:
      "Free tools for importers: calculate duties by HTS code, classify products with AI, and check tariff impacts.",
    images: [`https://${config.domainName}/hero-tariffs.png`],
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      {renderSchemaJsonLd({
        "@type": "WebSite",
        name: "HTS Hero",
        url: `https://${config.domainName}`,
        description:
          "Classify any product in minutes and see the tariff rate for any import. Trusted by hundreds of customs brokers, freight forwarders, and importers.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `https://${config.domainName}/hts/{search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      })}
      {renderSchemaJsonLd({
        "@type": "Organization",
        name: "HTS Hero",
        url: `https://${config.domainName}`,
        logo: `https://${config.domainName}/logo.svg`,
        description:
          "Trade compliance tools for US importers — duty calculators, AI classification, and tariff impact analysis.",
      })}
      <HomePage />
    </>
  );
}
