import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";

// The Tariff Tracker's look, following the site's light/dark setting, like the homepage
// (DESIGN_SYSTEM.md §15)
export default function PricingCalculatorLayout({ children }: { children: ReactNode }) {
  return (
    <FollowTheme>
      <MarketingLayout>{children}</MarketingLayout>
    </FollowTheme>
  );
}
