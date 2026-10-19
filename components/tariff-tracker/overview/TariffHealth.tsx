"use client";

import { ReactNode } from "react";
import { ArrowRightIcon, BellAlertIcon, ClipboardDocumentCheckIcon, ReceiptPercentIcon } from "@heroicons/react/20/solid";
import { InfoTip } from "@/components/ui/InfoTip";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { AUDITS_ENABLED, SAVINGS_AUDITS_LABEL, SAVINGS_ENABLED } from "@/libs/tariff-tracker/features";
import { useTrackerAccess } from "../access/accessContext";
import { useAlertSettings } from "../alerts/AlertSettingsContext";
import { entryProductKey } from "../entries/entries";
import { useAuditRows } from "../entries/useAuditRows";
import { useInsights } from "../insights/InsightsContext";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";

// Tariff Health (DESIGN_SYSTEM.md §15 "Home"): one score for how well the user's imports are looked
// after, from the three things the Tracker does for them. Alerts: the share of imports with alerts
// on (and somewhere for them to go). Savings: the share whose ways to pay less are all secured or
// ruled out. Audits: the share with an entry audited. The score is the average of those that are
// live: until Savings and Audits launch (libs/tariff-tracker/features.ts) it's alerts alone, and
// they show as coming, outside the score. A ring for the score, then a bar for each.

const share = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

export const useTariffHealth = () => {
  const { items, trackedKeys } = useTracker();
  const insights = useInsights();
  const alerts = useAlertSettings();
  const { rows: auditRows } = useAuditRows();
  const { signedIn } = useTrackerAccess();
  const imports = items.length;

  // Alerts: the imports covered, when alerts have somewhere to go
  const covered = Math.min(trackedKeys.size, imports);
  const alertsSet = signedIn && alerts.on;
  const alertsPct = alertsSet ? share(covered, imports) : 0;

  // Savings: imports whose quick wins are all secured or ruled out
  const savingsPct = share(insights.reviewStats.reviewed, insights.reviewStats.total);

  // Audits: imports with at least one entry audited
  const audited = new Set<string>();
  auditRows.forEach(({ entry, audit, product }) => audit && product && audited.add(entryProductKey(entry)));
  const auditPct = share(audited.size, imports);

  const live = [alertsPct, ...(SAVINGS_ENABLED ? [savingsPct] : []), ...(AUDITS_ENABLED ? [auditPct] : [])];
  const overall = Math.round(live.reduce((sum, n) => sum + n, 0) / live.length);
  return { imports, covered, alertsSet, alertsPct, savingsPct, reviewed: insights.reviewStats, auditPct, audited: audited.size, overall, signedIn };
};

// The score as a ring: green from 80, amber below (a low score needs a look, it isn't "wrong")
const Ring = ({ pct }: { pct: number }) => {
  const r = 34;
  const c = 2 * Math.PI * r;
  const good = pct >= 80;
  return (
    <span className="relative flex h-22 w-22 shrink-0 items-center justify-center">
      <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-tt-soft-high" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(Math.max(pct, pct > 0 ? 2 : 0) / 100) * c} ${c}`}
          className={good ? "stroke-success" : "stroke-warning"}
        />
      </svg>
      {/* Sized to sit inside the ring at any score, 100% included */}
      <span className={`${tt.display} text-xl font-semibold tabular-nums tracking-tight ${good ? "text-success" : "text-warning"}`}>{pct}%</span>
    </span>
  );
};

