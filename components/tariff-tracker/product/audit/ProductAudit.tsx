"use client";

import * as ui from "@/components/ui/styles";
import { todayIso } from "../../../duty-calculator/lib/format";
import { FreeChecksNotice } from "../../access/FreeChecksNotice";
import { AuditDisclaimer } from "../../entries/AuditDisclaimer";
import { AuditForm } from "../../entries/AuditForm";
import { AuditStats } from "../../entries/AuditStats";
import { PaidVsOwedChart } from "../../entries/charts/PaidVsOwedChart";
import { RateTimeline } from "../../entries/charts/RateTimeline";
import { EntriesTable } from "../../entries/EntriesTable";
import { Upload7501Card } from "../../entries/Upload7501Card";
import { useAuditRows } from "../../entries/useAuditRows";
import { useInsights } from "../../insights/InsightsContext";
import { TrackedProduct } from "../../report";

// A product's Audit tab (Beta): its logged entries, each checked against the duty in force on its
// entry date, on its rate history and side by side, with the form to log the next one. Same
// checks as the catalog's Entry audit (PRICING.md).
export const ProductAudit = ({ product }: { product: TrackedProduct }) => {
  const { rows, totals, loading } = useAuditRows(product.key);
  const { histories } = useInsights();
  const history = histories.get(product.key);
  return (
    <div className="flex flex-col gap-4">
      <FreeChecksNotice kind="audits" />
      <AuditStats totals={totals} />
      {history && <RateTimeline history={history} rows={rows} to={todayIso()} />}
      <div className="grid items-start gap-4 xl:grid-cols-2">
        <AuditForm fixedProduct={product} />
        {totals.audited > 0 ? <PaidVsOwedChart rows={rows} /> : <Upload7501Card />}
      </div>
      {loading ? <div className={`${ui.skeleton} h-40 w-full`} /> : rows.length > 0 && <EntriesTable rows={rows} showProduct={false} />}
      {totals.audited > 0 && <Upload7501Card />}
      <AuditDisclaimer />
    </div>
  );
};
