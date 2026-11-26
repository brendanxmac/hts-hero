import { ReactNode } from "react";
import Footer from "@/components/Footer";
import { MarketingHeader } from "@/components/ui/marketing/MarketingHeader";
import { THEME_LIGHT } from "@/components/ui/theme";
import { SaleBanner } from "@/components/sale/SaleBanner";
import { SalePopup } from "@/components/sale/SalePopup";
import { isSaleLive } from "@/libs/black-friday";

// The frame of every landing page: the light marketing header, the page, and the site footer kept
// light to match. Inside .follow-theme (FollowTheme) all three follow the site's light/dark setting.
// `banner` is a promo bar above the header; `beforeFooter` a band every page in the section ends on.
// `header` replaces the site header (a sales page's own, SalesHeader).
// While a sale is on (libs/black-friday.ts) its bar takes the banner's place and its popup opens
// once a day; `sale={false}` leaves a page out (the media kit, for sponsors).
export const MarketingLayout = ({
  children,
  banner,
  beforeFooter,
  header,
  sale = true,
}: {
  children: ReactNode;
  banner?: ReactNode;
  beforeFooter?: ReactNode;
  header?: ReactNode;
  sale?: boolean;
}) => (
  <div className="flex min-h-screen flex-col bg-white skin:bg-base-100">
    {sale ? <SaleBanner fallback={banner} serverLive={isSaleLive()} /> : banner}
    {sale && <SalePopup serverLive={isSaleLive()} />}
    {header ?? <MarketingHeader />}
    {children}
    {beforeFooter}
    <div className={`${THEME_LIGHT} scheme-light follow-dark:scheme-dark`}>
      <Footer />
    </div>
  </div>
);
