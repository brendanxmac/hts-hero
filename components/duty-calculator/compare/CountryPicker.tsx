"use client";

import { ReactNode, useMemo, useState } from "react";
import { Popover } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Country } from "@/constants/countries";
import * as ui from "@/components/ui/styles";
import { formatRate } from "@/components/tariff-tracker/formatRate";
import { formatImportValue } from "../lib/usImports";

// Picking a country to compare: a dropdown under whatever opens it (a country's name in Side by
// Side, or the "Add a country" tile), with a search box, the cheapest countries that already ship
// this to the US first, then every country A to Z, each with its duty rate and US imports. A pick
// closes it; so do a click outside and Escape. Nothing stays open half-done.

export interface PickOption {
  country: Country;
  // Its duty rate on this import, as shown
  pct: number;
  // US imports of this from there a year (Census); 0 when none
  imports: number;
}

const Row = ({ option, onPick }: { option: PickOption; onPick: () => void }) => (
  <li>
    <button type="button" onClick={onPick} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-tt-soft focus-visible:bg-tt-soft focus-visible:outline-none">
      <span className="text-base leading-none" aria-hidden>
        {option.country.flag}
      </span>
      <span className="min-w-0 flex-1 truncate text-base-content">{option.country.name}</span>
      {option.imports > 0 && <span className="text-xs tabular-nums text-base-content/60">{formatImportValue(option.imports)}</span>}
      <span className={`w-12 text-right font-semibold tabular-nums ${option.pct < 0.005 ? "text-success" : "text-base-content"}`}>{formatRate(option.pct)}</span>
    </button>
  </li>
);

export const CountryPicker = ({
  options,
  onPick,
  label,
  buttonClassName = "",
  className = "",
  align = "left",
  children,
}: {
  // Every country that can be picked (not the ones already compared)
  options: PickOption[];
  onPick: (country: Country) => void;
  // What the dropdown is for, for screen readers ("Pick another country instead of Mexico")
  label: string;
  buttonClassName?: string;
  // On the picker's own box (the Add a country tile fills its column)
  className?: string;
  // Which edge the dropdown lines up with: the right in the right-hand columns, so it stays inside the box
  align?: "left" | "right";
  // What opens it
  children: ReactNode;
}) => {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () => (q ? options.filter((o) => o.country.name.toLowerCase().includes(q) || o.country.code.toLowerCase() === q) : options),
    [options, q]
  );
  // The cheapest that already ship this to the US, when not searching
  const cheapest = useMemo(
    () => (q ? [] : [...options].filter((o) => o.imports > 0).sort((a, b) => a.pct - b.pct || b.imports - a.imports).slice(0, 5)),
    [options, q]
  );
  const all = useMemo(() => [...matches].sort((a, b) => a.country.name.localeCompare(b.country.name)), [matches]);

  return (
    <Popover className={`relative ${className}`}>
      {({ close }) => (
        <>
          <Popover.Button className={buttonClassName} aria-label={label} onClick={() => setQuery("")}>
            {children}
          </Popover.Button>
          <Popover.Panel className={`${ui.popover} absolute ${align === "right" ? "right-0" : "left-0"} z-40 mt-2 flex w-80 flex-col gap-1 tracker:rounded-2xl tracker:p-2`}>
            <label className={`${ui.inputSm} mb-1 flex items-center gap-2 tracker:rounded-xl tracker:border-transparent tracker:bg-tt-soft tracker:shadow-none`}>
              <MagnifyingGlassIcon className="h-4 w-4 text-base-content/60" aria-hidden />
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                // Ready to type as soon as it opens
                autoFocus
                placeholder={`Search ${options.length} countries`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  // Enter picks the first match
                  if (e.key === "Enter" && (cheapest[0] ?? all[0])) {
                    e.preventDefault();
                    onPick((q ? all[0] : (cheapest[0] ?? all[0])).country);
                    close();
                  }
                }}
                aria-label="Search countries"
              />
            </label>
            <div className="flex max-h-80 flex-col overflow-y-auto">
              {cheapest.length > 0 && (
                <>
                  <span className={`${ui.label} px-2.5 pb-1 pt-1`}>Cheapest suppliers</span>
                  <ul className="m-0 list-none p-0">
                    {cheapest.map((o) => (
                      <Row key={o.country.code} option={o} onPick={() => (onPick(o.country), close())} />
                    ))}
                  </ul>
                  <span className={`${ui.label} px-2.5 pb-1 pt-3`}>All countries</span>
                </>
              )}
              {all.length ? (
                <ul className="m-0 list-none p-0">
                  {all.map((o) => (
                    <Row key={o.country.code} option={o} onPick={() => (onPick(o.country), close())} />
                  ))}
                </ul>
              ) : (
                <p className={`${ui.bodySm} m-0 px-2.5 py-2`}>No country matches “{query}”.</p>
              )}
            </div>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};
