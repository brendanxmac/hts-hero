"use client";

import { useState } from "react";
import { PricingCards } from "@/components/home/pricing/PricingOverview";
import { SectionIntro } from "@/components/ui/marketing";
import { DarkBillingSwitch, ProductsSlider } from "@/components/ui/marketing/PlanPricing";
import * as mk from "@/components/ui/marketing/styles";
import { ALERT_TIERS, ANNUAL_DISCOUNT, Billing, REVERSE_TRIAL } from "../lib/pricing";

// The plans, as on the homepage: Free, Duty Guard, three cards side by side. One
// slider and billing switch, under the section's header, drives them.

export const PlansSection = () => {
  const [billing, setBilling] = useState<Billing>("annual");
  const [products, setProducts] = useState(10);

  return (
    <section id="plans" className={`${mk.band} ${mk.bandMuted} scroll-mt-16`} aria-labelledby="plans-title">
      <div className={mk.container}>
        <SectionIntro eyebrow="Plans" title="Pay for the Products You Have" id="plans-title" center>
          Every plan starts with {REVERSE_TRIAL.days} days free. A product is one HTS code from one country of origin.
        </SectionIntro>

        <div className="mt-10 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-full bg-base-100 p-2 ring-1 ring-base-content/10">
            <ProductsSlider plans={ALERT_TIERS} products={products} onChange={setProducts} />
            <DarkBillingSwitch billing={billing} onChange={setBilling} />
          </div>
        </div>

        <div className="mt-12">
          <PricingCards billing={billing} products={products} entry="pricing_page" />
        </div>

        <p className={`${mk.small} mt-10 text-center`}>Prices in USD. Annual billing saves {ANNUAL_DISCOUNT * 100}% on Duty Guard, billed once a year.</p>
      </div>
    </section>
  );
};
