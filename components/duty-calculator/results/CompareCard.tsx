"use client";

// One country's card in the comparison, kept to what's being compared: the total duty and how it
// stands against the lowest, what it's made of (one bar, colored the same on every card, and a
// row per part), the landed cost, and the trade preference to claim. Every line, with its code and
// legal text, is in the full breakdown.
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { TrophyIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Country } from "@/constants/countries";
import * as ui from "@/components/ui/styles";
import { formatMoney, formatPct } from "../lib/format";
import { ArrowLink } from "../calculator/ArrowLink";
import { CompareEntry } from "./compareEntry";
import { PreferencePicker } from "./PreferencePicker";
import { BASE_SLICE, sliceForProgram } from "./slices";
import { ExcludesBase } from "@/components/duty-calculator/results/ExcludesBase";

const pct = (n: number) => formatPct(Math.round(n * 100) / 100);

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
  colorFor,
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
  // One color per part of the duty, the same on every card
  colorFor: (label: string) => string;
  onPreferenceChange: (countryCode: string, symbol: string) => void;
  onViewDetails: (country: Country) => void;
  onRemove: (countryCode: string) => void;
}) => {
  const { country, result } = entry;
  const value = customsValue > 0 ? customsValue : 1;
  // The duty's parts: base duty, then one per program, each with its share of the value
  const parts = [
    { label: BASE_SLICE, amount: result.base.amount },
    ...Array.from(
      result.lines
        .filter((l) => l.status === "applies" && l.amount > 0)
        .reduce((m, l) => m.set(sliceForProgram(l.program), (m.get(sliceForProgram(l.program)) ?? 0) + l.amount), new Map<string, number>()),
    ).map(([label, amount]) => ({ label, amount })),
  ].filter((p) => p.amount > 0.005);

  return (
    <article
      // An outline, because the card's shadow would override a Tailwind ring
      // Overflow visible, for the trade program's dropdown
      className={`${ui.cardOverflowVisible} flex flex-col ${isLowest ? "outline-solid outline-2 -outline-offset-1 outline-success" : ""}`}
      aria-label={`Duty estimate for ${country.name}`}
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="text-2xl leading-none" aria-hidden>
            {country.flag}
          </span>
          <h3 className={`${ui.cardTitle} truncate`}>{country.name}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isLowest && (
            // Short, so four cards across still show the name; the line under the total says what it means
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success" title="Lowest landed cost">
              <TrophyIcon className="h-3.5 w-3.5" aria-hidden />
              Lowest
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
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* The figure being compared, and where it stands */}
      <div className="px-5 pt-4">
        <div className={ui.label}>Total duty</div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className={ui.metric.primaryCompact}>{formatMoney(result.totalDuty)}</span>
          <span className="tabular-nums text-sm text-base-content/60">{pct((result.totalDuty / value) * 100)}</span>
        </div>
        {result.baseNotCalculated && <ExcludesBase className="mt-1 block" />}
        {!single && (
          <div className="mt-1.5 text-sm font-medium tabular-nums">
            {allTied ? (
              <span className="text-base-content/60">Same landed cost as the others</span>
            ) : isLowest ? (
              <span className="text-success">{tiedForLowest ? "Tied for the lowest landed cost" : "Lowest landed cost"}</span>
            ) : (
              <span className="text-base-content/60">
                <span className="text-error">+{formatMoney(difference)}</span> vs {lowestNames}
              </span>
            )}
          </div>
        )}
      </div>

      {/* What the duty is made of */}
      <div className="flex flex-1 flex-col gap-2.5 px-5 py-4">
        {parts.length > 0 ? (
          <>
            <StackedBar
              parts={parts.map((p) => ({ label: p.label, amount: p.amount, color: colorFor(p.label) }))}
              formatValue={formatMoney}
              size="xs"
              shape="pill"
              legend={false}
            />
            <ul className="flex flex-col gap-1.5">
              {parts.map((p) => (
                <li key={p.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colorFor(p.label) }} aria-hidden />
                    <span className="truncate text-base-content/80">{p.label}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-base-content/60">{pct((p.amount / value) * 100)}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm font-medium text-success">Duty free</p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-base-300 px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-base-content/60">Landed cost</span>
          <span className="tabular-nums text-base font-semibold">{formatMoney(landedCost)}</span>
        </div>
        {result.availablePreferences.length > 0 && (
          <div className="flex items-center justify-between gap-3">
            <span className="shrink-0 text-sm text-base-content/60">Trade program</span>
            <div className="w-[60%] min-w-0">
              <PreferencePicker
                label={`Trade program for ${country.name}`}
                options={result.availablePreferences}
                value={entry.claimedPreference}
                onChange={(symbol) => onPreferenceChange(country.code, symbol)}
              />
            </div>
          </div>
        )}
        <ArrowLink onClick={() => onViewDetails(country)} className="self-start">
          View full breakdown
        </ArrowLink>
      </div>
    </article>
  );
};
