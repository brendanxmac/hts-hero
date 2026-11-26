import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";

// The Black Friday page in Duty Guard's look, following the site's light/dark setting, with the
// site header. No sale bar or popup here: this is where they lead (SaleBanner, SalePopup)
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <FollowTheme>
      <MarketingLayout>{children}</MarketingLayout>
    </FollowTheme>
  );
}
