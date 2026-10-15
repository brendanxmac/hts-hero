"use client";

import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Country } from "@/constants/countries";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatRate } from "@/components/tariff-tracker/formatRate";
import { BASE_PART, rateParts } from "@/components/tariff-tracker/report";
import { CalculationResult, DutyLine } from "@/tariffs/engine-v2/types";
import { ArrowLink } from "../calculator/ArrowLink";
import { formatMoney } from "../lib/format";
import { formatImportValue, UsImports } from "../lib/usImports";
import { programName } from "../results/labels";
import { CountryPicker, PickOption } from "./CountryPicker";
import { CompareOption, shortAgreement } from "./options";

// One country's duty on this shipment, as a card that reads top to bottom: who (and "Yours" or
// the agreement used), what it costs and against yours, a bar of what the duty is made of, then
// each tariff with its rate and amount, the fees, the landed cost and how much the US already imports
// from there (Census). Side by Side puts one per
// column with their tariff rows lined up (`lines`: every tariff in any column, so the same tariff
// sits on the same row, "—" where it doesn't apply); the Globe shows one beside the map. Rows are
// tariff programs (Base duty, Section 301 – Forced Labor), so the same program lines up whichever
// country's heading it is.

// How much of this the US already imports from a country (Census): the yearly value, its rank
// among the suppliers and its share of all US imports of it
export interface Supply {
  year: number;
  value: number;
  rank: number;
  share: number;
}

export const supplyOf = (imports: UsImports | null | undefined, code: string): Supply | null => {
  if (!imports) return null;
  const value = imports.byCountry.get(code)?.value ?? 0;
  const ranked = Array.from(imports.byCountry.entries())
    .filter(([, v]) => v.value > 0)
    .sort((a, b) => b[1].value - a[1].value);
  return { year: imports.year, value, rank: value > 0 ? ranked.findIndex(([c]) => c === code) + 1 : 0, share: imports.totalValue > 0 ? value / imports.totalValue : 0 };
};

const money = (n: number) => formatMoney(Math.round(n * 100) / 100).replace(/\.00$/, "");

// A tariff row: its key, label and code
export interface LineKey {
  key: string;
  name: string;
  code?: string;
  // Its color in the calculator's breakdown
  part: string;
}

const applied = (result: CalculationResult) => result.lines.filter((l) => l.status === "applies" && l.amount > 0);

// Every tariff program that applies to a result, base duty first: one row per program (Section 301
// – Forced Labor is one row whichever country's heading it is), its Chapter 99 code when it's one
export const linesOf = (result: CalculationResult): LineKey[] => [
  { key: BASE_PART, name: "Base duty", part: BASE_PART },
  ...Array.from(
    applied(result)
      .reduce((m, l) => {
        const part = programName(l.program);
        return m.set(part, [...(m.get(part) ?? []), l.code]);
      }, new Map<string, string[]>())
      .entries()
  ).map(([part, codes]) => ({ key: part, name: part, code: codes.length === 1 ? codes[0] : undefined, part })),
];

// A program's amount and rate on a result: its lines added up
const amountOf = (result: CalculationResult, key: string): Pick<DutyLine, "amount" | "ratePct"> | null => {
  if (key === BASE_PART) return result.base;
  const lines = applied(result).filter((l) => programName(l.program) === key);
  if (!lines.length) return null;
  return { amount: lines.reduce((sum, l) => sum + l.amount, 0), ratePct: lines.every((l) => l.ratePct !== undefined) ? lines.reduce((sum, l) => sum + (l.ratePct ?? 0), 0) : undefined };
};

