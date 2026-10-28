import { Metadata } from "next";
import config from "@/config";
import { renderSchemaJsonLd } from "@/libs/seo";
import { getAlertExample } from "@/libs/tariff-alerts-example";
import { getLatestUpdates, getPublishedUpdates, type PublicUpdate } from "@/libs/tariff-updates/public";
import { addDays } from "@/tariffs/engine-v2/history";
import { todayIsoDate } from "@/tariffs/engine-v2/dates";
import { ALERT_TIERS, ANNUAL_DISCOUNT, formatPrice } from "@/components/pricing-calculator/lib/pricing";
import * as mk from "@/components/ui/marketing/styles";
import {
  ALERTS_FAQS,
  AlertsFaq,
  AlertsHero,
  AlertsPricing,
  ClosingCta,
  DEFINITION,
  EarlySection,
  HowItWorks,
  LatestActions,
  ImpactSection,
  LOWEST_ALERT_PER_IMPORT,
} from "@/components/tariff-alerts";

// Static, refreshed hourly so the latest actions and the upcoming count stay current
export const revalidate = 3600;

const URL = `https://${config.domainName}/tariff-alerts`;
const TITLE = "Tariff Alerts: Know When New Tariffs Affect Your Imports | HTS Hero";
const DESCRIPTION = `Get alerted when new US tariffs affect your HTS codes, with the duty rate before and after on every import and the official source. Plans from ${formatPrice(ALERT_TIERS[0].price)} a month, as low as ${formatPrice(LOWEST_ALERT_PER_IMPORT)} per import.`;

// How far ahead the pricing's "take effect in the next N days" looks
const UPCOMING_DAYS = 60;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: "Get alerts when new tariffs affect your imports",
    description: DESCRIPTION,
    url: URL,
    siteName: "HTS Hero",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tariff Alerts by HTS Hero",
    description: DESCRIPTION,
  },
  alternates: { canonical: "/tariff-alerts" },
};

// How many days back the fallback counts new actions
const RECENT_DAYS = 30;

// Real counts from the published feed: actions taking effect in the next UPCOMING_DAYS, and new
// actions we tracked in the last RECENT_DAYS
const feedCounts = (updates: PublicUpdate[]) => {
  const today = todayIsoDate();
  const until = addDays(today, UPCOMING_DAYS);
  const since = addDays(today, -RECENT_DAYS);
  return {
    upcoming: updates.filter((u) => u.effective_on && u.effective_on > today && u.effective_on <= until).length,
    recent: updates.filter((u) => u.first_seen_at.slice(0, 10) >= since).length,
  };
};

// The pricing's urgency line: the upcoming changes, or, when that's only a couple, the recent actions
const urgencyLine = ({ upcoming, recent }: ReturnType<typeof feedCounts>): string | null => {
  if (upcoming >= 3) return `${upcoming} US tariff changes take effect in the next ${UPCOMING_DAYS} days. Know which hit you before they do.`;
  if (recent >= 3) return `${recent} new US tariff actions in the last ${RECENT_DAYS} days. Know which hit you before the next one does.`;
  return null;
};

export default async function TariffAlertsPage() {
  const [example, latest, published] = await Promise.all([
    getAlertExample().catch((): null => null),
    getLatestUpdates(6).catch((): PublicUpdate[] => []),
    getPublishedUpdates().catch((): PublicUpdate[] => []),
  ]);
  const counts = feedCounts(published);

  return (
    <main className={`${mk.page} w-full flex-1 shrink-0`}>
      {renderSchemaJsonLd({
        "@type": "SoftwareApplication",
        name: "HTS Hero Tariff Alerts",
        url: URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: DEFINITION,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: String(ALERT_TIERS[0].price),
          highPrice: String(ALERT_TIERS[ALERT_TIERS.length - 1].price),
          offerCount: String(ALERT_TIERS.length),
          description: `Plans are priced by the number of imports tracked (one HTS code from one country of origin), as low as ${formatPrice(LOWEST_ALERT_PER_IMPORT)} per import, per month; annual billing ${ANNUAL_DISCOUNT * 100}% off.`,
        },
        provider: { "@type": "Organization", name: "HTS Hero", url: `https://${config.domainName}` },
      })}
      {renderSchemaJsonLd({
        "@type": "FAQPage",
        mainEntity: ALERTS_FAQS.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      })}
      {renderSchemaJsonLd({
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "HTS Hero", item: `https://${config.domainName}` },
          { "@type": "ListItem", position: 2, name: "Tariff Alerts", item: URL },
        ],
      })}

      <AlertsHero example={example} />
      <EarlySection example={example} />
      <ImpactSection example={example} />
      <HowItWorks />
      <AlertsPricing />
      <AlertsFaq />
      <LatestActions updates={latest} />
      <ClosingCta />
    </main>
  );
}
