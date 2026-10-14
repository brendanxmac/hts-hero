"use client";

import * as tt from "@/components/ui/styles/tracker";
import { useTrackerAccess } from "../access/accessContext";
import { useAlertSettings } from "../alerts/AlertSettingsContext";
import { entryProductKey } from "../entries/entries";
import { useAuditRows } from "../entries/useAuditRows";
import { useInsights } from "../insights/InsightsContext";
import { wholeDollars } from "../insights/teasers";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";

// The Overview's focus: how healthy the user's imports are on the three things the Tracker does
// for them, side by side. Alerts (the share of imports covered, and whether alerts have somewhere
// to go), the savings review (the share whose quick wins are all secured or ruled out, review.ts)
// and the audit review (the share with an entry audited, by what the audits found). Each is a
// share, a bar of where every import stands, one line on what it's worth, and the one button that
// moves it on. The header sums them up as one score.

type Tone = "primary" | "success" | "warning";

interface Segment {
  label: string;
  count: number;
  className: string;
}

const share = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

const HealthCard = ({
  label,
  tone,
  pct,
  of,
  status,
  segments,
  note,
  action,
}: {
  label: string;
  tone: Tone;
  pct: number;
  // After the share: "of imports covered"
  of: string;
  // A chip beside the label: alerts' delivery
  status?: { text: string; tone: Tone };
  segments: Segment[];
  note: string;
  action: { label: string; onClick: () => void; variant: "next" | "money" | "secondary" };
}) => {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  return (
    <div className="flex flex-col gap-3 bg-base-100 px-5 py-5 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={tt.eyebrow(tone)}>{label}</span>
        {status && <span className={tt.chip(status.tone)}>{status.text}</span>}
      </div>
      <p className="m-0 flex items-baseline gap-2">
        <span className={tt.metric}>{pct}%</span>
        <span className="text-sm text-base-content/70">{of}</span>
      </p>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-tt-soft" aria-hidden>
        {segments
          .filter((s) => s.count > 0)
          .map((s) => (
            // Runtime width (DESIGN_SYSTEM §10)
            <div key={s.label} className={`h-full ${s.className}`} style={{ width: `${(s.count / Math.max(total, 1)) * 100}%` }} />
          ))}
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-base-content/70">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-sm ${s.className}`} aria-hidden />
            {s.label} <span className="font-semibold tabular-nums text-base-content">{s.count.toLocaleString("en-US")}</span>
          </span>
        ))}
      </div>
      <p className="m-0 text-sm leading-snug text-base-content/70">{note}</p>
      <div className="mt-auto pt-1">
        <button type="button" className={tt.button(action.variant, "sm")} onClick={action.onClick}>
          {action.label}
        </button>
      </div>
    </div>
  );
};

