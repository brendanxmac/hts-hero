"use client";

import { useMemo } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import { Country } from "@/constants/countries";
import * as ui from "@/components/ui/styles";
import { TrackedProduct } from "@/components/tariff-tracker/report";
import { rateOf } from "@/components/tariff-tracker/product/analysis/analysis";
import { CountryCard, linesOf, optionSub, supplyOf } from "./CountryCard";
import { CountryPicker, PickOption } from "./CountryPicker";
import { CompareOption, optionResult } from "./options";
import { Origins } from "./useOrigins";

// The countries being compared, side by side: one column each, yours on the left and the rest
// cheapest first (no summary: the columns are the answer). Each column is a CountryCard, rates first and dollars under them (what it costs and against yours, a bar of what the duty is made of, every
// tariff with its rate and amount, the fees and the landed cost), and their tariff rows line up,
// so the same tariff sits on the same row across the countries ("—" where it doesn't apply). One
// line above says which costs the least. At standard rates or with trade programs (the Compare
// header's toggle). Any country but yours can be swapped in place (its name is a picker), and "Add a
// country" (filling its column) is the last while there's room.

export type RatesShown = "standard" | "programs";


// The last column while there's room: a big, plain invitation to compare any other country, opening
// the same country picker as each country's name
const AddCountry = ({ options, onAdd }: { options: PickOption[]; onAdd: (country: Country) => void }) => (
  <CountryPicker
    options={options}
    onPick={onAdd}
    label="Add a country to compare"
    align="right"
    className="flex w-full"
    buttonClassName="flex h-full min-h-64 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-base-300 px-4 text-center transition-colors hover:border-primary hover:bg-tt-soft ui-open:border-primary ui-open:bg-tt-soft"
  >
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
      <PlusIcon className="h-5 w-5" />
    </span>
    <span className="text-sm font-semibold text-base-content">Add a country</span>
    <span className={ui.caption}>Compare any of {options.length} countries, up to 4 at once</span>
  </CountryPicker>
);

export const SideBySide = ({
  product,
  origins,
  options,
  mode,
  asOf,
  countries,
  max,
  onAdd,
  onRemove,
  onReplace,
  onViewDetails,
}: {
  product: TrackedProduct;
  // Every origin's tariff colors
  origins: Origins;
  // Each compared country at its standard rate, in the order they were added
  options: CompareOption[];
  // Every country at its standard rate, or with the trade program that lowers it most (the
  // Compare header's toggle)
  mode: RatesShown;
  // The entry date, when it isn't today
  asOf?: string;
  countries: Country[];
  max: number;
  onAdd: (country: Country) => void;
  onRemove: (code: string) => void;
  // Swapping one country for another, in its column
  onReplace: (code: string, country: Country) => void;
  onViewDetails: (country: Country, preference?: string) => void;
}) => {
  const value = product.customsValue > 0 ? product.customsValue : 1;
  // Each country at its standard rate, or with the trade program that lowers it most; worked out
  // in full on the date, cheapest first
  const rows = useMemo(
    () =>
      options
        .map((standard) => {
          const best = standard.origin.agreement;
          const option: CompareOption = mode === "programs" && best ? { ...standard, agreement: { symbol: best.symbol, name: best.name } } : standard;
          const result = optionResult(product, option, asOf);
          return { option, result, duty: result.totalDuty, pct: (result.totalDuty / value) * 100 };
        })
        .sort((a, b) => a.duty - b.duty),
    [options, mode, product, asOf, value]
  );
  const yours = rows.find((r) => r.option.origin.isOrigin);
  // Yours first, on the left; the others in the order they were added, so a new one joins the end
  const ordered = options.map((o) => rows.find((r) => r.option.origin.country.code === o.origin.country.code)!).filter(Boolean);
  const cheapest = rows[0];
  const top = Math.max(...rows.map((r) => r.pct), 0.01);
  const tied = rows.filter((r) => cheapest && Math.abs(r.duty - cheapest.duty) < 0.005);
  // Every tariff in any column, base duty first, so the rows line up across them
  // (no Chapter 99 code: the same program has a different heading in each country)
  const lines = Array.from(new Map(rows.flatMap((r) => linesOf(r.result)).map((l) => [l.key, { ...l, code: undefined as string | undefined }])).values());
  const canAdd = countries.length < max;
  // Every country not compared yet, at the rates shown, for the pickers
  const pickOptions: PickOption[] = useMemo(
    () =>
      origins.rates
        .filter((r) => !countries.some((c) => c.code === r.country.code))
        .map((r) => ({ country: r.country, pct: rateOf(r, mode === "programs" ? "agreements" : "standard"), imports: origins.imports?.byCountry.get(r.country.code)?.value ?? 0 })),
    [origins.rates, origins.imports, countries, mode]
  );
  // The largest share of US imports among the columns, so their volume bars compare
  const supplyTop = Math.max(...rows.map((r) => supplyOf(origins.imports, r.option.origin.country.code)?.share ?? 0), 0);
  const columns = rows.length + (canAdd ? 1 : 0);

  return (
    <section className="flex flex-col" aria-label="Countries side by side">
      {/* One column per country, yours first, with a rule between them */}
      <div
        className="grid grid-cols-1 divide-y divide-base-300 sm:grid-cols-2 sm:divide-y-0 lg:[grid-template-columns:var(--cols)] [&>*]:border-base-300 sm:[&>*:nth-child(n+3)]:border-t lg:[&>*:nth-child(n+3)]:border-t-0 sm:[&>*:nth-child(even)]:border-l lg:[&>*+*]:border-l"
        style={{ ["--cols" as string]: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {ordered.map((r, i) => (
          <div key={r.option.origin.country.code} className="p-5 sm:px-6">
            <CountryCard
              country={r.option.origin.country}
              sub={optionSub(r.option)}
              result={r.result}
              value={value}
              colors={origins.colors}
              lines={lines}
              scale={r.pct / top}
              show="pct"
              supply={supplyOf(origins.imports, r.option.origin.country.code)}
              supplyTop={supplyTop}
              onChange={r.option.origin.isOrigin ? undefined : (c) => onReplace(r.option.origin.country.code, c)}
              pickOptions={pickOptions}
              pickAlign={i >= 2 ? "right" : "left"}
              diff={r.option.origin.isOrigin || !yours ? undefined : r.duty - yours.duty}
              cheapest={rows.length > 1 && tied.includes(r) && !r.option.origin.isOrigin}
              onRemove={r.option.origin.isOrigin ? undefined : () => onRemove(r.option.origin.country.code)}
              onOpen={() => onViewDetails(r.option.origin.country, r.option.agreement?.symbol)}
            />
          </div>
        ))}
        {canAdd && (
          <div className="flex items-stretch p-5 sm:px-6">
            <AddCountry options={pickOptions} onAdd={onAdd} />
          </div>
        )}
      </div>
    </section>
  );
};
