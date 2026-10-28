import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";
import { SalesHeader } from "@/components/ui/marketing/SalesHeader";
import { ALERTS_HEADER_CTA, ALERTS_NAV } from "@/components/tariff-alerts/lib/nav";

export default function Layout({ children }: { children: ReactNode }) {
  // The Tariff Tracker's look, following the site's light/dark setting (DESIGN_SYSTEM.md §15), with
  // the page's own header: its sections and its button
  return (
    <FollowTheme>
      <MarketingLayout header={<SalesHeader product="Tariff Alerts" links={ALERTS_NAV} cta={ALERTS_HEADER_CTA} />}>{children}</MarketingLayout>
    </FollowTheme>
  );
}
