"use client";

import { Country } from "@/constants/countries";
import * as ui from "@/components/ui/styles";
import { DateNotice } from "../notices/DateNotice";
import { NotAppliedPanel, PreferenceClaim, QuestionsPanel, Statement, SummaryStats } from "../results";
import { EstimateActions } from "./EstimateActions";
import { DutyEstimate, Surface } from "./useDutyEstimate";

// The full variant: the totals and each duty line, the questions and preference claims that
// could change them, the headings that don't apply, and copy and open buttons
export const FullEstimate = ({
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
    <DateNotice entryDate={estimate.entryDate} onUseVerified={estimate.setEntryDate} />

    <div className={ui.card}>
      <SummaryStats result={result} customsValue={estimate.customsValue} />
      <Statement
        result={result}
        customsValue={estimate.customsValue}
        unitLabel={estimate.unitLabel}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      {(result.questions.length > 0 || result.availablePreferences.length > 0) && (
        <QuestionsPanel
          questions={result.questions}
          answers={estimate.answers}
          impacts={estimate.impacts}
          lines={result.lines}
          onAnswer={estimate.answer}
          asOf={result.asOf}
          htsCode={result.htsCode}
          preference={
            result.availablePreferences.length > 0 ? (
              <PreferenceClaim
                options={result.availablePreferences}
                value={estimate.preference}
                onChange={estimate.setPreference}
                impacts={estimate.preferenceChanges}
              />
            ) : undefined
          }
        />
      )}
      <NotAppliedPanel lines={result.lines} />
    </div>

    <EstimateActions estimate={estimate} country={country} htsno={htsno} surface={surface} />
  </>
);
