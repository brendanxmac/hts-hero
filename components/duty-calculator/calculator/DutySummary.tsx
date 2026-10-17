"use client";

import { ReactNode } from "react";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, CheckCircleIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { useCardClass } from "@/components/ui/Card";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { formatDate, formatMoney, formatPct } from "../lib/format";
import { glance } from "../lib/summary";
import { TariffFinder } from "../lib/useTariffFinder";
import { slices } from "../results/slices";
import { useCanSeeWhy } from "./WhyGate";

// The duty breakdown at a glance (glance in lib/summary), shown on request from the results'
// header ("Summarize") above the totals. The answer first, as a rate, then four short blocks a
// reader can scan: what's charged (each with a few words on why), what could lower it (always
// "could": the importer may not qualify), what's switched on, and what's good to know. Rates lead
// and dollars follow. It takes a free account (the "why" is the product's edge), and isn't
// rendered for anyone signed out: "Summarize" opens the pitch instead.

const pct = (n: number) => (n < 0.005 ? "Free" : formatPct(Math.round(n * 100) / 100));

// Savings shown before "and N more"
const SAVINGS_SHOWN = 3;

// A block's small heading, in the color of what it's about
const Block = ({ title, tone, children }: { title: string; tone: "primary" | "success" | "neutral"; children: ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-2.5">
    <h4 className={`m-0 ${tt.eyebrow(tone)}`}>{title}</h4>
    {children}
  </div>
);

// "Summarize": the button that shows and hides it, in the results' header beside the main action.
// Nothing for anyone who can't see the explanation (signed out, the header's own "Summarize"
// opens the pitch).
export const ExplainToggle = ({ open, onToggle }: { open: boolean; onToggle: () => void }) => {
  const { canSee, loading } = useCanSeeWhy();
  if (loading || !canSee) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={open}
      className={`${ui.button({ variant: open ? "primary" : "secondary", size: "sm" })} shrink-0`}
    >
      <SparklesIcon className="h-4 w-4" aria-hidden />
      Summarize
    </button>
  );
};

