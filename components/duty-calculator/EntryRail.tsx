"use client";

import { ReactNode } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { CountryField } from "./CountryField";
import { NumberField, Segmented } from "./controls";
import { TRANSPORT_MODES } from "./format";
import { HtsCodeField } from "./HtsCodeField";
import { MAX_COMPARE, TariffFinder } from "./useTariffFinder";
import * as ui from "../ui/styles";

// Entry details as a compact rail beside the results

const RailField = ({
  label,
  htmlFor,
  action,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  action?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-baseline justify-between gap-2">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wider text-base-content/60"
      >
        {label}
      </label>
      {action}
    </div>
    {children}
    {hint && (
      <p className="text-xs leading-snug text-base-content/60">
        {hint}
      </p>
    )}
  </div>
);

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
      className="h-full p-5 flex flex-col gap-4 rounded-lg border border-base-300 bg-base-100 shadow-sm"
      aria-label="Entry details"
    >
      {title && (
        <div>
          <h2 className="text-base font-semibold text-base-content">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs leading-snug text-base-content/60">
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

          {/* {result && (
            <dl className="mt-1 pt-3 border-t border-[var(--dc-border)] grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px]">
              <dt className="text-[var(--dc-text-3)]">Rules</dt>
              <dd className="text-right font-medium">
                HTS {f.revisionForDate?.title ?? "—"}
                <span
                  className={
                    f.verified
                      ? "text-[var(--dc-positive)]"
                      : "text-[var(--dc-warning)]"
                  }
                >
                  {f.verified ? " ✓" : " ⚠"}
                </span>
              </dd>
              <dt className="text-[var(--dc-text-3)]">Base rates</dt>
              <dd className="text-right font-medium">
                HTS {describeHtsRevision(f.htsRevisionName)}
              </dd>
              <dt className="text-[var(--dc-text-3)]">Column</dt>
              <dd className="text-right font-medium">
                {COLUMN_LABEL[result.column]}
                {result.claimedPreference
                  ? ` (${result.claimedPreference})`
                  : ""}
              </dd>
            </dl>
          )} */}
        </div>
      )}
    </aside>
  );
};
