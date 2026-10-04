import { ReactNode } from "react"
import AdminShell from "@/components/hts-revision-diff/AdminShell"
import { guardRevisionTool } from "../revision-checker/guard"

export const dynamic = "force-dynamic"

// Same admin gate as the revision checker
export default async function CoverageCheckerLayout({ children }: { children: ReactNode }) {
  await guardRevisionTool()
  return <AdminShell>{children}</AdminShell>
}
