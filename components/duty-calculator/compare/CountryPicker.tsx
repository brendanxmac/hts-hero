"use client";

import { ReactNode, useMemo, useState } from "react";
import { Popover } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Country } from "@/constants/countries";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import { formatRate } from "@/components/tariff-tracker/formatRate";
import { formatImportValue } from "../lib/usImports";

// Picking a country to compare: a dropdown under whatever opens it (a country's name in Side by
// Side, or the "Add a country" tile), with a search box and three lists to switch between: the
// countries that already ship this to the US, cheapest first, or biggest first (Census), and every
// country A to Z. Each row has its duty rate, its US imports and how it compares with yours, so the
// pick is easy. The countries already on screen (yours, and those being compared) stay in their
// place in each list, highlighted and tagged, so each list reads whole. Searching looks through every country. A pick closes it; so do a click outside and
// Escape. Nothing stays open half-done.

export interface PickOption {
  country: Country;
  // Its duty rate on this import, as shown
  pct: number;
  // US imports of this from there a year (Census); 0 when none
  imports: number;
  // Its rate less yours, in percent of the value (negative is cheaper)
  vsYours?: number;
  // Already on screen: your own origin, or a country being compared (highlighted, not pickable)
  selected?: "yours" | "compared";
}

type List = "cheapest" | "biggest" | "all";

const LISTS: Record<List, string> = {
  cheapest: "Ships it to the US, lowest duty first",
  biggest: "Ships it to the US, most imports first",
  all: "Every country, A to Z",
};

const Row = ({ option, onPick }: { option: PickOption; onPick: () => void }) => {
  const d = option.vsYours;
  const on = option.selected;
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        disabled={Boolean(on)}
        aria-current={on ? "true" : undefined}
        className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm focus-visible:outline-none ${on ? "cursor-default bg-primary/10 shadow-[inset_3px_0_0_0_oklch(var(--p))]" : "hover:bg-tt-soft focus-visible:bg-tt-soft"}`}
      >
        <span className="text-base leading-none" aria-hidden>
          {option.country.flag}
        </span>
        <span className={`min-w-0 flex-1 truncate ${on ? "font-semibold text-primary" : "text-base-content"}`}>{option.country.name}</span>
        {on && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${on === "yours" ? "bg-primary text-primary-content" : "bg-primary/15 text-primary"}`}>
            {on === "yours" ? "Yours" : "Comparing"}
          </span>
        )}
        {option.imports > 0 && <span className="text-xs tabular-nums text-base-content/60">{formatImportValue(option.imports)}</span>}
        <span className={`w-12 text-right font-semibold tabular-nums ${option.pct < 0.005 ? "text-success" : "text-base-content"}`}>{formatRate(option.pct)}</span>
        {d !== undefined && (
          <span
            className={`w-16 shrink-0 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums ${d < -0.005 ? "bg-success/10 text-success" : d > 0.005 ? "bg-error/10 text-error" : "bg-tt-soft text-base-content/60"}`}
            title="Against your rate"
          >
            {Math.abs(d) < 0.005 ? "Same" : `${d < 0 ? "−" : "+"}${formatRate(Math.abs(d))}`}
          </span>
        )}
      </button>
    </li>
  );
};

export const CountryPicker = ({
  options,
  onPick,
  label,
  buttonClassName = "",
  className = "",
  align = "left",
  children,
}: {
  // Every country, the ones already on screen marked `selected` (shown highlighted, not pickable)
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
  const suppliers = useMemo(() => options.filter((o) => o.imports > 0), [options]);
  // Opens on the cheapest suppliers; without US import figures, on every country
  const [list, setList] = useState<List>("cheapest");
  const shownList: List = suppliers.length ? list : "all";
  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    if (q) return options.filter((o) => o.country.name.toLowerCase().includes(q) || o.country.code.toLowerCase() === q).sort((a, b) => a.country.name.localeCompare(b.country.name));
    if (shownList === "cheapest") return [...suppliers].sort((a, b) => a.pct - b.pct || b.imports - a.imports);
    if (shownList === "biggest") return [...suppliers].sort((a, b) => b.imports - a.imports);
    return [...options].sort((a, b) => a.country.name.localeCompare(b.country.name));
  }, [options, suppliers, q, shownList]);

  return (
    <Popover className={`relative ${className}`}>
      {({ close }) => (
        <>
          <Popover.Button className={buttonClassName} aria-label={label} onClick={() => setQuery("")}>
            {children}
          </Popover.Button>
          <Popover.Panel className={`${ui.popover} absolute ${align === "right" ? "right-0" : "left-0"} z-40 mt-2 flex w-[26rem] max-w-[calc(100vw-2rem)] flex-col gap-2 tracker:rounded-2xl tracker:p-2`}>
            <label className={`${ui.inputSm} flex items-center gap-2 tracker:rounded-xl tracker:border-transparent tracker:bg-tt-soft tracker:shadow-none`}>
              <MagnifyingGlassIcon className="h-4 w-4 text-base-content/60" aria-hidden />
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                // Ready to type as soon as it opens
                autoFocus
                placeholder={`Search all ${options.filter((o) => !o.selected).length} countries`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  // Enter picks the first in the list
                  const first = rows.find((o) => !o.selected);
                  if (e.key === "Enter" && first) {
                    e.preventDefault();
                    onPick(first.country);
                    close();
                  }
                }}
                aria-label="Search countries"
              />
            </label>
            {!q && suppliers.length > 0 && (
              <SegmentedControl<List>
                label="Which countries"
                size="sm"
                fullWidth
                value={shownList}
                onChange={setList}
                options={[
                  { id: "cheapest", label: "Cheapest", count: suppliers.length },
                  { id: "biggest", label: "Biggest suppliers", count: suppliers.length },
                  { id: "all", label: "A–Z", count: options.length },
                ]}
              />
            )}
            <div className="flex items-baseline justify-between gap-2 px-2.5">
              <span className={ui.label}>{q ? `Matching “${query.trim()}”` : LISTS[shownList]}</span>
              <span className="text-xs text-base-content/50">{options.some((o) => o.vsYours !== undefined) ? "Rate · vs yours" : "Rate"}</span>
            </div>
            {rows.length ? (
              <ul className="m-0 flex max-h-80 list-none flex-col overflow-y-auto p-0">
                {rows.map((o) => (
                  <Row key={o.country.code} option={o} onPick={() => (onPick(o.country), close())} />
                ))}
              </ul>
            ) : (
              <p className={`${ui.bodySm} m-0 px-2.5 py-2`}>No country matches “{query}”.</p>
            )}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};
