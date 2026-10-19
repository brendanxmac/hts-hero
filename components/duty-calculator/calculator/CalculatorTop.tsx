"use client";

import { ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useHts } from "@/contexts/HtsContext";
import { describe } from "@/components/tariff-tracker/report";
import { mono } from "@/components/ui/font";
import { CardSections } from "@/components/ui/Card";
import * as ui from "@/components/ui/styles";
import { Country } from "@/constants/countries";
import { CountryField } from "../fields/CountryField";
import { HtsCodeField } from "../fields/HtsCodeField";
import { NumberField } from "../fields/NumberField";
import { TransportField } from "../fields/TransportField";
import { formatDate, todayIso } from "../lib/format";
import { TariffFinder } from "../lib/useTariffFinder";
import { RailField } from "./RailField";

// The calculator, the same on every page: two boxes. Entry details (the fields: the only place the
// import's details change, the entry date included, with arrows that step to the dates its rates
// changed; in an import's own page the HTS code and origin are fixed) and, once there's an answer,
// the results (ResultsBox: what's being looked at, the tabs and the actions, then everything the
// open tab shows).

// The dates this import's rates changed (from its history), for the date's arrows
const changeDates = (f: TariffFinder) =>
  Array.from(new Set(f.history.filter((s, i) => i > 0 && s.changes.length > 0).map((s) => s.from))).sort();

