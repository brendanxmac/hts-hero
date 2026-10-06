import { ReactNode } from "react";
import { THEME } from "@/components/ui/theme";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageFooter } from "@/components/ui/PageFooter";

// Every blog page is static: no session lookup here, so posts prerender and land in the sitemap
export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${THEME} flex min-h-screen w-full flex-col`}>
      <PageHeader />
      <main className="flex-1">{children}</main>
      <PageFooter />
    </div>
  );
}
