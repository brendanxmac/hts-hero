import { Metadata } from "next";
import { ClassifyController } from "../../components/ClassifyController";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import config from "@/config";

export const metadata: Metadata = {
  title:
    "AI-Powered HTS Classification Assistant — Audit-Ready Reports | HTS Hero",
  description:
    "Classify products with AI-powered HTS code suggestions, GRI analysis, and CROSS ruling validation. Generate branded, audit-ready classification reports in seconds. Free for customs brokers and importers.",
  keywords: [
    "HTS classification",
    "AI HTS classification",
    "tariff classification assistant",
    "HTS code classification",
    "customs classification tool",
    "GRI analysis",
    "CROSS ruling validation",
    "classification report",
    "harmonized tariff schedule classification",
    "customs broker classification tool",
  ],
  openGraph: {
    title: "AI-Powered HTS Classification Assistant | HTS Hero",
    description:
      "Classify products with AI-powered suggestions, GRI analysis, and CROSS ruling validation. Generate audit-ready reports instantly.",
    url: `https://${config.domainName}/classifications`,
    siteName: "HTS Hero",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AI HTS Classification Assistant | HTS Hero",
    description:
      "AI-powered HTS classification with GRI analysis and CROSS validation. Audit-ready reports in seconds.",
  },
  alternates: {
    canonical: "/classifications",
  },
};

export default function Home() {
  return (
    <main className="w-full bg-base-300">
      <BreadcrumbsProvider>
        <ClassifyController />
      </BreadcrumbsProvider>
    </main>
  );
}
