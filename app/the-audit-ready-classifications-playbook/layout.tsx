import { ReactNode } from "react";
import { Metadata } from "next";
import { LeadMagnetHeader } from "../../components/LeadMagnetHeader";
import config from "@/config";

export const metadata: Metadata = {
  title: "The Audit-Ready Classifications Playbook — Free HTS Guide | HTS Hero",
  description:
    "Download the free playbook that teaches importers and customs brokers how to produce HTS classifications that reduce import risk and protect profits. Includes the CLEAR Framework, the DOOR Method, templates, and 7 bonus tools.",
  keywords: [
    "HTS classification playbook",
    "audit-ready classification",
    "HTS classification guide",
    "customs classification training",
    "CLEAR Framework",
    "DOOR Method",
    "HTS code classification",
    "customs broker training",
    "import compliance guide",
  ],
  openGraph: {
    title: "The Audit-Ready Classifications Playbook — Free Download",
    description:
      "Learn how to produce HTS classifications that reduce import risk and protect profits. Free playbook + 7 bonus tools for customs brokers and importers.",
    url: `https://${config.domainName}/the-audit-ready-classifications-playbook`,
    siteName: "HTS Hero",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Audit-Ready Classifications Playbook — Free Download",
    description:
      "Learn how to produce HTS classifications that reduce import risk and protect profits. Free playbook + 7 bonus tools.",
  },
  alternates: {
    canonical: "/the-audit-ready-classifications-playbook",
  },
};

export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <div className="flex flex-col bg-base-100">
      <LeadMagnetHeader />
      {children}
    </div>
  );
}