export const TariffHealth = () => {
  const { items, trackedKeys } = useTracker();
  const insights = useInsights();
  const alerts = useAlertSettings();
  const { rows: auditRows, totals } = useAuditRows();
  const { signedIn, unlock, unlockLabel } = useTrackerAccess();
  const nav = useTrackerNav();
  const imports = items.length;
  if (!imports) return null;
  const count = (n: number, one: string, many: string) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

  // Alerts: the imports covered, and whether there's anywhere for alerts to go
  const covered = Math.min(trackedKeys.size, imports);
  const alertsSet = signedIn && alerts.configured;
  const alertsPct = alertsSet ? share(covered, imports) : 0;

  // Savings review
  const { reviewStats: stats } = insights;
  const savingsPct = share(stats.reviewed, stats.total);
  const potential = insights.savingsReady && insights.beyond.ready ? insights.totals.anyUsd + insights.beyond.anyUsd : null;

  // Audit review: each import by what its audited entries found (an overpayment outranks an
  // underpayment, which outranks paid as owed)
  const verdicts = new Map<string, "overpaid" | "underpaid" | "correct">();
  auditRows.forEach(({ entry, audit, product }) => {
    if (!audit || !product) return;
    const key = entryProductKey(entry);
    const was = verdicts.get(key);
    if (was === "overpaid" || (was === "underpaid" && audit.verdict === "correct")) return;
    verdicts.set(key, audit.verdict);
  });
  const audited = { overpaid: 0, underpaid: 0, correct: 0 };
  verdicts.forEach((v) => (audited[v] += 1));
  const auditedImports = verdicts.size;
  const auditPct = share(auditedImports, imports);

  const overall = Math.round((alertsPct + savingsPct + auditPct) / 3);

  return (
    <section aria-labelledby="tt-health" className={`${tt.panel} overflow-hidden`}>
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pb-4 pt-5 lg:px-6">
        <div>
          <h2 id="tt-health" className={tt.title}>
            Tariff health
          </h2>
          <p className={tt.subtitle}>Alerts on, savings reviewed and entries audited, across your imports</p>
        </div>
        <p className="m-0 flex items-baseline gap-2" aria-label={`Tariff health ${overall}%`}>
          <span className={`${tt.metric} ${overall >= 80 ? "text-success" : "text-primary"}`}>{overall}%</span>
          <span className="text-sm text-base-content/60">overall</span>
        </p>
      </div>
      {/* 1px gaps over the border color draw the dividers */}
      <div className="grid gap-px border-t border-base-300 bg-base-300 lg:grid-cols-3">
        <HealthCard
          label="Alerts"
          tone={alertsSet ? "primary" : "warning"}
          pct={alertsPct}
          of={alertsSet ? `of imports covered · ${covered.toLocaleString("en-US")} of ${imports.toLocaleString("en-US")}` : "of imports alerted"}
          status={alertsSet ? { text: "Set up", tone: "success" } : { text: "Not set up", tone: "warning" }}
          segments={[
            { label: "Covered", count: alertsSet ? covered : 0, className: "bg-primary" },
            { label: alertsSet ? "Not covered" : "Waiting on setup", count: alertsSet ? imports - covered : imports, className: "bg-base-300" },
          ]}
          note={
            alertsSet
              ? covered < imports
                ? `Your plan covers ${count(covered, "import", "imports")}; the rest get no alert when a tariff changes.`
                : "Every import gets an alert when a tariff on it changes."
              : signedIn
                ? `Say where alerts go (email, Slack or Teams) and ${count(covered, "import", "imports")} start getting them.`
                : "With a free account, get an email, Slack or Teams message when a tariff on your imports changes."
          }
          action={
            !signedIn
              ? { label: unlockLabel, onClick: () => unlock("alerts"), variant: "next" }
              : { label: alertsSet ? "Manage alerts" : "Set up alerts", onClick: () => nav.openTab("alerts"), variant: alertsSet ? "secondary" : "next" }
          }
        />
        <HealthCard
          label="Savings review"
          tone="success"
          pct={savingsPct}
          of={`of imports reviewed · ${stats.reviewed.toLocaleString("en-US")} of ${stats.total.toLocaleString("en-US")}`}
          segments={[
            { label: "Reviewed", count: stats.reviewed, className: "bg-success" },
            { label: "Reviewing", count: stats.inProgress, className: "bg-warning" },
            { label: "To review", count: stats.checked - stats.reviewed - stats.inProgress, className: "bg-primary" },
            { label: "Not checked", count: stats.total - stats.checked, className: "bg-base-300" },
          ]}
          note={
            potential !== null && potential > 0
              ? `Up to ${wholeDollars(potential)} per shipment spotted, if you qualify.`
              : "An import is reviewed once each of its quick wins is secured or ruled out."
          }
          action={
            signedIn
              ? { label: "Review savings", onClick: () => nav.openTab("savings"), variant: "money" }
              : { label: unlockLabel, onClick: () => unlock("savings"), variant: "money" }
          }
        />
        <HealthCard
          label="Audit review"
          tone="primary"
          pct={auditPct}
          of={`of imports audited · ${auditedImports.toLocaleString("en-US")} of ${imports.toLocaleString("en-US")}`}
          segments={[
            { label: "Possible overpayment", count: audited.overpaid, className: "bg-success" },
            { label: "Possible underpayment", count: audited.underpaid, className: "bg-error" },
            { label: "Paid as owed", count: audited.correct, className: "bg-primary" },
            { label: "Not audited", count: imports - auditedImports, className: "bg-base-300" },
          ]}
          note={
            totals.overpaid > 0
              ? `Up to ${wholeDollars(totals.overpaid)} you may have overpaid, across ${count(totals.audited, "audited entry", "audited entries")}.`
              : totals.audited > 0
                ? `${count(totals.audited, "entry", "entries")} audited against the rate in force on the day.`
                : "Check what you paid on a past entry against the rate in force on the day."
          }
          action={
            signedIn
              ? { label: "Audit an entry", onClick: () => nav.openTab("entries"), variant: "next" }
              : { label: unlockLabel, onClick: () => unlock("entries"), variant: "next" }
          }
        />
      </div>
    </section>
  );
};
