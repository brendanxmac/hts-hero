"use client";

import { ReactNode } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { CountryField } from "./CountryField";
import { NumberField, Segmented } from "./controls";
import { TRANSPORT_MODES } from "./format";
import { HtsCodeField } from "./HtsCodeField";
import { COLUMN_LABEL, describeHtsRevision } from "./Results";
import { PreferenceSelect } from "./shared";
import { MAX_COMPARE, TariffFinder } from "./useTariffFinder";
import styles from "./theme.module.css";

// Entry details as a compact rail that stays beside the results (Classic and Workbench)

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
        className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--dc-text-3)]"
      >
        {label}
      </label>
      {action}
    </div>
    {children}
    {hint && (
      <p className="text-[11.5px] leading-snug text-[var(--dc-text-3)]">
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
  // A heading above the rail, styled like the results heading beside it
  title?: string;
  description?: ReactNode;
}) => {
  const { result } = f;
  return (
    // The heading and rail stay in view together; the rail scrolls if it's taller than the window
    <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]">
      {title && (
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-[14px] text-[var(--dc-text-2)]">
              {description}
            </p>
          )}
        </div>
      )}
      <aside
        className={`${styles.card} p-4 flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto`}
        aria-label="Entry details"
        // Tighter fields than the other designs
        style={{ borderRadius: 12 }}
      >
        {f.loading ? (
          Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${styles.skeleton} h-12 w-full`} />
          ))
        ) : (
          <div
            className="flex flex-col gap-4 [&_input]:text-[14px]"
            data-density="compact"
          >
            <RailField
              label="HTS code"
              htmlFor="wb-hts"
              action={
                <button
                  type="button"
                  className={`${styles.link} inline-flex items-center gap-1 text-[12px]`}
                  onClick={() => f.openExplore()}
                >
                  <MagnifyingGlassIcon className="w-3 h-3" />
                  Search
                </button>
              }
            >
              <HtsCodeField
                id="wb-hts"
                selectedElement={f.selectedElement}
                onSelect={(el) => f.selectElement(el, "hts_selector")}
                autoFocus={!f.codeParam}
                hidePath
              />
            </RailField>
            <RailField
              label={f.countries.length > 1 ? "Origins" : "Origin"}
              htmlFor="wb-country"
            >
              <CountryField
                id="wb-country"
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
              <RailField label="Value" htmlFor="wb-value">
                <NumberField
                  id="wb-value"
                  prefix="$"
                  suffix={result?.requiresQuantity ? undefined : "USD"}
                  value={f.customsValue}
                  onChange={f.setCustomsValue}
                />
              </RailField>
              {result?.requiresQuantity && (
                <RailField label="Quantity" htmlFor="wb-qty">
                  <NumberField
                    id="wb-qty"
                    suffix={f.unitLabel}
                    value={f.quantity}
                    onChange={f.setQuantity}
                  />
                </RailField>
              )}
            </div>
            <RailField label="Entry date" htmlFor="wb-date">
              <input
                id="wb-date"
                type="date"
                className={`${styles.input} ${styles.num}`}
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
            {result &&
              result.availablePreferences.length > 0 &&
              !f.comparing && (
                <RailField label="Preference" htmlFor="wb-pref">
                  <PreferenceSelect f={f} id="wb-pref" />
                </RailField>
              )}

            {result && (
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
            )}
          </div>
        )}
      </aside>
    </div>
  );
};
