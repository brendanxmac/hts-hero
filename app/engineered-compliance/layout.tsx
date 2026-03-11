import { ReactNode } from "react";
import { Metadata } from "next";
import { createClient } from "@/app/api/supabase/server";
import UnauthenticatedHeader from "../../components/UnauthenticatedHeader";
import { AuthenticatedHeader } from "../../components/AuthenticatedHeader";
import config from "@/config";

export const metadata: Metadata = {
  title: "Engineered Compliance — Trade Compliance Solutions for Importers | HTS Hero",
  description:
    "Custom trade compliance solutions built for your business. From HTS classification systems to tariff monitoring infrastructure, get engineered solutions that scale with your import operations.",
  keywords: [
    "trade compliance solutions",
    "customs compliance consulting",
    "HTS classification system",
    "import compliance automation",
    "tariff monitoring",
    "customs broker technology",
  ],
  openGraph: {
    title: "Engineered Compliance — Trade Compliance Solutions | HTS Hero",
    description:
      "Custom trade compliance solutions built for your business. HTS classification systems, tariff monitoring, and more.",
    url: `https://${config.domainName}/engineered-compliance`,
    siteName: "HTS Hero",
    type: "website",
  },
  alternates: {
    canonical: "/engineered-compliance",
  },
};

export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col max-h-svh bg-base-100 overflow-y-auto">
      {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      {children}
    </div>
  );
}
