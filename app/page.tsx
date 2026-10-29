import { Metadata } from "next";
import config from "@/config";
import { renderSchemaJsonLd } from "@/libs/seo";
import { getDutyCalculatorContent } from "@/libs/duty-calculator-content";
import { MarketingLayout } from "@/components/MarketingLayout";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";
import {
  DEFINITION,
  HOME_FAQS,
  HeroTicker,
  HomeDirectory,
  HomeFaq,
  OfferCta,
  PricingOverview,
  NewsSignup,
  ToolShowcase,
  ClassifySection,
  ManagedSection,
  WelcomeNotice,
} from "@/components/home";
import { Testimonials } from "@/components/classify-landing";
import { monitorFacts } from "@/components/tariff-monitor";
import { getAuditScans, type AuditScan } from "@/libs/tariff-audit-example";
import { getAlertExample } from "@/libs/tariff-alerts-example";
import { getSavingsExamples } from "@/libs/tariff-savings-example";
import { getLatestVerifiedRevision } from "@/tariffs/engine-v2/revisions";
import * as mk from "@/components/ui/marketing/styles";

// Static, refreshed daily with the tariff data
export const revalidate = 86400;

const TITLE = "HTS Hero: Eliminate Tariff Overpayments and Surprises";
const DESCRIPTION =
  "Find duty you may have overpaid on every import and get alerted the moment a tariff change hits your products. Plus a free US tariff calculator for any HTS code. For importers and customs brokers.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `https://${config.domainName}`,
    siteName: "HTS Hero",
    type: "website",
    // The image comes from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: { canonical: "/" },
};

export default async function Home() {
  const facts = monitorFacts();
  const [{ example }, alert, scans, savings] = await Promise.all([
    getDutyCalculatorContent(),
    getAlertExample(),
    getAuditScans().catch((): AuditScan[] => []),
    getSavingsExamples(),
  ]);

  return (
    // The Tariff Tracker's look, following the site's light/dark setting (DESIGN_SYSTEM.md §15)
    <FollowTheme>
      <MarketingLayout>
        {renderSchemaJsonLd({
          "@type": "WebSite",
          name: "HTS Hero",
          url: `https://${config.domainName}`,
          description: DEFINITION,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `https://${config.domainName}/hts/{search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        })}
        {renderSchemaJsonLd({
          "@type": "Organization",
          name: "HTS Hero",
          url: `https://${config.domainName}`,
          logo: `https://${config.domainName}/logo.svg`,
          description: DEFINITION,
        })}
        {renderSchemaJsonLd({
          "@type": "WebPage",
          name: TITLE,
          url: `https://${config.domainName}`,
          description: DESCRIPTION,
          // The tariff data on the page follows the latest verified HTS revision
          dateModified: getLatestVerifiedRevision().from,
        })}
        {renderSchemaJsonLd({
          "@type": "FAQPage",
          mainEntity: HOME_FAQS.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        })}
        <main className={`${mk.page} w-full flex-1 shrink-0`}>
          <WelcomeNotice />
          <HeroTicker />
          <Testimonials />
          <ToolShowcase
            example={example}
            alert={alert}
            scans={scans}
            savings={savings}
            facts={facts}
          />
          {/* <PricingOverview /> */}
          {/* <ManagedSection /> */}
          <ClassifySection />
          <NewsSignup />
          {/* <HomeDirectory /> */}
          <HomeFaq />
          <OfferCta />
        </main>
      </MarketingLayout>
    </FollowTheme>
  );
}
