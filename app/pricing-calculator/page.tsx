import { Metadata } from "next";
import config from "@/config";
import { renderSchemaJsonLd } from "@/libs/seo";
import * as mk from "@/components/ui/marketing/styles";
import {
  ClosingCta,
  PRICING_FAQS,
  PricingCalculator,
  PricingFaq,
  PricingHero,
  parseEstimateParams,
} from "@/components/pricing-calculator";
import { COMING_NOTE, FREE_FOREVER_SHORT } from "@/components/ui/marketing/comingSoon";
import { CLASSIFY_PLANS, LOWEST_PER_IMPORT, REVERSE_TRIAL, TRACKER_TIERS, formatPrice } from "@/components/pricing-calculator/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing — Tariff Calculator, Tariff Tracker & Classify | HTS Hero",
  description: `HTS Hero pricing. The Tariff Calculator is free and unlimited with no account. Try the Tariff Tracker free for ${REVERSE_TRIAL.days} days on up to ${REVERSE_TRIAL.imports} imports, no credit card, then ${FREE_FOREVER_SHORT} stay free, forever. Automatic savings detection and auditing ${COMING_NOTE}. Paid plans from ${formatPrice(TRACKER_TIERS[0].price)}/mo, as low as ${formatPrice(LOWEST_PER_IMPORT)} per import. Classify from ${formatPrice(CLASSIFY_PLANS.starter.price)}/mo.`,
  openGraph: {
    title: "HTS Hero Pricing",
    description: `The Tariff Calculator is free. Try the Tariff Tracker free for ${REVERSE_TRIAL.days} days on up to ${REVERSE_TRIAL.imports} imports, build your plan, and see your price before you sign up.`,
    url: `https://${config.domainName}/pricing-calculator`,
    siteName: "HTS Hero",
    type: "website",
  },
  alternates: {
    canonical: "/pricing-calculator",
  },
};

// The estimate's options come from the URL, so a shared quote opens exactly as it was sent
export default async function PricingCalculatorPage(
  props: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }
) {
  const searchParams = await props.searchParams;
  // In the Tracker's look (the layout's FollowTheme), following light and dark
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

      <PricingHero />

      {/* Plans and the estimator share the billing toggle */}
      <PricingCalculator initial={parseEstimateParams(searchParams)} />

      <PricingFaq />
      <ClosingCta />
    </main>
  );
}
