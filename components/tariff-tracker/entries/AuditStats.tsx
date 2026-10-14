import { TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { useTrackerAccess } from "../access/accessContext";
import { StatRow } from "../shell/StatRow";
import { money } from "./EntriesTable";
import { AuditTotals } from "./useAuditRows";

// The audit in four numbers: entries checked, possible over- and underpayments, checks left
export const AuditStats = ({ totals }: { totals: AuditTotals }) => {
  const { access } = useTrackerAccess();
  return (
    <StatRow
      stats={[
        { label: "Entries audited", value: totals.audited.toLocaleString("en-US"), note: `Of ${totals.logged.toLocaleString("en-US")} logged · ${money(totals.paid)} paid` },
        { label: "Possible overpayments", value: money(totals.overpaid), note: "A refund to ask your broker about", tone: "success" },
        { label: "Possible underpayments", value: money(totals.underpaid), note: "Worth correcting before Customs does", tone: totals.underpaid > 0 ? "error" : undefined },
        {
          label: "Audit checks left",
          value: access.kind === "paid" ? "Unlimited" : String(Math.max(0, TRIAL_ALLOWANCE.auditChecks - access.usage.auditsChecked.length)),
          note: access.kind === "paid" ? "With your plan" : `Of ${TRIAL_ALLOWANCE.auditChecks} free`,
        },
      ]}
    />
  );
};
