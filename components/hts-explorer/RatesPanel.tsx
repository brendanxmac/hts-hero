"use client";

import { HtsElement } from "@/interfaces/hts";
import { TariffColumn } from "@/enums/tariff";
import { getFootnotesForTariffType, getGeneralNoteFromSpecialTariffSymbol } from "@/libs/hts";
import { normalizeUsitcHtsFileName, openUsitcHtsFileInNewTab } from "@/libs/usitc-hts-file-url";
import { getStringBeforeOpeningParenthesis, getStringBetweenParenthesis } from "@/utilities/hts";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";

// The line's rates from the schedule itself: general, special (with the programs that give it),
// Column 2, units and any additional duties, each with its temporary or special adjustments
export const RatesPanel = ({ element, tariffElement }: { element: HtsElement; tariffElement: HtsElement }) => {
  const specialRate = getStringBeforeOpeningParenthesis(tariffElement.special ?? "");
  const programs = (getStringBetweenParenthesis(tariffElement.special ?? "") || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const inherited = tariffElement.uuid !== element.uuid && tariffElement.htsno;
  const units = tariffElement.units.length ? tariffElement.units : element.units;

  return (
    <section aria-labelledby="explorer-rates" className={`${tt.panel} overflow-hidden`}>
      <div className="border-b border-base-300 px-6 py-4">
        <h4 id="explorer-rates" className={tt.title}>
          Base duty rates
        </h4>
        <p className="mt-0.5 text-xs text-base-content/60">
          {inherited ? (
            <>
              Set at <span className={`${mono.className} font-semibold text-base-content`}>{tariffElement.htsno}</span> in the schedule
            </>
          ) : (
            "From the Harmonized Tariff Schedule"
          )}
        </p>
      </div>
      <dl className="divide-y divide-base-300 text-sm tabular-nums">
        <Rate label="General" value={tariffElement.general} column={TariffColumn.GENERAL} element={tariffElement} strong />
        <Rate
          label="Special"
          value={specialRate || tariffElement.special}
          column={TariffColumn.SPECIAL}
          element={tariffElement}
          tone={programs.length ? "success" : undefined}
          hint={programs.length && specialRate ? "If the goods qualify under one of these programs" : undefined}
        >
          {programs.length > 0 && (
            <dd className="mt-2 flex flex-wrap gap-1">
              {programs.map((symbol, i) => {
                const note = getGeneralNoteFromSpecialTariffSymbol(symbol);
                const file = normalizeUsitcHtsFileName(note?.fileName || "");
                return (
                  <button
                    key={`${symbol}-${i}`}
                    type="button"
                    title={note?.description || note?.title || undefined}
                    disabled={!file}
                    onClick={() => file && openUsitcHtsFileInNewTab(file)}
                    className={`${tt.chip("neutral")} ${mono.className} transition-colors hover:bg-primary/10 hover:text-primary disabled:hover:bg-tt-soft disabled:hover:text-base-content/70`}
                  >
                    {symbol}
                  </button>
                );
              })}
            </dd>
          )}
        </Rate>
        <Rate label="Column 2 (Non-NTR)" value={tariffElement.other} column={TariffColumn.OTHER} element={tariffElement} />
        <Rate label="Units" value={units.join(", ") || null} />
        {element.quotaQuantity && <Rate label="Quota quantity" value={element.quotaQuantity} />}
        {tariffElement.additionalDuties && (
          <Rate label="Additional duties" value={tariffElement.additionalDuties} tone="warning" />
        )}
      </dl>
    </section>
  );
};

const Rate = ({
  label,
  value,
  column,
  element,
  strong = false,
  tone,
  hint,
  children,
}: {
  label: string;
  value: string | null;
  // The column whose footnotes (temporary or special adjustments) to show under the rate
  column?: TariffColumn;
  element?: HtsElement;
  strong?: boolean;
  tone?: "success" | "warning";
  hint?: string;
  children?: React.ReactNode;
}) => {
  // Chapter 99 lines carry sentences in the rate columns
  const long = (value?.length ?? 0) > 22;
  const footnotes = column && element ? getFootnotesForTariffType(element, column) ?? [] : [];
  const color = !value ? "text-base-content/60" : tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-base-content";
  return (
    <div className="px-6 py-3">
      <div className={long ? "" : "flex items-baseline justify-between gap-3"}>
        <dt className="text-base-content/70">{label}</dt>
        <dd className={`font-semibold ${color} ${long ? "mt-1 leading-snug" : "text-right"} ${strong && !long && value ? `${tt.display} text-lg leading-none` : ""}`}>
          {value || "—"}
        </dd>
      </div>
      {hint && <dd className="mt-0.5 text-xs text-base-content/60">{hint}</dd>}
      {children}
      {footnotes.length > 0 && (
        <dd className="mt-2 rounded-xl bg-warning/10 px-3 py-2 text-xs leading-snug text-base-content">
          <span className="font-bold text-warning">Adjustments: </span>
          {footnotes.map((f) => f.value.trim().replace(/\.*$/g, "")).join(", ")}
        </dd>
      )}
    </div>
  );
};
