"use client";

import { ArrowRightIcon, BellAlertIcon, ChartBarIcon, CurrencyDollarIcon, ScaleIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { SAVINGS_AUDITS_LABEL } from "@/libs/tariff-tracker/features";
import { useTariffUpdates } from "../overview/useTariffUpdates";
import { PreviewDashboard } from "./PreviewDashboard";
import { delay, StepHeading } from "./parts";

// The first thing a new account sees in the Tracker: what it'll do for them once their imports
// are in, the example dashboard coming to life beside it, and a real reason not to wait: how many
// US tariff actions came out in the last 30 days.

const BENEFITS = [
  {
    Icon: ScaleIcon,
    title: "Live Duty Rates for Every Import",
    text: "Every tariff stacked up on each one: base rate, Section 232 and 301, reciprocal and more.",
  },
  {
    Icon: ChartBarIcon,
    title: "Historical Tariff Rate Analysis",
    text: "12 months of rate history and the impact of each new action on your catalog.",
  },
  {
    Icon: BellAlertIcon,
    title: "New Tariff Alerts for Your Imports",
    text: "By email, Slack or Teams, with the rate before and after. Plus AD/CVD case flags.",
  },
  {
    Icon: CurrencyDollarIcon,
    title: "Savings and Audits",
    text: `Programs you may qualify for, and duty you may have overpaid. ${SAVINGS_AUDITS_LABEL}.`,
  },
];

const DAY = 86_400_000;

// Tariff actions published in the last 30 days (HTS revisions aside); null while loading
const useRecentActions = () => {
  const updates = useTariffUpdates("all");
  if (!updates) return null;
  const since = Date.now() - 30 * DAY;
  return updates.filter((u) => u.kind !== "hts_revision" && Date.parse(u.first_seen_at) >= since);
};

export const HookStep = ({ onNext }: { onNext: () => void }) => {
  const actions = useRecentActions();
  return (
    <div className="grid items-center gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col gap-8">
        <StepHeading
          eyebrow="Welcome to your Tariff Tracker"
          title={
            <>
              Tariff alerts, savings, and audits are <span className="text-primary">one step away.</span>
            </>
          }
          lead="Add the products you import to get automatic tariff alerts, find savings, and see where you might have overpaid or underpaid previously."
        />

        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
          {BENEFITS.map(({ Icon, title, text }, i) => (
            <li key={title} className="tt-ob-rise flex gap-3" style={delay(260 + i * 70)}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
                <Icon className="h-[1.125rem] w-[1.125rem]" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-base-content">{title}</span>
                <span className="text-xs leading-relaxed text-base-content/65">{text}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* Why now: real numbers from Tariff News */}
        {actions && actions.length > 0 && (
          <div className="tt-ob-rise flex items-start gap-4 rounded-2xl border border-error/25 bg-error/5 p-4" style={delay(200)}>
            <span className={`${tt.display} shrink-0 text-[2.25rem] font-semibold leading-none tabular-nums text-error`}>{actions.length}</span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-sm font-semibold text-base-content">
                US tariff {actions.length === 1 ? "action" : "actions"} in the last 30 days. Are any hitting your imports?
              </span>
              <span className="truncate text-xs text-base-content/60">Latest: {actions[0].title}</span>
            </div>
          </div>
        )}

        <div className="tt-ob-rise flex flex-col gap-3" style={delay(560)}>
          {/* The one thing to do here: nothing beside it */}
          <button
            type="button"
            className={`${ui.button({ variant: "primary", size: "lg" })} h-14 w-full text-lg shadow-[0_14px_30px_-14px_var(--tt-ob-glow)]`}
            onClick={onNext}
            autoFocus
          >
            Add my imports
            <ArrowRightIcon className="h-5 w-5" aria-hidden />
          </button>
          <span className="text-center text-xs text-base-content/60">Free for {REVERSE_TRIAL.days} days · No credit card required</span>
        </div>
      </div>

      <div className="hidden pb-8 pl-10 xl:block">
        <PreviewDashboard />
      </div>
    </div>
  );
};
