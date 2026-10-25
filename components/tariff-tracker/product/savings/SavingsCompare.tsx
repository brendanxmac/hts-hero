"use client";

import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { amountOf, CountryCard, linesOf, supplyOf } from "../../../duty-calculator/compare/CountryCard";
import { formatMoney } from "../../../duty-calculator/lib/format";
import { UsImports } from "../../../duty-calculator/lib/usImportsData";
import { CalculationResult } from "../../../../tariffs/engine-v2/types";
import { formatRate } from "../../formatRate";
import { Measure } from "../../opportunities/measure";
import { SavingOption } from "../../opportunities/options";
import { programColors } from "../../programColors";
import { rateParts, TrackedProduct } from "../../report";

// How a way to save compares with what the import pays today, made to read at a glance:
// - sourcing it somewhere else: the Compare tab's country cards, today's and the new origin's side
//   by side with their tariff rows lined up, each row of the new one saying what it changes
// - a trade program or an exemption (same supplier, same country): today's rate and the rate with
//   it, as two big figures and bars on one scale, then every line before and after, the ones it
//   changes picked out and the ones it doesn't faded
// Savings are only ever potential: they need the goods to meet the program's or exemption's terms.

const money = (n: number) => formatMoney(Math.round(n * 100) / 100).replace(/\.00$/, "");

const Arrow = () => (
  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success" aria-hidden>
    <ArrowRightIcon className="h-5 w-5" />
  </span>
);

// Two origins side by side
const OriginCompare = ({ product, option, imports, measure }: { product: TrackedProduct; option: SavingOption; imports: UsImports | null; measure: Measure }) => {
  const value = product.customsValue;
  const today = product.result;
  const colors = programColors([{ parts: rateParts(today, value) }, { parts: rateParts(option.result, value) }]);
  // Every tariff in either, base duty first, so the rows line up
  const lines = Array.from(new Map([...linesOf(today), ...linesOf(option.result)].map((l) => [l.key, { ...l, code: undefined as string | undefined }])).values());
  const top = Math.max(today.totalDuty, option.result.totalDuty, 0.01);
  const supplies = [supplyOf(imports, product.entry.country.code), supplyOf(imports, option.setup.country.code)];
  const supplyTop = Math.max(...supplies.map((s) => s?.share ?? 0), 0);
  const card = (
    which: "today" | "option",
    result: CalculationResult,
    country = which === "today" ? product.entry.country : option.setup.country
  ) => (
    <CountryCard
      country={country}
      sub={which === "today" ? "Your origin today" : option.agreement ? `With ${option.agreement}` : "Standard rate"}
      eyebrow={<span className={`${tt.eyebrow(which === "today" ? "neutral" : "success")} mb-1 block`}>{which === "today" ? "Today" : "If you source it here"}</span>}
      baseline={which === "option" ? today : undefined}
      result={result}
      value={value}
      colors={colors}
      lines={lines}
      scale={result.totalDuty / top}
      show={measure}
      noDollars={measure === "pct"}
      diff={which === "option" ? result.totalDuty - today.totalDuty : undefined}
      cheapest={which === "option"}
      supply={which === "today" ? supplies[0] : supplies[1]}
      supplyTop={supplyTop}
    />
  );
  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      {card("today", today)}
      <div className="hidden self-stretch md:flex md:flex-col md:items-center md:pt-24">
        <Arrow />
        <span className="mt-2 w-px flex-1 bg-base-300" aria-hidden />
      </div>
      <div className="rounded-2xl bg-success/[0.04] p-4 outline-solid outline-1 outline-success/20 md:-m-4">{card("option", option.result)}</div>
    </div>
  );
};

