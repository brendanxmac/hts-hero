import { Metadata } from "next";
import config from "@/config";
import { ClassificationsPageContent } from "../../components/ClassificationsPageContent";

export const metadata: Metadata = {
  title:
    "HTS Code Finder for US Importers & Customs Brokers | HTS Hero",
  description:
    "Find the HTS Code for any product in minutes & generate branded, audit-ready classification reports trusted by customs brokers and importers.",
  keywords: [
    "HTS Code Finder",
    "HTS Code Lookup",
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
    title: "HTS Code Finder for US Importers & Customs Brokers | HTS Hero",
    description:
      "Find the HTS Code for any product in minutes & generate branded, audit-ready classification reports trusted by customs brokers and importers.",
    url: `https://${config.domainName}/classifications`,
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
    canonical: "/classifications",
  },
};

export default function ClassificationsListPage() {
  return (
    <main className="w-full bg-base-300">
      <ClassificationsPageContent />
    </main>
  );
}
