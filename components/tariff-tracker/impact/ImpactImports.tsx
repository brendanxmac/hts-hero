"use client";

import { useMemo, useState } from "react";
import { ChevronRightIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { partColors } from "@/components/ui/charts/partColors";
import type { DutyAt, ImportImpact } from "@/libs/tariff-updates/impactOf";
import { namingPrefix, scopeOf, type UpdateScope } from "@/libs/tariff-updates/match";
import type { DutyLine } from "@/tariffs/engine-v2/types";
import { formatRate } from "../formatRate";
import { BASE_PART, rateParts, shortProgram, type RatePart, type TrackedProduct } from "../report";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import type { TrackerUpdate } from "../overview/useTariffUpdates";
import { day, formatPrefix, groupOf, rateChange, signedRate, type ImpactGroup } from "./format";

// The imports an action touches, laid out like Your imports (DESIGN_SYSTEM §15), in three groups,
// each with one line on what it means: Duty Changes (worked out by the duty engine, the day before
// and the day it takes effect), May Apply (it names their code and country, before the new rate is
// in the HTS), and Same Country, Other Products (it names their country only; folded away). Each
// row: the product and origin with why it's here, its tariffs before and after as two bars (what
// the action adds marked new, what it ends struck), and the change. Biggest change first. A row
// opens to the duty line by line, the day before and the day of the change.

const GRID = "grid grid-cols-[minmax(0,1fr)_minmax(0,1.75fr)_7.5rem_1.25rem] items-center gap-6";

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
const DutyDiff = ({ impact, customsValue }: { impact: ImportImpact; customsValue: number }) => {
  const before = linesOf(impact.before!);
  const after = linesOf(impact.after!);
  const codes = Array.from(new Set([...before.map((l) => l.code), ...after.map((l) => l.code)]));
  const find = (lines: Line[], code: string) => lines.find((l) => l.code === code);
  // Each line as a rate on the shipment (a per-unit duty worked out on its value)
  const cell = (l?: Line) => (l ? formatRate(l.pct ?? (l.amount / customsValue) * 100) : "—");
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left">
          <th className={`${tt.eyebrow()} pb-2`}>Duty line</th>
          <th className={`${tt.eyebrow()} whitespace-nowrap pb-2 pl-4 text-right`}>Day before</th>
          <th className={`${tt.eyebrow()} whitespace-nowrap pb-2 pl-4 text-right`}>From {day(impact.date!, false)}</th>
        </tr>
      </thead>
      <tbody>
        {codes.map((code) => {
          const b = find(before, code);
          const a = find(after, code);
          const state = !b ? "added" : !a ? "removed" : Math.abs(a.amount - b.amount) > 0.5 ? "changed" : "same";
          return (
            <tr key={code} className="border-t border-base-300">
              <td className="py-2 pr-4">
                <span className={state === "same" ? "text-base-content/70" : "font-semibold text-base-content"}>{(a ?? b)!.name}</span>
                {code !== "BASE" && <span className="ml-2 font-mono text-xs text-base-content/60">{code}</span>}
              </td>
              <td className={`py-2 text-right tabular-nums ${state === "removed" ? "text-base-content/60 line-through" : "text-base-content/60"}`}>{cell(b)}</td>
              <td
                className={`py-2 text-right tabular-nums ${
                  (state === "added" && a!.amount > 0.5) || (state === "changed" && a!.amount > b!.amount)
                    ? "font-semibold text-error"
                    : state === "changed"
                      ? "font-semibold text-success"
                      : state === "added"
                        ? "font-semibold text-base-content"
                        : "text-base-content/70"
                }`}
              >
                {state === "removed" ? <span className="font-semibold text-success">Ends</span> : cell(a)}
              </td>
            </tr>
          );
        })}
        <tr className="border-t border-base-300">
          <td className="py-2.5 font-semibold text-base-content">Total duty</td>
          <td className="py-2.5 text-right tabular-nums text-base-content/60">{formatRate(impact.beforePct!)}</td>
          <td className="py-2.5 text-right font-semibold tabular-nums text-base-content">{formatRate(impact.afterPct!)}</td>
        </tr>
      </tbody>
    </table>
  );
};

