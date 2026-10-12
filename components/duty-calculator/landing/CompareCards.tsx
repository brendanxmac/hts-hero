"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { Country } from "@/constants/countries";
import { CountryField } from "../fields/CountryField";
import { formatMoney, formatPct } from "../lib/format";
import { CompareEntry } from "../results";
import { COLUMN_LABEL, programName } from "../results/labels";

// The Compare tab's cards, in the Tracker's look (the Tracker's own calculator keeps the original
// CompareView): one card per country with the duty, fees and landed cost in the same places,
// how it compares to the lowest, each line, and the trade preference to claim as chips. Then a
// card to add a country with the country picker.

const pct = (n: number) => formatPct(Math.round(n * 100) / 100);

const Card = ({
  entry,
  customsValue,
  landed,
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
  landed: number;
  difference: number;
  isLowest: boolean;
  tiedForLowest: boolean;
  allTied: boolean;
  lowestNames: string;
  single: boolean;
  onPreferenceChange: (countryCode: string, symbol: string) => void;
  onViewDetails: (country: Country) => void;
  onRemove: (countryCode: string) => void;
}) => {
  const { country, result } = entry;
  const rate = customsValue > 0 ? (result.totalDuty / customsValue) * 100 : 0;
  const applied = result.lines.filter((l) => l.status === "applies");

  return (
    <article
      aria-label={`Duty estimate for ${country.name}`}
      className={`flex flex-col rounded-2xl border bg-base-100 ${isLowest ? "border-success ring-1 ring-success" : "border-base-300"}`}
    >
      <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-2xl leading-none" aria-hidden>
            {country.flag}
          </span>
          <div className="min-w-0">
            <h3 className={`${tt.display} m-0 truncate text-base font-semibold text-base-content`}>{country.name}</h3>
            <p className="m-0 text-xs text-base-content/60">
              {COLUMN_LABEL[result.column]}
              {result.claimedPreference ? ` · ${result.claimedPreference}` : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isLowest && <span className={tt.chip("success")}>Lowest cost</span>}
          {!single && (
            <button
              type="button"
              className="-mr-1.5 rounded-full p-1.5 text-base-content/40 transition-colors hover:bg-tt-soft hover:text-base-content"
              aria-label={`Remove ${country.name} from the comparison`}
              title="Remove from comparison"
              onClick={() => onRemove(country.code)}
            >
              <XMarkIcon className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-4 px-5 pb-5">
        <div>
          <span className="text-xs text-base-content/60">Total duty</span>
          <div className={`${tt.display} text-3xl font-semibold leading-tight tabular-nums text-base-content`}>{formatMoney(result.totalDuty)}</div>
          <span className="text-sm tabular-nums text-base-content/70">{pct(rate)} effective rate</span>
        </div>
        <dl className="m-0 grid grid-cols-2 gap-3">
          <div className="border-l border-base-300 pl-3">
            <dt className="text-xs text-base-content/60">Fees</dt>
            <dd className="m-0 font-semibold tabular-nums text-base-content">{formatMoney(result.totalFees)}</dd>
          </div>
          <div className="border-l border-base-300 pl-3">
            <dt className="text-xs text-base-content/60">Landed cost</dt>
            <dd className="m-0 font-semibold tabular-nums text-base-content">{formatMoney(landed)}</dd>
          </div>
        </dl>
        {!single && (
          <span className={`text-sm font-medium tabular-nums ${allTied || isLowest ? "text-success" : "text-base-content/70"}`}>
            {allTied
              ? "Same landed cost as the others"
              : isLowest
                ? tiedForLowest
                  ? "Tied for the lowest landed cost"
                  : "Lowest landed cost"
                : `+${formatMoney(difference)} more than ${lowestNames}`}
          </span>
        )}
      </div>

      <ul className="m-0 flex-1 list-none border-t border-base-300 px-5 py-2">
        <li className="flex items-baseline justify-between gap-3 py-2 text-sm">
          <span className="min-w-0">
            <span className={`${mono.className} mr-2 text-xs font-semibold text-base-content/60`}>Base</span>
            <span className="text-base-content">{result.base.reasons[0] ?? "Free"}</span>
          </span>
          <span className="whitespace-nowrap font-medium tabular-nums text-base-content">{formatMoney(result.base.amount)}</span>
        </li>
        {applied.map((line) => (
          <li key={line.code} className="flex items-baseline justify-between gap-3 py-2 text-sm">
            <span className="flex min-w-0 flex-col">
              <span>
                <span className={`${mono.className} mr-2 text-xs font-semibold text-base-content/60`}>{line.code}</span>
                {line.ratePct !== undefined && <span className="text-xs tabular-nums text-base-content/50">{pct(line.ratePct)}</span>}
              </span>
              <span className="text-base-content">{programName(line.program)}</span>
            </span>
            <span className="whitespace-nowrap font-medium tabular-nums text-base-content">{formatMoney(line.amount)}</span>
          </li>
        ))}
      </ul>

      <footer className="flex flex-col gap-3 rounded-b-2xl border-t border-base-300 bg-tt-soft px-5 py-4">
        {result.availablePreferences.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-base-content/60">Trade preference</span>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Trade preference for ${country.name}`}>
              {[{ symbol: "", name: "None claimed" }, ...result.availablePreferences].map((p) => {
                const on = entry.claimedPreference === p.symbol;
                return (
                  <button
                    key={p.symbol || "none"}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    title={p.name}
                    onClick={() => onPreferenceChange(country.code, p.symbol)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                      on ? "border-primary bg-primary text-primary-content" : "border-base-300 bg-base-100 text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    {p.symbol ? `${p.symbol} · ${p.name.replace(/^United States-/, "")}` : "None"}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-base-content/60">
            {entry.openQuestions > 0
              ? `${entry.openQuestions} ${entry.openQuestions === 1 ? "question" : "questions"} could change this`
              : "No open questions"}
          </span>
          <button type="button" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline" onClick={() => onViewDetails(country)}>
            View details
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </footer>
    </article>
  );
};

const AddCard = ({ countries, onAdd }: { countries: Country[]; onAdd: (country: Country) => void }) => {
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    if (searching) document.getElementById("dc-compare-add")?.focus();
  }, [searching]);

  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-base-300 p-6 text-center">
      {searching ? (
        <div className="flex w-full max-w-xs flex-col gap-2 text-left">
          <label htmlFor="dc-compare-add" className="text-xs font-semibold text-base-content/60">
            Compare with
          </label>
          <div className="rounded-xl border border-base-300 bg-base-100 px-3 py-2 focus-within:border-primary">
            <CountryField
              id="dc-compare-add"
              selected={[]}
              max={1}
              bare
              onChange={(picked) => {
                const added = picked[0];
                // A country already compared has a card; picking it again does nothing
                if (added && !countries.some((c) => c.code === added.code)) onAdd(added);
                setSearching(false);
              }}
            />
          </div>
          <button type="button" className="self-start text-sm font-medium text-base-content/60 hover:text-base-content" onClick={() => setSearching(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div>
            <div className={`${tt.display} text-base font-semibold text-base-content`}>{countries.length === 1 ? "Compare with another country" : "Add another country"}</div>
            <p className="m-0 mt-1 text-sm text-base-content/60">Duty, fees and landed cost side by side</p>
          </div>
          <button type="button" className={tt.button("secondary", "sm")} onClick={() => setSearching(true)}>
            <PlusIcon className="h-4 w-4" aria-hidden />
            Add a country
          </button>
        </>
      )}
    </div>
  );
};

export const CompareCards = ({
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
  countries: Country[];
  max: number;
  onAdd: (country: Country) => void;
  customsValue: number;
  onPreferenceChange: (countryCode: string, symbol: string) => void;
  onViewDetails: (country: Country) => void;
  onRemove: (countryCode: string) => void;
}) => {
  const landed = (e: CompareEntry) => customsValue + e.result.totalDuty + e.result.totalFees;
  const lowest = Math.min(...entries.map(landed));
  const lowestEntries = entries.filter((e) => Math.abs(landed(e) - lowest) < 0.005);
  const allTied = lowestEntries.length === entries.length;
  const canAdd = countries.length < max;
  const cards = entries.length + (canAdd ? 1 : 0);

  return (
    <div className={`grid grid-cols-1 items-stretch gap-4 ${cards >= 3 ? "md:grid-cols-2 lg:grid-cols-3" : cards === 2 ? "md:grid-cols-2" : ""}`}>
      {entries.map((entry) => (
        <Card
          key={entry.country.code}
          entry={entry}
          customsValue={customsValue}
          landed={landed(entry)}
          difference={landed(entry) - lowest}
          isLowest={!allTied && lowestEntries.includes(entry)}
          tiedForLowest={lowestEntries.length > 1}
          allTied={allTied}
          lowestNames={lowestEntries.map((e) => e.country.name).join(" and ")}
          single={entries.length === 1}
          onPreferenceChange={onPreferenceChange}
          onViewDetails={onViewDetails}
          onRemove={onRemove}
        />
      ))}
      {canAdd && <AddCard countries={countries} onAdd={onAdd} />}
    </div>
  );
};
