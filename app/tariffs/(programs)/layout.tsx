import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";
import { TrackerBanner } from "@/components/ui/marketing/TrackerBanner";
import { TrackerCta } from "@/components/ui/marketing/TrackerCta";

// The /tariffs program pages: the HTS reference pages' frame (Tracker look, Tracker banner), with
// the Tariff Tracker band above the footer instead of the classification one
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <FollowTheme>
      <MarketingLayout banner={<TrackerBanner />} beforeFooter={<TrackerCta />}>
        {children}
      </MarketingLayout>
    </FollowTheme>
  );
}
