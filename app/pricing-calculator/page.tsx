import { Metadata } from "next";
import config from "@/config";
import { renderSchemaJsonLd } from "@/libs/seo";
import * as ui from "@/components/ui/styles";
import { THEME } from "@/components/ui/theme";
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
    "HTS Hero pricing. Tariff Calculator from $14.99/mo, Tariff Tracker from $49/mo priced by HTS code + country pairs, and Classify from $39/mo. Save 10% with annual billing.",
  openGraph: {
    title: "HTS Hero Pricing",
    description:
      "Build your plan: Tariff Calculator, Tariff Tracker and Classify. See your price before you sign up, and save 10% with annual billing.",
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
  // <main> fills the rest of the window so the layout's scroll container never shows around it
  return (
    <main className={`${THEME} w-full flex-1 shrink-0 flex flex-col`}>
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

      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding} flex flex-col gap-16 sm:gap-20`}>
          <PricingFaq />
          <ClosingCta />
        </div>
      </div>
    </main>
  );
}
