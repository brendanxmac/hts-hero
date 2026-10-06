"use client";

import { isVerifiedDate } from "@/tariffs/engine-v2/revisions";
import * as ui from "@/components/ui/styles";
import { SimpleSummary } from "../results";
import { formatDate } from "../lib/format";
import { CalculatorCta } from "./CalculatorCta";
import { DutyEstimate } from "./useDutyEstimate";

// The simple variant: the headline figures, and a call to open the Tariff Calculator for the rest
export const SimpleEstimate = ({
  estimate,
  result,
}: {
  estimate: DutyEstimate;
  result: NonNullable<DutyEstimate["result"]>;
}) => (
  <>
    <div className={ui.card}>
      <SimpleSummary
        result={result}
        customsValue={estimate.customsValue}
        openQuestions={estimate.openQuestions}
      />
    </div>
    <CalculatorCta
      href={estimate.link()}
      bestSaving={estimate.bestSaving}
      openQuestions={estimate.openQuestions}
      onOpen={() =>
        estimate.trackOpen({ variant: "simple", best_saving: Math.round(estimate.bestSaving) })
      }
    />
    <p className={ui.caption}>
      Rates as of {formatDate(estimate.entryDate)}
      {isVerifiedDate(estimate.entryDate)
        ? ""
        : " (tariff rules for this date aren't verified yet)"}
      , shipped by ocean, with no trade preference claimed.
    </p>
  </>
);
