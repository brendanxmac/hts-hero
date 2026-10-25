import { Metadata } from "next";
import config from "@/config";
import { createPublicClient } from "@/app/api/supabase/server";
import { getChangelogEntries } from "@/libs/supabase/tariff-changelog";
import { renderSchemaJsonLd } from "@/libs/seo";
import { getDutyCalculatorContent } from "@/libs/duty-calculator-content";
import { getLatestVerifiedRevision } from "@/tariffs/engine-v2/revisions";
import { LOWEST_PER_IMPORT, REVERSE_TRIAL, TRACKER_TIERS, formatPrice } from "@/components/pricing-calculator/lib/pricing";
import { FREE_FOREVER_SHORT, SAVINGS_AUDITS_INCLUDED } from "@/components/ui/marketing/comingSoon";
import * as mk from "@/components/ui/marketing/styles";
import {
  AlertsSection,
  CalculationSection,
  ClosingCta,
  DEFINITION,
  DutyStory,
  EngineSection,
  FeatureGrid,
  LanesSection,
  MONITOR_FAQS,
  MonitorFaq,
  MonitorHero,
  MonitorPricing,
  StatsBand,
  TryItSection,
  VsManual,
  caughtChanges,
  monitorFacts,
} from "@/components/tariff-monitor";

// Static, refreshed hourly so the latest changes and facts stay current
export const revalidate = 3600;

const URL = `https://${config.domainName}/tariff-monitor`;
const TITLE = "Tariff Tracking Software: Alerts by HTS Code | HTS Hero";
const DESCRIPTION = `Monitor US tariffs on every HTS code and country you import. Get alerts by email, in-app, Slack or Teams when a tariff changes. Free for ${REVERSE_TRIAL.days} days on up to ${REVERSE_TRIAL.imports} imports, no card; then Tariff News alerts free, forever. Savings detection and auditing included.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: "Tariff Tracker: know the moment a tariff change hits your products",
    description: DESCRIPTION,
    url: URL,
    siteName: "HTS Hero",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tariff Tracker by HTS Hero",
    description: DESCRIPTION,
  },
  alternates: { canonical: "/tariff-monitor" },
};

export default async function TariffMonitorPage() {
  const facts = monitorFacts();
  const [entries, content] = await Promise.all([
    getChangelogEntries(createPublicClient(), { limit: 40 }),
    getDutyCalculatorContent(),
  ]);
  const changes = caughtChanges(entries, 4);

  return (
    <main className={`${mk.page} w-full flex-1 shrink-0`}>
      {renderSchemaJsonLd({
        "@type": "SoftwareApplication",
        name: "HTS Hero Tariff Tracker",
        url: URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        // The tariff data on the page follows the latest verified HTS revision
        dateModified: getLatestVerifiedRevision().from,
        description: DEFINITION,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: "0",
          highPrice: String(TRACKER_TIERS[TRACKER_TIERS.length - 1].price),
          offerCount: String(TRACKER_TIERS.length + 1),
          description: `Free ${REVERSE_TRIAL.days}-day trial of everything on up to ${REVERSE_TRIAL.imports} imports, no credit card; then ${FREE_FOREVER_SHORT} stay free, forever. Paid plans are priced by the number of imports tracked, billed monthly, as low as ${formatPrice(LOWEST_PER_IMPORT)} per import, per month. ${SAVINGS_AUDITS_INCLUDED}`,
        },
        provider: { "@type": "Organization", name: "HTS Hero", url: `https://${config.domainName}` },
      })}
      {renderSchemaJsonLd({
        "@type": "FAQPage",
        mainEntity: MONITOR_FAQS.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      })}
      {renderSchemaJsonLd({
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "HTS Hero", item: `https://${config.domainName}` },
          { "@type": "ListItem", position: 2, name: "Tariff Tracker", item: URL },
        ],
      })}

      <MonitorHero />
      <StatsBand facts={facts} />
      <TryItSection />
      <DutyStory changes={changes} />
      <EngineSection />
      <CalculationSection example={content.example} revision={facts.latestRevisionTitle} />
      <AlertsSection />
      <LanesSection countries={facts.countries} />
      <FeatureGrid />
      <VsManual />
      <MonitorPricing />
      <MonitorFaq />
      <ClosingCta />
    </main>
  );
}
