"use client";

import { ArrowRightIcon, ArrowTrendingDownIcon, CheckCircleIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { formatDate, formatPct } from "../lib/format";
import { glance } from "../lib/summary";
import { TariffFinder } from "../lib/useTariffFinder";
import { slices } from "../results/slices";
import { useCanSeeWhy } from "./WhyGate";

// The duty breakdown at a glance (glance in lib/summary), shown on request from the results'
// header ("Summarize"), right above the totals, the cost bar and the duty lines, so it repeats
// none of them (no dollars, no bar): the answer as a rate in one sentence, why each charge
// applies in a line each, the best way it could be lower (always "could": the importer may not
// qualify) and what's switched on, then a line on how the rate has moved and what else was
// checked. Every block is labeled, with what its numbers are, so it reads on its own. Each charge
// keeps its color from the bar below. It takes a free account (the "why" is the product's edge),
// and isn't rendered for anyone signed out: "Summarize" opens the pitch instead.

const pct = (n: number) => (n < 0.005 ? "Free" : formatPct(Math.round(n * 100) / 100));

// A charge's row: color, rate, then its name and why
const ROW = "grid grid-cols-[0.5rem_3.25rem_minmax(0,1fr)] items-baseline gap-x-2.5 text-sm";

// A block's small heading, with what its numbers are on the right
const Label = ({ title, hint, tone = "neutral" }: { title: string; hint: string; tone?: "neutral" | "success" }) => (
  <div className="flex items-baseline justify-between gap-3">
    <h4 className={`m-0 ${tt.eyebrow(tone)}`}>{title}</h4>
    <span className="text-xs text-base-content/50">{hint}</span>
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
  const { canSee, loading } = useCanSeeWhy();
  if (loading || !canSee) return null;
  const g = glance(f, result);
  const colors = Object.fromEntries(slices(result).map((s) => [s.label, s.color]));
  // Base duty only when it's charged, or when nothing else is
  const charges = g.charges.filter((c) => c.usd > 0.005 || g.charges.length === 1).sort((a, b) => b.pct - a.pct);
  const best = g.savings[0];
  const top = charges.filter((c) => c.code !== "BASE")[0];
  return (
    <section className={`${ui.cardSection} flex flex-col gap-4 border-b border-base-300`} aria-labelledby="duty-summary-title">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 id="duty-summary-title" className={`m-0 flex items-center gap-1.5 ${tt.eyebrow("primary")}`}>
            <SparklesIcon className="h-3.5 w-3.5" aria-hidden />
            In plain English
          </h3>
          {/* The answer, as a story sentence with its numbers in chips */}
          <p className={`${tt.display} m-0 text-lg font-semibold leading-relaxed text-base-content`}>
            {g.duty > 0.005 ? (
              <>
                You pay <span className={tt.numberChip("primary")}>{pct(g.ratePct)}</span> in duty
                {top && top.pct > g.ratePct / 2 ? (
                  <>
                    , mostly from <span className="whitespace-nowrap">{top.name}</span>
                  </>
                ) : null}
                .
              </>
            ) : (
              "This import comes in duty free."
            )}
            {best && (
              <>
                {" "}
                It could be <span className={tt.numberChip("success")}>up to {pct(best.pct)}</span> lower.
              </>
            )}
          </p>
        </div>
        {onClose && (
          <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} onClick={onClose}>
            <XMarkIcon className="h-4 w-4" aria-hidden />
            <span className="sr-only">Hide the explanation</span>
          </button>
        )}
      </div>

      <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Why each charge applies: one line each, in the bar's colors below, adding up to the rate */}
        <div className="flex min-w-0 flex-col gap-2">
          <Label title="Why you pay each tariff" hint="Rate, as a % of the customs value" />
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0" aria-label="Why you pay each tariff">
            {charges.map((c) => (
              <li key={c.code} className={ROW}>
                {/* Part color, as in the bar below (DESIGN_SYSTEM §10) */}
                <span className="h-2 w-2 self-center rounded-full" style={{ background: colors[c.slice] }} aria-hidden />
                <b className="text-right tabular-nums text-base-content">{pct(c.pct)}</b>
                <span className="min-w-0 truncate text-base-content/70" title={`${c.name}: ${c.why}`}>
                  <span className="font-medium text-base-content">{c.name}</span> · {c.why}
                </span>
              </li>
            ))}
            {charges.length > 1 && (
              <li className={`${ROW} border-t border-base-300 pt-1.5`}>
                <span aria-hidden />
                <b className="text-right tabular-nums text-primary">{pct(g.ratePct)}</b>
                <span className="text-base-content/70">
                  <span className="font-medium text-base-content">Total duty rate</span> · dollars and fees are in the totals below
                </span>
              </li>
            )}
          </ul>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {/* The best potential saving: always "could" */}
          <div className="flex min-w-0 flex-col gap-2">
            <Label title="Could lower it" hint="Potential, not guaranteed" tone="success" />
            {best ? (
              <>
                <a
                  href="#possible-adjustments"
                  className="group flex items-start gap-2.5 rounded-xl bg-success/10 px-3.5 py-2.5 text-sm hover:bg-success/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40"
                >
                  <ArrowTrendingDownIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-success">Best potential saving: up to {pct(best.pct)} off the rate</span>
                    <span className="line-clamp-2 font-semibold text-base-content" title={best.title}>
                      {best.title}
                    </span>
                    <span className="block text-xs text-base-content/70">{best.how}. Check it in Possible Adjustments.</span>
                  </span>
                  <ArrowRightIcon className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-success opacity-60 group-hover:opacity-100" aria-hidden />
                </a>
                {g.savings.length > 1 && (
                  <p className="m-0 px-1 text-xs text-base-content/60">
                    {g.savings.length - 1} more {g.savings.length === 2 ? "way" : "ways"} to pay less below. Each works on its own; some lift the same tariff, so
                    they may not add up.
                  </p>
                )}
              </>
            ) : (
              <p className="m-0 px-1 text-sm text-base-content/70">Nothing found that would lower this duty.</p>
            )}
          </div>

          {/* What the user switched on */}
          {g.on.length > 0 && (
            <div className="flex min-w-0 flex-col gap-2">
              <Label title="Switched on by you" hint="Your answers and claims" />
              {g.on.map((o) => (
                <p key={o.title} className="m-0 flex items-start gap-2 px-1 text-xs text-base-content/70">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0">
                    <span className="font-semibold text-base-content">{o.title}</span> · {o.detail}
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How the rate moved, and what else was checked */}
      {(g.history || g.ruledOut > 0) && (
        <dl className="m-0 flex flex-wrap gap-x-6 gap-y-1 border-t border-base-300 pt-3 text-xs text-base-content/70">
          {g.history && (
            <div className="flex gap-1.5">
              <dt className="font-semibold text-base-content">Rate history</dt>
              <dd className="m-0">
                {pct(g.history.fromPct)} on {formatDate(g.history.fromDate)} → {pct(g.ratePct)} today
              </dd>
            </div>
          )}
          {g.ruledOut > 0 && (
            <div className="flex gap-1.5">
              <dt className="font-semibold text-base-content">Also checked</dt>
              <dd className="m-0">
                {g.ruledOut} {g.ruledOut === 1 ? "tariff that doesn't" : "tariffs that don't"} apply
                {g.waiting > 0 ? `, ${g.waiting} of them depending on your answers in Possible Adjustments` : ""}
              </dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
};
