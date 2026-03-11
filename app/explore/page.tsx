import { Metadata } from "next";
import { Explore } from "../../components/Explore";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import config from "@/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse the Harmonized Tariff Schedule (HTS) — Free Lookup | HTS Hero",
  description:
    "Search and browse the complete US Harmonized Tariff Schedule. Look up any HTS code by number or product description to find duty rates, tariff classifications, and trade program eligibility.",
  keywords: [
    "HTS code lookup",
    "harmonized tariff schedule",
    "HTS search",
    "HTSUS browse",
    "tariff schedule lookup",
    "HTS code search",
    "US tariff code",
    "import classification",
  ],
  openGraph: {
    title: "Browse the Harmonized Tariff Schedule | HTS Hero",
    description:
      "Search the complete US Harmonized Tariff Schedule by code or description.",
    url: `https://${config.domainName}/explore`,
    siteName: "HTS Hero",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Browse the Harmonized Tariff Schedule | HTS Hero",
    description:
      "Search and browse the complete US HTS. Find any tariff code by number or description.",
  },
  alternates: {
    canonical: "/explore",
  },
};

export default function Home() {
  return (
    <main className="w-full min-h-0 flex flex-col bg-base-100">
      <BreadcrumbsProvider>
        <Explore />
      </BreadcrumbsProvider>
    </main>
  );
}
