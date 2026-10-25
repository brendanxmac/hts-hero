import { ReactNode } from "react"
import AdminFrame from "@/components/admin/AdminFrame"
import { guardAdmin } from "@/libs/admin/access"

export const dynamic = "force-dynamic"

// Admin only, live and local (libs/admin/access.ts)
export default async function EmailOutboxLayout({ children }: { children: ReactNode }) {
  await guardAdmin()
  return <AdminFrame>{children}</AdminFrame>
}
