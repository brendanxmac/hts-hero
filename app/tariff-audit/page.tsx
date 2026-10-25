import { Metadata } from "next";
import config from "@/config";
import { renderSchemaJsonLd } from "@/libs/seo";
import { getLatestVerifiedRevision, getVerifiedRange } from "@/tariffs/engine-v2/revisions";
import { getAuditExample } from "@/libs/tariff-audit-example";
import * as mk from "@/components/ui/marketing/styles";
import {
  AUDIT_FAQS,
  AuditFaq,
  AuditFlow,
  AuditHero,
  ClosingCta,
  DEFINITION,
  OverpaymentCauses,
  RecalcSection,
  RefundGroups,
  RequestAudit,
  StartPaths,
} from "@/components/tariff-audit";

// Static, refreshed daily with the tariff data
export const revalidate = 86400;

const URL = `https://${config.domainName}/tariff-audit`;
const TITLE = "Tariff Audit: Find Overpaid Import Duty & Refunds | HTS Hero";
const DESCRIPTION =
  "Audit past US import entries for overpaid duty, missed exemptions and refundable tariffs like IEEPA. Free for 14 days, or request one. Ready for your broker.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: "Find the import duty you overpaid",
    description: DESCRIPTION,
    url: URL,
    siteName: "HTS Hero",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Tariff audit by HTS Hero", description: DESCRIPTION },
  alternates: { canonical: "/tariff-audit" },
};

export default async function TariffAuditPage() {
  const verifiedFrom = getVerifiedRange().from;
  const example = await getAuditExample();

  return (
    <main className={`${mk.page} w-full flex-1 shrink-0`}>
      {renderSchemaJsonLd({
        "@type": "Service",
        name: "HTS Hero tariff audit",
        serviceType: "Customs duty audit",
        url: URL,
        description: DEFINITION,
        areaServed: "US",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        provider: { "@type": "Organization", name: "HTS Hero", url: `https://${config.domainName}` },
      })}
      {renderSchemaJsonLd({
        "@type": "WebPage",
        name: TITLE,
        url: URL,
        description: DESCRIPTION,
        // The refund statuses were last checked Oct 10, 2026; the recalculation follows the latest
        // verified HTS revision
        dateModified: getLatestVerifiedRevision().from,
      })}
      {renderSchemaJsonLd({
        "@type": "FAQPage",
        mainEntity: AUDIT_FAQS.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      })}
      {renderSchemaJsonLd({
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "HTS Hero", item: `https://${config.domainName}` },
          { "@type": "ListItem", position: 2, name: "Tariff audit", item: URL },
        ],
      })}

      <AuditHero />
      <OverpaymentCauses />
      <RecalcSection example={example} />
      <RefundGroups verifiedFrom={verifiedFrom} />
      <AuditFlow />
      <StartPaths />
      <RequestAudit />
      <AuditFaq />
      <ClosingCta />
    </main>
  );
}
