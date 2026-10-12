import { ReactNode } from "react";
import Footer from "@/components/Footer";
import { MarketingHeader } from "@/components/ui/marketing/MarketingHeader";
import { THEME_LIGHT } from "@/components/ui/theme";

// The frame of every landing page: the light marketing header, the page, and the site footer kept
// light to match. Inside .follow-theme (FollowTheme) all three follow the site's light/dark setting.
export const MarketingLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col bg-white skin:bg-base-100">
    <MarketingHeader />
    {children}
    <div className={`${THEME_LIGHT} [color-scheme:light] follow-dark:[color-scheme:dark]`}>
      <Footer />
    </div>
  </div>
);
