"use client";

import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { todayIso } from "../../../duty-calculator/lib/format";
import { FreeChecksNotice } from "../../access/FreeChecksNotice";
import { AuditDisclaimer } from "../../entries/AuditDisclaimer";
import { AuditStats } from "../../entries/AuditStats";
import { AuditEntryButton } from "../../entries/check/AuditEntryButton";
import { PaidVsOwedChart } from "../../entries/charts/PaidVsOwedChart";
import { RateTimeline } from "../../entries/charts/RateTimeline";
import { EntriesTable } from "../../entries/EntriesTable";
import { Upload7501Button } from "../../entries/Upload7501Button";
import { AuditStart } from "../../entries/AuditStart";
import { useAuditRows } from "../../entries/useAuditRows";
import { useInsights } from "../../insights/InsightsContext";
import { TrackedProduct } from "../../report";

// A product's Audit tab (Beta): "Audit an Entry" up top, on the right (the step-by-step entry
// audit; before any entry is audited, the empty state's big button instead), then its logged entries, each checked against the duty in force on its entry date, on its rate history,
// side by side and in the table. Same checks as the catalog's Entry audit (PRICING.md).
export const ProductAudit = ({ product }: { product: TrackedProduct }) => {
  const { rows, totals, loading } = useAuditRows(product.key);
  const { histories } = useInsights();
  const history = histories.get(product.key);
  return (
    <div className="flex flex-col gap-4">
      <FreeChecksNotice kind="audits" />
      {loading ? (
        <div className={`${ui.skeleton} h-40 w-full`} />
      ) : totals.audited === 0 ? (
        <>
          <AuditStart fixedProduct={product} />
          {rows.length > 0 && <EntriesTable rows={rows} showProduct={false} />}
        </>
      ) : (
        <>
          {/* The tab's actions, on the right as in the Entry Audit page's header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={`${tt.subtitle} m-0`}>Each entry checked against the duty in force on its entry date.</p>
            <div className="flex flex-wrap items-center gap-2">
              <Upload7501Button />
              <AuditEntryButton fixedProduct={product} />
            </div>
          </div>
          <AuditStats totals={totals} />
          {history && <RateTimeline history={history} rows={rows} to={todayIso()} />}
          <PaidVsOwedChart rows={rows} />
          <EntriesTable rows={rows} showProduct={false} />
        </>
      )}
      <AuditDisclaimer />
    </div>
  );
};
