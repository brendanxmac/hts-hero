import { ReactNode } from "react"
import AdminShell from "@/components/hts-revision-diff/AdminShell"
import { guardRevisionTool } from "./guard"

export const dynamic = "force-dynamic"

export default async function RevisionCheckerLayout({ children }: { children: ReactNode }) {
  await guardRevisionTool()
  return <AdminShell>{children}</AdminShell>
}
