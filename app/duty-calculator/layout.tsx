import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";
import { COUNTRY_PAGES } from "@/libs/country-pages/countries";

// Every /duty-calculator page is a landing page: the marketing header and footer. The calculator
// itself has the Tariff Tracker's look; /duty-calculator and the country pages are in that look
// throughout, following the site's light/dark setting. The others (changelog, FAQ, countries hub)
// stay in the light marketing look for now.
const TRACKER_SKIN_PATHS = ["/duty-calculator", ...COUNTRY_PAGES.map((c) => `/duty-calculator/${c.slug}`)];

export default function DutyCalculatorLayout({ children }: { children: ReactNode }) {
  return (
    <FollowTheme paths={TRACKER_SKIN_PATHS}>
      <MarketingLayout>{children}</MarketingLayout>
    </FollowTheme>
  );
}
