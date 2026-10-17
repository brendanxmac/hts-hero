"use client";

import { ReactNode } from "react";
import { ArrowRightIcon, ArrowTrendingDownIcon, CalendarDaysIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import { TimeStepChart } from "@/components/ui/charts/kit";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { NEWS_DOTS, newsToneOf } from "@/components/tariff-tracker/news/tone";
import { shortDate } from "../rate-history/format";
import { formatMoney, formatPct } from "../lib/format";
import { onShipment } from "../lib/valueBasis";
import { Overview } from "./useOverview";

// The parts of a tariff's overview, shared by the Overview tab (roomy, side by side) and the
// Explain drawer (stacked, `compact`): the answer with its big numbers, why each tariff applies,
// what could make it lower, how it has moved, and what to watch. Rates lead and dollars follow;
// savings are always "could" (the importer may not qualify).

export type OverviewTab = "duty" | "compare" | "history";

export const pct = (n: number) => (n < 0.005 ? "Free" : formatPct(Math.round(n * 100) / 100));

// "$41M", "$860K"
const compactUsd = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${Math.round(n / 1e6)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${Math.round(n)}`;

// A part's heading: title, what it's about, and the way to its details
export const PartHeader = ({ title, hint, link }: { title: string; hint?: string; link?: ReactNode }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <h3 className={tt.title}>{title}</h3>
      {hint && <p className={tt.subtitle}>{hint}</p>}
    </div>
    {link}
  </div>
);

export const DetailsLink = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className={`${ui.link} inline-flex shrink-0 items-center gap-1 self-start text-sm`}>
    {label}
    <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
  </button>
);

// ── The answer ──

export const Answer = ({ o, colors, compact = false }: { o: Overview; colors: Record<string, string>; compact?: boolean }) => {
  const charged = o.charges.filter((c) => c.usd > 0.005).sort((a, b) => b.pct - a.pct);
  const top = charged.find((c) => c.code !== "BASE");
  const best = o.savings[0];
  return (
    <div className="flex flex-col gap-5">
      <div className={`flex flex-col gap-4 ${compact ? "" : "lg:flex-row lg:items-end lg:gap-10"}`}>
        <div className="shrink-0">
          <span className={tt.eyebrow("primary")}>Duty rate</span>
          <div className={`${tt.display} ${compact ? "text-5xl" : "text-7xl"} font-semibold leading-none tracking-tight tabular-nums text-base-content`}>{pct(o.ratePct)}</div>
        </div>
        <p className={`m-0 ${compact ? "text-base" : "text-lg"} leading-relaxed text-base-content/80`}>
          {o.duty > 0.005 ? (
            <>
              You pay <b className="text-base-content">{formatMoney(o.duty)}</b> in duty {onShipment(o.value)}
              {top && top.pct > o.ratePct / 2 ? (
                <>
                  , mostly because of <b className="text-base-content">{top.name}</b>
                </>
              ) : null}
              . With {formatMoney(o.fees)} in customs fees, <b className="text-base-content">{formatMoney(o.duty + o.fees)}</b> is due at entry.
            </>
          ) : (
            <>
              This import comes in <b className="text-success">duty free</b>. Only {formatMoney(o.fees)} in customs fees is due at entry, {onShipment(o.value)}.
            </>
          )}
          {best && (
            <>
              {" "}
              It <b className="text-success">could be up to {pct(best.pct)} lower</b> if your goods qualify.
            </>
          )}
        </p>
      </div>

      {/* Where the rate comes from: one big bar, each part named under it */}
      {charged.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex h-5 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden>
            {charged.map((c) => (
              // Runtime share and part color (DESIGN_SYSTEM §10)
              <div key={c.code} className="h-full first:rounded-l-full last:rounded-r-full" style={{ flexGrow: c.pct, flexBasis: 4, background: colors[c.slice] }} />
            ))}
          </div>
          <ul className={`m-0 grid list-none gap-x-6 gap-y-2 p-0 ${compact ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-4"}`} aria-label="Where the rate comes from">
            {charged.map((c) => (
              <li key={c.code} className="flex min-w-0 items-baseline gap-2">
                {/* Part color (DESIGN_SYSTEM §10) */}
                <span className="h-2.5 w-2.5 shrink-0 self-center rounded-sm" style={{ background: colors[c.slice] }} aria-hidden />
                <b className={`${tt.display} tabular-nums text-base-content`}>{pct(c.pct)}</b>
                <span className="truncate text-sm text-base-content/70" title={c.name}>
                  {c.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// The headline numbers under the answer
export const Stats = ({ o, compact = false }: { o: Overview; compact?: boolean }) => {
  const best = o.savings[0];
  const cheapest = o.cheaper?.[0];
  const stats: { label: string; value: string; note: string; tone?: string }[] = [
    { label: "Due at entry", value: formatMoney(o.duty + o.fees), note: `Duty + fees, ${onShipment(o.value)}` },
    {
      label: "Rate changes",
      value: o.changes.toLocaleString("en-US"),
      note: o.history ? `Since ${shortDate(o.history.fromDate, true)}, from ${pct(o.history.fromPct)}` : "No change in the verified data",
    },
    best
      ? { label: "Could be lower", value: `up to ${pct(best.pct)}`, note: `${o.savings.length} ${o.savings.length === 1 ? "way" : "ways"}, if your goods qualify`, tone: "text-success" }
      : { label: "Could be lower", value: "—", note: "No adjustment found that lowers it" },
    cheapest
      ? { label: "Cheapest proven origin", value: pct(cheapest.pct), note: `${cheapest.country.flag} ${cheapest.country.name}, already ships it to the US`, tone: "text-success" }
      : { label: "Cheaper origins", value: o.cheaper ? "None" : "…", note: o.cheaper ? "No large US supplier pays less" : "Checking US suppliers" },
  ];
  return (
    <dl className={`m-0 grid gap-px overflow-hidden rounded-xl bg-base-300 ${compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
      {stats.map((s) => (
        <div key={s.label} className="flex min-w-0 flex-col gap-1 bg-tt-soft px-4 py-3.5">
          <dt className="text-xs font-semibold text-base-content/60">{s.label}</dt>
          <dd className={`m-0 ${tt.metricSm} ${s.tone ?? ""}`}>{s.value}</dd>
          <dd className="m-0 truncate text-xs text-base-content/60" title={s.note}>
            {s.note}
          </dd>
        </div>
      ))}
    </dl>
  );
};

// ── Why ──

export const Why = ({ o, colors, canSee, onLocked }: { o: Overview; colors: Record<string, string>; canSee: boolean; onLocked: () => void }) => {
  const charges = o.charges.filter((c) => c.usd > 0.005 || o.charges.length === 1).sort((a, b) => b.pct - a.pct);
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {charges.map((c) => (
        <li key={c.code} className="flex items-start gap-3">
          {/* Part color (DESIGN_SYSTEM §10) */}
          <span className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ background: colors[c.slice] }} aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-semibold text-base-content">{c.name}</span>
              <span className="shrink-0 tabular-nums">
                <b className="text-base-content">{pct(c.pct)}</b>
              </span>
            </span>
            {canSee ? (
              <span className="block text-sm text-base-content/70">{c.why}.</span>
            ) : (
              <button type="button" onClick={onLocked} className={`${ui.link} inline-flex items-center gap-1 text-xs`}>
                <LockClosedIcon className="h-3 w-3" aria-hidden />
                See why it applies, free
              </button>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
};

// ── Could you pay less ──

// One option, an adjustment or a country: the same green tile, at least two lines of title tall,
// so the two lists beside each other line up row for row
const TILE = "flex min-h-[4.75rem] items-center gap-2.5 rounded-xl bg-success/10 px-3.5 py-2.5";

export const PayLess = ({
  o,
  compact = false,
  onSavings,
  onSourcing,
  wide = false,
}: {
  o: Overview;
  compact?: boolean;
  // Room for the two halves side by side
  wide?: boolean;
  // Where each half leads: the Duty tab's Possible Adjustments, and Compare
  onSavings?: () => void;
  onSourcing?: () => void;
}) => {
  const savings = o.savings.slice(0, compact ? 2 : 3);
  return (
    <div className={wide ? "grid gap-x-10 gap-y-6 lg:grid-cols-2" : "flex flex-col gap-4"}>
      <div className="flex flex-col gap-2">
        <span className={tt.eyebrow("success")}>Adjustments that could lower it</span>
        {savings.length ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {savings.map((s) => (
              <li key={s.title} className={TILE}>
                <ArrowTrendingDownIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-semibold text-base-content" title={s.title}>
                    {s.title}
                  </span>
                  <span className="block text-xs text-base-content/70">{s.how}</span>
                </span>
                <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-success">up to −{pct(s.pct)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-sm text-base-content/70">No adjustment we checked would lower this duty.</p>
        )}
        {o.savings.length > 1 && <p className="m-0 text-xs text-base-content/60">Each works on its own; some lift the same tariff, so they may not add up.</p>}
        {onSavings && <DetailsLink label="Find exemptions and savings" onClick={onSavings} />}
      </div>

      <div className="flex flex-col gap-2">
        <span className={tt.eyebrow("success")}>Cheaper countries that already ship it</span>
        {o.cheaper === null ? (
          <div className={`${ui.skeleton} h-16 w-full`} />
        ) : o.cheaper.length ? (
          // The same tiles as the adjustments beside them: the country, what it already ships to
          // the US, and its rate with how much lower it is than yours
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {o.cheaper.map((c) => (
              <li key={c.country.code} className={TILE}>
                <span className="mt-px text-base leading-none" aria-hidden>
                  {c.country.flag}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-semibold text-base-content">{c.country.name}</span>
                  <span className="block truncate text-xs text-base-content/70" title={c.agreement ? `With ${c.agreement}` : undefined}>
                    {compactUsd(c.value)} a year to the US{c.share >= 0.01 ? ` (${Math.round(c.share * 100)}%)` : ""}
                    {c.agreement ? ` · with ${c.agreement}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-right tabular-nums">
                  <span className="block text-sm font-semibold text-success">{pct(c.pct)}</span>
                  <span className="block text-xs text-base-content/60">−{pct(o.ratePct - c.pct)} vs yours</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-sm text-base-content/70">None of the largest US suppliers of this product pays less duty.</p>
        )}
        {onSourcing && <DetailsLink label="Compare sourcing countries" onClick={onSourcing} />}
      </div>
    </div>
  );
};

// ── How it's moved ──

export const Moved = ({ o, compact = false }: { o: Overview; compact?: boolean }) => (
  <div className="flex flex-col gap-3">
    <p className="m-0 text-sm text-base-content/80">
      {o.history ? (
        <>
          The rate was <b className="text-base-content">{pct(o.history.fromPct)}</b> on {shortDate(o.history.fromDate, true)} and is{" "}
          <b className={o.ratePct > o.history.fromPct ? "text-error" : "text-success"}>{pct(o.ratePct)}</b> today, after {o.changes}{" "}
          {o.changes === 1 ? "change" : "changes"}.
        </>
      ) : (
        <>The rate hasn&apos;t changed in the verified tariff data.</>
      )}
    </p>
    {o.steps.length > 0 && (
      <TimeStepChart
        steps={o.steps}
        to={new Date().toISOString().slice(0, 10)}
        format={pct}
        formatDate={(d) => shortDate(d, true)}
        valueLabel="Duty rate"
        height={compact ? 130 : 180}
        label={`Duty rate over time, ${pct(o.ratePct)} today`}
      />
    )}
    {o.scheduled && (
      <p className="m-0 flex items-center gap-2 rounded-xl bg-warning/10 px-3.5 py-2.5 text-sm text-base-content">
        <CalendarDaysIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden />
        <span>
          Scheduled: goes to <b>{pct(o.scheduled.pct)}</b> on {shortDate(o.scheduled.date, true)}.
        </span>
      </p>
    )}
  </div>
);

// ── What to watch ──

export const Watch = ({ o }: { o: Overview }) => (
  <div className="flex flex-col gap-3">
    {o.news === null ? (
      <div className={`${ui.skeleton} h-16 w-full`} />
    ) : o.news.length ? (
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {o.news.map((n) => (
          <li key={n.slug} className="flex items-start gap-2.5">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${NEWS_DOTS[newsToneOf(n.kind)]}`} aria-hidden />
            <span className="min-w-0">
              <a href={`/tariff-updates/${n.slug}`} target="_blank" rel="noopener" className="line-clamp-2 text-sm font-medium text-base-content hover:text-primary hover:underline">
                {n.title}
              </a>
              <span className="text-xs text-base-content/60">
                {shortDate(n.date, true)} · {n.level === "likely" ? "Names this code and country" : "Names this country"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="m-0 text-sm text-base-content/70">No tariff news in the last 45 days names this product or country.</p>
    )}
    {o.waiting > 0 && (
      <p className="m-0 text-sm text-base-content/70">
        <b className="text-base-content">{o.waiting}</b> {o.waiting === 1 ? "tariff depends" : "tariffs depend"} on answers about your goods (Possible Adjustments on the Duty tab).
      </p>
    )}
  </div>
);

// ── The Overview tab's top: the answer on the left, where the rate comes from on the right ──

// The rate, big, with two short lines and three headline numbers under it
export const Headline = ({ o }: { o: Overview }) => {
  const best = o.savings[0];
  const cheapest = o.cheaper?.[0];
  const facts: { label: string; value: string; note: string; tone?: string }[] = [
    {
      label: "Rate changes",
      value: o.changes.toLocaleString("en-US"),
      note: o.history ? `Since ${shortDate(o.history.fromDate, true)}` : "None in the verified data",
    },
    best
      ? { label: "Could be lower", value: `up to ${pct(best.pct)}`, note: "If your goods qualify", tone: "text-success" }
      : { label: "Could be lower", value: "—", note: "No adjustment found" },
    cheapest
      ? { label: "Cheapest supplier", value: pct(cheapest.pct), note: `${cheapest.country.flag} ${cheapest.country.name}`, tone: "text-success" }
      : { label: "Cheapest supplier", value: o.cheaper ? "—" : "…", note: o.cheaper ? "None pays less" : "Checking US suppliers" },
  ];
  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className={tt.eyebrow("primary")}>Duty rate</span>
        <div className={`${tt.display} text-7xl font-semibold leading-none tracking-tight tabular-nums text-base-content`}>{pct(o.ratePct)}</div>
        <p className="m-0 mt-1 text-base text-base-content/80">
          {o.duty > 0.005 ? (
            <>
              <b className="text-base-content">{formatMoney(o.duty)}</b> in duty {onShipment(o.value)}
            </>
          ) : (
            <>
              <b className="text-success">Duty free</b> {onShipment(o.value)}
            </>
          )}
        </p>
        <p className="m-0 text-sm text-base-content/60">
          {formatMoney(o.duty + o.fees)} due at entry, with {formatMoney(o.fees)} in customs fees
        </p>
      </div>
      <dl className="m-0 mt-auto grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-base-300">
        {facts.map((f) => (
          <div key={f.label} className="flex min-w-0 flex-col gap-1 bg-tt-soft px-3.5 py-3">
            <dt className="text-xs font-semibold text-base-content/60">{f.label}</dt>
            <dd className={`m-0 ${tt.metricSm} ${f.tone ?? ""}`}>{f.value}</dd>
            <dd className="m-0 truncate text-xs text-base-content/60" title={f.note}>
              {f.note}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

// Where the rate comes from: one bar, then each tariff on a row of its own (its rate, its name, and
// why it applies in a few words), biggest first
export const RateSources = ({ o, colors, canSee, onLocked }: { o: Overview; colors: Record<string, string>; canSee: boolean; onLocked: () => void }) => {
  const charges = o.charges.filter((c) => c.usd > 0.005 || o.charges.length === 1).sort((a, b) => b.pct - a.pct);
  const charged = charges.filter((c) => c.usd > 0.005);
  return (
    <div className="flex flex-col gap-4">
      {charged.length > 0 && (
        <div className="flex h-4 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden>
          {charged.map((c) => (
            // Runtime share and part color (DESIGN_SYSTEM §10)
            <div key={c.code} className="h-full first:rounded-l-full last:rounded-r-full" style={{ flexGrow: c.pct, flexBasis: 4, background: colors[c.slice] }} />
          ))}
        </div>
      )}
      <ul className="m-0 flex list-none flex-col p-0">
        {charges.map((c) => (
          <li key={c.code} className="grid grid-cols-[0.75rem_4.5rem_minmax(0,1fr)] items-baseline gap-x-3 border-t border-base-300 py-3 first:border-t-0 first:pt-0">
            {/* Part color (DESIGN_SYSTEM §10) */}
            <span className="h-3 w-3 self-center rounded-sm" style={{ background: colors[c.slice] }} aria-hidden />
            <span className={`${tt.display} text-xl font-semibold tabular-nums text-base-content`}>{pct(c.pct)}</span>
            <span className="min-w-0">
              <span className="block font-semibold text-base-content">{c.name}</span>
              {canSee ? (
                <span className="block text-sm text-base-content/70">{c.why}</span>
              ) : (
                <button type="button" onClick={onLocked} className={`${ui.link} inline-flex items-center gap-1 text-xs`}>
                  <LockClosedIcon className="h-3 w-3" aria-hidden />
                  See why it applies, free
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
