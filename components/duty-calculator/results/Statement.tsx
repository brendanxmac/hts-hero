"use client";

// The detailed duty statement: base duty and each Chapter 99 line, fees, and the totals.
// A table on wider screens, stacked lines on phones.
import * as ui from "@/components/ui/styles";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { formatMoney } from "../lib/format";
import { legalText, tariffStartDate } from "./headings";
import { COLUMN_LABEL, programName } from "./labels";
import { MobileRow } from "./MobileRow";
import { MobileTotal } from "./MobileTotal";
import { BASE_SLICE, FEES_SLICE, sliceForProgram } from "./slices";
import { whyApplies } from "../lib/explain";
import { LineChanges } from "../lib/useLineChanges";
import { RowLink, RowProps } from "./rowTypes";
import { StatementRow } from "./StatementRow";
import { TotalRow } from "./TotalRow";

export const Statement = ({
  result,
  customsValue,
  unitLabel,
  sliceColors,
  highlight,
  onHighlight,
  compact,
  changes,
  lockWhy = false,
}: {
  result: CalculationResult;
  customsValue: number;
  unitLabel: string;
  // Chart colors by slice, to tie each line to "Where the money goes"
  sliceColors?: Record<string, string>;
  // The slice being hovered, here or in the chart
  highlight?: string | null;
  onHighlight?: (slice: string | null) => void;
  // One tight line per row: no program, effective date, reasons or legal text
  compact?: boolean;
  // What the last answer or trade program changed, to mark in the rows
  changes?: LineChanges | null;
  // The plain-English why for each line takes a free account: signed out, it's locked
  lockWhy?: boolean;
}) => {
  // Per-unit and compound base rates are shown as written in the HTS
  // Rates with several parts, per-unit amounts, or parts that apply to a component
  // (the case, lead content) are shown one part per line, each against its own basis
  const itemized =
    result.baseParts.length > 1 ||
    result.baseParts.some((p) => p.kind === "amount" || p.component);
  const partBasis = (p: CalculationResult["baseParts"][number]) =>
    (p.kind === "percent"
      ? formatMoney(p.basis)
      : `${p.basis.toLocaleString("en-US")} ${p.unit === "each" ? unitLabel : p.unit}`) +
    (p.assumed ? " (assumed)" : "");
  const applied = result.lines.filter((l) => l.status === "applies");
  const dutyAndFees = result.totalDuty + result.totalFees;
  const rows: RowProps[] = [
    {
      code: "Base",
      slice: BASE_SLICE,
      name: `Base duty · ${COLUMN_LABEL[result.column]}`,
      // Notes about parts that use the whole value until a component's value is entered
      detail: result.base.reasons.slice(1).join(" · ") || undefined,
      basis: result.base.basisValue,
      basisText: itemized
        ? result.baseParts.map(partBasis).join(" · ")
        : undefined,
      rate: result.base.ratePct,
      rateText: itemized
        ? result.baseParts.map((p) => p.raw).join(" + ")
        : undefined,
      amount: result.base.amount,
    },
    ...applied.map((line) => ({
      code: line.code,
      slice: sliceForProgram(line.program),
      name: line.name,
      program: programName(line.program),
      effectiveFrom: tariffStartDate(line.code, result.asOf),
      // Why it applies, in plain English (the engine's own reasons are mostly empty)
      detail: lockWhy ? undefined : whyApplies(line, result, result.questions).join(" · "),
      whyLocked: lockWhy,
      legal: legalText(line.code, result),
      basis: line.basisValue,
      rate: line.ratePct,
      amount: line.amount,
    })),
  ];
  if (changes) {
    rows.forEach((row) => (row.change = changes.byCode[row.code]));
    // Lines the change switched off stay in view, struck through
    changes.removed.forEach((line) =>
      rows.push({
        code: line.code,
        slice: sliceForProgram(line.program),
        name: line.name,
        program: programName(line.program),
        basis: line.basisValue,
        rate: line.ratePct,
        amount: 0,
        change: { kind: "removed", before: line.amount },
      })
    );
  }
  const feeRows: RowProps[] = result.fees.map((fee) => ({
    code: fee.id.toUpperCase(),
    slice: FEES_SLICE,
    name: fee.name,
    detail: fee.note,
    basis: customsValue,
    rate: fee.ratePct,
    amount: fee.amount,
  }));

  // Every line charged on the customs value: the "Applies to" column would repeat it on every
  // row, so it's left out (the host says it once)
  const hideBasis = sameBasis(result, customsValue);

  // Only lines with a slice in the chart get a color and respond to hover
  const linked = (row: RowProps): RowLink => {
    const color = row.slice ? sliceColors?.[row.slice] : undefined;
    return {
      color,
      // Only the hovered line changes; the others stay as they are
      active: Boolean(color && highlight && highlight === row.slice),
      onHover:
        color && onHighlight
          ? (on: boolean) => onHighlight(on ? (row.slice ?? null) : null)
          : undefined,
    };
  };

  return (
    <>
      {/* Phones: stacked lines */}
      <ul className="sm:hidden">
        {rows.map((row) => (
          <MobileRow
            key={row.code}
            {...row}
            link={linked(row)}
            compact={compact}
          />
        ))}
        <MobileTotal label="Total duty" amount={result.totalDuty} />
        {feeRows.map((row) => (
          <MobileRow
            key={row.code}
            {...row}
            link={linked(row)}
            compact={compact}
          />
        ))}
        <MobileTotal label="Total duty and fees" amount={dutyAndFees} strong />
      </ul>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Duty statement</caption>
          <thead>
            <tr className="bg-base-200 text-base-content/60">
              <th scope="col" className={`${ui.label} py-3 pl-5 sm:pl-6 pr-3`}>
                Line
              </th>
              {!hideBasis && (
                <th scope="col" className={`${ui.label} py-3 px-3`}>
                  Applies to
                </th>
              )}
              <th scope="col" className={`${ui.label} py-3 px-3 text-right`}>
                Rate
              </th>
              <th
                scope="col"
                className={`${ui.label} py-3 pl-3 pr-5 sm:pr-6 text-right`}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <StatementRow
                key={row.code}
                {...row}
                link={linked(row)}
                compact={compact}
                hideBasis={hideBasis}
              />
            ))}
            <TotalRow label="Total duty" amount={result.totalDuty} before={changes?.totalDutyBefore} hideBasis={hideBasis} />
            {feeRows.map((row) => (
              <StatementRow
                key={row.code}
                {...row}
                link={linked(row)}
                compact={compact}
                hideBasis={hideBasis}
              />
            ))}
            <TotalRow label="Total duty and fees" amount={dutyAndFees} strong before={changes ? changes.totalDutyBefore + result.totalFees : undefined} hideBasis={hideBasis} />
          </tbody>
        </table>
      </div>
    </>
  );
};

// Whether every duty line is charged on the whole customs value (no per-unit or component parts)
export const sameBasis = (result: CalculationResult, customsValue: number) =>
  result.baseParts.length <= 1 &&
  !result.baseParts.some((p) => p.kind === "amount" || p.component) &&
  [result.base, ...result.lines.filter((l) => l.status === "applies")].every((l) => Math.abs(l.basisValue - customsValue) < 0.005);
