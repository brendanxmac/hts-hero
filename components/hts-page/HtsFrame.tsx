import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { ClassifyCta } from "@/components/ui/marketing/ClassifyCta";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";
import { TrackerBanner } from "@/components/ui/marketing/TrackerBanner";

// The frame of the HTS reference pages (/hts/[code], /explore, /section, /chapter): the Tariff
// Tracker banner, the marketing header and footer, all in the Tracker's look following the site's
// light/dark setting (DESIGN_SYSTEM.md §15), with the classification band above the footer. The
// code pages leave the band off: their calls to action are the Tracker, the calculator and the
// tariff alerts, nothing else (2026-10-26)
export const HtsFrame = ({ children, classifyBand = true }: { children: ReactNode; classifyBand?: boolean }) => (
  <FollowTheme>
    <MarketingLayout banner={<TrackerBanner />} beforeFooter={classifyBand ? <ClassifyCta /> : undefined}>
      {children}
    </MarketingLayout>
  </FollowTheme>
);
