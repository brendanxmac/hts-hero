import AuditReports from "@/components/admin/audit-reports/AuditReports"
import { guardAdmin } from "@/libs/admin/access"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Audit Reports | HTS Hero",
  robots: { index: false, follow: false },
}

// What users sent from Duty Guard's entry audit (libs/admin/audit-reports.ts)
export default async function AuditReportsPage() {
  await guardAdmin()
  return <AuditReports />
}