// One bar of the duty on the import, on the list's shared scale, with its rate at the end
const DutyBar = ({ label, parts, pct, colors, maxPct, faded, rateClass }: { label: string; parts: RatePart[]; pct: number; colors: Record<string, string>; maxPct: number; faded?: boolean; rateClass: string }) => (
  <span className="grid grid-cols-[3.5rem_minmax(0,1fr)_3.75rem] items-center gap-3">
    <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/60">{label}</span>
    <span className={faded ? "opacity-60" : ""}>
      <StackedBar
        parts={parts.map((p) => ({ label: p.key, amount: p.pct, color: colors[p.key] }))}
        formatValue={formatRate}
        size="xs"
        shape="pill"
        fill={maxPct > 0 ? Math.max(pct / maxPct, pct > 0 ? 0.02 : 0) : 0}
        legend={false}
      />
    </span>
    <span className={`text-right tabular-nums ${rateClass}`}>{formatRate(pct)}</span>
  </span>
);

// The duty the day before and from the change, as two bars on one scale, then what's in the
// second: what the action adds marked new, what it ends struck
const BeforeAfter = ({ r, colors, maxPct }: { r: RowData; colors: Record<string, string>; maxPct: number }) => {
  const { impact, group } = r;
  const tone = group === "up" ? "text-error" : group === "down" ? "text-success" : "text-base-content";
  return (
    <span className="flex min-w-0 flex-col gap-1.5">
      {r.beforeParts ? (
        <>
          <DutyBar label="Before" parts={r.beforeParts} pct={impact.beforePct!} colors={colors} maxPct={maxPct} faded rateClass="text-sm text-base-content/60" />
          <DutyBar label={impact.date ? day(impact.date, false) : "After"} parts={r.parts} pct={impact.afterPct!} colors={colors} maxPct={maxPct} rateClass={`${tt.display} text-base font-semibold ${tone}`} />
        </>
      ) : (
        <>
          <DutyBar label="Today" parts={r.parts} pct={r.product.totalPct} colors={colors} maxPct={maxPct} rateClass={`${tt.display} text-base font-semibold text-base-content`} />
          {/* No "after" yet: the new rate isn't in the HTS, so it can't be worked out */}
          <span className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/60">After</span>
            <span className="text-xs text-base-content/60">{r.impact.level === "possible" ? "Most likely unchanged" : "Known once it's in the HTS; we'll alert you"}</span>
          </span>
        </>
      )}
      <span className="flex flex-wrap gap-x-3 gap-y-1 pl-17 text-xs text-base-content/70">
        {r.parts.length === 0 && <span className="text-base-content/60">Duty free</span>}
        {r.parts.map((p) => (
          <span key={p.key} className="inline-flex items-center gap-1.5 whitespace-nowrap" title={p.key}>
            {/* Tariff color (DESIGN_SYSTEM §10) */}
            <span className="h-2 w-2 rounded-xs" style={{ background: colors[p.key] }} aria-hidden />
            <span className={r.added.has(p.key) ? "font-semibold text-error" : ""}>{p.key === BASE_PART ? "Base" : shortProgram(p.key)}</span>
            <span className="font-semibold tabular-nums text-base-content">{formatRate(p.pct)}</span>
            {r.added.has(p.key) && <span className="text-[10px] font-bold uppercase tracking-wide text-error">New</span>}
          </span>
        ))}
        {r.ended.map((key) => (
          <span key={key} className="inline-flex items-center gap-1.5 whitespace-nowrap text-success">
            <span className="line-through">{shortProgram(key)}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">Ends</span>
          </span>
        ))}
      </span>
    </span>
  );
};

