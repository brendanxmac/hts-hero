import { ReactNode } from "react";
import Footer from "@/components/Footer";
import { MarketingHeader } from "@/components/ui/marketing/MarketingHeader";
import { THEME_LIGHT } from "@/components/ui/theme";

// The frame of every landing page: the light marketing header, the page, and the site footer kept
// light to match. Inside .follow-theme (FollowTheme) all three follow the site's light/dark setting.
// `banner` is a promo bar above the header; `beforeFooter` a band every page in the section ends on.
export const MarketingLayout = ({
  children,
  banner,
  beforeFooter,
}: {
  children: ReactNode;
  banner?: ReactNode;
  beforeFooter?: ReactNode;
}) => (
  <div className="flex min-h-screen flex-col bg-white skin:bg-base-100">
    {banner}
    <MarketingHeader />
    {children}
    {beforeFooter}
    <div className={`${THEME_LIGHT} scheme-light follow-dark:scheme-dark`}>
      <Footer />
    </div>
  </div>
);
