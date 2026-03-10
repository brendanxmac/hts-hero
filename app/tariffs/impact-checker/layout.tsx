import { ReactNode } from "react";
import { Metadata } from "next";
import UnauthenticatedHeader from "../../../components/UnauthenticatedHeader";
import { createClient } from "@/app/api/supabase/server";
import { AuthenticatedHeader } from "../../../components/AuthenticatedHeader";
import config from "@/config";

export const metadata: Metadata = {
  title: "Tariff Impact Checker — See If New Tariffs Affect Your Imports | HTS Hero",
  description:
    "Instantly check if the latest US tariff announcements affect your imports. Paste your HTS codes to see which products are impacted by Section 301, Section 232, and other tariff changes.",
  keywords: [
    "tariff impact checker",
    "tariff change checker",
    "Section 301 impact",
    "tariff announcement checker",
    "import tariff changes",
    "trump tariff checker",
    "tariff impact analysis",
    "HTS code tariff check",
  ],
  openGraph: {
    title: "Tariff Impact Checker | HTS Hero",
    description:
      "Check if the latest tariff announcements affect your imports. Paste your HTS codes and see which products are impacted.",
    url: `https://${config.domainName}/tariffs/impact-checker`,
    siteName: "HTS Hero",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tariff Impact Checker | HTS Hero",
    description:
      "Check if new tariffs affect your imports. Paste your HTS codes to see the impact.",
  },
  alternates: {
    canonical: "/tariffs/impact-checker",
  },
};

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="h-screen flex flex-col max-h-svh bg-base-100 overflow-y-auto">
      {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      {children}
    </div>
  );
}
