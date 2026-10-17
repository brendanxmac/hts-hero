"use client";

import { ReactNode } from "react";
import { ArrowRightIcon, ArrowTrendingDownIcon, CalendarDaysIcon, CheckBadgeIcon, CheckCircleIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import { TimeStepChart } from "@/components/ui/charts/kit";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { NEWS_DOTS, newsToneOf } from "@/components/tariff-tracker/news/tone";
import { shortDate } from "../rate-history/format";
import { formatMoney, formatPct } from "../lib/format";
import { onShipment } from "../lib/valueBasis";
import { Overview } from "./useOverview";

// The parts of a tariff's Overview tab: the rate and its story in plain English, where the rate
// comes from (each tariff and why it applies), what could make it lower, its duty history, and
// news about it. Rates lead and dollars follow; savings are always "could" (the importer may not
// qualify).

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

// ── Could you pay less ──

// Nothing could lower it: good news, said so (green is money and done here), at the height of the
// options it stands in for, so the two halves still line up
const AllGood = ({ title, body }: { title: string; body: string }) => (
  <div className="flex min-h-[4.75rem] items-center gap-3 rounded-xl bg-success/10 px-4 py-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-success-content" aria-hidden>
      <CheckBadgeIcon className="h-5 w-5" />
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-base-content">{title}</span>
      <span className="block text-xs text-base-content/70">{body}</span>
    </span>
  </div>
);

// One option, an adjustment or a country: a row between thin rules, at least two lines of title
// tall, so the two lists beside each other line up row for row
const TILE = "flex min-h-[4.75rem] items-center gap-2.5 py-2.5";
const OPTIONS = "m-0 flex list-none flex-col divide-y divide-base-300 border-y border-base-300 p-0";

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
  // What the user already claims: programs, confirmed exemptions, yes answers
  const applied = o.on.filter((a) => a.byYou);
  return (
    <div className={wide ? "grid gap-x-10 gap-y-6 lg:grid-cols-2" : "flex flex-col gap-4"}>
      <div className="flex flex-col gap-2">
        {applied.length > 0 && (
          <>
            <span className={tt.eyebrow("primary")}>Already applied</span>
            <ul className={`${OPTIONS} mb-3`}>
              {applied.map((a) => (
                <li key={a.title} className={TILE}>
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-semibold text-base-content" title={a.title}>
                      {a.title}
                    </span>
                    <span className="block truncate text-xs text-base-content/70" title={a.detail}>
                      {a.detail}
                    </span>
                  </span>
                  {a.pct !== undefined && Math.abs(a.pct) >= 0.005 && (
                    <span className={`shrink-0 text-right text-sm font-semibold tabular-nums ${a.pct < 0 ? "text-success" : "text-error"}`}>
                      {a.pct < 0 ? "−" : "+"}
                      {pct(Math.abs(a.pct))}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
        <span className={tt.eyebrow("success")}>{applied.length ? "More that could lower it" : "Adjustments that could lower it"}</span>
        {savings.length ? (
          <ul className={OPTIONS}>
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
          <AllGood
            title="You're not leaving money on the table"
            body={
              applied.length
                ? "You're already claiming what applies, and nothing else we checked would lower this duty."
                : "We checked every exemption and trade program for this import: none would lower this duty."
            }
          />
        )}
        {o.savings.length > 1 && <p className="m-0 text-xs text-base-content/60">Each works on its own; some lift the same tariff, so they may not add up.</p>}
        {onSavings && <DetailsLink label="Find exemptions and savings" onClick={onSavings} />}
      </div>

      <div className="flex flex-col gap-2">
        <span className={tt.eyebrow("success")}>Cheaper countries that already ship it</span>
        {o.cheaper === null ? (
          <div className={`${ui.skeleton} h-16 w-full`} />
        ) : o.cheaper.length ? (
          // The same rows as the adjustments beside them: the country, what it already ships to
          // the US, and its rate with how much lower it is than yours
          <ul className={OPTIONS}>
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
          <AllGood title="You already pay the lowest rate" body="None of the largest US suppliers of this product pays less duty than you do. Great sourcing." />
        )}
        {onSourcing && <DetailsLink label="Compare sourcing countries" onClick={onSourcing} />}
      </div>
    </div>
  );
};

// ── Duty history ──

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

// ── News about this import ──

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
      <AllGood title="All quiet: no news about this import" body="No tariff action in the last 45 days names this product or its country of origin." />
    )}
    {o.waiting > 0 && (
      <p className="m-0 text-sm text-base-content/70">
        <b className="text-base-content">{o.waiting}</b> {o.waiting === 1 ? "tariff depends" : "tariffs depend"} on answers about your goods (Possible Adjustments on the Duty tab).
      </p>
    )}
  </div>
);

// ── The Overview tab's top: the answer on the left, where the rate comes from on the right ──

// The rate, big, then the whole story in plain English: what's due on this shipment, where most of
// it comes from, how it has moved, and how much lower it could be (always "could")
export const Headline = ({ o }: { o: Overview }) => {
  const best = o.savings[0];
  const cheapest = o.cheaper?.[0];
  const top = o.charges.filter((c) => c.usd > 0.005 && c.code !== "BASE").sort((a, b) => b.pct - a.pct)[0];
  const strong = (text: string, tone = "text-base-content") => <b className={tone}>{text}</b>;
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className={tt.eyebrow("primary")}>Duty rate</span>
        <div className={`${tt.display} text-7xl font-semibold leading-none tracking-tight tabular-nums text-base-content`}>{pct(o.ratePct)}</div>
      </div>
      <div className="flex flex-col gap-2.5 text-[0.9375rem] leading-relaxed text-base-content/80">
        <p className="m-0">
          {o.duty > 0.005 ? (
            <>
              You pay {strong(formatMoney(o.duty))} in duty {onShipment(o.value)}. With {formatMoney(o.fees)} in customs fees, {strong(formatMoney(o.duty + o.fees))} is due at
              entry.
            </>
          ) : (
            <>
              This import comes in {strong("duty free", "text-success")}; only {formatMoney(o.fees)} in customs fees is due at entry, {onShipment(o.value)}.
            </>
          )}
          {top && top.pct > o.ratePct / 2 && (
            <>
              {" "}
              Most of the rate, {strong(pct(top.pct))}, comes from {strong(top.name)}.
            </>
          )}
        </p>
        {o.history && (
          <p className="m-0">
            {o.ratePct < o.history.fromPct ? (
              <>It&apos;s {strong("down", "text-success")} from</>
            ) : o.ratePct > o.history.fromPct ? (
              <>It&apos;s {strong("up", "text-error")} from</>
            ) : (
              <>It&apos;s back to where it was,</>
            )}{" "}
            {pct(o.history.fromPct)} on {shortDate(o.history.fromDate, true)}, after {o.changes === 1 ? "one change" : `${o.changes} changes`}.
          </p>
        )}
        {!best && o.cheaper !== null && !cheapest && (
          <p className="m-0">
            {strong("Nothing we checked would lower it:", "text-success")} you&apos;re already paying the lowest duty we can find.
          </p>
        )}
        {(best || cheapest) && (
          <p className="m-0">
            It could be {strong(`up to ${pct(Math.max(best?.pct ?? 0, cheapest ? o.ratePct - cheapest.pct : 0))} lower`, "text-success")}
            {best && cheapest ? " if your goods qualify for an exemption, or if you source from a cheaper country" : best ? " if your goods qualify" : " if you source from a cheaper country"}.
          </p>
        )}
      </div>
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
