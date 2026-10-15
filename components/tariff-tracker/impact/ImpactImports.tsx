"use client";

import { useMemo, useState } from "react";
import { ArrowRightIcon, ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { DutyAt, ImportImpact } from "@/libs/tariff-updates/impactOf";
import type { DutyLine } from "@/tariffs/engine-v2/types";
import { formatRate } from "../formatRate";
import type { TrackedProduct } from "../report";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { day, groupOf, GROUPS, money, reasonText, type ImpactGroup } from "./format";

// Every import the update affects or may affect, biggest change first. A row opens to the duty
// line by line, the day before and the day it changes (what starts, what stops, what moves), or,
// when it isn't confirmed, why it may apply; each opens the import's own page.

export type Show = "affected" | "confirmed" | "likely" | "possible";

interface Line {
  code: string;
  name: string;
  pct: number | null;
  amount: number;
}

const linesOf = (p: DutyAt): Line[] => [
  { code: "BASE", name: "Base duty", pct: p.result.base.ratePct ?? null, amount: p.result.base.amount },
  ...p.result.lines.filter((l: DutyLine) => l.status === "applies").map((l) => ({ code: l.code, name: l.name, pct: l.ratePct ?? null, amount: l.amount })),
];

// The duty, line by line, the day before and the day of the change
const DutyDiff = ({ impact }: { impact: ImportImpact }) => {
  const before = linesOf(impact.before!);
  const after = linesOf(impact.after!);
  const codes = Array.from(new Set([...before.map((l) => l.code), ...after.map((l) => l.code)]));
  const find = (lines: Line[], code: string) => lines.find((l) => l.code === code);
  const cell = (l?: Line) => (l ? `${l.pct === null ? "" : `${formatRate(l.pct)} · `}${money(l.amount)}` : "—");
  return (
    <div className={`${tt.tile} overflow-hidden`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className={`${tt.eyebrow()} px-4 py-2.5`}>Duty line</th>
            <th className={`${tt.eyebrow()} px-4 py-2.5 text-right`}>{day(impact.date!, false)} before</th>
            <th className={`${tt.eyebrow()} px-4 py-2.5 text-right`}>From {day(impact.date!, false)}</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((code) => {
            const b = find(before, code);
            const a = find(after, code);
            const state = !b ? "added" : !a ? "removed" : Math.abs(a.amount - b.amount) > 0.5 ? "changed" : "same";
            const tone = state === "added" ? "text-error" : state === "removed" ? "text-success" : state === "changed" ? (a!.amount > b!.amount ? "text-error" : "text-success") : "text-base-content/70";
            return (
              <tr key={code} className="border-t border-base-300/70">
                <td className="px-4 py-2">
                  <span className={state === "same" ? "text-base-content/80" : "font-semibold text-base-content"}>{(a ?? b)!.name}</span>
                  {code !== "BASE" && <span className="ml-2 font-mono text-xs text-base-content/50">{code}</span>}
                  {state === "added" && <span className={`${tt.chip("error")} ml-2`}>New</span>}
                  {state === "removed" && <span className={`${tt.chip("success")} ml-2`}>Ends</span>}
                </td>
                <td className={`px-4 py-2 text-right tabular-nums ${state === "removed" ? "text-base-content/50 line-through" : "text-base-content/70"}`}>{cell(b)}</td>
                <td className={`px-4 py-2 text-right font-semibold tabular-nums ${tone}`}>{cell(a)}</td>
              </tr>
            );
          })}
          <tr className="border-t border-base-300">
            <td className="px-4 py-2.5 font-semibold text-base-content">Total duty</td>
            <td className="px-4 py-2.5 text-right tabular-nums text-base-content/70">
              {formatRate(impact.beforePct!)} · {money(impact.before!.result.totalDuty)}
            </td>
            <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-base-content">
              {formatRate(impact.afterPct!)} · {money(impact.after!.result.totalDuty)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const Row = ({ impact, product, effective, today, perYear }: { impact: ImportImpact; product: TrackedProduct; effective: string | null; today: string; perYear: number | null }) => {
  const [open, setOpen] = useState(false);
  const { openProduct } = useTrackerNav();
  const group = groupOf(impact);
  const g = GROUPS[group];
  const confirmed = impact.level === "confirmed";
  const future = confirmed && !!impact.date && impact.date > today;
  const delta = impact.deltaUsd ?? 0;
  return (
    <li className="border-t border-base-300 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="grid w-full grid-cols-[minmax(0,1fr)_8rem_9.5rem_7rem_1.25rem] items-center gap-4 px-6 py-3.5 text-left transition-colors hover:bg-tt-soft"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: g.mark }} aria-hidden />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-base-content">{product.description}</span>
            <span className="truncate text-xs text-base-content/60">
              <span className="font-mono">{product.entry.element.htsno}</span> · {product.entry.country.flag} {product.entry.country.name}
            </span>
          </span>
        </span>
        <span className="flex flex-col items-start gap-1">
          <span className={SOLID[group]}>{g.short}</span>
          {future && <span className="text-[11px] font-semibold text-warning">From {day(impact.date!, false)}</span>}
        </span>
        <span className="text-sm tabular-nums">
          {confirmed ? (
            <>
              <span className="text-base-content/60">{formatRate(impact.beforePct!)}</span>
              <span className="mx-1.5 text-base-content/40">→</span>
              <span className={`font-semibold ${group === "up" ? "text-error" : group === "down" ? "text-success" : "text-base-content"}`}>{formatRate(impact.afterPct!)}</span>
            </>
          ) : (
            <span className="text-base-content/60">Now {formatRate(product.totalPct)}</span>
          )}
        </span>
        <span className="flex flex-col items-end">
          {confirmed && Math.abs(delta) > 0.5 ? (
            <>
              <span className={`${tt.display} text-base font-semibold tabular-nums ${delta > 0 ? "text-error" : "text-success"}`}>{money(delta, true)}</span>
              <span className="text-[11px] text-base-content/60">{perYear ? `${money(delta * perYear, true)} a year` : "per shipment"}</span>
            </>
          ) : (
            <span className="text-xs text-base-content/50">{confirmed ? "No change" : "—"}</span>
          )}
        </span>
        <ChevronDownIcon className={`h-5 w-5 text-base-content/40 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="flex flex-col gap-3 px-6 pb-5 pl-10">
          <p className="text-sm text-base-content/80">
            <span className="font-semibold text-base-content">{reasonText(impact, effective, today)}.</span>{" "}
            {impact.level === "confirmed" &&
              impact.reason !== "ban" &&
              `Worked out by the duty engine on your saved value (${money(product.customsValue)} a shipment)${perYear ? ` and ${perYear} shipments a year` : ""}.`}
            {impact.reason === "ban" && "From that day these goods can't be entered, unless an exception applies to them."}
            {impact.reason === "named" && "Its scope names this code and country. We'll confirm the exact duty once the change is in the HTS, and tell you."}
            {impact.reason === "answer" && "The duty engine has this tariff, and whether it applies depends on an answer about your goods. Answer it on the import's page."}
            {impact.reason === "country" && "It's worth a look if this import could fall under it; the scope doesn't name this code."}
          </p>
          {impact.before && impact.after && impact.reason !== "ban" && <DutyDiff impact={impact} />}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => openProduct(product.key, false, "duty")}>
              {impact.reason === "answer" ? "Answer it on the import's page" : "Open this import"}
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

// Status chips filled in their color, so the list reads at a glance
const SOLID: Record<ImpactGroup, string> = {
  up: "inline-flex rounded-full bg-error px-2.5 py-0.5 text-xs font-bold text-error-content",
  down: "inline-flex rounded-full bg-success px-2.5 py-0.5 text-xs font-bold text-success-content",
  same: "inline-flex rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-content",
  likely: "inline-flex rounded-full bg-warning px-2.5 py-0.5 text-xs font-bold text-warning-content",
  possible: "inline-flex rounded-full bg-base-300 px-2.5 py-0.5 text-xs font-bold text-base-content/70",
};

const groupRank: Record<ImpactGroup, number> = { up: 0, down: 1, same: 2, likely: 3, possible: 4 };

export const ImpactImports = ({
  impacts,
  effective,
  today,
  country,
  onClearCountry,
  show,
  onShow,
}: {
  impacts: ImportImpact[];
  effective: string | null;
  today: string;
  country: string | null;
  onClearCountry: () => void;
  show: Show;
  onShow: (show: Show) => void;
}) => {
  const { products, itemFor } = useTracker();
  const byKey = useMemo(() => new Map(products.map((p) => [p.key, p])), [products]);
  const counts = useMemo(() => {
    const c = { confirmed: 0, likely: 0, possible: 0 };
    impacts.forEach((i) => c[i.level]++);
    return c;
  }, [impacts]);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return impacts
      .filter((i) => {
        if (show === "affected" && i.level === "possible") return false;
        if (show !== "affected" && i.level !== show) return false;
        const p = byKey.get(i.key);
        if (!p) return false;
        if (country && p.entry.country.code !== country) return false;
        const text = `${p.description} ${p.entry.element.htsno} ${p.entry.country.name}`.toLowerCase();
        return words.every((w) => text.includes(w));
      })
      .sort((a, b) => groupRank[groupOf(a)] - groupRank[groupOf(b)] || Math.abs(b.deltaUsd ?? 0) - Math.abs(a.deltaUsd ?? 0));
  }, [impacts, show, query, byKey, country]);

  const countryName = country ? products.find((p) => p.entry.country.code === country)?.entry.country.name : null;

  return (
    <section className={`${tt.panel} overflow-hidden`} aria-labelledby="tt-impact-imports" id="tt-impact-imports-list">
      <div className="flex flex-wrap items-center gap-3 px-6 py-4">
        <div className="mr-auto">
          <h2 id="tt-impact-imports" className={tt.title}>
            Your imports
          </h2>
        </div>
        <SegmentedControl
          label="Which imports"
          size="sm"
          options={[
            { id: "affected", label: "Affected", count: counts.confirmed + counts.likely },
            { id: "confirmed", label: "Confirmed", count: counts.confirmed },
            { id: "likely", label: "May apply", count: counts.likely },
            { id: "possible", label: "Country only", count: counts.possible },
          ]}
          value={show}
          onChange={(v) => onShow(v as Show)}
        />
        <label className="relative w-56">
          <span className="sr-only">Search your affected imports</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search imports"
            className="h-8 w-full rounded-full border border-base-300 bg-base-100 pl-9 pr-3 text-sm text-base-content placeholder:text-base-content/40 focus:border-primary focus:outline-none"
          />
        </label>
      </div>
      {country && (
        <div className="flex items-center gap-2 px-6 pb-3 text-sm">
          <span className={tt.chip("primary")}>From {countryName ?? country}</span>
          <button type="button" className={`${ui.link} text-xs`} onClick={onClearCountry}>
            Show every country
          </button>
        </div>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_8rem_9.5rem_7rem_1.25rem] gap-4 border-y border-base-300 bg-tt-soft px-6 py-2">
        <span className={tt.eyebrow()}>Import</span>
        <span className={tt.eyebrow()}>Impact</span>
        <span className={tt.eyebrow()}>Duty rate</span>
        <span className={`${tt.eyebrow()} text-right`}>Change</span>
        <span />
      </div>
      {rows.length ? (
        <ul>
          {rows.map((i) => {
            const p = byKey.get(i.key)!;
            const perYear = itemFor(i.key)?.shipmentsPerYear ?? null;
            return <Row key={i.key} impact={i} product={p} effective={effective} today={today} perYear={perYear && perYear > 1 ? perYear : null} />;
          })}
        </ul>
      ) : (
        <p className="px-6 py-8 text-sm text-base-content/60">{query || country ? "No imports match." : "None of your imports in this group."}</p>
      )}
    </section>
  );
};
