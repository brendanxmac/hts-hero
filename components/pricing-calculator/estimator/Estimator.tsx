"use client";

import { useMemo } from "react";
import * as ui from "@/components/ui/styles";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  Billing,
  CLASSIFY_PLANS,
  EstimateInput,
  TARIFF_CALCULATOR_PRICE,
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
    <section id="estimate" className={ui.section} aria-labelledby="estimate-title">
      <SectionHeader kicker="Pricing calculator" title="Build your plan" titleId="estimate-title">
        Turn on the tools you need, tell us the size of your catalog and team,
        and see exactly what you&apos;ll pay.
      </SectionHeader>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4">
          <ProductCard
            name="Tariff Calculator"
            summary={`${rate(TARIFF_CALCULATOR_PRICE)}/mo · every duty on an import, line by line`}
            enabled={input.calculator || input.tracker}
            includedWith={input.tracker ? "Tariff Tracker" : undefined}
            onToggle={(calculator) => update({ calculator })}
          />
          <ProductCard
            name="Tariff Tracker"
            summary={`From ${rate(TRACKER_TIERS[0].price)}/mo · your catalog, watched for tariff changes`}
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

        <div className="lg:sticky lg:top-6">
          <EstimateSummary est={est} billing={billing} onBillingChange={onBillingChange} query={query} />
        </div>
      </div>
    </section>
  );
};
