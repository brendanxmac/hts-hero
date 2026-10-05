"use client";

import { Country } from "@/constants/countries";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { isVerifiedDate } from "@/tariffs/engine-v2/revisions";
import * as ui from "@/components/ui/styles";
import { SimpleSummary } from "../results";
import { formatDate } from "../lib/format";
import { CalculatorCta } from "./CalculatorCta";
import { DutyEstimate, Surface } from "./useDutyEstimate";

// The simple variant: the headline figures, and a call to open the Tariff Calculator for the rest
export const SimpleEstimate = ({
  estimate,
  result,
  country,
  htsno,
  surface,
}: {
  estimate: DutyEstimate;
  result: NonNullable<DutyEstimate["result"]>;
  country: Country;
  htsno: string;
  surface: Surface;
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
        trackEvent(MixpanelEvent.DUTY_ESTIMATE_OPENED_IN_CALCULATOR, {
          hts_code: htsno,
          country_code: country.code,
          surface,
          variant: "simple",
          best_saving: Math.round(estimate.bestSaving),
        })
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
