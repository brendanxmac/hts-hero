import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Viewport } from "next";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import { GoogleAnalytics } from "@next/third-parties/google";
import config from "@/config";
import "./globals.css";
import { HtsSectionsProvider } from "../contexts/HtsSectionsContext";
import { ClassificationProvider } from "../contexts/ClassificationContext";
import { HtsProvider } from "../contexts/HtsContext";
import { UserProvider } from "../contexts/UserContext";
import { GuideProvider } from "@/contexts/GuideContext";
import { GuideInitializer } from "@/components/GuideInitializer";
import { classifyGuideSteps, guides } from "@/constants/guides";
import { GuideName } from "@/types/guides";

const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  // Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme={config.colors.theme} className={font.className}>
      <body>
        <GuideProvider guides={guides}>
          <GuideInitializer />
          <UserProvider>
            <HtsSectionsProvider>
              <ClassificationProvider>
                <HtsProvider>
                  {/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
                  <ClientLayout>{children}</ClientLayout>
                </HtsProvider>
              </ClassificationProvider>
            </HtsSectionsProvider>
          </UserProvider>
        </GuideProvider>
        <GoogleAnalytics gaId="G-V2DRE5Y0NV" />
      </body>
    </html>
  );
}
