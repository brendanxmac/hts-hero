import { Metadata } from "next";
import config from "@/config";
import { renderSchemaJsonLd } from "@/libs/seo";
import { getAlertExample } from "@/libs/tariff-alerts-example";
import { getPublishedUpdates, type PublicUpdate } from "@/libs/tariff-updates/public";
import { addDays } from "@/tariffs/engine-v2/history";
import { todayIsoDate } from "@/tariffs/engine-v2/dates";
import * as mk from "@/components/ui/marketing/styles";
import { ALERT_TIERS, AUDIT_TIERS, formatPrice, REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { ManagedSection } from "@/components/home/managed/ManagedSection";
import {
  ClassificationSection,
  CompareTable,
  FreeBand,
  LOWEST_PER_PRODUCT,
  NumbersBand,
  PlansSection,
  PriceCalculator,
  PRICING_FAQS,
  PricingFaq,
  SalesHero,
  TrialSection,
} from "@/components/pricing-calculator/sales";

// Static, refreshed hourly so the counts stay current
export const revalidate = 3600;

const URL = `https://${config.domainName}/pricing-calculator`;
const DESCRIPTION = `HTS Hero pricing. The Duty Calculator is free with no account, and tracking your products is free with one. Try Duty Guard free for ${REVERSE_TRIAL.days} days, no credit card required. Then Duty Guard Essentials from ${formatPrice(ALERT_TIERS[0].price)} and Duty Guard Pro from ${formatPrice(AUDIT_TIERS[0].price)} a month, as low as ${formatPrice(LOWEST_PER_PRODUCT)} per product.`;

export const metadata: Metadata = {
  title: "Pricing: Free Duty Calculator, Duty Guard | HTS Hero",
  description: DESCRIPTION,
  openGraph: { title: "HTS Hero Pricing", description: DESCRIPTION, url: URL, siteName: "HTS Hero", type: "website" },
  alternates: { canonical: "/pricing-calculator" },
};

const RECENT_DAYS = 30;
const UPCOMING_DAYS = 60;

export default async function PricingPage() {
  const [example, published] = await Promise.all([getAlertExample().catch((): null => null), getPublishedUpdates().catch((): PublicUpdate[] => [])]);
  const today = todayIsoDate();
  const until = addDays(today, UPCOMING_DAYS);
  const since = addDays(today, -RECENT_DAYS);
  const upcoming = published.filter((u) => u.effective_on && u.effective_on > today && u.effective_on <= until).length;
  const recent = published.filter((u) => u.first_seen_at.slice(0, 10) >= since).length;

  // In Duty Guard's look (the layout's FollowTheme), following light and dark
  return (
    <main className={`${mk.page} flex w-full flex-1 flex-col`}>
      {renderSchemaJsonLd({
        "@type": "FAQPage",
        mainEntity: PRICING_FAQS.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      })}

      <SalesHero />
      {/* <NumbersBand recent={recent} upcoming={upcoming} recentDays={RECENT_DAYS} upcomingDays={UPCOMING_DAYS} example={example} /> */}
      <PriceCalculator />
      <FreeBand />
      <PlansSection />
      <TrialSection />
      <CompareTable />
      <PricingFaq />
      <ClassificationSection />
      <ManagedSection />
    </main>
  );
}