interface RowData {
  impact: ImportImpact;
  product: TrackedProduct;
  group: ImpactGroup;
  parts: RatePart[];
  // The day before, when it's confirmed
  beforeParts: RatePart[] | null;
  added: Set<string>;
  ended: string[];
  pct: number;
  // Why it's in the list, in a few words
  why: string;
}

// Why an action touches an import: the tariff it starts, ends or changes on it, the code or
// country its scope names, or the answer it depends on
const whyOf = (impact: ImportImpact, product: TrackedProduct, scope: UpdateScope) => {
  const country = product.entry.country.name;
  // The duty lines it starts or ends, by name and number, from the day before to the day of it
  const lines = (side: DutyAt | null) => (side ? linesOf(side).filter((l) => l.code !== "BASE") : []);
  const before = lines(impact.before);
  const after = lines(impact.after);
  const named = (l: Line) => `${l.name} (${l.code})`;
  const started = after.filter((l) => !before.some((b) => b.code === l.code));
  const stopped = before.filter((l) => !after.some((a) => a.code === l.code));
  const same = Math.abs(rateChange(impact)) < 0.005;
  switch (impact.reason) {
    case "starts":
    case "ends":
    case "changes": {
      const parts = [
        started.length ? `${started.map(named).join(" and ")} now ${started.length === 1 ? "applies" : "apply"}` : null,
        stopped.length ? `${stopped.map(named).join(" and ")} no longer ${stopped.length === 1 ? "applies" : "apply"}` : null,
      ].filter(Boolean);
      const what = parts.length ? parts.join("; ") : "The rate of a tariff on it changes";
      return same ? `${what}, at the same duty` : what;
    }
    case "ban":
      return "An import ban starts on goods like it";
    case "answer":
      return "It may apply, depending on an answer about your goods";
    case "named": {
      if (scope.allProducts) return `It covers every product from ${country}`;
      const prefix = namingPrefix(scope, product.entry.element.htsno);
      return prefix ? `It names ${formatPrefix(prefix)}${prefix.replace(/\D/g, "").length < 10 ? ", which includes your code" : ""}, from ${country}` : `It names your code, from ${country}`;
    }
    case "country":
      return `It names ${country}, but not this code`;
  }
};

