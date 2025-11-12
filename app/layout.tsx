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
import { createClient } from "./api/supabase/server";
import { AuthenticatedHeader } from "../components/AuthenticatedHeader";
import UnauthenticatedHeader from "../components/UnauthenticatedHeader";

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

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" data-theme={config.colors.theme} className={font.className}>
      <body>
        <UserProvider>
          {/* <GuideProvider guides={guides}> */}
          <HtsSectionsProvider>
            <ClassificationProvider>
              <HtsProvider>
                {/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
                <ClientLayout>{children}</ClientLayout>
              </HtsProvider>
            </ClassificationProvider>
          </HtsSectionsProvider>
          {/* </GuideProvider> */}
        </UserProvider>
        <GoogleAnalytics gaId="G-V2DRE5Y0NV" />
      </body>
    </html>
  );
}
