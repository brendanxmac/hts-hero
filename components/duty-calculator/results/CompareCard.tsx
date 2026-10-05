"use client";

// One country's card in the comparison: total duty, fees and landed cost, how it compares to the
// lowest, each line, and the trade preference to claim
import {
  ArrowRightIcon,
  TrophyIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Country } from "@/constants/countries";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatMoney, formatPct } from "../lib/format";
import { CompareEntry } from "./compareEntry";
import { COLUMN_LABEL, programName } from "./labels";

export const CompareCard = ({
  entry,
  customsValue,
  landedCost,
  difference,
  isLowest,
  tiedForLowest,
  allTied,
  lowestNames,
  single,
  onPreferenceChange,
  onViewDetails,
  onRemove,
}: {
  entry: CompareEntry;
  customsValue: number;
  landedCost: number;
  // How much more it costs than the lowest
  difference: number;
  isLowest: boolean;
  // More than one country shares the lowest landed cost
  tiedForLowest: boolean;
  // Every country has the same landed cost
  allTied: boolean;
  lowestNames: string;
  // The only country, so it can't be removed and isn't compared
  single: boolean;
  onPreferenceChange: (countryCode: string, symbol: string) => void;
  onViewDetails: (country: Country) => void;
  onRemove: (countryCode: string) => void;
}) => {
  const { country, result } = entry;
  const effectiveRate =
    customsValue > 0 ? (result.totalDuty / customsValue) * 100 : 0;
  const applied = result.lines.filter((l) => l.status === "applies");

  return (
    <article
      // An outline, because the card's shadow would override a Tailwind ring
      className={`${ui.card} flex flex-col ${
        isLowest ? "outline outline-2 -outline-offset-1 outline-success" : ""
      }`}
      aria-label={`Duty estimate for ${country.name}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-base-300">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl leading-none" aria-hidden>
            {country.flag}
          </span>
          <div className="min-w-0">
            <h3 className={`${ui.cardTitle} truncate`}>{country.name}</h3>
            <p className={ui.caption}>
              {COLUMN_LABEL[result.column]}
              {result.claimedPreference
                ? ` (${result.claimedPreference})`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isLowest && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
              <TrophyIcon className="w-3.5 h-3.5" aria-hidden />
              Lowest cost
            </span>
          )}
          {/* The last country can't be removed here; it's the one being estimated */}
          {!single && (
            <button
              type="button"
              className={`${ui.button({ variant: "ghost", size: "sm", icon: true })} -mr-1.5`}
              aria-label={`Remove ${country.name} from the comparison`}
              title="Remove from comparison"
              onClick={() => onRemove(country.code)}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Figures, in the same positions on every card */}
      <div className="p-5 flex flex-col gap-4 border-b border-base-300">
        <div>
          <div className={ui.label}>Total duty</div>
          <div className={`${ui.metric.primaryCompact} mt-1.5`}>
            {formatMoney(result.totalDuty)}
          </div>
          <div className="tabular-nums mt-1.5 text-sm text-base-content/70">
            {formatPct(Math.round(effectiveRate * 100) / 100)} effective rate
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className={ui.caption}>Fees</dt>
            <dd className="tabular-nums text-base font-semibold">
              {formatMoney(result.totalFees)}
            </dd>
          </div>
          <div>
            <dt className={ui.caption}>Landed cost</dt>
            <dd className="tabular-nums text-base font-semibold">
              {formatMoney(landedCost)}
            </dd>
          </div>
        </dl>
        {!single && (
          <div
            className={`tabular-nums text-sm font-medium ${
              allTied || isLowest ? "text-success" : "text-base-content/70"
            }`}
          >
            {allTied
              ? "Same landed cost as the other countries"
              : isLowest
                ? tiedForLowest
                  ? "Tied for the lowest landed cost"
                  : "Lowest landed cost"
                : `+${formatMoney(difference)} more than ${lowestNames}`}
          </div>
        )}
      </div>

      {/* Lines */}
      <ul className="flex-1 divide-y divide-base-300">
        <li className="flex items-baseline justify-between gap-3 px-5 py-3">
          <span className="min-w-0">
            <span
              className={`${mono.className} text-sm font-semibold text-primary mr-1.5`}
            >
              Base
            </span>
            <span className="text-sm text-base-content">
              {result.base.reasons[0] ?? "Free"}
            </span>
          </span>
          <span className="tabular-nums text-sm font-semibold whitespace-nowrap">
            {formatMoney(result.base.amount)}
          </span>
        </li>
        {applied.map((line) => (
          <li
            key={line.code}
            className="flex items-baseline justify-between gap-3 px-5 py-3"
          >
            <span className="min-w-0 flex flex-col">
              <span>
                <span
                  className={`${mono.className} text-sm font-semibold text-primary mr-1.5`}
                >
                  {line.code}
                </span>
                <span className={`${ui.caption} tabular-nums`}>
                  {line.ratePct !== undefined ? formatPct(line.ratePct) : ""}
                </span>
              </span>
              <span className={ui.bodySm}>{programName(line.program)}</span>
            </span>
            <span className="tabular-nums text-sm font-semibold whitespace-nowrap">
              {formatMoney(line.amount)}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="p-5 pt-4 flex flex-col gap-3 border-t border-base-300 bg-base-200">
        {result.availablePreferences.length > 0 && (
          <label className="flex flex-col gap-1.5">
            <span className={ui.fieldLabel}>Trade preference</span>
            <select
              className={ui.selectSm}
              value={entry.claimedPreference}
              onChange={(e) => onPreferenceChange(country.code, e.target.value)}
            >
              <option value="">None claimed</option>
              {result.availablePreferences.map((p) => (
                <option key={p.symbol} value={p.symbol}>
                  {p.symbol} · {p.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex items-center justify-between gap-3">
          <span className={ui.caption}>
            {entry.openQuestions > 0
              ? `${entry.openQuestions} ${entry.openQuestions === 1 ? "question" : "questions"} could change this`
              : "No open questions"}
          </span>
          <button
            type="button"
            className={`${ui.link} inline-flex items-center gap-1 text-sm shrink-0`}
            onClick={() => onViewDetails(country)}
          >
            View details
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
