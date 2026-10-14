import { ReactNode } from "react"
import { MarketingLayout } from "@/components/MarketingLayout"
import { FollowTheme } from "@/components/ui/marketing/FollowTheme"
import { TrackerBanner } from "@/components/ui/marketing/TrackerBanner"

// The tariff updates pages, in the Tariff Tracker's look like the HTS pages (DESIGN_SYSTEM.md §15,
// "Public pages in the Tracker look"), with the Tracker banner above the header
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <FollowTheme>
      <MarketingLayout banner={<TrackerBanner />}>{children}</MarketingLayout>
    </FollowTheme>
  )
}
