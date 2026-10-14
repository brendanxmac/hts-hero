import * as tt from "@/components/ui/styles/tracker";
import { formatDate } from "../../../duty-calculator/lib/format";
import { money, VERDICTS } from "../../entries/EntriesTable";
import { useAuditRows } from "../../entries/useAuditRows";
import { TrackedProduct } from "../../report";
import { SummaryCard } from "./SummaryCard";

// The product's audit at a glance (Beta): how many entries are checked, what they may have
// overpaid and underpaid, and the latest few
export const AuditCard = ({ product, onOpen }: { product: TrackedProduct; onOpen: () => void }) => {
  const { rows, totals } = useAuditRows(product.key);
  const latest = rows.filter((r) => r.audit).slice(0, 3);
  return (
    <SummaryCard title="Audit" chip={<span className={tt.chip("warning")}>Beta</span>} link={{ label: totals.logged ? "Open audit" : "Audit an entry", onClick: onOpen }}>
      {totals.audited ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className={`${tt.tile} p-3`}>
              <span className={tt.eyebrow("success")}>May have overpaid</span>
              <span className={`${tt.metricSm} block text-success`}>{money(totals.overpaid)}</span>
            </div>
            <div className={`${tt.tile} p-3`}>
              <span className={tt.eyebrow(totals.underpaid > 0 ? "error" : "neutral")}>May have underpaid</span>
              <span className={`${tt.metricSm} block ${totals.underpaid > 0 ? "text-error" : ""}`}>{money(totals.underpaid)}</span>
            </div>
          </div>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {latest.map((r) => (
              <li key={r.entry.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-base-content/70">{formatDate(r.entry.entryDate)}</span>
                <span className={tt.chip(VERDICTS[r.audit!.verdict].tone)}>{VERDICTS[r.audit!.verdict].label}</span>
              </li>
            ))}
          </ul>
          <p className="m-0 text-xs text-base-content/60">
            {totals.audited} of {totals.logged} logged {totals.logged === 1 ? "entry" : "entries"} audited
          </p>
        </>
      ) : (
        <p className="m-0 text-sm text-base-content/70">
          Check what you paid on past entries of this product against the duty in force on each entry date.
        </p>
      )}
    </SummaryCard>
  );
};
