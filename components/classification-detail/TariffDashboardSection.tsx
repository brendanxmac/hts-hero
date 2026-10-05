"use client";

import { useMemo } from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/16/solid";
import { ClassificationI } from "../../interfaces/hts";
import { Country } from "../../constants/countries";
import { useHts } from "../../contexts/HtsContext";
import { calculate } from "../../tariffs/engine-v2/calculate";
import { AllRules } from "../../tariffs/engine-v2/data";
import { isVerifiedDate } from "../../tariffs/engine-v2/revisions";
import { buildEstimateInput, findTariffElement } from "../duty-calculator/lib/estimate";
import { formatDate, formatMoney, formatPct, todayIso } from "../duty-calculator/lib/format";
import { mono } from "../ui/font";
import { countOpenQuestions, questionImpacts } from "../duty-calculator/lib/questions";
import { programName, SummaryStats } from "../duty-calculator/results";
import { DashboardCard, DashboardCardHeader } from "./DashboardCard";
import { THEME_EMBEDDED } from "../ui/theme";
import * as ui from "../ui/styles";

// The classification's duty at a glance, for its country of origin: the same engine as the
// Tariff Calculator, for a standard shipment. The Duty & Tariffs tab has the full estimate.

const DEFAULT_CUSTOMS_VALUE = 10000;
const DEFAULT_UNITS = 1000;

const useDutySummary = (countryOfOrigin: Country | null, classification: ClassificationI) => {
  const { htsElements } = useHts();
  return useMemo(() => {
    const element = classification.levels[classification.levels.length - 1]?.selection;
    if (!countryOfOrigin || !classification.isComplete || !element || htsElements.length === 0) return null;
    const input = buildEstimateInput({
      element,
      tariffElement: findTariffElement(element, htsElements),
      country: countryOfOrigin,
      asOf: todayIso(),
      customsValue: DEFAULT_CUSTOMS_VALUE,
      quantity: DEFAULT_UNITS,
      transportMode: "ocean",
    });
    const result = calculate(AllRules, { ...input, answers: {} });
    return { result, openQuestions: countOpenQuestions(result, questionImpacts(input, result, {})) };
  }, [countryOfOrigin, classification, htsElements]);
};

export function TariffDashboardSection({
  countryOfOrigin,
  classification,
  onNavigateToDuty,
}: {
  countryOfOrigin: Country | null;
  classification: ClassificationI;
  onNavigateToDuty: () => void;
}) {
  const summary = useDutySummary(countryOfOrigin, classification);
  const htsno = classification.levels[classification.levels.length - 1]?.selection?.htsno;

  return (
    <DashboardCard>
      <DashboardCardHeader
        title={`Tariff Summary ${countryOfOrigin?.name ? `for ${htsno} from ${countryOfOrigin.name}` : ""}`}
        icon={<CurrencyDollarIcon className="w-4 h-4" />}
        action={
          <button onClick={onNavigateToDuty} className={ui.button({ variant: "primary", size: "sm" })}>
            See All Tariff Details
            <ArrowRightIcon className="w-3 h-3" aria-hidden />
          </button>
        }
      />
      <div className="flex flex-col gap-5">
        {summary ? (
          <div className={`${THEME_EMBEDDED} p-4 flex flex-col gap-4`}>
            <div className={`${ui.card}`}>
              <SummaryStats result={summary.result} customsValue={DEFAULT_CUSTOMS_VALUE} />
              <ul className="divide-y divide-base-300">
                <SummaryLine
                  code="Base"
                  name={summary.result.base.reasons[0] ?? "Free"}
                  amount={summary.result.base.amount}
                />
                {summary.result.lines
                  .filter((l) => l.status === "applies")
                  .map((line) => (
                    <SummaryLine
                      key={line.code}
                      code={line.code}
                      name={programName(line.program)}
                      rate={line.ratePct}
                      amount={line.amount}
                    />
                  ))}
              </ul>
            </div>
            <p className="text-xs text-base-content/60">
              For {formatMoney(DEFAULT_CUSTOMS_VALUE)} of goods entering {formatDate(summary.result.asOf)}
              {isVerifiedDate(summary.result.asOf) ? "" : " (tariff rules for this date aren't verified yet)"}.
              {summary.openQuestions > 0 &&
                ` ${summary.openQuestions} ${summary.openQuestions === 1 ? "question" : "questions"} could change this; answer them in Duty & Tariffs.`}
            </p>
          </div>
        ) : countryOfOrigin && !classification.isComplete ? (
          <div className="text-center py-6">
            <p className="text-sm text-base-content/60">Complete the classification to see tariff estimates.</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-base-content/60">
              Select a country of origin on the dashboard to see tariff estimates.
            </p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

const SummaryLine = ({ code, name, rate, amount }: { code: string; name: string; rate?: number; amount: number }) => (
  <li className="flex items-baseline justify-between gap-4 px-5 py-3">
    <span className="min-w-0 flex items-baseline gap-2.5">
      <span className={`${mono.className} text-sm font-semibold text-primary shrink-0`}>{code}</span>
      <span className="text-sm text-base-content/70 truncate">{name}</span>
    </span>
    <span className="flex items-baseline gap-3 shrink-0">
      {rate !== undefined && <span className="tabular-nums text-xs text-base-content/60">{formatPct(rate)}</span>}
      <span className="tabular-nums text-sm font-semibold text-base-content">{formatMoney(amount)}</span>
    </span>
  </li>
);
