import { ReactNode } from "react";
import { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "Tariff Impact Checker — See If New Tariffs Affect Your Imports | HTS Hero",
  description:
    "Instantly check if the latest US tariff announcements affect your imports. Paste your HTS codes to see which products are impacted by Section 301, Section 232, reciprocal tariffs, and more. Get notified when new tariffs are published.",
  keywords: [
    "tariff impact checker",
    "tariff change checker",
    "import tariff monitor",
    "Section 301 impact",
    "tariff notification",
    "HTS code tariff check",
    "trump tariff checker",
  ],
  openGraph: {
    title: "Tariff Impact Checker | HTS Hero",
    description:
      "Check if new tariff announcements affect your imports. Paste HTS codes to see which products are impacted.",
    url: `https://${config.domainName}/about/tariff-impact-checker`,
    siteName: "HTS Hero",
    type: "website",
  },
  alternates: {
    canonical: "/about/tariff-impact-checker",
  },
};

export default async function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
