import { StatStrip } from "@/components/ui/StatStrip";
import { money } from "./EntriesTable";
import { AuditTotals } from "./useAuditRows";

// The audit in four numbers: entries checked, what was paid in the past year, possible over- and
// underpayments
export const AuditStats = ({ totals }: { totals: AuditTotals }) => (
  <StatStrip
    stats={[
      {
        label: "Entries audited",
        value: totals.audited.toLocaleString("en-US"),
        note: `Of ${totals.logged.toLocaleString("en-US")} logged`,
      },
      {
        label: "Total payments (past 12 months)",
        value: money(totals.paidYear),
        note: `Duty and AD/CVD on ${totals.loggedYear.toLocaleString("en-US")} ${totals.loggedYear === 1 ? "entry" : "entries"}`,
      },
      {
        label: "Possible overpayments",
        value: money(totals.overpaid),
        note: "A potential refund opportunity",
        tone: "success",
      },
      {
        label: "Possible underpayments",
        value: money(totals.underpaid),
        note: "Potentially worth correcting with Customs",
        tone: totals.underpaid > 0 ? "error" : undefined,
      },
    ]}
  />
);