const Row = ({ r, colors, maxPct, today }: { r: RowData; colors: Record<string, string>; maxPct: number; today: string }) => {
  const [open, setOpen] = useState(false);
  const { openProduct } = useTrackerNav();
  const { impact, product } = r;
  const confirmed = impact.level === "confirmed";
  const future = confirmed && !!impact.date && impact.date > today;
  const delta = rateChange(impact);
  return (
    <li className="border-t border-base-300 first:border-t-0">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`${GRID} w-full px-6 py-4 text-left transition-colors hover:bg-tt-soft`}>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="flex min-w-0 items-baseline gap-2 text-sm">
            <span className="font-semibold tabular-nums text-base-content">{product.entry.element.htsno}</span>
            <span className="truncate text-base-content/70">
              <span aria-hidden>{product.entry.country.flag}</span> {product.entry.country.name}
            </span>
          </span>
          <span className="line-clamp-1 text-xs text-base-content/60">{product.description}</span>
          <span className="mt-1 text-xs font-medium text-base-content/80">
            <span className="text-base-content/50">Why: </span>
            {r.why}
          </span>
        </span>
        <BeforeAfter r={r} colors={colors} maxPct={maxPct} />
        <span className="flex flex-col items-end gap-1">
          {confirmed && impact.reason === "ban" ? (
            <span className={tt.chip("error")}>Import ban</span>
          ) : confirmed && Math.abs(delta) > 0.005 ? (
            <>
              <span className={`${tt.chip(delta > 0 ? "error" : "success")} tabular-nums`}>{signedRate(delta)}</span>
              <span className="text-xs text-base-content/60">duty rate</span>
            </>
          ) : confirmed ? (
            <>
              <span className={tt.chip()}>Same duty</span>
              <span className="text-xs text-base-content/60">New number</span>
            </>
          ) : impact.level === "likely" ? (
            <span className={tt.chip("warning")}>May apply</span>
          ) : (
            <span className="text-xs text-base-content/60">Country only</span>
          )}
          {future && <span className="text-xs font-semibold text-warning">From {day(impact.date!, false)}</span>}
        </span>
        <ChevronRightIcon className={`h-5 w-5 text-base-content/50 transition-transform ${open ? "rotate-90" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="grid gap-6 border-t border-base-300 bg-tt-soft/60 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-base-content">{r.why}.</p>
            <p className="text-sm text-base-content/70">
              {confirmed &&
                impact.reason !== "ban" &&
                "Worked out by the duty engine on your saved shipment details, the day before and the day it changes."}
              {impact.reason === "ban" && "From that day these goods can't be entered, unless an exception applies to them."}
              {impact.reason === "named" && "Its scope names this code and country. We'll confirm the exact duty once the change is in the HTS, and alert you."}
              {impact.reason === "answer" && "The duty engine has this tariff; whether it applies depends on an answer about your goods."}
              {impact.reason === "country" && "The scope doesn't name this code. Worth a look if your goods could fall under it."}
            </p>
            <button type="button" className={`${ui.button({ variant: "secondary", size: "sm" })} self-start`} onClick={() => openProduct(product.key, false, "duty")}>
              {impact.reason === "answer" ? "Answer it on the import's page" : "Open this import"}
            </button>
          </div>
          {impact.before && impact.after && impact.reason !== "ban" ? <DutyDiff impact={impact} customsValue={product.customsValue} /> : <div />}
        </div>
      )}
    </li>
  );
};

const groupRank: Record<ImpactGroup, number> = { up: 0, down: 1, same: 2, likely: 3, possible: 4 };

// The three groups, in order, with what each means
const GROUPS: { id: ImportImpact["level"]; title: string; body: string }[] = [
  { id: "confirmed", title: "Duty Changes", body: "Worked out on each import the day before and the day it takes effect." },
  {
    id: "likely",
    title: "May Apply",
    body: "It names these imports' codes and countries, but its new rate isn't in the HTS yet. We'll work out each one once it is, and alert you.",
  },
  { id: "possible", title: "Same Country, Other Products", body: "It names their country but not their codes, so it most likely doesn't apply to them." },
];

export const ImpactImports = ({
  update,
  impacts,
  today,
  country,
  onClearCountry,
  checking,
}: {
  // Whether any import is checked against actions (signed out or with none tracked, there are none)
  checking: boolean;
  update: TrackerUpdate;
  impacts: ImportImpact[];
  today: string;
  country: string | null;
  onClearCountry: () => void;
}) => {
  const { products } = useTracker();
  const byKey = useMemo(() => new Map(products.map((p) => [p.key, p])), [products]);
  const scope = useMemo(() => scopeOf(update), [update]);
  const [query, setQuery] = useState("");
  // The country-only group is folded away until asked for
  const [showPossible, setShowPossible] = useState(false);

  // Every row's tariffs after the change (or today, when it isn't confirmed), what changed and why
  const all: RowData[] = useMemo(
    () =>
      impacts.flatMap((impact) => {
        const product = byKey.get(impact.key);
        if (!product) return [];
        const confirmed = impact.level === "confirmed" && !!impact.after && !!impact.before;
        const parts = confirmed ? rateParts(impact.after!.result, product.customsValue) : product.parts;
        const beforeParts = confirmed ? rateParts(impact.before!.result, product.customsValue) : null;
        const before = (beforeParts ?? []).map((p) => p.key);
        const after = new Set(parts.map((p) => p.key));
        const added = confirmed ? parts.map((p) => p.key).filter((k) => !before.includes(k)) : [];
        const ended = before.filter((k) => !after.has(k));
        return [
          {
            impact,
            product,
            group: groupOf(impact),
            parts,
            beforeParts,
            added: new Set(added),
            ended,
            pct: confirmed ? Math.max(impact.afterPct!, impact.beforePct!) : product.totalPct,
            why: whyOf(impact, product, scope),
          },
        ];
      }),
    [impacts, byKey, scope]
  );
  const colors = useMemo(() => partColors(Array.from(new Set(all.flatMap((r) => [...r.parts.map((p) => p.key), ...r.ended])))), [all]);
  const maxPct = Math.max(0, ...all.map((r) => r.pct));

  const rows = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return all
      .filter(({ product }) => {
        if (country && product.entry.country.code !== country) return false;
        const text = `${product.description} ${product.entry.element.htsno} ${product.entry.country.name}`.toLowerCase();
        return words.every((w) => text.includes(w));
      })
      .sort((a, b) => groupRank[a.group] - groupRank[b.group] || Math.abs(rateChange(b.impact)) - Math.abs(rateChange(a.impact)));
  }, [all, query, country]);

  const countryName = country ? products.find((p) => p.entry.country.code === country)?.entry.country.name : null;
  const affected = all.filter((r) => r.impact.level !== "possible").length;

  return (
    <section className={`${tt.panel} overflow-hidden`} aria-labelledby="tt-impact-imports-title" id="tt-impact-imports-list">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-4 pt-5">
        <div className="min-w-0">
          <h3 id="tt-impact-imports-title" className={tt.moduleTitle}>
            Your Imports It Touches
          </h3>
          <p className={`${tt.subtitle} m-0 mt-0.5`}>
            {affected ? `${affected} ${affected === 1 ? "import" : "imports"} affected or may be` : "None of your imports are affected"}
            {all.length > affected ? `, and ${all.length - affected} from a country it names` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {country && (
            <button type="button" className={tt.chip("primary")} onClick={onClearCountry} title="Show every country">
              From {countryName ?? country} ✕
            </button>
          )}
          {all.length > 4 && (
            <label className="relative w-64 max-w-full">
              <span className="sr-only">Search these imports</span>
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/50" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search code, product or country"
                className="h-9 w-full rounded-full border border-base-300 bg-tt-soft pl-10 pr-3 text-sm text-base-content placeholder:text-base-content/50 focus:border-primary focus:bg-base-100 focus:outline-hidden"
              />
            </label>
          )}
        </div>
      </div>
      {!rows.length ? (
        <p className="m-0 border-t border-base-300 px-6 py-10 text-center text-sm text-base-content/60">
          {query || country
            ? "No imports match."
            : checking
              ? "This action doesn't name any of your imports' codes or countries."
              : "Turn on alerts for your imports to check each action against them."}
        </p>
      ) : (
        GROUPS.map((g) => {
          const groupRows = rows.filter((r) => r.impact.level === g.id);
          if (!groupRows.length) return null;
          const folded = g.id === "possible" && !showPossible && !query;
          return (
            <section key={g.id} className="border-t border-base-300" aria-label={g.title}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-tt-soft/60 px-6 py-3">
                <div className="min-w-0">
                  <h4 className={`${tt.sectionTitle} inline`}>{g.title}</h4>
                  <span className="ml-2 text-sm tabular-nums text-base-content/60">{groupRows.length}</span>
                  <p className={`${tt.caption} m-0 mt-0.5`}>{g.body}</p>
                </div>
                {g.id === "possible" && !query && (
                  <button type="button" className={`${ui.link} text-sm`} onClick={() => setShowPossible((v) => !v)}>
                    {showPossible ? "Hide them" : "Show them"}
                  </button>
                )}
              </div>
              {!folded && (
                <ul className="m-0 list-none border-t border-base-300 p-0">
                  {groupRows.map((r) => (
                    <Row key={r.impact.key} r={r} colors={colors} maxPct={maxPct} today={today} />
                  ))}
                </ul>
              )}
            </section>
          );
        })
      )}
    </section>
  );
};
