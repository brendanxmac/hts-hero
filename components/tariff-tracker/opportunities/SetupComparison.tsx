"use client";

import { Fragment, ReactNode } from "react";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CalculationResult } from "../../../tariffs/engine-v2/types";
import { formatRate } from "../formatRate";
import { formatDuty, Measure } from "./measure";
import { BASE_PART, programName, shortProgram } from "../report";
import { Setup } from "./options";

// Setups side by side: what the product pays today and a way to pay less. For each,
// the origin, trade program and conditions, then every duty line (as a percentage of the value, or
// in dollars), the fees, the total and the rate, and what it saves. Lines one setup doesn't have show a dash, so what changes is
// plain to see.

export interface ComparedSetup {
  id: string;
  label: string;
  setup: Setup;
  result: CalculationResult;
  // The one everything is compared against
  baseline?: boolean;
}

// Each setup's duty by line: the base duty, then each tariff program that applies
const dutyByLine = (result: CalculationResult) => {
  const lines = new Map<string, number>([[BASE_PART, result.base.amount]]);
  result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .forEach((l) => {
      const key = shortProgram(programName(l.program));
      lines.set(key, (lines.get(key) ?? 0) + l.amount);
    });
  return lines;
};

const preferenceName = (s: ComparedSetup) =>
  s.setup.claimedPreference
    ? (s.result.availablePreferences.find((p) => p.symbol === s.setup.claimedPreference)?.name ?? s.setup.claimedPreference)
    : "None claimed";

// One row: its label, then a cell per setup (the options tinted)
const Row = ({ label, cells, tinted, strong = false }: { label: string; cells: ReactNode[]; tinted: boolean[]; strong?: boolean }) => (
  <>
    <div className={`border-t border-base-300 py-2.5 pr-3 text-sm ${strong ? "font-semibold text-base-content" : "text-base-content/70"}`}>{label}</div>
    {cells.map((cell, i) => (
      <div
        key={i}
        className={`border-t border-base-300 px-3 py-2.5 text-right text-sm tabular-nums ${strong ? "font-semibold" : ""} text-base-content ${tinted[i] ? "bg-success/[0.04]" : ""}`}
      >
        {cell}
      </div>
    ))}
  </>
);

export const SetupComparison = ({
  setups,
  customsValue,
  shipmentsPerYear,
  measure,
}: {
  setups: ComparedSetup[];
  customsValue: number;
  shipmentsPerYear: number;
  measure: Measure;
}) => {
  const money = (usd: number) => formatDuty(usd, customsValue, measure);
  const pct = measure === "pct";
  const baseline = setups.find((s) => s.baseline) ?? setups[0];
  const byLine = setups.map((s) => dutyByLine(s.result));
  const lineKeys = Array.from(new Set(byLine.flatMap((m) => Array.from(m.keys()))));
  const cols = `minmax(9rem,1fr) repeat(${setups.length}, minmax(0,1fr))`;
  const tinted = setups.map((s) => !s.baseline);

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[36rem]" style={{ gridTemplateColumns: cols }}>
        {/* Runtime column count (DESIGN_SYSTEM §10) */}
        <div />
        {setups.map((s) => (
          <div key={s.id} className={`flex flex-col items-end gap-1 rounded-t-2xl px-3 pb-3 pt-2 text-right ${s.baseline ? "" : "bg-success/[0.04]"}`}>
            <span className={tt.eyebrow(s.baseline ? "neutral" : "success")}>{s.baseline ? "Today" : "Option"}</span>
            <span className="text-sm font-semibold leading-snug text-base-content">{s.label}</span>
          </div>
        ))}

        <Row tinted={tinted} label="Country of origin" cells={setups.map((s) => `${s.setup.country.flag} ${s.setup.country.name}`)} />
        <Row tinted={tinted} label="Trade program" cells={setups.map(preferenceName)} />
        <Row
          tinted={tinted}
          label="Conditions confirmed"
          cells={setups.map((s) => {
            const yes = Object.values(s.setup.answers).filter((v) => v === true).length;
            return yes ? `${yes} yes` : "None";
          })}
        />
        {lineKeys.map((key) => (
          <Fragment key={key}>
            <Row tinted={tinted} label={key} cells={byLine.map((m) => (m.has(key) ? money(m.get(key)!) : <span key="none" className="text-base-content/40">—</span>))} />
          </Fragment>
        ))}
        <Row tinted={tinted} label="Fees (MPF, HMF)" cells={setups.map((s) => money(s.result.totalFees))} />
        {/* As percentages, the total is the rate; in dollars, the rate follows it */}
        <Row tinted={tinted} label={pct ? "Duty rate" : "Duty per shipment"} strong cells={setups.map((s) => money(s.result.totalDuty))} />
        {!pct && <Row tinted={tinted} label="Duty rate" strong cells={setups.map((s) => formatRate((s.result.totalDuty / customsValue) * 100))} />}
        <Row
          tinted={tinted}
          label={pct ? "Could lower the rate by" : "Could save per shipment"}
          strong
          cells={setups.map((s) =>
            s.baseline ? <span key="none" className="text-base-content/40">—</span> : <span key="saving" className="text-success">{money(baseline.result.totalDuty - s.result.totalDuty)}</span>
          )}
        />
        <Row
          tinted={tinted}
          label={pct ? "Cut in duty" : `Per year (${shipmentsPerYear.toLocaleString("en-US")} ${shipmentsPerYear === 1 ? "shipment" : "shipments"})`}
          cells={setups.map((s) => {
            if (s.baseline) return <span key="none" className="text-base-content/40">—</span>;
            const saved = baseline.result.totalDuty - s.result.totalDuty;
            return (
              <span key="saving" className="text-success">
                {pct ? formatRate(baseline.result.totalDuty > 0 ? (saved / baseline.result.totalDuty) * 100 : 0) : money(saved * shipmentsPerYear)}
              </span>
            );
          })}
        />
      </div>
      <p className={`${ui.caption} mt-3`}>
        {pct ? "As a percentage of the entered value" : "For one shipment at this product's value and quantity"}, at the rates in force today. Savings are potential: they
        need the goods to meet each program&apos;s or exemption&apos;s requirements.
      </p>
    </div>
  );
};
