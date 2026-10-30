import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";
import { SalesHeader } from "@/components/ui/marketing/SalesHeader";
import { AUDIT_HEADER_CTA, AUDIT_NAV } from "@/components/tariff-audit/lib/links";

export default function Layout({ children }: { children: ReactNode }) {
  // The Tariff Tracker's look, following the site's light/dark setting (DESIGN_SYSTEM.md §15), with
  // the page's own header: its sections and its button
  return (
    <FollowTheme>
      <MarketingLayout header={<SalesHeader product="Duty Audits" links={AUDIT_NAV} cta={AUDIT_HEADER_CTA} />}>{children}</MarketingLayout>
    </FollowTheme>
  );
}
