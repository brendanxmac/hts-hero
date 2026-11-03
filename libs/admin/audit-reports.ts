// What users send from Duty Guard's entry audit for the admin to look at (audit_reports): the
// kinds, as the admin queue, the email and /audit-reports name them

export const AUDIT_REPORT_KINDS = {
  looks_wrong: { label: "An audit looks wrong", short: "Looks wrong" },
  missing_case: { label: "An AD/CVD case we don't have", short: "Missing case" },
  case_link: { label: "An AD/CVD case added by hand", short: "Case added" },
} as const

export type AuditReportKind = keyof typeof AUDIT_REPORT_KINDS

export interface AuditReport {
  id: string
  user_id: string | null
  user_email: string | null
  kind: AuditReportKind
  entry_id: string | null
  hts_code: string | null
  country: string | null
  case_number: string | null
  note: string | null
  details: Record<string, unknown>
  status: "open" | "resolved"
  created_at: string
  resolved_at: string | null
}
