"use client";

import { useState } from "react";
import { mono } from "@/components/ui/font";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as tt from "@/components/ui/styles/tracker";
import { MUTED_MARK } from "@/components/ui/theme";
import { CalculationResult, DutyLine, Question } from "@/tariffs/engine-v2/types";
import { formatDate, formatMoney, formatPct } from "../lib/format";
import { legalText, tariffStartDate } from "../results/headings";
import { COLUMN_LABEL, programName } from "../results/labels";
import { LegalPanel } from "../results/LegalPanel";
import { BASE_SLICE, slices, sliceForProgram } from "../results/slices";
import { whyApplies } from "../lib/explain";
import { plainReasons } from "../lib/plainReason";

// How the total adds up, on Results. Summary: one row per charge (what it is, where it comes
// from in the law, its rate and amount). Detailed: each row also says why it applies, since when,
// what it's charged on, what it switches off, and its legal text; then every other heading that
// was checked and why it doesn't apply.

type View = "summary" | "detailed";

interface Row {
  key: string;
  name: string;
  // Where the charge comes from: the HTS line, a Chapter 99 heading, or a CBP fee
  reference: string;
  referenceNote?: string;
  rate: string;
  amount: number;
  color: string;
  program?: string;
  since?: string;
  basis?: number;
  reasons: string[];
  switchesOff: DutyLine[];
  legal?: ReturnType<typeof legalText>;
}

const pct = (n?: number) => (n === undefined ? "—" : formatPct(Math.round(n * 100) / 100));

const rowsOf = (result: CalculationResult, customsValue: number, questions: Question[], preferenceName?: string): Row[] => {
  const colors = Object.fromEntries(slices(result).map((s) => [s.label, s.color]));
  const off = result.lines.filter((l) => l.status !== "applies");
  return [
    {
      key: "base",
      name: "Base duty",
      reference: result.htsCode,
      referenceNote: `HTS · ${COLUMN_LABEL[result.column]}${result.claimedPreference ? ` (${result.claimedPreference})` : ""}`,
      rate: pct(result.base.ratePct ?? result.baseRateEquivalentPct),
      amount: result.base.amount,
      color: colors[BASE_SLICE],
      basis: result.base.basisValue,
      // With a trade program claimed, the first reason says so
      // The first base reason is the rate as the HTS writes it
      reasons: [
        ...(preferenceName ? [`${preferenceName} claimed`] : []),
        ...result.base.reasons.map((r, i) => (i === 0 ? `Rate as written in the HTS: ${r}` : r)),
      ],
      switchesOff: [],
    },
    ...result.lines
      .filter((l) => l.status === "applies")
      .map((l) => ({
        key: l.code,
        name: l.name,
        reference: l.code,
        referenceNote: "Chapter 99",
        rate: pct(l.ratePct),
        amount: l.amount,
        color: colors[sliceForProgram(l.program)] ?? MUTED_MARK,
        program: programName(l.program),
        since: tariffStartDate(l.code, result.asOf),
        basis: l.basisValue,
        // Plain English, built from the heading's rules (the engine's own reasons are mostly empty)
        reasons: whyApplies(l, result, questions),
        switchesOff: off.filter((o) => o.reasons.some((r) => r === `Excluded by ${l.code}`)),
        legal: legalText(l.code, result),
      })),
    ...result.fees.map((fee) => ({
      key: fee.id,
      name: fee.name,
      reference: fee.id.toUpperCase(),
      referenceNote: "CBP fee",
      rate: pct(fee.ratePct),
      amount: fee.amount,
      color: MUTED_MARK,
      basis: customsValue,
      reasons: fee.note ? [fee.note] : [],
      switchesOff: [] as DutyLine[],
    })),
  ];
};

const COLS = "grid-cols-[0.75rem_minmax(0,1fr)_10rem_5rem_7rem]";

const DetailRow = ({ row, plain }: { row: Row; plain: (reason: string) => string }) => {
  const [legalOpen, setLegalOpen] = useState(false);
  return (
    <div className="col-span-full -mt-1 flex flex-col gap-2 pb-4 pl-8 pr-2 text-xs text-base-content/70">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {row.program && <span>{row.program}</span>}
        {row.since && <span>In effect since {formatDate(row.since)}</span>}
        {row.basis !== undefined && <span className="tabular-nums">Charged on {formatMoney(row.basis)}</span>}
      </div>
      {row.reasons.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
          {row.reasons.map((r) => (
            <li key={r}>{plain(r)}</li>
          ))}
        </ul>
      )}
      {row.switchesOff.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-base-content/70">Switches off</span>
          {row.switchesOff.map((o) => (
            <span key={o.code} className="rounded-full bg-tt-soft px-2 py-0.5 text-base-content/70" title={o.name}>
              <span className={`${mono.className} font-semibold`}>{o.code}</span> {o.name}
            </span>
          ))}
        </div>
      )}
      {row.legal && (
        <div className="flex flex-col gap-2">
          <button type="button" className="self-start font-semibold text-primary hover:underline" aria-expanded={legalOpen} onClick={() => setLegalOpen((o) => !o)}>
            {legalOpen ? "Hide legal text" : "Legal text"}
          </button>
          {legalOpen && <LegalPanel text={row.legal.text} notesFor={{ asOf: row.legal.asOf, htsCode: row.legal.htsCode }} />}
        </div>
      )}
    </div>
  );
};

