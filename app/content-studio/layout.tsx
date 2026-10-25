import { ReactNode } from "react"
import AdminFrame from "@/components/admin/AdminFrame"
import { guardSocialStudio } from "@/libs/social-studio/access"

export const dynamic = "force-dynamic"

// Admin only (libs/social-studio/access.ts)
export default async function SocialStudioLayout({ children }: { children: ReactNode }) {
  await guardSocialStudio()
  return <AdminFrame>{children}</AdminFrame>
}