const Part = ({
  icon,
  label,
  pct,
  soon,
  text,
  action,
}: {
  icon: ReactNode;
  label: string;
  pct: number;
  soon?: boolean;
  text: string;
  action?: { label: string; go: () => void };
}) => (
  <li className="flex flex-col gap-1.5">
    <span className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 font-semibold text-base-content">
        <span className={soon ? "text-base-content/40" : "text-primary"} aria-hidden>
          {icon}
        </span>
        {label}
      </span>
      {soon ? <span className={tt.chip()}>{SAVINGS_AUDITS_LABEL}</span> : <span className="font-semibold tabular-nums text-base-content">{pct}%</span>}
    </span>
    {soon ? (
      <span className="block h-2 w-full rounded-full border border-dashed border-base-300" aria-hidden />
    ) : (
      <span className="block h-2 w-full overflow-hidden rounded-full bg-tt-soft-high" aria-hidden>
        {/* Runtime width (DESIGN_SYSTEM §10) */}
        <span className={`block h-full rounded-full ${pct >= 80 ? "bg-success" : "bg-warning"}`} style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }} />
      </span>
    )}
    <span className="flex flex-wrap items-baseline justify-between gap-x-3 text-xs text-base-content/60">
      <span>{text}</span>
      {action && (
        <button type="button" className={`${ui.link} inline-flex items-center gap-1 text-xs font-semibold`} onClick={action.go}>
          {action.label}
          <ArrowRightIcon className="h-3 w-3" aria-hidden />
        </button>
      )}
    </span>
  </li>
);

export const TariffHealth = () => {
  const h = useTariffHealth();
  const { openTab } = useTrackerNav();
  const { moreToTrack, trackMore } = useTracker();
  const n = (count: number) => count.toLocaleString("en-US");
  const parts = [!SAVINGS_ENABLED && "savings", !AUDITS_ENABLED && "audits"].filter(Boolean);
  const scoreLine =
    h.overall >= 80 ? "Your imports are well looked after." : h.alertsSet ? "Turn on alerts for more of your imports to raise it." : "Turn on alerts to start raising it.";
  return (
    <section className={`${tt.panel} flex h-full flex-col gap-4 p-6`} aria-labelledby="tt-health">
      <div className="flex items-center gap-2">
        <h2 id="tt-health" className={`${tt.moduleTitle} m-0`}>
          Tariff Health
        </h2>
        <InfoTip label="About Tariff Health">
          One score for how well your imports are looked after: the share with alerts on, the share whose savings are reviewed, and the share with an entry
          audited, averaged.{parts.length ? ` Until ${parts.join(" and ")} launch, it's alerts alone.` : ""}
        </InfoTip>
      </div>
      <div className="flex items-center gap-5">
        <Ring pct={h.overall} />
        <p className={`${tt.body} m-0`}>{scoreLine}</p>
      </div>
      <ul className="m-0 mt-auto flex list-none flex-col gap-3.5 p-0">
        <Part
          icon={<BellAlertIcon className="h-4 w-4" />}
          label="Alerts"
          pct={h.alertsPct}
          text={
            !h.signedIn
              ? "Sign up to hear about every change"
              : !h.alertsSet
                ? "Alerts are off"
                : `${n(h.covered)} of ${n(h.imports)} imports`
          }
          action={
            !h.signedIn || !h.alertsSet
              ? { label: "Turn on", go: () => openTab("alerts") }
              : h.covered < h.imports && moreToTrack > 0
                ? { label: `Add ${n(moreToTrack)} more`, go: trackMore }
                : undefined
          }
        />
        <Part
          icon={<ReceiptPercentIcon className="h-4 w-4" />}
          label="Savings"
          pct={h.savingsPct}
          soon={!SAVINGS_ENABLED}
          text={SAVINGS_ENABLED ? `${n(h.reviewed.reviewed)} of ${n(h.reviewed.total)} imports reviewed` : "Joins the score when it launches"}
          action={{ label: SAVINGS_ENABLED ? "Review" : "See what's coming", go: () => openTab("savings") }}
        />
        <Part
          icon={<ClipboardDocumentCheckIcon className="h-4 w-4" />}
          label="Audits"
          pct={h.auditPct}
          soon={!AUDITS_ENABLED}
          text={AUDITS_ENABLED ? `${n(h.audited)} of ${n(h.imports)} imports audited` : "Joins the score when it launches"}
          action={{ label: AUDITS_ENABLED ? "Audit" : "See what's coming", go: () => openTab("entries") }}
        />
      </ul>
    </section>
  );
};
