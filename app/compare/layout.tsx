import { ReactNode } from "react";
import { THEME } from "@/components/ui/theme";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageFooter } from "@/components/ui/PageFooter";

// Static, like the blog: no session lookup, so every comparison prerenders
export default function CompareLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${THEME} flex min-h-screen w-full flex-col`}>
      <PageHeader />
      <main className="flex-1">{children}</main>
      <PageFooter />
    </div>
  );
}
