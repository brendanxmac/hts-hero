"use client";

import { ReactNode } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { CountryField } from "../fields/CountryField";
import { HtsCodeField } from "../fields/HtsCodeField";
import { NumberField } from "../fields/NumberField";
import { TRANSPORT_MODES } from "../lib/format";
import { TariffFinder } from "../lib/useTariffFinder";

// Every input on one bar, like a flight search: each one a labelled segment, split by thin
// rules. Below 1280px wide it becomes a tidy grid of soft cells (the code across the top). The
// HTS code leads, tinted, since nothing works without it.

const Segment = ({
  label,
  htmlFor,
  grow,
  lead = false,
  last = false,
  action,
  children,
}: {
  label: string;
  htmlFor?: string;
  // Flex grow and basis, e.g. "2.4 1 15rem"
  grow: string;
  lead?: boolean;
  last?: boolean;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <div
    // Runtime layout weight on wide screens (DESIGN_SYSTEM §10); a grid cell below that
    style={{ ["--grow" as string]: grow }}
    className={`relative flex min-w-0 flex-col gap-0 rounded-xl px-4 py-2 xl:min-w-32 xl:flex-[var(--grow)] xl:rounded-none ${
      lead ? "col-span-2 bg-primary/5 md:col-span-3 xl:col-span-1 xl:rounded-l-xl" : "bg-tt-soft xl:bg-transparent"
    } ${last ? "" : "xl:border-r xl:border-base-300"}`}
  >
    <span className="flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className={`text-xs font-bold ${lead ? "text-primary" : "text-base-content/60"}`}>
        {label}
      </label>
      {action}
    </span>
    {children}
  </div>
);

export const InputBar = ({ f }: { f: TariffFinder }) => (
  <section
    aria-label="Your import"
    className="grid grid-cols-2 gap-1.5 rounded-2xl border border-base-300 bg-base-100 p-1.5 shadow-xl shadow-primary/10 ring-1 ring-primary/10 md:grid-cols-3 xl:flex xl:items-stretch xl:gap-0"
  >
    <Segment
      label="HTS Code"
      htmlFor="dc-hts"
      grow="2.4 1 16rem"
      lead
      action={
        <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline" onClick={() => f.openExplore()}>
          <MagnifyingGlassIcon className="h-3 w-3" aria-hidden />
          Browse
        </button>
      }
    >
      <HtsCodeField id="dc-hts" selectedElement={f.selectedElement} onSelect={(el) => f.selectElement(el, "hts_selector")} autoFocus={!f.codeParam} hidePath bare />
    </Segment>
    <Segment label="Country of Origin" htmlFor="dc-country" grow="1.4 1 11rem">
      <CountryField id="dc-country" selected={f.countries.slice(0, 1)} onChange={(next) => f.changeCountries(next.slice(0, 1))} max={1} bare />
    </Segment>
    <Segment label="Value" htmlFor="dc-value" grow="1 1 8rem">
      <NumberField id="dc-value" prefix="$" value={f.customsValue} onChange={f.setCustomsValue} bare />
    </Segment>
    <Segment label="Quantity" htmlFor="dc-qty" grow="1 1 8rem">
      <NumberField id="dc-qty" suffix={f.unitLabel} value={f.quantity} onChange={f.setQuantity} bare />
    </Segment>
    <Segment label="Date of Entry" htmlFor="dc-date" grow="1.1 1 9rem">
      <input
        id="dc-date"
        type="date"
        className="h-7 w-full bg-transparent font-semibold tabular-nums text-base-content outline-none"
        value={f.entryDate}
        onChange={(e) => f.setEntryDate(e.target.value)}
      />
    </Segment>
    <Segment label="Transport" htmlFor="dc-mode" grow="0.9 1 7rem" last>
      <select
        id="dc-mode"
        className="h-7 w-full cursor-pointer bg-transparent font-semibold text-base-content outline-none"
        value={f.transportMode}
        onChange={(e) => f.setTransportMode(e.target.value as TariffFinder["transportMode"])}
      >
        {TRANSPORT_MODES.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
    </Segment>
  </section>
);
