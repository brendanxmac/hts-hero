import { ReactNode } from "react";
import Footer from "@/components/Footer";
import { MarketingHeader } from "@/components/ui/marketing/MarketingHeader";
import { THEME_LIGHT } from "@/components/ui/theme";

// The frame of every landing page: the light marketing header, the page, and the site footer kept
// light to match. Inside .follow-theme (FollowTheme) all three follow the site's light/dark setting.
// `banner` is a promo bar above the header; `beforeFooter` a band every page in the section ends on.
// `header` replaces the site header (a sales page's own, SalesHeader).
export const MarketingLayout = ({
  children,
  banner,
  beforeFooter,
  header,
}: {
  children: ReactNode;
  banner?: ReactNode;
  beforeFooter?: ReactNode;
  header?: ReactNode;
}) => (
  <div className="flex min-h-screen flex-col bg-white skin:bg-base-100">
    {banner}
    {header ?? <MarketingHeader />}
    {children}
    {beforeFooter}
    <div className={`${THEME_LIGHT} scheme-light follow-dark:scheme-dark`}>
      <Footer />
    </div>
  </div>
);
