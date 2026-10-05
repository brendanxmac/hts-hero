"use client";

import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  PlusIcon,
  TrophyIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Country } from "../../constants/countries";
import { AllRules } from "../../tariffs/engine-v2/data";
import { CalculationResult } from "../../tariffs/engine-v2/types";
import { CountryField } from "./CountryField";
import { formatMoney, formatPct } from "./format";
import { mono } from "../ui/font";

export interface CompareEntry {
  country: Country;
  result: CalculationResult;
  claimedPreference: string;
  openQuestions: number;
}

const programName = (id?: string) =>
  AllRules.programs.find((p) => p.id === id)?.name ?? "Other";

const COLUMN_LABEL = {
  general: "Column 1 General",
  special: "Column 1 Special",
  column2: "Column 2",
};

export const CompareView = ({
  entries,
  countries,
  max,
  onAdd,
  customsValue,
  onPreferenceChange,
  onViewDetails,
  onRemove,
}: {
  entries: CompareEntry[];
  // Every selected country, and the most there can be; an empty card offers the next slot
  countries: Country[];
  max: number;
  onAdd: (country: Country) => void;
  customsValue: number;
  onPreferenceChange: (countryCode: string, symbol: string) => void;
  onViewDetails: (country: Country) => void;
  onRemove: (countryCode: string) => void;
}) => {
  const landed = (e: CompareEntry) =>
    customsValue + e.result.totalDuty + e.result.totalFees;
  const lowest = Math.min(...entries.map(landed));
  const lowestEntries = entries.filter(
    (e) => Math.abs(landed(e) - lowest) < 0.005,
  );
  const lowestNames = lowestEntries.map((e) => e.country.name).join(" and ");
  const allTied = lowestEntries.length === entries.length;

  const single = entries.length === 1;
  const canAdd = countries.length < max;
  const cards = entries.length + (canAdd ? 1 : 0);
  const columns =
    cards >= 3
      ? "lg:grid-cols-3 md:grid-cols-2"
      : cards === 2
        ? "md:grid-cols-2"
        : "";

  return (
    <div className={`grid grid-cols-1 ${columns} gap-4 items-stretch`}>
      {entries.map((entry) => {
        const { country, result } = entry;
        const isLowest = !allTied && lowestEntries.includes(entry);
        const difference = landed(entry) - lowest;
        const effectiveRate =
          customsValue > 0 ? (result.totalDuty / customsValue) * 100 : 0;
        const applied = result.lines.filter((l) => l.status === "applies");

        return (
          <article
            key={country.code}
            // An outline, because the card's shadow would override a Tailwind ring
            className={`rounded-lg border border-base-300 bg-base-100 shadow-sm flex flex-col overflow-hidden ${
              isLowest
                ? "outline outline-2 -outline-offset-1 outline-success"
                : ""
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
                  <h3 className="text-base font-semibold truncate">
                    {country.name}
                  </h3>
                  <p className="text-xs text-base-content/60">
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
                    className="btn btn-ghost btn-sm btn-square -mr-1.5 text-base-content/60 hover:text-base-content"
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
                <div className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                  Total duty
                </div>
                <div className="tabular-nums mt-1.5 text-3xl leading-none font-semibold tracking-tight">
                  {formatMoney(result.totalDuty)}
                </div>
                <div className="tabular-nums mt-1.5 text-sm text-base-content/70">
                  {formatPct(Math.round(effectiveRate * 100) / 100)} effective
                  rate
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-base-content/60">Fees</dt>
                  <dd className="tabular-nums text-base font-semibold">
                    {formatMoney(result.totalFees)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-base-content/60">Landed cost</dt>
                  <dd className="tabular-nums text-base font-semibold">
                    {formatMoney(landed(entry))}
                  </dd>
                </div>
              </dl>
              {!single && (
                <div
                  className={`tabular-nums text-sm font-medium ${
                    allTied || isLowest
                      ? "text-success"
                      : "text-base-content/70"
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
                      <span className="tabular-nums text-xs text-base-content/60">
                        {line.ratePct !== undefined
                          ? formatPct(line.ratePct)
                          : ""}
                      </span>
                    </span>
                    <span className="text-sm leading-snug text-base-content/70">
                      {programName(line.program)}
                    </span>
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
                  <span className="text-sm font-semibold text-base-content/70">
                    Trade preference
                  </span>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={entry.claimedPreference}
                    onChange={(e) =>
                      onPreferenceChange(country.code, e.target.value)
                    }
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
                <span className="text-xs text-base-content/60">
                  {entry.openQuestions > 0
                    ? `${entry.openQuestions} ${entry.openQuestions === 1 ? "question" : "questions"} could change this`
                    : "No open questions"}
                </span>
                <button
                  type="button"
                  className="link link-primary link-hover font-semibold inline-flex items-center gap-1 text-sm shrink-0"
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
      {canAdd && <AddCountryCard countries={countries} onAdd={onAdd} />}
    </div>
  );
};

// The next open slot: a button that turns into a country search
const AddCountryCard = ({
  countries,
  onAdd,
}: {
  countries: Country[];
  onAdd: (country: Country) => void;
}) => {
  const [searching, setSearching] = useState(false);

  // Put the cursor in the search as soon as it appears
  useEffect(() => {
    if (searching) document.getElementById("dc-compare-add")?.focus();
  }, [searching]);

  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-base-content/20 p-6 text-center">
      {searching ? (
        <div className="w-full max-w-xs flex flex-col gap-2 text-left">
          <label
            htmlFor="dc-compare-add"
            className="text-sm font-semibold text-base-content/70"
          >
            Compare with
          </label>
          <CountryField
            id="dc-compare-add"
            selected={[]}
            max={1}
            onChange={(picked) => {
              const added = picked[0];
              // Already selected countries have a card; picking one again does nothing
              if (added && !countries.some((c) => c.code === added.code))
                onAdd(added);
              setSearching(false);
            }}
          />
          <button
            type="button"
            className="self-start text-sm font-medium text-base-content/60 hover:text-base-content"
            onClick={() => setSearching(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div>
            <div className="text-base font-semibold">
              {countries.length === 1
                ? "Compare with another country"
                : "Add another country"}
            </div>
            <p className="mt-1 text-sm text-base-content/60">
              See the duty, fees and landed cost side by side
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setSearching(true)}
          >
            <PlusIcon className="w-4 h-4" />
            Add a country
          </button>
        </>
      )}
    </div>
  );
};
