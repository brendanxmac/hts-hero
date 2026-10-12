"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { Country } from "@/constants/countries";
import { CountryField } from "../fields/CountryField";
import { HtsCodeField } from "../fields/HtsCodeField";
import { NumberField } from "../fields/NumberField";
import { Segmented } from "../fields/Segmented";
import { TRANSPORT_MODES } from "../lib/format";
import { TariffFinder } from "../lib/useTariffFinder";
import { RailField } from "./RailField";

// Entry details across the top of the results (the Tariff Tracker's calculator): the title and
// subtitle, then every field on one row on wide screens. One country of origin; others are
// added to compare in the Compare tab, and stay there when the origin changes.
export const EntryBar = ({ f, title, description }: { f: TariffFinder; title: string; description: string }) => {
  const { result } = f;
  const setOrigin = (picked: Country[]) => {
    const origin = picked[0];
    f.changeCountries(origin ? [origin, ...f.countries.slice(1).filter((c) => c.code !== origin.code)] : []);
  };
  return (
    <section className={`${ui.cardOverflowVisible} flex flex-col gap-3 px-5 pb-5 pt-4`} aria-label="Entry details">
      {/* Title and subtitle on one line, to keep the box short */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h2 className={ui.cardTitle}>{title}</h2>
        <p className={`${ui.caption} leading-snug`}>{description}</p>
      </div>
      {f.loading ? (
        <div className={`${ui.skeleton} h-14 w-full`} />
      ) : (
        <div
          className={`grid grid-cols-1 items-end gap-4 sm:grid-cols-2 [&_input]:text-sm ${
            result?.requiresQuantity
              ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(14rem,1.6fr)]"
              : "lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(14rem,1.6fr)]"
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
          <RailField label="Value" htmlFor="dc-value">
            <NumberField id="dc-value" prefix="$" suffix="USD" value={f.customsValue} onChange={f.setCustomsValue} />
          </RailField>
          {result?.requiresQuantity && (
            <RailField label="Quantity" htmlFor="dc-qty">
              <NumberField id="dc-qty" suffix={f.unitLabel} value={f.quantity} onChange={f.setQuantity} />
            </RailField>
          )}
          <RailField label="Entry date" htmlFor="dc-date">
            <input id="dc-date" type="date" className={`${ui.input} tabular-nums`} value={f.entryDate} onChange={(e) => f.setEntryDate(e.target.value)} />
          </RailField>
          <RailField label="Transport">
            <Segmented label="Mode of transport" options={TRANSPORT_MODES} value={f.transportMode} onChange={f.setTransportMode} compact />
          </RailField>
        </div>
      )}
    </section>
  );
};
