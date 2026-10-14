"use client";

import { useMemo } from "react";
import { SectionIntro } from "@/components/ui/marketing";
import {
  Billing,
  CLASSIFY_PLANS,
  EstimateInput,
  TRACKER_TIERS,
  estimate,
  formatPrice,
  monthlyRate,
} from "../lib/pricing";
import { ClassifyControls } from "./ClassifyControls";
import { EstimateSummary } from "./EstimateSummary";
import { ProductCard } from "./ProductCard";
import { TrackerControls } from "./TrackerControls";

// Build a plan from the products you need and see the price as you go
export const Estimator = ({
  input,
  onInputChange: update,
  billing,
  onBillingChange,
  query,
}: {
  input: EstimateInput;
  onInputChange: (patch: Partial<EstimateInput>) => void;
  billing: Billing;
  onBillingChange: (billing: Billing) => void;
  // The estimate as a URL query, for sharing
  query: string;
}) => {
  const est = useMemo(() => estimate(input, billing), [input, billing]);
  const rate = (listPrice: number) => formatPrice(monthlyRate(listPrice, billing));

  return (
    <section id="estimate" className="flex flex-col gap-10 sm:gap-12" aria-labelledby="estimate-title">
      <SectionIntro eyebrow="Pricing calculator" title="Build your plan" id="estimate-title">
        The Tariff Calculator is free. Turn on what you need to watch your own
        products, tell us the size of your catalog and team, and see exactly
        what you&apos;ll pay.
      </SectionIntro>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-10">
        <div className="flex min-w-0 flex-col gap-5">
          <ProductCard
            name="Tariff Calculator"
            summary="Unlimited lookups, no account · every duty on an import, line by line"
            enabled
            fixedLabel="Free for everyone"
          />
          <ProductCard
            name="Tariff Tracker"
            summary={`Start free, then from ${rate(TRACKER_TIERS[0].price)}/mo · alerts, audits and savings on your catalog`}
            enabled={input.tracker}
            onToggle={(tracker) => update({ tracker })}
          >
            <TrackerControls pairs={input.pairs} onPairsChange={(pairs) => update({ pairs })} billing={billing} />
          </ProductCard>
          <ProductCard
            name="Classify"
            summary={`From ${rate(CLASSIFY_PLANS.starter.price)}/mo · HTS classifications you can defend`}
            enabled={input.classify}
            onToggle={(classify) => update({ classify })}
          >
            <ClassifyControls input={input} onChange={update} billing={billing} />
          </ProductCard>
        </div>

        <div className="min-w-0 lg:sticky lg:top-24">
          <EstimateSummary est={est} billing={billing} onBillingChange={onBillingChange} query={query} />
        </div>
      </div>
    </section>
  );
};
