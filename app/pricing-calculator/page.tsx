import { Metadata } from "next";
import config from "@/config";
import { renderSchemaJsonLd } from "@/libs/seo";
import * as mk from "@/components/ui/marketing/styles";
import { THEME_LIGHT } from "@/components/ui/theme";
import {
  ClosingCta,
  PRICING_FAQS,
  PricingCalculator,
  PricingFaq,
  PricingHero,
  parseEstimateParams,
} from "@/components/pricing-calculator";

export const metadata: Metadata = {
  title: "Pricing — Tariff Calculator, Tariff Tracker & Classify | HTS Hero",
  description:
    "HTS Hero pricing. The Tariff Calculator is free and unlimited with no account. Tariff Tracker starts free: check 5 imports for savings, 10 free audit checks, then from $19/mo. Classify from $39/mo. Save 15% with annual billing.",
  openGraph: {
    title: "HTS Hero Pricing",
    description:
      "The Tariff Calculator is free. Build your Tariff Tracker and Classify plan, see your price before you sign up, and save 15% with annual billing.",
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
  // Always light, like the other landing pages; the light theme covers any shared control inside
  return (
    <main className={`${THEME_LIGHT} ${mk.page} flex w-full flex-1 flex-col`}>
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
