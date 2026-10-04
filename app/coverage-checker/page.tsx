import CoverageDashboard from "@/components/hts-coverage/CoverageDashboard"
import { guardRevisionTool } from "../revision-checker/guard"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Coverage checker | HTS Hero",
  robots: { index: false, follow: false },
}

export default async function CoverageCheckerPage() {
  await guardRevisionTool()
  return <CoverageDashboard />
}
