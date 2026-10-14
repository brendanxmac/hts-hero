"use client";

import { ArrowLeftIcon, ArrowPathIcon, BellAlertIcon, BellSlashIcon, TrashIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { formatMoney } from "../../duty-calculator/lib/format";
import { adjustmentTags } from "../adjustments";
import { useAuditRows } from "../entries/useAuditRows";
import { formatRate } from "../formatRate";
import { useInsights } from "../insights/InsightsContext";
import { bestSavings } from "../insights/savings";
import { wholeDollars } from "../insights/teasers";
import { REVIEW_LABELS } from "../opportunities/review";
import { TrackedProduct } from "../report";
import { PRODUCT_TABS, ProductTab } from "../sections";
import { useTracker } from "../TrackerContext";

// The top of a catalog product's view (DESIGN_SYSTEM.md §15): what it is (code, origin,
// description, what's been set on it), four facts (its rate, the duty on a shipment, its savings
// and its audit), and the tabs, with the actions beside them. One panel, so it reads as one thing.

const TAB_LABELS: Record<ProductTab, string> = { summary: "Summary", duty: "Duty", savings: "Savings", audit: "Audit" };

const Fact = ({ label, value, note, tone, onClick }: { label: string; value: string; note: string; tone?: "primary" | "success"; onClick?: () => void }) => {
  const body = (
    <>
      <span className={tt.eyebrow(tone ?? "neutral")}>{label}</span>
      <span className={`${tt.metricSm} ${tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : ""}`}>{value}</span>
      <span className="truncate text-xs text-base-content/60">{note}</span>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={`${tt.tile} flex min-w-0 flex-col gap-1 p-4 text-left transition-colors hover:bg-base-300/60`}>
      {body}
    </button>
  ) : (
    <div className={`${tt.tile} flex min-w-0 flex-col gap-1 p-4`}>{body}</div>
  );
};

export const ProductHeader = ({
  row,
  totalPct,
  totalDuty,
  tab,
  onTab,
  onBack,
  onReset,
  onRemove,
  adjusted,
}: {
  row: TrackedProduct;
  // Live from the Duty tab's calculator
  totalPct: number;
  totalDuty: number;
  tab: ProductTab;
  onTab: (tab: ProductTab) => void;
  onBack: () => void;
  onReset: () => void;
  onRemove: () => void;
  adjusted: boolean;
}) => {
  const { entry } = row;
  const insights = useInsights();
  const { trackedKeys, itemFor } = useTracker();
  const { totals: audit } = useAuditRows(row.key);
  const tags = adjustmentTags(row.adjustments, row.result);
  const review = insights.review.get(row.key) ?? "unchecked";
  const unlocked = insights.unlocked.has(row.key);
  const best = bestSavings(insights.savings.get(row.key) ?? []).any;
  const found = insights.lockedBest.get(row.key);
  const alerts = trackedKeys.has(row.key);
  const perYear = itemFor(row.key)?.shipmentsPerYear;

  return (
    <header className={`${tt.panel} flex flex-col`}>
      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:items-center">
        <div className="flex min-w-0 flex-col gap-2">
          <button type="button" onClick={onBack} className="-ml-1 inline-flex items-center gap-1 self-start rounded-full px-1 text-sm text-base-content/60 hover:text-base-content">
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Catalog
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className={tt.chip("neutral")}>
              <span className="mr-1" aria-hidden>
                {entry.country.flag}
              </span>
              {entry.country.name}
            </span>
            <span className={tt.chip(alerts ? "success" : "neutral")} title={alerts ? "Alerts are on for this import" : "No alerts on this import"}>
              {alerts ? <BellAlertIcon className="mr-1 h-3 w-3" aria-hidden /> : <BellSlashIcon className="mr-1 h-3 w-3" aria-hidden />}
              {alerts ? "Alerts on" : "No alerts"}
            </span>
            <span className={tt.chip(REVIEW_LABELS[review].tone)}>Savings · {REVIEW_LABELS[review].label}</span>
          </div>
          <h1 className={`${mono.className} m-0 text-3xl font-semibold tracking-tight text-base-content`}>{entry.element.htsno}</h1>
          <p className={`${tt.subtitle} m-0 max-w-2xl`}>{row.description}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5" aria-label="Set on this product">
              {tags.map((t) => (
                <span key={t.id} className={tt.chip("primary")} title={t.title}>
                  {t.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
          <Fact
            label="Duty rate"
            value={formatRate(totalPct)}
            note={row.parts.length > 1 ? `Base duty + ${row.parts.length - 1} ${row.parts.length === 2 ? "tariff" : "tariffs"}` : "Base duty only"}
            tone="primary"
          />
          <Fact
            label="Per shipment"
            value={wholeDollars(totalDuty)}
            note={`On ${formatMoney(row.customsValue).replace(/\.00$/, "")}${perYear ? ` · ${wholeDollars(totalDuty * perYear)} a year` : ""}`}
          />
          <Fact
            label="Savings"
            value={unlocked ? (best ? `−${formatRate(best.pts)}` : "None") : found && found > 0.005 ? "Found" : "—"}
            note={unlocked ? (best ? "Best quick win or proven origin" : "Nothing open to claim") : found && found > 0.005 ? `Up to ${wholeDollars(found)} · check to see` : "Not checked yet"}
            tone="success"
            onClick={() => onTab("savings")}
          />
          <Fact
            label="Audit"
            value={audit.audited ? `${audit.audited} ${audit.audited === 1 ? "entry" : "entries"}` : "—"}
            note={
              !audit.audited
                ? "No entries audited"
                : audit.overpaid > 0.005
                  ? `May have overpaid ${wholeDollars(audit.overpaid)}`
                  : audit.underpaid > 0.005
                    ? `May have underpaid ${wholeDollars(audit.underpaid)}`
                    : "All paid as owed"
            }
            onClick={() => onTab("audit")}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 px-4">
        <nav role="tablist" aria-label="Product" className="-mb-px flex gap-1">
          {PRODUCT_TABS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => onTab(id)}
              className={`flex items-center gap-2 border-b-2 px-3 py-3.5 text-sm font-semibold transition-colors ${
                tab === id ? "border-primary text-primary" : "border-transparent text-base-content/60 hover:text-base-content"
              }`}
            >
              {TAB_LABELS[id]}
              {id === "audit" && <span className={tt.chip("warning")}>Beta</span>}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-1 py-2">
          {adjusted && (
            <button type="button" className={tt.button("ghost", "sm")} onClick={onReset}>
              <ArrowPathIcon className="h-4 w-4" aria-hidden />
              Reset adjustments
            </button>
          )}
          <button type="button" className={`${tt.button("ghost", "sm")} hover:text-error`} onClick={onRemove}>
            <TrashIcon className="h-4 w-4" aria-hidden />
            Remove
          </button>
        </div>
      </div>
    </header>
  );
};
