"use client";

import { useState } from "react";
import * as ui from "@/components/ui/styles";
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
      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding} flex flex-col gap-16 sm:gap-20`}>
          <TariffPlans billing={billing} onBillingChange={setBilling} />
          <ClassifyPlans billing={billing} />
        </div>
      </div>
      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding}`}>
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
