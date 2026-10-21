"use client";

import { useState } from "react";
import * as mk from "@/components/ui/marketing/styles";
import { Estimator } from "./estimator";
import { EstimateState } from "./lib/estimateParams";
import { Billing, EstimateInput } from "./lib/pricing";
import { useEstimateUrl } from "./lib/useEstimateUrl";
import { ClassifyPlans, TariffPlans } from "./plans";

// The plans and the estimator share one billing period, so a toggle in either updates both.
// Both start from the page's URL, and every change is written back to it for sharing.
export const PricingCalculator = ({ initial }: { initial: EstimateState }) => {
  const [billing, setBilling] = useState<Billing>(initial.billing);
  const [input, setInput] = useState<EstimateInput>(initial.input);
  const query = useEstimateUrl({ billing, input });

  return (
    <>
      <div className={mk.band}>
        <div className={`${mk.container} flex flex-col gap-24 sm:gap-28`}>
          <TariffPlans billing={billing} onBillingChange={setBilling} />
          <ClassifyPlans billing={billing} />
        </div>
      </div>
      <div className={`${mk.band} ${mk.bandMuted}`}>
        <div className={mk.container}>
          <Estimator
            input={input}
            onInputChange={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
            billing={billing}
            onBillingChange={setBilling}
            query={query}
          />
        </div>
      </div>
    </>
  );
};
