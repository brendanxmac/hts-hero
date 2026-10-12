import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
