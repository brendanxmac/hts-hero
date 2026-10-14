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
  LookupStrip,
  OfferCta,
  PricingOverview,
  ToolShowcase,
} from "@/components/home";
import { Testimonials } from "@/components/classify-landing";
import { monitorFacts } from "@/components/tariff-monitor";
import { getAuditExample } from "@/libs/tariff-audit-example";
import { getSavingsExamples } from "@/libs/tariff-savings-example";
import { getLatestVerifiedRevision } from "@/tariffs/engine-v2/revisions";
import * as mk from "@/components/ui/marketing/styles";

// Static, refreshed daily with the tariff data
export const revalidate = 86400;

const TITLE = "HTS Hero: US Tariff Calculator, Tariff Monitoring & Duty Audits";
const DESCRIPTION =
  "Calculate the US duty on any HTS code free, get alerts when tariffs change on your products, and find duty you overpaid. For importers and customs brokers.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: "HTS Hero: know every tariff on every import",
    description: DESCRIPTION,
    url: `https://${config.domainName}`,
    siteName: "HTS Hero",
    type: "website",
    images: [
      {
        url: `https://${config.domainName}/hero-tariffs.png`,
        width: 1200,
        height: 630,
        alt: "HTS Hero tariff software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HTS Hero: know every tariff on every import",
    description: DESCRIPTION,
    images: [`https://${config.domainName}/hero-tariffs.png`],
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
        <HeroTicker />
        <LookupStrip />
        <ToolShowcase
          example={example}
          audit={audit}
          savings={savings}
          facts={facts}
        />
        <Testimonials />
        <PricingOverview />
        <HomeDirectory />
        <HomeFaq />
        <OfferCta />
      </main>
    </MarketingLayout>
    </FollowTheme>
  );
}
