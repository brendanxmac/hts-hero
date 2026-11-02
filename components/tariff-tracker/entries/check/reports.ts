import type { AuditReportKind } from "@/libs/admin/audit-reports";

// Sends something from the entry audit to the admin (/api/audit-reports): "This looks wrong", an
// AD/CVD case we don't have, or one added by hand. Resolves to whether it was sent.
export const sendAuditReport = async (report: {
  kind: AuditReportKind;
  entryId?: string | null;
  htsCode?: string | null;
  country?: string | null;
  caseNumber?: string | null;
  note?: string;
  details: Record<string, unknown>;
}) => {
  const r = await fetch("/api/audit-reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
  }).catch((): null => null);
  return !!r?.ok;
};
