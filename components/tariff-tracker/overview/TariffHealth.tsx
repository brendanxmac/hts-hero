"use client";

import { useTrackerAccess } from "../access/accessContext";
import { useAlertSettings } from "../alerts/AlertSettingsContext";
import { entryProductKey } from "../entries/entries";
import { useAuditRows } from "../entries/useAuditRows";
import { useInsights } from "../insights/InsightsContext";
import { useTracker } from "../TrackerContext";

// Tariff health: how well the user's imports are looked after on the three things the Tracker does
// for them. Alerts (the share of imports covered, and whether alerts have somewhere to go), the
// savings review (the share whose quick wins are all secured or ruled out, review.ts) and the audit
// review (the share with an entry audited, by what the audits found), and their average as one
// score. Shown on the Overview (SummaryBoxes.tsx).

const share = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

// The three shares and the score, for the Tariff health tab and the Overview's summary of it
export const useTariffHealth = () => {
  const { items, trackedKeys } = useTracker();
  const insights = useInsights();
  const alerts = useAlertSettings();
  const { rows: auditRows, totals } = useAuditRows();
  const { signedIn, unlock, unlockLabel } = useTrackerAccess();
  const imports = items.length;
  const count = (n: number, one: string, many: string) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

  // Alerts: the imports covered, and whether there's anywhere for alerts to go
  const covered = Math.min(trackedKeys.size, imports);
  const alertsSet = signedIn && alerts.on;
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
  return { imports, count, covered, alertsSet, alertsPct, stats, savingsPct, potential, audited, auditedImports, auditPct, totals, overall, signedIn, unlock, unlockLabel };
};
