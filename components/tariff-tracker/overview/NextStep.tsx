"use client";

import { ReactNode, useEffect, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { todayIso } from "../../duty-calculator/lib/format";
import { useTrackerAccess } from "../access/accessContext";
import { currentPath, signupHref } from "../access/signup";
import { useAlertSettings } from "../alerts/AlertSettingsContext";
import { useInsights } from "../insights/InsightsContext";
import { wholeDollars } from "../insights/teasers";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { tariffNews } from "./lib/news";
import { pathSteps, Step, StepId } from "./lib/steps";
import { readSeenSections } from "./seenSections";

// The one next step on the path to lower duty, with what it's worth, and a quiet look at the
// two after it. Never the whole list: one thing to do at a time (DESIGN_SYSTEM.md §15).

const Progress = ({ steps, current }: { steps: Step[]; current: Step }) => (
  <div className="flex gap-1" aria-hidden>
    {steps.map((s) => (
      <span key={s.id} className={`h-1.5 w-7 rounded-full ${s.done ? "bg-success" : s === current ? "bg-primary" : "bg-base-300"}`} />
    ))}
  </div>
);

const Channel = ({ name, detail }: { name: string; detail: string }) => (
  <div className="flex flex-col gap-1 rounded-2xl bg-base-100 px-4 py-3">
    <span className="text-sm font-bold text-base-content">{name}</span>
    <span className="truncate text-xs text-base-content/60">{detail}</span>
  </div>
);

const ValueBar = ({ set, total }: { set: number; total: number }) => (
  <div className="flex items-center gap-2">
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-300">
      {/* Runtime width (DESIGN_SYSTEM §10) */}
      <div className="h-full rounded-full bg-primary" style={{ width: `${(set / Math.max(total, 1)) * 100}%` }} />
    </div>
    <span className="text-xs font-bold tabular-nums text-base-content">
      {set} / {total}
    </span>
  </div>
);

export const NextStep = () => {
  const { items, products } = useTracker();
  const insights = useInsights();
  const alerts = useAlertSettings();
  const { signedIn, paid, access, savingsLeft, auditsLeft, unlock, unlockLabel, email } = useTrackerAccess();
  const nav = useTrackerNav();
  const [seen, setSeen] = useState<Set<string>>(new Set());
  useEffect(() => setSeen(readSeenSections()), [nav.tab]);

  const valuesSet = products.filter((p) => p.adjustments.customsValue !== undefined).length;
  const { steps, next } = pathSteps({
    products: items.length,
    alertsOn: alerts.configured,
    valuesSet,
    savingsSeen: insights.unlocked.size > 0 && seen.has("savings"),
    entriesAudited: access.usage.auditsChecked.length > 0 || (paid && seen.has("entries")),
  });
  // Across the whole catalog, checked or not
  const potential = insights.savingsReady && insights.beyond.ready ? insights.totals.anyUsd + insights.beyond.anyUsd : null;
  const upcoming = tariffNews(todayIso(), 20).filter((n) => n.date > todayIso()).length;
  const firstDefault = products.find((p) => p.adjustments.customsValue === undefined);

  const content: Record<Exclude<StepId, "products">, { title: string; body: ReactNode; extra?: ReactNode; action: ReactNode }> = {
    alerts: {
      title: `Turn on alerts for your ${items.length.toLocaleString("en-US")} products`,
      body: "Hear about a tariff change the day it's announced, before it reaches your next entry. Pick where alerts go:",
      extra: (
        <div className="grid gap-2.5 sm:grid-cols-3">
          <Channel name="Email" detail={email ?? "Your inbox"} />
          <Channel name="Slack" detail="Post to a channel" />
          <Channel name="Microsoft Teams" detail="Post to a channel" />
        </div>
      ),
      action: (
        <>
          {signedIn ? (
            <button type="button" className={tt.button("next")} onClick={() => nav.openTab("alerts")}>
              Turn on alerts · 1 min
            </button>
          ) : (
            <a href={signupHref(currentPath())} className={tt.button("next")}>
              Create a free account for alerts
            </a>
          )}
          {upcoming > 0 && (
            <span className="text-sm text-base-content/70">
              {upcoming} tariff {upcoming === 1 ? "action takes" : "actions take"} effect soon.
            </span>
          )}
        </>
      ),
    },
    values: {
      title: "Set your product values",
      body: `${(items.length - valuesSet).toLocaleString("en-US")} of your products use the $10,000 estimate. Your own values make every duty and potential saving yours.`,
      extra: <ValueBar set={valuesSet} total={items.length} />,
      action: (
        <button
          type="button"
          className={tt.button("next")}
          onClick={() => (firstDefault ? nav.openProduct(firstDefault.key, false, "duty") : nav.openTab("catalog"))}
        >
          Set values
        </button>
      ),
    },
    savings: {
      title: "See your potential savings",
      body:
        potential !== null && potential > 0
          ? `Up to ${wholeDollars(potential)} per shipment across ${(insights.totals.productsWithSavings + insights.beyond.productsWithSavings).toLocaleString("en-US")} products, if you qualify: trade programs and lower-duty origins.`
          : "Trade programs and lower-duty origins for every product, in dollars.",
      action: signedIn ? (
        <>
          <button type="button" className={tt.button("money")} onClick={() => nav.openTab("savings")}>
            {paid || savingsLeft === 0 ? "See potential savings" : "Check savings free"}
          </button>
          {!paid && savingsLeft > 0 && (
            <span className="text-sm text-base-content/70">
              {savingsLeft} free {savingsLeft === 1 ? "check" : "checks"} left
            </span>
          )}
        </>
      ) : (
        <button type="button" className={tt.button("money")} onClick={() => unlock("savings")}>
          {unlockLabel}
        </button>
      ),
    },
    audit: {
      title: "Audit your past entries",
      body: "Log an entry's date, value and the duty you paid. We check it against the duty in force that day, so you can spot a refund to request through your broker, or an underpayment to fix.",
      action: (
        <>
          <button type="button" className={tt.button("next")} onClick={() => nav.openTab("entries")}>
            Audit an entry
          </button>
          {!paid && (
            <span className="text-sm text-base-content/70">
              {auditsLeft} free audit {auditsLeft === 1 ? "check" : "checks"} left
            </span>
          )}
        </>
      ),
    },
  };

  const after = steps.filter((s) => !s.done && s !== next).slice(0, 2);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      {next && next.id !== "products" ? (
        <div className="flex flex-col gap-4 rounded-3xl border-2 border-primary bg-primary/5 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={tt.eyebrow("primary")}>
              Your next step · {next.number} of {steps.length}
            </span>
            <Progress steps={steps} current={next} />
          </div>
          <h2 className={`${tt.display} m-0 text-2xl font-semibold text-base-content`}>{content[next.id as keyof typeof content].title}</h2>
          <p className="m-0 text-[0.95rem] leading-relaxed text-base-content/70">{content[next.id as keyof typeof content].body}</p>
          {content[next.id as keyof typeof content].extra}
          <div className="flex flex-wrap items-center gap-3">{content[next.id as keyof typeof content].action}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-3xl bg-success/10 p-6">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-success">
            <CheckCircleIcon className="h-5 w-5" aria-hidden />
            You&apos;re all set up
          </span>
          <p className="m-0 text-[0.95rem] text-base-content/70">
            Your products are tracked, alerts are on, your potential savings are in view and you&apos;ve audited your entries.
          </p>
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        <span className={tt.eyebrow()}>What&apos;s after</span>
        {after.length === 0 && <div className={`${tt.tile} flex-1 p-4 text-sm text-base-content/70`}>Nothing else to set up.</div>}
        {after.map((s) => (
          <div key={s.id} className={`${tt.tile} flex flex-1 flex-col gap-1.5 p-4`}>
            <span className={tt.eyebrow(s.id === "savings" ? "success" : s.soon ? "warning" : "primary")}>
              Step {s.number} · {s.label}
            </span>
            {s.id === "savings" && potential !== null && potential > 0 && (
              <>
                <span className={tt.metric}>Up to {wholeDollars(potential)}</span>
                <span className="text-sm text-base-content/70">in potential savings per shipment, already spotted</span>
              </>
            )}
            {s.id === "values" && (
              <>
                <span className="text-sm text-base-content/70">Your own values make every number yours.</span>
                <ValueBar set={valuesSet} total={items.length} />
              </>
            )}
            {s.id === "alerts" && <span className="text-sm text-base-content/70">Email, Slack or Teams, the day a tariff is announced.</span>}
            {s.id === "audit" && <span className="text-sm text-base-content/70">Find duty you may have overpaid and could recover.</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
