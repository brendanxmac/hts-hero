import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { ClassifyCta } from "@/components/ui/marketing/ClassifyCta";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";
import { TrackerBanner } from "@/components/ui/marketing/TrackerBanner";

// The frame of the HTS reference pages (/hts/[code], /explore, /section, /chapter): the Tariff
// Tracker banner, the marketing header and footer, all in the Tracker's look following the site's
// light/dark setting (DESIGN_SYSTEM.md §15), with the classification band above the footer.
export const HtsFrame = ({ children }: { children: ReactNode }) => (
  <FollowTheme>
    <MarketingLayout banner={<TrackerBanner />} beforeFooter={<ClassifyCta />}>
      {children}
    </MarketingLayout>
  </FollowTheme>
);
