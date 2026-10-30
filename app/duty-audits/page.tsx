import { Metadata } from "next";
import config from "@/config";
import { renderSchemaJsonLd } from "@/libs/seo";
import { getLatestVerifiedRevision } from "@/tariffs/engine-v2/revisions";
import { getAuditExample, getAuditScans, type AuditScan } from "@/libs/tariff-audit-example";
import * as mk from "@/components/ui/marketing/styles";
import {
  AUDIT_FAQS,
  AuditFaq,
  AuditFlow,
  AuditHero,
  AuditPricing,
  PaybackSection,
  ClosingCta,
  DEFINITION,
  KeepAllSection,
  CompareSection,
  OverpaymentCauses,
  RecalcSection,
} from "@/components/tariff-audit";
import { AUDIT_TIERS } from "@/components/pricing-calculator/lib/pricing";

// Static, refreshed daily with the tariff data
export const revalidate = 86400;

const URL = `https://${config.domainName}/duty-audits`;
const TITLE = "Duty Audits: Find Overpaid Import Duty & Refunds | HTS Hero";
const DESCRIPTION =
  "Audit past US import entries for overpaid duty, missed exemptions and refundable tariffs like IEEPA. Plans from $49 a month, by your number of products. Keep 100% of any refund.";

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
  alternates: { canonical: "/duty-audits" },
};

export default async function TariffAuditPage() {
  const [example, scans] = await Promise.all([getAuditExample(), getAuditScans().catch((): AuditScan[] => [])]);

  return (
    <main className={`${mk.page} w-full flex-1 shrink-0`}>
      {renderSchemaJsonLd({
        "@type": "Service",
        name: "HTS Hero Duty Audits",
        serviceType: "Customs duty audit",
        url: URL,
        description: DEFINITION,
        areaServed: "US",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: String(AUDIT_TIERS[0].price),
          highPrice: String(AUDIT_TIERS[AUDIT_TIERS.length - 1].price),
          offerCount: String(AUDIT_TIERS.length),
          description: "Ongoing audits are priced per month by the number of products tracked (one HTS code from one country of origin), each with Tariff Alerts included and a 10-audit money-back guarantee. Historical audits of past entries are quoted. No contingency fee.",
        },
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

      <AuditHero scans={scans} />
      {/* <OverpaymentCauses /> */}
      <KeepAllSection />
      <AuditFlow />
      {/* <CompareSection /> */}
      <RecalcSection />
      <PaybackSection />
      {/* The refund groups (RefundGroups) are off the page for now, 2026-10-28; they may come back in another form */}
      <AuditPricing example={example} />
      {/* The three ways to start (StartPaths) and the free audit request form (RequestAudit) gave way to
          the two offers in AuditPricing, 2026-10-28: historical audits are booked on a call */}
      <AuditFaq />
      <ClosingCta />
    </main>
  );
}
