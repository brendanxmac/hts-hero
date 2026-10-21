import { ReactNode } from "react"
import AdminShell from "@/components/hts-revision-diff/AdminShell"
import { guardAdmin } from "@/libs/admin/access"

export const dynamic = "force-dynamic"

// Admin only, live and local (libs/admin/access.ts)
export default async function EmailOutboxLayout({ children }: { children: ReactNode }) {
  await guardAdmin()
  return <AdminShell>{children}</AdminShell>
}
