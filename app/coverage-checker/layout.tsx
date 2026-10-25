import { ReactNode } from "react"
import AdminFrame from "@/components/admin/AdminFrame"
import { guardRevisionTool } from "../revision-checker/guard"

export const dynamic = "force-dynamic"

// Same admin gate as the revision checker
export default async function CoverageCheckerLayout({ children }: { children: ReactNode }) {
  await guardRevisionTool()
  return <AdminFrame>{children}</AdminFrame>
}
