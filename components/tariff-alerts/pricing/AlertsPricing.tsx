"use client";

import { useState } from "react";
import { ClockIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import { bestPlanFor, DarkBillingSwitch, DemoRow, GuaranteeBox, PlanCards, ProductsSlider } from "@/components/ui/marketing/PlanPricing";
import * as mk from "@/components/ui/marketing/styles";
import { ALERT_TIERS, ANNUAL_DISCOUNT, Billing } from "@/components/pricing-calculator/lib/pricing";
import { TRY_FREE_HREF } from "@/components/tariff-tracker/access/signup";
import { bookCallHref } from "@/libs/book-call";
import { GUARANTEE, GUARANTEE_DETAIL } from "../lib/copy";

// The Tariff Alerts plans (ALERT_TIERS, PRICING.md's value ladder), as the shared plan cards
// (PlanPricing): four side by side, all paid, the one that fits the visitor's products highlighted. Each lists its imports and users
// first; Slack & Teams from Pro. More than the largest plan, and firms managing importer clients,
// lead to a demo under them; the guarantee sits under everything. The urgency is real: counted from
// the published updates.

export { DarkBillingSwitch };

// What every plan includes, after its products and users (and Slack & Teams from Pro, on the card)
export const alertsIncluded = (): string[] => [
  "Alerts when new tariffs affect your products",
  "See how each update affects your products",
  "Antidumping and countervailing duty alerts",
];

const LARGEST = ALERT_TIERS[ALERT_TIERS.length - 1].maxPairs;

const LARGE_CATALOG_HREF = bookCallHref({
  source: "tariff-alerts",
  campaign: "large-catalog",
  context: `Importer with more than ${LARGEST} products, from the Tariff Alerts pricing (htshero.com/tariff-alerts)`,
});
const PARTNERS_HREF = bookCallHref({
  source: "tariff-alerts",
  campaign: "partners",
  context: "Customs broker, 3PL or freight forwarder managing importer clients, from the Tariff Alerts pricing (htshero.com/tariff-alerts)",
});

export const AlertsPricing = ({ urgency }: { urgency?: string | null }) => {
  const [billing, setBilling] = useState<Billing>("annual");
  const [products, setProducts] = useState(25);
  const best = bestPlanFor(ALERT_TIERS, products);

  return (
    <section id="pricing" className={`${mk.band} scroll-mt-6`} aria-labelledby="pricing-title">
      <div className="mx-auto w-full max-w-[84rem] px-6 lg:px-8">
        <SectionIntro eyebrow="" title="Less Than $1.00 Per Product" id="pricing-title" center>
          Pay for the products you track, nothing else. Cancel anytime.
        </SectionIntro>

        {urgency && (
          <p className="mx-auto mt-8 flex w-fit max-w-3xl items-center gap-2.5 rounded-full bg-warning/10 px-5 py-2.5 text-sm font-medium text-base-content ring-1 ring-warning/30">
            <ClockIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden />
            {urgency}
          </p>
        )}

        <div className="mt-10">
          {/* Billing, and how many products: the slider highlights the plan that fits */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <ProductsSlider plans={ALERT_TIERS} products={products} onChange={setProducts} />
            <DarkBillingSwitch billing={billing} onChange={setBilling} />
          </div>

          <PlanCards product="Tariff Alerts" plans={ALERT_TIERS} billing={billing} features={alertsIncluded} href={TRY_FREE_HREF} lead={(p) => `Alerts on up to ${p.maxPairs} products`} best={best} products={products} />

          {/* More than the largest plan, and firms managing importer clients. Each demo link says which,
              so it's on the booking. */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DemoRow title={`More than ${LARGEST} products?`} text="Volume pricing for large catalogs." href={LARGE_CATALOG_HREF} best={best === null} />
            <DemoRow title="Broker, 3PL or forwarder?" text="Monitor your clients' tariffs and send them branded alerts when they're affected by new tariffs" href={PARTNERS_HREF} />
          </div>

          <GuaranteeBox title={GUARANTEE} text={GUARANTEE_DETAIL} />

          <p className={`${mk.small} mt-6 text-center`}>
            A product is one HTS code from one country of origin. Prices in USD; annual billing saves {ANNUAL_DISCOUNT * 100}%.
          </p>
        </div>
      </div>
    </section>
  );
};
