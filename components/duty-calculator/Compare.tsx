"use client";

import { ArrowRightIcon, TrophyIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Country } from "../../constants/countries";
import { AllRules } from "../../tariffs/engine-v2/data";
import { CalculationResult } from "../../tariffs/engine-v2/types";
import { formatMoney, formatPct, mono } from "./format";
import styles from "./theme.module.css";

export interface CompareEntry {
  country: Country;
  result: CalculationResult;
  claimedPreference: string;
  openQuestions: number;
}

const programName = (id?: string) => AllRules.programs.find((p) => p.id === id)?.name ?? "Other";

const COLUMN_LABEL = {
  general: "Column 1 General",
  special: "Column 1 Special",
  column2: "Column 2",
};

export const CompareView = ({
  entries,
  customsValue,
  onPreferenceChange,
  onViewDetails,
  onRemove,
}: {
  entries: CompareEntry[];
  customsValue: number;
  onPreferenceChange: (countryCode: string, symbol: string) => void;
  onViewDetails: (country: Country) => void;
  onRemove: (countryCode: string) => void;
}) => {
  const landed = (e: CompareEntry) => customsValue + e.result.totalDuty + e.result.totalFees;
  const lowest = Math.min(...entries.map(landed));
  const lowestEntries = entries.filter((e) => Math.abs(landed(e) - lowest) < 0.005);
  const lowestNames = lowestEntries.map((e) => e.country.name).join(" and ");
  const allTied = lowestEntries.length === entries.length;

  const columns =
    entries.length === 3 ? "lg:grid-cols-3" : entries.length === 2 ? "md:grid-cols-2" : "";

  return (
    <div className={`grid grid-cols-1 ${columns} gap-4 items-stretch`}>
      {entries.map((entry) => {
        const { country, result } = entry;
        const isLowest = !allTied && lowestEntries.includes(entry);
        const difference = landed(entry) - lowest;
        const effectiveRate = customsValue > 0 ? (result.totalDuty / customsValue) * 100 : 0;
        const applied = result.lines.filter((l) => l.status === "applies");

        return (
          <article
            key={country.code}
            className={`${styles.card} flex flex-col overflow-hidden`}
            // An outline, because the card's shadow would override a Tailwind ring
            style={isLowest ? { outline: "2px solid var(--dc-positive)", outlineOffset: -1 } : undefined}
            aria-label={`Duty estimate for ${country.name}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-[var(--dc-border)]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl leading-none" aria-hidden>
                  {country.flag}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-semibold truncate">{country.name}</h3>
                  <p className="text-[12.5px] text-[var(--dc-text-3)]">
                    {COLUMN_LABEL[result.column]}
                    {result.claimedPreference ? ` (${result.claimedPreference})` : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {isLowest && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--dc-positive-soft)] px-2.5 py-1 text-[12px] font-semibold text-[var(--dc-positive)]">
                    <TrophyIcon className="w-3.5 h-3.5" aria-hidden />
                    Lowest cost
                  </span>
                )}
                <button
                  type="button"
                  className="-mr-1.5 rounded-lg p-1.5 text-[var(--dc-text-3)] hover:bg-[var(--dc-surface-2)] hover:text-[var(--dc-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dc-accent)]"
                  aria-label={`Remove ${country.name} from the comparison`}
                  title="Remove from comparison"
                  onClick={() => onRemove(country.code)}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Figures, in the same positions on every card */}
            <div className="p-5 flex flex-col gap-4 border-b border-[var(--dc-border)]">
              <div>
                <div className={styles.eyebrow}>Total duty</div>
                <div className={`${styles.num} mt-1.5 text-[30px] leading-none font-semibold tracking-tight`}>
                  {formatMoney(result.totalDuty)}
                </div>
                <div className={`${styles.num} mt-1.5 text-[13.5px] text-[var(--dc-text-2)]`}>
                  {formatPct(Math.round(effectiveRate * 100) / 100)} effective rate
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-[12.5px] text-[var(--dc-text-3)]">Fees</dt>
                  <dd className={`${styles.num} text-[15px] font-semibold`}>{formatMoney(result.totalFees)}</dd>
                </div>
                <div>
                  <dt className="text-[12.5px] text-[var(--dc-text-3)]">Landed cost</dt>
                  <dd className={`${styles.num} text-[15px] font-semibold`}>{formatMoney(landed(entry))}</dd>
                </div>
              </dl>
              <div
                className={`${styles.num} text-[13px] font-medium ${
                  allTied || isLowest ? "text-[var(--dc-positive)]" : "text-[var(--dc-text-2)]"
                }`}
              >
                {allTied
                  ? "Same landed cost as the other countries"
                  : isLowest
                    ? lowestEntries.length > 1
                      ? "Tied for the lowest landed cost"
                      : "Lowest landed cost"
                    : `+${formatMoney(difference)} more than ${lowestNames}`}
              </div>
            </div>

            {/* Lines */}
            <ul className="flex-1 divide-y divide-[var(--dc-border)]">
              <li className="flex items-baseline justify-between gap-3 px-5 py-3">
                <span className="min-w-0">
                  <span className={`${mono.className} text-[12.5px] font-semibold text-[var(--dc-accent)] mr-1.5`}>Base</span>
                  <span className="text-[13.5px] text-[var(--dc-text)]">{result.base.reasons[0] ?? "Free"}</span>
                </span>
                <span className={`${styles.num} text-[13.5px] font-semibold whitespace-nowrap`}>
                  {formatMoney(result.base.amount)}
                </span>
              </li>
              {applied.map((line) => (
                <li key={line.code} className="flex items-baseline justify-between gap-3 px-5 py-3">
                  <span className="min-w-0 flex flex-col">
                    <span>
                      <span className={`${mono.className} text-[12.5px] font-semibold text-[var(--dc-accent)] mr-1.5`}>
                        {line.code}
                      </span>
                      <span className={`${styles.num} text-[12.5px] text-[var(--dc-text-3)]`}>
                        {line.ratePct !== undefined ? formatPct(line.ratePct) : ""}
                      </span>
                    </span>
                    <span className="text-[13px] leading-snug text-[var(--dc-text-2)]">{programName(line.program)}</span>
                  </span>
                  <span className={`${styles.num} text-[13.5px] font-semibold whitespace-nowrap`}>{formatMoney(line.amount)}</span>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="p-5 pt-4 flex flex-col gap-3 border-t border-[var(--dc-border)] bg-[var(--dc-surface-2)]">
              {result.availablePreferences.length > 0 && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] font-semibold text-[var(--dc-text-2)]">Trade preference</span>
                  <select
                    className={`${styles.input} appearance-none`}
                    style={{ height: 38, fontSize: 13.5 }}
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
                <span className="text-[12.5px] text-[var(--dc-text-3)]">
                  {entry.openQuestions > 0
                    ? `${entry.openQuestions} ${entry.openQuestions === 1 ? "question" : "questions"} could change this`
                    : "No open questions"}
                </span>
                <button
                  type="button"
                  className={`${styles.link} inline-flex items-center gap-1 text-[13px] shrink-0`}
                  onClick={() => onViewDetails(country)}
                >
                  View details
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