// extraQuestions: questions from elsewhere (the import before any answer), to name conditions
export const DutyTable = ({
  result,
  customsValue,
  extraQuestions,
}: {
  result: CalculationResult;
  customsValue: number;
  extraQuestions?: Question[];
}) => {
  const plain = plainReasons(result, extraQuestions);
  const [view, setView] = useState<View>("summary");
  const [showChecked, setShowChecked] = useState(false);
  const preferenceName = result.claimedPreference
    ? result.availablePreferences.find((p) => p.symbol === result.claimedPreference)?.name ?? result.claimedPreference
    : undefined;
  const rows = rowsOf(result, customsValue, [...result.questions, ...(extraQuestions ?? [])], preferenceName);
  const notApplied = result.lines.filter((l) => l.status !== "applies");
  const detailed = view === "detailed";
  const total = result.totalDuty + result.totalFees;

  return (
    <section aria-labelledby="dc-lines" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="dc-lines" className={`${tt.display} m-0 text-base font-semibold text-base-content`}>
          Duty Breakdown
        </h3>
        <SegmentedControl<"summary" | "detailed">
          label="Detail"
          options={[
            { id: "summary", label: "Summary" },
            { id: "detailed", label: "Detailed" },
          ]}
          value={view}
          onChange={setView}
          size="sm"
          tone="accent"
        />
      </div>

      <div className={`grid ${COLS} items-baseline gap-x-4`}>
        <div className="col-span-full hidden grid-cols-subgrid pb-2 text-xs font-semibold text-base-content/60 md:grid">
          <span />
          <span>Charge</span>
          <span>Legal reference</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amount</span>
        </div>
        {rows.map((row) => (
          <div key={row.key} className="col-span-full grid grid-cols-subgrid border-t border-base-300/70">
            {/* Theme chart color (DESIGN_SYSTEM §10) */}
            <span className="mt-[1.1rem] h-2.5 w-2.5 rounded-sm" style={{ background: row.color }} aria-hidden />
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 py-3 text-sm text-base-content">
              {row.name}
            </span>
            <span className="flex min-w-0 flex-col py-3">
              <span className={`${mono.className} truncate text-xs font-semibold text-base-content/80`}>{row.reference}</span>
              {row.referenceNote && <span className="truncate text-[0.7rem] text-base-content/50">{row.referenceNote}</span>}
            </span>
            <span className="py-3 text-right text-sm tabular-nums text-base-content/70">{row.rate}</span>
            <span className="py-3 text-right text-sm font-medium tabular-nums text-base-content">{formatMoney(row.amount)}</span>
            {detailed && <DetailRow row={row} plain={plain} />}
          </div>
        ))}
        <div className="col-span-full grid grid-cols-subgrid border-t border-base-content/30 pt-3 text-sm">
          <span />
          <b className="col-span-3 text-base-content">Duty + fees</b>
          <b className="text-right tabular-nums text-base-content">{formatMoney(total)}</b>
        </div>
      </div>

      {notApplied.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {!detailed && (
            <button type="button" className="self-start text-sm font-semibold text-primary hover:underline" aria-expanded={showChecked} onClick={() => setShowChecked((v) => !v)}>
              {showChecked ? "Hide" : "Show"} the {notApplied.length} {notApplied.length === 1 ? "heading" : "headings"} checked that don&apos;t apply
            </button>
          )}
          {detailed && <h4 className="m-0 mt-2 text-sm font-semibold text-base-content">Checked, but don&apos;t apply</h4>}
          {(detailed || showChecked) && (
            <ul className={`${tt.tile} m-0 grid list-none gap-x-8 px-4 py-1 md:grid-cols-2`}>
              {notApplied.map((l) => (
                <li key={l.code} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 border-b border-base-300 py-2.5 text-sm last:border-0">
                  <span className={`${mono.className} text-xs font-semibold text-base-content/60`}>{l.code}</span>
                  <span className="text-base-content/70">
                    {l.name}
                    {l.reasons[0] && <span className="block text-xs text-base-content/60">{plain(l.reasons[0])}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};
