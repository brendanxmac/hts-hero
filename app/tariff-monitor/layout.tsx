import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";

export default function Layout({ children }: { children: ReactNode }) {
  // The Tariff Tracker's look, following the site's light/dark setting (DESIGN_SYSTEM.md §15)
  return (
    <FollowTheme>
      <MarketingLayout>{children}</MarketingLayout>
    </FollowTheme>
  );
}
