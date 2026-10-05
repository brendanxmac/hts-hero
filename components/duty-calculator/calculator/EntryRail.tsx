"use client";

import { ReactNode } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { CountryField } from "../fields/CountryField";
import { HtsCodeField } from "../fields/HtsCodeField";
import { NumberField } from "../fields/NumberField";
import { Segmented } from "../fields/Segmented";
import { TRANSPORT_MODES } from "../lib/format";
import { MAX_COMPARE, TariffFinder } from "../lib/useTariffFinder";
import { RailField } from "./RailField";

// Entry details as a compact rail beside the results

export const EntryRail = ({
  f,
  title,
  description,
}: {
  f: TariffFinder;
  // A heading at the top of the rail, styled like the other panels' titles
  title?: string;
  description?: ReactNode;
}) => {
  const { result } = f;
  return (
    <aside
      className={`${ui.cardOverflowVisible} h-full p-5 flex flex-col gap-4`}
      aria-label="Entry details"
    >
      {title && (
        <div>
          <h2 className={ui.cardTitle}>{title}</h2>
          {description && (
            <p className={`${ui.caption} mt-0.5 leading-snug`}>
              {description}
            </p>
          )}
        </div>
      )}
      {f.loading ? (
        Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`${ui.skeleton} h-12 w-full`} />
        ))
      ) : (
        <div
          className="flex flex-col gap-4 [&_input]:text-sm"
          data-density="compact"
        >
          <RailField
            label="HTS code"
            htmlFor="dc-hts"
            action={
              <button
                type="button"
                className={`${ui.link} inline-flex items-center gap-1 text-xs`}
                onClick={() => f.openExplore()}
              >
                <MagnifyingGlassIcon className="w-3 h-3" />
                Search
              </button>
            }
          >
            <HtsCodeField
              id="dc-hts"
              selectedElement={f.selectedElement}
              onSelect={(el) => f.selectElement(el, "hts_selector")}
              autoFocus={!f.codeParam}
              hidePath
            />
          </RailField>
          <RailField
            label={f.countries.length > 1 ? "Origins" : "Origin"}
            htmlFor="dc-country"
          >
            <CountryField
              id="dc-country"
              selected={f.countries}
              onChange={f.changeCountries}
              max={MAX_COMPARE}
            />
          </RailField>
          <div
            className={
              result?.requiresQuantity ? "grid grid-cols-2 gap-3" : ""
            }
          >
            <RailField label="Value" htmlFor="dc-value">
              <NumberField
                id="dc-value"
                prefix="$"
                suffix={result?.requiresQuantity ? undefined : "USD"}
                value={f.customsValue}
                onChange={f.setCustomsValue}
              />
            </RailField>
            {result?.requiresQuantity && (
              <RailField label="Quantity" htmlFor="dc-qty">
                <NumberField
                  id="dc-qty"
                  suffix={f.unitLabel}
                  value={f.quantity}
                  onChange={f.setQuantity}
                />
              </RailField>
            )}
          </div>
          <RailField label="Entry date" htmlFor="dc-date">
            <input
              id="dc-date"
              type="date"
              className={`${ui.input} tabular-nums`}
              value={f.entryDate}
              onChange={(e) => f.setEntryDate(e.target.value)}
            />
          </RailField>
          <RailField label="Transport">
            <Segmented
              label="Mode of transport"
              options={TRANSPORT_MODES}
              value={f.transportMode}
              onChange={f.setTransportMode}
              compact
            />
          </RailField>
        </div>
      )}
    </aside>
  );
};
