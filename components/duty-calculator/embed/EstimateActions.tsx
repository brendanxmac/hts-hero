"use client";

import {
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/20/solid";
import { Country } from "@/constants/countries";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import * as ui from "@/components/ui/styles";
import { DutyEstimate, Surface } from "./useDutyEstimate";

// Under the full estimate: a note on what's left out, and buttons to copy it or open it in
// the Tariff Calculator
export const EstimateActions = ({
  estimate,
  country,
  htsno,
  surface,
}: {
  estimate: DutyEstimate;
  country: Country;
  htsno: string;
  surface: Surface;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <span className={ui.caption}>
      {estimate.openQuestions > 0
        ? "Answer the questions above to refine this estimate."
        : "Estimates don't include antidumping or countervailing duties."}
    </span>
    <div className="flex items-center gap-2">
      <button type="button" className={ui.button({ size: "sm" })} onClick={estimate.copy}>
        {estimate.copied ? (
          <CheckIcon className="w-4 h-4" />
        ) : (
          <ClipboardDocumentIcon className="w-4 h-4" />
        )}
        {estimate.copied ? "Copied" : "Copy"}
      </button>
      <a
        href={estimate.link()}
        className={ui.button({ variant: "primary", size: "sm" })}
        onClick={() =>
          trackEvent(MixpanelEvent.DUTY_ESTIMATE_OPENED_IN_CALCULATOR, {
            hts_code: htsno,
            country_code: country.code,
            surface,
          })
        }
      >
        Open in Tariff Calculator
        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
      </a>
    </div>
  </div>
);
