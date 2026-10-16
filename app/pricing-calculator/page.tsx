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
import { CLASSIFY_PLANS, TRACKER_TIERS, TRIAL_ALLOWANCE, formatPrice } from "@/components/pricing-calculator/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing — Tariff Calculator, Tariff Tracker & Classify | HTS Hero",
  description: `HTS Hero pricing. The Tariff Calculator is free and unlimited with no account. Tariff Tracker starts free: track ${TRIAL_ALLOWANCE.alertImports} imports with alerts and impact checks, then from ${formatPrice(TRACKER_TIERS[0].price)}/mo. Classify from ${formatPrice(CLASSIFY_PLANS.starter.price)}/mo.`,
  openGraph: {
    title: "HTS Hero Pricing",
    description:
      "The Tariff Calculator is free. Track your imports free with the Tariff Tracker, build your plan, and see your price before you sign up.",
    url: `https://${config.domainName}/pricing-calculator`,
    siteName: "HTS Hero",
    type: "website",
  },
  alternates: {
    canonical: "/pricing-calculator",
  },
};

// The estimate's options come from the URL, so a shared quote opens exactly as it was sent
export default function PricingCalculatorPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
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
