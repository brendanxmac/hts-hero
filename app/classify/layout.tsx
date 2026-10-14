import { ReactNode } from "react";
import { Metadata } from "next";
import config from "@/config";
import { MarketingLayout } from "@/components/MarketingLayout";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";

export const metadata: Metadata = {
  title: "Produce Audit-Ready HTS Classifications, Fast! | HTS Hero",
  description:
    "Classify any product correctly in minutes. Trusted by hundreds of customs brokers, freight forwarders, and manufacturers.",
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
    title: "Produce Audit-Ready HTS Classifications, Fast! | HTS Hero",
    description:
      "Classify any product correctly in minutes. Trusted by hundreds of customs brokers, freight forwarders, and manufacturers.",
    url: `https://${config.domainName}/classify`,
    siteName: "HTS Hero",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Produce Audit-Ready HTS Classifications, Fast! | HTS Hero",
    description:
      "Classify any product correctly in minutes. Trusted by hundreds of customs brokers, freight forwarders, and manufacturers.",
  },
  alternates: {
    canonical: "/classify",
  },
};

export default function ClassifyLayout({ children }: { children: ReactNode }) {
  // The Tariff Tracker's look, following the site's light/dark setting (DESIGN_SYSTEM.md §15)
  return (
    <FollowTheme>
      <MarketingLayout>{children}</MarketingLayout>
    </FollowTheme>
  );
}