// One big rate (or amount) with its bar, on the scale both share
const RateTile = ({ label, result, value, colors, top, measure, tone }: { label: string; result: CalculationResult; value: number; colors: Record<string, string>; top: number; measure: Measure; tone: "neutral" | "success" }) => {
  const pct = (result.totalDuty / value) * 100;
  const parts = rateParts(result, value);
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-3 rounded-2xl p-5 ${tone === "success" ? "bg-success/[0.06]" : "bg-tt-soft"}`}>
      <span className={tt.eyebrow(tone)}>{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`${tt.metricLg} ${tone === "success" ? "!text-success" : ""}`}>{measure === "pct" ? formatRate(pct) : money(result.totalDuty)}</span>
        {measure === "usd" && <span className="text-sm tabular-nums text-base-content/60">{formatRate(pct)} duty</span>}
      </div>
      <div className="h-2.5">
        {parts.length ? (
          <StackedBar parts={parts.map((p) => ({ label: p.key, amount: p.pct, color: colors[p.key] }))} formatValue={formatRate} size="sm" shape="pill" fill={result.totalDuty / top} legend={false} />
        ) : (
          <span className="block h-full w-1.5 rounded-full bg-success" aria-hidden />
        )}
      </div>
    </div>
  );
};

// The same import before and after a trade program or an exemption
const RateChange = ({ product, option, measure }: { product: TrackedProduct; option: SavingOption; measure: Measure }) => {
  const value = product.customsValue;
  const today = product.result;
  const after = option.result;
  const colors = programColors([{ parts: rateParts(today, value) }, { parts: rateParts(after, value) }]);
  const lines = Array.from(new Map([...linesOf(today), ...linesOf(after)].map((l) => [l.key, l])).values());
  const top = Math.max(today.totalDuty, after.totalDuty, 0.01);
  const fmt = (usd: number) => (measure === "pct" ? formatRate((usd / value) * 100) : money(usd));
  const rows = lines.map((l) => {
    const was = amountOf(today, l.key)?.amount ?? 0;
    const now = amountOf(after, l.key)?.amount ?? 0;
    return { ...l, was, now, delta: now - was };
  });
  const changed = rows.filter((r) => Math.abs(r.delta) >= 0.005);
  const same = rows.filter((r) => Math.abs(r.delta) < 0.005);
  const what = option.kind === "program" ? option.title.replace(/^Claim /, "With ") : "With the exemption";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <RateTile label="Today" result={today} value={value} colors={colors} top={top} measure={measure} tone="neutral" />
        <div className="flex justify-center">
          <Arrow />
        </div>
        <RateTile label={what} result={after} value={value} colors={colors} top={top} measure={measure} tone="success" />
      </div>

      <div className="flex flex-col">
        <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_1.25rem_5.5rem_6.5rem] items-center gap-x-3 pb-2 text-xs text-base-content/60">
          <span className={tt.eyebrow()}>What changes</span>
          <span className="text-right">Today</span>
          <span />
          <span className="text-right">{option.kind === "program" ? "Claimed" : "Exempt"}</span>
          <span className="text-right">Change</span>
        </div>
        {[...changed, ...same].map((r) => {
          const moved = Math.abs(r.delta) >= 0.005;
          return (
            <div
              key={r.key}
              className={`grid grid-cols-[minmax(0,1fr)_5.5rem_1.25rem_5.5rem_6.5rem] items-center gap-x-3 border-t border-base-300 py-3 text-sm ${moved ? "" : "text-base-content/60"}`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: colors[r.part] ?? "color-mix(in oklab, var(--color-base-content) 20%, transparent)" }} aria-hidden />
                <span className={`truncate ${moved ? "font-medium text-base-content" : ""}`} title={r.name}>
                  {r.name}
                </span>
              </span>
              <span className={`text-right tabular-nums ${moved && r.now < r.was ? "text-base-content/60 line-through decoration-error/60" : ""}`}>{r.was > 0.005 ? fmt(r.was) : "—"}</span>
              <ArrowRightIcon className={`h-3.5 w-3.5 ${moved ? "text-success" : "text-base-content/20"}`} aria-hidden />
              <span className={`text-right tabular-nums ${moved ? "font-semibold text-base-content" : ""}`}>{r.now > 0.005 ? fmt(r.now) : r.was > 0.005 ? fmt(0) : "—"}</span>
              <span className="text-right">
                {moved ? (
                  <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${r.delta < 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                    {r.now < 0.005 ? "Removed" : `${r.delta < 0 ? "−" : "+"}${fmt(Math.abs(r.delta))}`}
                  </span>
                ) : (
                  <span className="text-xs">Unchanged</span>
                )}
              </span>
            </div>
          );
        })}
        <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_1.25rem_5.5rem_6.5rem] items-center gap-x-3 border-t-2 border-base-content/80 py-3 text-sm font-semibold text-base-content">
          <span>Total duty</span>
          <span className="text-right tabular-nums">{fmt(today.totalDuty)}</span>
          <ArrowRightIcon className="h-3.5 w-3.5 text-success" aria-hidden />
          <span className="text-right tabular-nums text-success">{fmt(after.totalDuty)}</span>
          <span className="text-right">
            <span className="whitespace-nowrap rounded-full bg-success px-2 py-0.5 text-xs font-bold tabular-nums text-success-content">−{fmt(today.totalDuty - after.totalDuty)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const SavingsCompare = ({ product, option, imports, measure }: { product: TrackedProduct; option: SavingOption; imports: UsImports | null; measure: Measure }) => (
  <div className="flex flex-col gap-4">
    {option.kind === "origin" ? <OriginCompare product={product} option={option} imports={imports} measure={measure} /> : <RateChange product={product} option={option} measure={measure} />}
    <p className={`${ui.caption} m-0`}>
      {measure === "pct" ? "As a percentage of the entered value" : "For one shipment at this import's value and quantity"}, at the rates in force today
      {option.kind !== "origin" ? `, from ${product.entry.country.name}` : ""}. Savings are potential: the goods need to meet{" "}
      {option.kind === "exemption" ? "the exemption's condition" : option.kind === "program" ? "the program's rules of origin" : "the rules on where goods are made"}.
    </p>
  </div>
);
