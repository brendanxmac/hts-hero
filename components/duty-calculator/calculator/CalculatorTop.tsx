"use client";

import { ReactNode } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useHts } from "@/contexts/HtsContext";
import { describePath } from "@/components/tariff-tracker/report";
import { mono } from "@/components/ui/font";
import { ModuleSections } from "@/components/ui/Card";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { Country } from "@/constants/countries";
import { CountryField } from "../fields/CountryField";
import { HtsCodeField } from "../fields/HtsCodeField";
import { NumberField } from "../fields/NumberField";
import { TransportField } from "../fields/TransportField";
import { TariffFinder } from "../lib/useTariffFinder";
import { EntryDatePicker } from "./EntryDatePicker";
import { RailField } from "./RailField";

// The calculator, the same on every page, in two groups a page tier apart. The inputs: Entry details
// (the fields: the only place the import's details change, the entry date included, picked from
// today or the dates its rates changed). Then, once there's an answer, the results: a heading
// card (what's being looked at, its actions and the tabs, ResultsHeading) with everything the open
// tab shows as modules close under it (ResultsBox). On an import's own page, its header holds the
// fields that can change and the tabs, with the HTS code and origin fixed.

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
      <EntryDatePicker f={f} id="dc-date" />
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

// pageTitle: in the Tracker, this card is the Calculator page's header, so it carries the page's
// title and line in place of "Entry details"
export const EntryDetails = ({ f, description, pageTitle }: { f: TariffFinder; description: string; pageTitle?: { title: string; summary: string } }) => {
  const { result } = f;
  const setOrigin = (picked: Country[]) => {
    const origin = picked[0];
    f.changeCountries(origin ? [origin, ...f.countries.slice(1).filter((c) => c.code !== origin.code)] : []);
  };
  return (
    <section className={`${ui.cardOverflowVisible} flex flex-col ${pageTitle ? "gap-4 pt-5" : "gap-3 pt-4"} px-5 pb-5 sm:px-6`} aria-label="Entry details">
      {pageTitle ? (
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className={tt.pageTitle}>{pageTitle.title}</h1>
          <p className={`${tt.subtitle} m-0`}>{pageTitle.summary}</p>
        </div>
      ) : (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <h2 className={ui.cardTitle}>Entry details</h2>
          <p className={`${ui.caption} leading-snug`}>{description}</p>
        </div>
      )}
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

// What the answer is about (the code, its description in words and the origin, the same on every
// tab), its actions, and the tabs as pills under them: the results' first card
export const ResultsHeading = ({ f, actions, tabs }: { f: TariffFinder; actions?: ReactNode; tabs?: ReactNode }) => {
  const { selectedElement, country } = f;
  const { htsElements } = useHts();
  // What it is in words: every level from the heading down, the heading and the code's own line
  // bold, so an "Other (339)" reads in context
  const path = selectedElement ? describePath(selectedElement, htsElements) : [];
  if (!selectedElement || !country) return null;
  return (
    <div className={`${ui.cardOverflowVisible} flex flex-col px-5 sm:px-6`}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-4 pt-4">
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
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>
      {/* The full width under the code and actions, so the actions never squeeze it */}
      <PathTrail path={path} />
      {tabs && <div className="-mt-1 pb-4">{tabs}</div>}
    </div>
  );
};

// Past these, the trail gives way so the line that's the code itself still shows within its two
// lines: the heading is cut at a word, then the levels between collapse to "…" (the last of them
// stays). The whole path is in the tooltip, and View in HTS
const HEADING_MAX = 100;
const TRAIL_MAX = 190;

const shorten = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, text.lastIndexOf(" ", max)).replace(/[\s,;:]+$/, "")}…`;

// "Heading › level › level › the code's line": the heading and the code's line bold, the levels
// between them quiet, at most two lines
const fitTrail = (path: string[]) => {
  if (path.length < 2) return path;
  const [heading, ...rest] = path;
  const leaf = rest.pop() as string;
  const fits = (l: string[]) => l.join(" › ").length <= TRAIL_MAX;
  const head = shorten(heading, HEADING_MAX);
  // Drop the levels just under the heading, one more at a time, behind an "…"
  for (let dropped = 0; dropped < rest.length; dropped++) {
    const levels = [head, ...(dropped ? ["…"] : []), ...rest.slice(dropped), leaf];
    if (fits(levels)) return levels;
  }
  return [head, ...(rest.length > 1 ? ["…"] : []), ...rest.slice(-1), leaf];
};

const PathTrail = ({ path }: { path: string[] }) => {
  const levels = fitTrail(path);
  return (
    <p className="m-0 -mt-2 mb-4 line-clamp-2 text-sm leading-relaxed text-base-content/55" title={path.join(" › ")}>
      {levels.map((level, i) => {
        const last = i === levels.length - 1;
        return (
          <span key={i}>
            {i > 0 && (
              <span className="mx-1.5 text-base-content/30" aria-hidden>
                ›
              </span>
            )}
            <span className={i === 0 || last ? "font-semibold text-base-content/90" : undefined}>{level}</span>
          </span>
        );
      })}
    </p>
  );
};

// The results, one group: their heading card (ResultsHeading; none on an import's page, whose
// header holds the tabs), then everything the open tab shows as module cards close under it
// (ModuleSections). Only once there's an answer.
export const ResultsBox = ({ view, heading, children }: { view?: string; heading?: ReactNode; children: ReactNode }) => (
  // The arrow over plain text (still selectable), so the pointer doesn't flick to a text cursor
  // over every short line of figures; fields keep their text cursor, links and buttons their hand
  <section
    id="duty-results"
    className="flex scroll-mt-4 cursor-default flex-col gap-module [&_input:not([type=checkbox]):not([type=radio])]:cursor-text [&_textarea]:cursor-text"
    aria-label="Results"
    aria-live="polite"
  >
    {heading}
    {/* Every module of the open tab, each a card on the ground (ModuleSections); switching tabs
        brings them in with the enter motion */}
    <ModuleSections key={view} className="tt-enter">
      {children}
    </ModuleSections>
  </section>
);
