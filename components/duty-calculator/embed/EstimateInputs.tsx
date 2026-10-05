"use client";

import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { Country } from "@/constants/countries";
import { TransportMode } from "@/tariffs/engine-v2/types";
import * as ui from "@/components/ui/styles";
import { CountryField } from "../fields/CountryField";
import { Field } from "../fields/Field";
import { NumberField } from "../fields/NumberField";
import { TRANSPORT_MODES } from "../lib/format";
import { DutyEstimate } from "./useDutyEstimate";

// The embed's inputs in one row: origin and value, plus entry date and transport in the full
// variant, and quantity when the base rate is charged per unit
export const EstimateInputs = ({
  estimate,
  ids,
  simple,
  countryOfOrigin,
}: {
  estimate: DutyEstimate;
  // Prefix for the inputs' ids
  ids: string;
  simple: boolean;
  countryOfOrigin: Country | null;
}) => {
  const { country, result } = estimate;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
      <Field
        label="Country of origin"
        htmlFor={`${ids}-country`}
        className={simple ? "lg:col-span-7" : "lg:col-span-4"}
        action={
          countryOfOrigin && country?.code !== countryOfOrigin.code ? (
            <button
              type="button"
              className={`${ui.link} inline-flex items-center gap-1 text-sm`}
              onClick={() => estimate.setCountry(countryOfOrigin)}
            >
              <ArrowPathIcon className="w-3.5 h-3.5" />
              Back to {countryOfOrigin.name}
            </button>
          ) : undefined
        }
      >
        <CountryField
          id={`${ids}-country`}
          selected={country ? [country] : []}
          max={1}
          onChange={(next) => estimate.setCountry(next[next.length - 1] ?? null)}
        />
      </Field>
      <Field
        label="Customs value"
        htmlFor={`${ids}-value`}
        className={simple ? "lg:col-span-5" : "lg:col-span-3"}
      >
        <NumberField
          id={`${ids}-value`}
          prefix="$"
          suffix="USD"
          value={estimate.customsValue}
          onChange={estimate.setCustomsValue}
        />
      </Field>
      {!simple && (
        <Field
          label="Entry date"
          htmlFor={`${ids}-date`}
          className="lg:col-span-3"
        >
          <input
            id={`${ids}-date`}
            type="date"
            className={`${ui.input} tabular-nums`}
            value={estimate.entryDate}
            onChange={(e) => estimate.setEntryDate(e.target.value)}
          />
        </Field>
      )}
      {!simple && (
        <Field
          label="Transport"
          htmlFor={`${ids}-mode`}
          className="lg:col-span-2"
        >
          <select
            id={`${ids}-mode`}
            className={ui.select}
            value={estimate.transportMode}
            onChange={(e) =>
              estimate.setTransportMode(e.target.value as TransportMode)
            }
          >
            {TRANSPORT_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
      )}
      {result?.requiresQuantity && (
        <Field
          label="Quantity"
          htmlFor={`${ids}-quantity`}
          className="lg:col-span-4"
          hint={`The base rate (${result.base.reasons[0]}) is charged per unit`}
        >
          <NumberField
            id={`${ids}-quantity`}
            suffix={estimate.unitLabel}
            value={estimate.quantity}
            onChange={estimate.setQuantity}
          />
        </Field>
      )}
    </div>
  );
};