export const CountryCard = ({
  option,
  result,
  value,
  colors,
  lines,
  scale = 1,
  diff,
  show = "usd",
  supply,
  supplyTop,
  onChange,
  pickOptions,
  pickAlign,
  cheapest = false,
  onRemove,
  onOpen,
  onClose,
}: {
  option: CompareOption;
  result: CalculationResult;
  // The shipment's customs value
  value: number;
  // Each tariff's color, by its part key
  colors: Record<string, string>;
  // The tariff rows to show, in order (Side by Side: every column's, lined up); this one's alone when left out
  lines?: LineKey[];
  // The bar's length against the highest rate shown (0 to 1)
  scale?: number;
  // Its duty against yours, in dollars; left out for yours
  diff?: number;
  // What leads: the rate (Side by Side: %s first, dollars under them) or the dollars
  show?: "pct" | "usd";
  // US imports from it (Census), as the last row; left out when there are no figures
  supply?: Supply | null;
  // The largest share any country shown has, so the volume bars compare (the largest fills it)
  supplyTop?: number;
  // Swapping it for another country: its name opens a picker of these
  onChange?: (country: Country) => void;
  pickOptions?: PickOption[];
  pickAlign?: "left" | "right";
  // The least of the countries shown
  cheapest?: boolean;
  onRemove?: () => void;
  // Its full breakdown in the calculator
  onOpen?: () => void;
  // Hide the card (the Globe's)
  onClose?: () => void;
}) => {
  const { origin } = option;
  const pct = (result.totalDuty / value) * 100;
  const byPct = show === "pct";
  // The difference from yours in the lead unit: rate (of the value) or dollars
  const diffLead = diff === undefined ? undefined : byPct ? formatRate(Math.abs((diff / value) * 100)) : money(Math.abs(diff));
  const parts = rateParts(result, value);
  const rows = lines ?? linesOf(result);
  const sub = [origin.isOrigin && "Yours", option.agreement && `With ${shortAgreement(option.agreement.name)}`].filter(Boolean).join(" · ") || "Standard rate";

  return (
    <article className="flex min-w-0 flex-col gap-4" aria-label={`${origin.country.name}: ${money(result.totalDuty)} duty`}>
      {/* Who */}
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="m-0">
            {onChange && pickOptions ? (
              // Its name opens the country picker, to swap it for another
              <CountryPicker
                options={pickOptions}
                onPick={onChange}
                align={pickAlign}
                label={`Pick another country instead of ${origin.country.name}`}
                buttonClassName="group -mx-1.5 flex max-w-full items-center gap-2 rounded-lg px-1.5 py-0.5 text-left text-base font-semibold text-base-content transition-colors hover:bg-tt-soft ui-open:bg-tt-soft"
              >
                <span className="text-xl leading-none" aria-hidden>
                  {origin.country.flag}
                </span>
                <span className="truncate">{origin.country.name}</span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-base-content/40 group-hover:text-base-content/70" aria-hidden />
              </CountryPicker>
            ) : (
              <span className="flex items-center gap-2 text-base font-semibold text-base-content">
                <span className="text-xl leading-none" aria-hidden>
                  {origin.country.flag}
                </span>
                <span className="truncate">{origin.country.name}</span>
              </span>
            )}
          </h4>
          <p className={`${ui.caption} mt-0.5`}>
            {sub}
          </p>
        </div>
        {(onRemove || onClose) && (
          <button
            type="button"
            className="rounded p-1 text-base-content/40 hover:bg-base-200 hover:text-base-content"
            aria-label={onClose ? "Hide" : `Remove ${origin.country.name} from the comparison`}
            title={onClose ? "Hide" : "Remove"}
            onClick={onClose ?? onRemove}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* What it costs, and against yours */}
      <div className="flex flex-col gap-1">
        <span className={`${ui.metric.secondary} ${cheapest ? "!text-success" : ""}`}>{byPct ? formatRate(pct) : money(result.totalDuty)}</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="tabular-nums text-base-content/60">{byPct ? `${money(result.totalDuty)} duty` : `${formatRate(pct)} duty`}</span>
          {diff !== undefined &&
            (Math.abs(diff) < 0.005 ? (
              <span className="rounded-full bg-base-200 px-2 py-0.5 text-xs font-semibold text-base-content/70">Same as yours</span>
            ) : (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${diff < 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                {diff < 0 ? "−" : "+"}
                {diffLead} vs yours
              </span>
            ))}
        </span>
      </div>

      {/* What it's made of, against the highest rate shown */}
      <div className="h-2" style={{ width: `${Math.max(scale * 100, pct > 0 ? 3 : 0)}%` }} title={parts.map((p) => `${p.key} ${formatRate(p.pct)}`).join(" · ") || "No duty"}>
        <StackedBar parts={parts.map((p) => ({ label: p.key, amount: p.pct, color: colors[p.key] }))} formatValue={formatRate} size="xs" shape="pill" legend={false} />
      </div>

      {/* Each tariff, then the fees and the landed cost */}
      <dl className="m-0 flex flex-col text-sm">
        {rows.map((row) => {
          const line = amountOf(result, row.key);
          return (
            <div key={row.key} className="flex h-12 items-center justify-between gap-3 border-t border-base-300">
              <dt className={`flex min-w-0 items-center gap-2 ${line ? "text-base-content" : "text-base-content/60"}`}>
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: line ? colors[row.part] : "oklch(var(--bc) / 0.15)" }} aria-hidden />
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate" title={row.name}>
                    {row.name}
                  </span>
                  {row.code && <span className={`${mono.className} text-[11px] text-base-content/60`}>{row.code}</span>}
                </span>
              </dt>
              <dd className="m-0 flex shrink-0 flex-col items-end leading-tight">
                {line ? (
                  <>
                    <span className="font-medium tabular-nums text-base-content">{byPct ? formatRate(line.ratePct ?? (line.amount / value) * 100) : money(line.amount)}</span>
                    <span className="text-[11px] tabular-nums text-base-content/60">{byPct ? money(line.amount) : line.ratePct !== undefined ? formatRate(line.ratePct) : ""}</span>
                  </>
                ) : (
                  <span className="text-base-content/30">—</span>
                )}
              </dd>
            </div>
          );
        })}
        <div className="flex h-12 items-center justify-between gap-3 border-t border-base-300 font-semibold text-base-content">
          <dt>Total duty</dt>
          {/* Like the tariff rows: the lead figure on top, the other under it */}
          <dd className="m-0 flex flex-col items-end leading-tight">
            <span className="tabular-nums">{byPct ? formatRate(pct) : money(result.totalDuty)}</span>
            <span className="text-[11px] font-normal tabular-nums text-base-content/60">{byPct ? money(result.totalDuty) : formatRate(pct)}</span>
          </dd>
        </div>
        <div className="flex h-9 items-center justify-between gap-3 border-t border-base-300 text-base-content/70">
          <dt title={result.fees.map((f) => f.name).join(", ")}>Fees ({result.fees.map((f) => f.id.toUpperCase()).join(" + ") || "none"})</dt>
          <dd className="m-0 tabular-nums">{money(result.totalFees)}</dd>
        </div>
        <div className="flex h-10 items-center justify-between gap-3 border-t border-base-300 font-semibold text-base-content">
          <dt>Landed cost</dt>
          <dd className="m-0 tabular-nums">{money(value + result.totalDuty + result.totalFees)}</dd>
        </div>
      </dl>

      {/* A separate question from the duty: how much the US already buys from there */}
      {supply && (
        // How much of this the US already buys from there: the value, its rank among the
        // suppliers and a bar of its share (the biggest share shown fills it)
        <section className="mt-2 flex h-[6.5rem] flex-col justify-center gap-1.5 rounded-xl bg-tt-soft px-3.5" title={`US imports of this from ${origin.country.name} in ${supply.year} (U.S. Census Bureau)`}>
          <h5 className="m-0 flex items-center justify-between gap-2">
            <span className={ui.label}>US Import Volume</span>
            {supply.value > 0 && (
              <span className="rounded-full bg-tt-sky/20 px-2 text-[11px] font-semibold leading-[18px] text-base-content">#{supply.rank} supplier</span>
            )}
          </h5>
          <div className="flex flex-col gap-1.5">
            {supply.value > 0 ? (
              <>
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-base font-semibold tabular-nums text-base-content">{formatImportValue(supply.value)}</span>
                  <span className="text-xs tabular-nums text-base-content/60">
                    {supply.share >= 0.01 ? `${Math.round(supply.share * 100)}%` : "<1%"} of US imports
                  </span>
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-base-100" aria-hidden>
                  <span className="block h-full rounded-full bg-tt-sky" style={{ width: `${Math.max((supply.share / Math.max(supplyTop ?? supply.share, 0.0001)) * 100, 3)}%` }} />
                </span>
              </>
            ) : (
              <span className="text-sm text-base-content/60">The US doesn&apos;t import this from there yet</span>
            )}
          </div>
        </section>
      )}

      {onOpen && (
        <ArrowLink onClick={onOpen} className="text-sm">
          Full breakdown
        </ArrowLink>
      )}
    </article>
  );
};
