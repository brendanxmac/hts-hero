import { StatStrip } from "@/components/ui/StatStrip";
import { money } from "./EntriesTable";
import { AuditTotals } from "./useAuditRows";

// The audit in three numbers: entries checked, possible over- and underpayments
export const AuditStats = ({ totals }: { totals: AuditTotals }) => (
  <StatStrip
    stats={[
      {
        label: "Entries audited",
        value: totals.audited.toLocaleString("en-US"),
        note: `Of ${totals.logged.toLocaleString("en-US")} logged · ${money(totals.paid)} paid`,
      },
      {
        label: "Possible overpayments",
        value: money(totals.overpaid),
        note: "A refund to ask your broker about",
        tone: "success",
      },
      {
        label: "Possible underpayments",
        value: money(totals.underpaid),
        note: "Worth correcting before Customs does",
        tone: totals.underpaid > 0 ? "error" : undefined,
      },
    ]}
  />
);
