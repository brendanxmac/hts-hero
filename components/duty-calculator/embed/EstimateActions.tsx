"use client";

import {
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { DutyEstimate } from "./useDutyEstimate";

// Under the full estimate: a note on what's left out, and buttons to copy it or open it in
// the Tariff Calculator
export const EstimateActions = ({
  estimate,
}: {
  estimate: DutyEstimate;
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
        onClick={() => estimate.trackOpen()}
      >
        Open in Tariff Calculator
        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
      </a>
    </div>
  </div>
);
