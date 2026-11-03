import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";
import { SalesHeader } from "@/components/ui/marketing/SalesHeader";
import { PRICING_HEADER_CTA, PRICING_NAV } from "@/components/pricing-calculator/sales/nav";

// Duty Guard's look, following the site's light/dark setting, with the sales pages' header
// (DESIGN_SYSTEM.md §15)
export default function PricingCalculatorLayout({ children }: { children: ReactNode }) {
  return (
    <FollowTheme>
      <MarketingLayout header={<SalesHeader product="Pricing" links={PRICING_NAV} cta={PRICING_HEADER_CTA} />}>{children}</MarketingLayout>
    </FollowTheme>
  );
}
