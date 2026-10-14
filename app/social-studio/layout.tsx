import { ReactNode } from "react"
import AdminShell from "@/components/hts-revision-diff/AdminShell"
import { guardSocialStudio } from "@/libs/social-studio/access"

export const dynamic = "force-dynamic"

// Admin only (libs/social-studio/access.ts)
export default async function SocialStudioLayout({ children }: { children: ReactNode }) {
  await guardSocialStudio()
  return <AdminShell>{children}</AdminShell>
}
