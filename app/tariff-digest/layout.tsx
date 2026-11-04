import { ReactNode } from "react"
import { MarketingLayout } from "@/components/MarketingLayout"
import { FollowTheme } from "@/components/ui/marketing/FollowTheme"
import { DigestHeader } from "@/components/tariff-digest/DigestHeader"

// The Weekly Tariff Digest's sign-up page: Duty Guard's palette and fonts (DESIGN_SYSTEM.md §15),
// dark bands all the way down, and a header with nothing to click away to
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <FollowTheme>
      <MarketingLayout header={<DigestHeader />}>{children}</MarketingLayout>
    </FollowTheme>
  )
}
