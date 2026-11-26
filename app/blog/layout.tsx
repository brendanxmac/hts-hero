import { ReactNode } from "react";
import { THEME } from "@/components/ui/theme";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageFooter } from "@/components/ui/PageFooter";
import { SaleBanner } from "@/components/sale/SaleBanner";
import { SalePopup } from "@/components/sale/SalePopup";
import { isSaleLive } from "@/libs/black-friday";

// Every blog page is static: no session lookup here, so posts prerender and land in the sitemap.
// While a sale is on, its bar sits above the header and its popup opens once a day
export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${THEME} flex min-h-screen w-full flex-col`}>
      <SaleBanner serverLive={isSaleLive()} />
      <SalePopup serverLive={isSaleLive()} />
      <PageHeader />
      <main className="flex-1">{children}</main>
      <PageFooter />
    </div>
  );
}
