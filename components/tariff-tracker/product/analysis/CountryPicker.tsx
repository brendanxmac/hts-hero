"use client";

import { useMemo, useState } from "react";
import { Popover } from "@headlessui/react";
import { ChevronDownIcon, GlobeAltIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { SUMMARY_COUNTRY_CODES } from "@/libs/hts-duty-summary";
import { formatRate } from "../../formatRate";
import { CountrySelection, OriginRate, presetCountries, PresetId, RateBasis, rateOf } from "./analysis";

// Choosing which countries the analysis shows: a searchable checklist with one-click presets,
// then the choice as chips under the toolbar. The product's own origin is always shown.

const PRESETS: { id: PresetId; label: string; hint: string }[] = [
  { id: "sources", label: "Top import sources", hint: "The 20 largest sources of US imports" },
  { id: "agreements", label: "Trade agreement partners", hint: "Origins with an agreement that lowers this rate" },
  { id: "cheaper", label: "Cheaper than yours", hint: "Every origin paying less than yours" },
];

// Chips beyond this collapse into a count
const CHIPS_SHOWN = 12;

export const CountryPicker = ({
  rates,
  basis,
  selection,
  onChange,
}: {
  rates: OriginRate[];
  basis: RateBasis;
  selection: CountrySelection;
  onChange: (selection: CountrySelection, how: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const others = useMemo(
    () => rates.filter((r) => !r.isOrigin).sort((a, b) => a.country.name.localeCompare(b.country.name)),
    [rates]
  );
  const chosen = new Set(selection ?? others.map((r) => r.country.code));
  const q = query.trim().toLowerCase();
  const shown = q
    ? others.filter((r) => r.country.name.toLowerCase().includes(q) || r.country.code.toLowerCase() === q)
    : others;

  const toggle = (code: string) => {
    const next = new Set(chosen);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    // Every country chosen is the same as no choice
    onChange(next.size === others.length ? null : Array.from(next), "checkbox");
  };

  const label = selection ? `${selection.length} ${selection.length === 1 ? "country" : "countries"}` : "All countries";

  return (
    <Popover className="relative">
      <Popover.Button className={`${ui.button({ size: "sm" })} ${selection ? "border-primary/40 text-primary" : ""}`}>
        <GlobeAltIcon className="h-4 w-4" aria-hidden />
        {label}
        <ChevronDownIcon className="-mr-1 h-4 w-4 text-base-content/60" aria-hidden />
      </Popover.Button>
      <Popover.Panel className={`${ui.popover} absolute left-0 z-40 mt-2 flex w-80 flex-col gap-2`}>
        <div className="flex flex-col gap-1 px-1 pt-1">
          <span className={ui.label}>Quick picks</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => {
              const codes = presetCountries(p.id, rates, basis, SUMMARY_COUNTRY_CODES);
              return (
                <button
                  key={p.id}
                  type="button"
                  title={p.hint}
                  disabled={codes.length === 0}
                  className="rounded-full border border-base-300 bg-base-200 px-2.5 py-1 text-xs font-medium text-base-content/80 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
                  onClick={() => onChange(codes, p.id)}
                >
                  {p.label} <span className="tabular-nums text-base-content/50">{codes.length}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-base-300 px-1 pt-2">
          <label className={`${ui.inputSm} flex flex-1 items-center gap-2`}>
            <MagnifyingGlassIcon className="h-4 w-4 text-base-content/60" aria-hidden />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none"
              placeholder="Find a country"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Find a country"
            />
          </label>
          <button type="button" className={`${ui.link} text-xs`} onClick={() => onChange(null, "all")}>
            All
          </button>
          <button type="button" className={`${ui.link} text-xs`} onClick={() => onChange([], "none")}>
            None
          </button>
        </div>
        <ul className="flex max-h-72 flex-col overflow-y-auto" role="group" aria-label="Countries to show">
          {shown.map((r) => (
            <li key={r.country.code}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-base-200">
                <input
                  type="checkbox"
                  className={ui.checkbox}
                  checked={chosen.has(r.country.code)}
                  onChange={() => toggle(r.country.code)}
                />
                <span aria-hidden>{r.country.flag}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-base-content">{r.country.name}</span>
                <span className="text-xs tabular-nums text-base-content/60">{formatRate(rateOf(r, basis))}</span>
              </label>
            </li>
          ))}
          {shown.length === 0 && <li className={`${ui.caption} px-2 py-1.5`}>Nothing matches “{query}”</li>}
        </ul>
      </Popover.Panel>
    </Popover>
  );
};

// The chosen countries as chips, with a way back to all of them
export const CountryChips = ({
  rates,
  selection,
  onChange,
}: {
  rates: OriginRate[];
  selection: string[];
  onChange: (selection: CountrySelection, how: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const origins = rates.filter((r) => selection.includes(r.country.code) && !r.isOrigin);
  const yours = rates.find((r) => r.isOrigin);
  const shown = expanded ? origins : origins.slice(0, CHIPS_SHOWN);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-sm text-base-content/70">
        Showing {origins.length} of {rates.length - 1} countries{yours ? `, and ${yours.country.name}` : ""}:
      </span>
      {shown.map((r) => (
        <button
          key={r.country.code}
          type="button"
          className={`${ui.badge("primary")} gap-1 hover:bg-primary/20`}
          onClick={() => onChange(selection.filter((c) => c !== r.country.code), "chip")}
          aria-label={`Remove ${r.country.name}`}
        >
          {r.country.flag} {r.country.name}
          <XMarkIcon className="h-3 w-3" aria-hidden />
        </button>
      ))}
      {origins.length > CHIPS_SHOWN && (
        <button type="button" className={`${ui.badge()} hover:bg-base-300`} onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Show fewer" : `+${origins.length - CHIPS_SHOWN} more`}
        </button>
      )}
      <button type="button" className={`${ui.link} ml-1 text-xs`} onClick={() => onChange(null, "all")}>
        Show all countries
      </button>
    </div>
  );
};