const DateField = ({ f }: { f: TariffFinder }) => {
  const dates = changeDates(f);
  const today = todayIso();
  const earlier = [...dates].reverse().find((d) => d < f.entryDate);
  // The next change after the date, or today once there's none left
  const later = dates.find((d) => d > f.entryDate) ?? (f.entryDate < today ? today : undefined);
  const step = (to: string | undefined) => to && f.setEntryDate(to);
  const arrow = "flex h-10 w-8 shrink-0 items-center justify-center text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content disabled:pointer-events-none disabled:opacity-30";
  return (
    <div className={`${ui.input} flex items-stretch overflow-hidden px-0!`}>
      <button
        type="button"
        className={`${arrow} border-r border-base-300`}
        disabled={!earlier}
        onClick={() => step(earlier)}
        aria-label={earlier ? `The rates before ${formatDate(earlier)}'s change` : "No earlier change"}
        title={earlier ? `Jump to ${formatDate(earlier)}, when rates changed` : "No earlier change"}
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden />
      </button>
      <input
        id="dc-date"
        type="date"
        className="min-w-0 flex-1 bg-transparent px-2 text-sm tabular-nums outline-hidden"
        value={f.entryDate}
        onChange={(e) => f.setEntryDate(e.target.value)}
      />
      <button
        type="button"
        className={`${arrow} border-l border-base-300`}
        disabled={!later}
        onClick={() => step(later)}
        aria-label={later ? (later === today ? "Today's rates" : `Jump to ${formatDate(later)}, when rates changed`) : "No later change"}
        title={later ? (later === today ? "Back to today" : `Jump to ${formatDate(later)}, when rates changed`) : "No later change"}
      >
        <ChevronRightIcon className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
};

// The fields that can change on any import: its value (and quantity, when its duty is per unit),
// the entry date and the mode of transport. In Entry details on the calculator; on an import's own
// page, in its header (DESIGN_SYSTEM §15), where the code and origin are the import itself.
export const EntryInputs = ({ f }: { f: TariffFinder }) => (
  <>
    <RailField label="Value" htmlFor="dc-value">
      <NumberField id="dc-value" prefix="$" suffix="USD" value={f.customsValue} onChange={f.setCustomsValue} />
    </RailField>
    {f.result?.requiresQuantity && (
      <RailField label="Quantity" htmlFor="dc-qty">
        <NumberField id="dc-qty" suffix={f.unitLabel} value={f.quantity} onChange={f.setQuantity} />
      </RailField>
    )}
    <RailField label="Entry date" htmlFor="dc-date">
      <DateField f={f} />
    </RailField>
    <RailField label="Mode of transport" htmlFor="dc-transport">
      <TransportField id="dc-transport" value={f.transportMode} onChange={f.setTransportMode} />
    </RailField>
  </>
);

// The fields of an import's page header, in one compact row
export const ImportInputs = ({ f }: { f: TariffFinder }) => (
  <div
    className={`grid grid-cols-2 items-end gap-3 [&_input]:text-sm ${f.result?.requiresQuantity ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)]"}`}
    data-density="compact"
  >
    <EntryInputs f={f} />
  </div>
);

export const EntryDetails = ({ f, description }: { f: TariffFinder; description: string }) => {
  const { result } = f;
  const setOrigin = (picked: Country[]) => {
    const origin = picked[0];
    f.changeCountries(origin ? [origin, ...f.countries.slice(1).filter((c) => c.code !== origin.code)] : []);
  };
  return (
    <section className={`${ui.cardOverflowVisible} flex flex-col gap-3 px-5 pb-5 pt-4 sm:px-6`} aria-label="Entry details">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h2 className={ui.cardTitle}>Entry details</h2>
        <p className={`${ui.caption} leading-snug`}>{description}</p>
      </div>
      {f.loading ? (
        <div className={`${ui.skeleton} h-14 w-full`} />
      ) : (
        <div
          className={`grid grid-cols-1 items-end gap-4 sm:grid-cols-2 [&_input]:text-sm ${
            result?.requiresQuantity
              ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1.1fr)]"
              : "lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1.1fr)]"
          }`}
          data-density="compact"
        >
          <RailField
            label="HTS code"
            htmlFor="dc-hts"
            action={
              <button type="button" className={`${ui.link} inline-flex items-center gap-1 text-xs`} onClick={() => f.openExplore()}>
                <MagnifyingGlassIcon className="h-3 w-3" />
                Search
              </button>
            }
          >
            <HtsCodeField id="dc-hts" selectedElement={f.selectedElement} onSelect={(el) => f.selectElement(el, "hts_selector")} autoFocus={!f.codeParam} hidePath />
          </RailField>
          <RailField label="Origin" htmlFor="dc-country">
            <CountryField id="dc-country" selected={f.countries.slice(0, 1)} onChange={setOrigin} max={1} />
          </RailField>
          <EntryInputs f={f} />
        </div>
      )}
    </section>
  );
};

// The results' box: what the answer is about (the code, its description in words and the origin,
// the same on every tab) on the left, the tabs and the actions on the right, and under a
// rule everything the open tab shows, as sections of the one box divided by hairlines (not boxes
// inside the box). Only once there's an answer.
export const ResultsBox = ({
  f,
  actions,
  tabs,
  headless = false,
  children,
}: {
  f: TariffFinder;
  actions?: ReactNode;
  tabs?: ReactNode;
  // No title, actions or tabs of its own: on an import's page, whose header already says what it
  // is and holds the tabs, it's just the answer
  headless?: boolean;
  children: ReactNode;
}) => {
  const { selectedElement, country } = f;
  const { htsElements } = useHts();
  // What it is in words: the nearest two levels that say so ("Of pumps › Of subheading 8413.30")
  const words = selectedElement ? describe(selectedElement, htsElements) : "";
  if (!selectedElement || !country) return null;
  return (
    // The arrow over plain text (still selectable), so the pointer doesn't flick to a text cursor
    // over every short line of figures; fields keep their text cursor, links and buttons their hand
    <section
      id="duty-results"
      className={`${ui.cardOverflowVisible} flex scroll-mt-4 cursor-default flex-col overflow-clip [&_input:not([type=checkbox]):not([type=radio])]:cursor-text [&_textarea]:cursor-text`}
      aria-labelledby={headless ? undefined : "results-heading"}
      aria-label={headless ? "Results" : undefined}
      aria-live="polite"
    >
      {!headless && (
      <div className="flex flex-col border-b border-base-300 px-5 sm:px-6">
        <div className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-4 ${tabs ? "pb-1" : "pb-4"}`}>
          <div className="min-w-0 flex-1">
            <h2 id="results-heading" className="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xl font-semibold tracking-tight text-base-content sm:text-2xl">
              <span className={mono.className}>{selectedElement.htsno}</span>
              <span className="text-base-content/30" aria-hidden>
                ·
              </span>
              <span>
                {country.flag} {country.name}
              </span>
            </h2>
            <p className="m-0 mt-1 line-clamp-1 text-sm text-base-content/60" title={words}>
              {words}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        </div>
        {/* The tabs, along the header's bottom edge */}
        {tabs && <div className="mt-2">{tabs}</div>}
      </div>
      )}
      {/* Every section of the open tab: panels that are cards elsewhere are its sections here. The
          box clips to its corners (overflow: clip, which keeps sticky panels working), so a first
          section with a fill, with no header above it, never paints square corners */}
      <CardSections>{children}</CardSections>
    </section>
  );
};