export const DutySummary = ({
  f,
  result,
  onClose,
}: {
  f: TariffFinder;
  result: CalculationResult;
  onClose?: () => void;
}) => {
  const cardClass = useCardClass();
  const { canSee, loading } = useCanSeeWhy();
  if (loading || !canSee) return null;
  const g = glance(f, result);
  const colors = Object.fromEntries(slices(result).map((s) => [s.label, s.color]));
  const charged = g.charges.filter((c) => c.usd > 0.005);
  const savings = g.savings.slice(0, SAVINGS_SHOWN);
  const best = g.savings[0];

  return (
    <section className={`${cardClass} flex flex-col gap-6 px-5 py-5 sm:px-6`} aria-labelledby="duty-summary-title">
      {/* The answer */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 id="duty-summary-title" className={`m-0 flex items-center gap-1.5 ${tt.eyebrow("primary")}`}>
            <SparklesIcon className="h-3.5 w-3.5" aria-hidden />
            In plain English
          </h3>
          <p className={`${tt.display} m-0 text-2xl font-semibold leading-snug text-base-content`}>
            {g.duty > 0.005 ? (
              <>
                You pay <span className="text-primary">{pct(g.ratePct)}</span> in duty on this import
              </>
            ) : (
              "This import comes in duty free"
            )}
            {best ? (
              <span className="text-base-content/60">
                , and it could be <span className="text-success">up to {pct(best.pct)} lower</span>
              </span>
            ) : null}
            .
          </p>
          <p className="m-0 text-sm text-base-content/70">
            {formatMoney(g.duty)} on {formatMoney(g.value)}, plus {formatMoney(g.fees)} in customs fees:{" "}
            <b className="text-base-content">{formatMoney(g.duty + g.fees)} due at entry</b>
          </p>
        </div>
        {onClose && (
          <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} onClick={onClose}>
            <XMarkIcon className="h-4 w-4" aria-hidden />
            <span className="sr-only">Hide the explanation</span>
          </button>
        )}
      </div>

      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* What's charged */}
        <Block title={`What you're charged (${g.charges.filter((c) => c.usd > 0.005 || c.code === "BASE").length})`} tone="primary">
          {charged.length > 0 && (
            <StackedBar
              parts={charged.map((c) => ({ label: c.name, amount: c.pct, color: colors[c.slice] }))}
              formatValue={pct}
              size="sm"
              shape="pill"
              legend={false}
            />
          )}
          <ul className="m-0 flex list-none flex-col p-0">
            {g.charges.map((c) => (
              <li key={c.code} className="grid grid-cols-[0.625rem_minmax(0,1fr)_auto] items-start gap-x-3 border-t border-base-300 py-2.5 first:border-t-0">
                {/* Part color (DESIGN_SYSTEM §10) */}
                <span className="mt-1.5 h-2.5 w-2.5 rounded-sm" style={{ background: c.usd > 0.005 ? colors[c.slice] : undefined }} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-base-content">{c.name}</span>
                  <span className="block text-xs text-base-content/60">{c.why}</span>
                </span>
                <span className="text-right tabular-nums">
                  <span className="block text-sm font-semibold text-base-content">{pct(c.pct)}</span>
                  {c.usd > 0.005 && <span className="block text-xs text-base-content/60">{formatMoney(c.usd)}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Block>

        <div className="flex min-w-0 flex-col gap-6">
          {/* Could lower it */}
          {savings.length > 0 && (
            <Block title="Could lower it" tone="success">
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {savings.map((s) => (
                  <li key={s.title} className="flex items-start justify-between gap-3 rounded-xl bg-success/10 px-3 py-2.5">
                    <span className="flex min-w-0 items-start gap-2">
                      <ArrowTrendingDownIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-base-content">{s.title}</span>
                        <span className="block text-xs text-base-content/70">{s.how}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right tabular-nums">
                      <span className="block text-sm font-semibold text-success">up to −{pct(s.pct)}</span>
                      <span className="block text-xs text-base-content/60">{formatMoney(s.usd)}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {savings.length > 1 && <p className="m-0 text-xs text-base-content/60">Each is on its own; they may not add up, since some lift the same tariff.</p>}
              <a href="#possible-adjustments" className={`${ui.link} self-start text-xs`}>
                {g.savings.length > SAVINGS_SHOWN ? `See all ${g.savings.length} in Possible Adjustments` : "Check them in Possible Adjustments"}
              </a>
            </Block>
          )}

          {/* Switched on */}
          {g.on.length > 0 && (
            <Block title="Switched on" tone="primary">
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {g.on.map((o) => (
                  <li key={o.title} className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-base-content">{o.title}</span>
                      <span className="block text-xs text-base-content/60">{o.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {/* Good to know */}
          <Block title="Good to know" tone="neutral">
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm text-base-content/80">
              {g.history && (
                <li className="flex items-start gap-2">
                  {g.history.fromPct > g.ratePct ? (
                    <ArrowTrendingDownIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  ) : (
                    <ArrowTrendingUpIcon className="mt-0.5 h-4 w-4 shrink-0 text-error" aria-hidden />
                  )}
                  <span>
                    The rate was {pct(g.history.fromPct)} on {formatDate(g.history.fromDate)}; it&apos;s {pct(g.ratePct)} now.
                  </span>
                </li>
              )}
              {g.ruledOut > 0 && (
                <li>
                  {g.ruledOut} other {g.ruledOut === 1 ? "tariff was" : "tariffs were"} checked and {g.ruledOut === 1 ? "doesn't" : "don't"} apply
                  {g.waiting > 0 ? `; ${g.waiting} of them depend on your answers in Possible Adjustments` : ""}.
                </li>
              )}
              <li>Rates are a share of the customs value; fees are on top.</li>
            </ul>
          </Block>
        </div>
      </div>
    </section>
  );
};
