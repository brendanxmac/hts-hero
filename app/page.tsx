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
  ToolShowcase,
  ClassifySection,
  ManagedSection,
  WelcomeNotice,
} from "@/components/home";
import { Testimonials } from "@/components/classify-landing";
import { monitorFacts } from "@/components/tariff-monitor";
import { getAuditExample } from "@/libs/tariff-audit-example";
import { getSavingsExamples } from "@/libs/tariff-savings-example";
import { getLatestVerifiedRevision } from "@/tariffs/engine-v2/revisions";
import * as mk from "@/components/ui/marketing/styles";

// Static, refreshed daily with the tariff data
export const revalidate = 86400;

const TITLE = "HTS Hero: US Tariff Calculator & Tariff Tracking for Your Imports";
const DESCRIPTION =
  "Calculate the US duty on any HTS code free, track every tariff on your imports, get alerts when tariffs change, and see exactly how each new tariff affects you. For importers and customs brokers.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: "HTS Hero: Tariff Alerts, Savings, & Audits on Autopilot",
    description: DESCRIPTION,
    url: `https://${config.domainName}`,
    siteName: "HTS Hero",
    type: "website",
    // The image comes from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "HTS Hero: Tariff Alerts, Savings, & Audits on Autopilot",
    description: DESCRIPTION,
  },
  alternates: { canonical: "/" },
};

export default async function Home() {
  const facts = monitorFacts();
  const [{ example }, audit, savings] = await Promise.all([
    getDutyCalculatorContent(),
    getAuditExample(),
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
          <ToolShowcase
            example={example}
            audit={audit}
            savings={savings}
            facts={facts}
          />
          {/* <Testimonials /> */}
          <PricingOverview />
          <ManagedSection />
          <ClassifySection />
          <HomeDirectory />
          <HomeFaq />
          <OfferCta />
        </main>
      </MarketingLayout>
    </FollowTheme>
  );
}
