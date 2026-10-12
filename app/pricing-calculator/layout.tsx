import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";

export default function PricingCalculatorLayout({ children }: { children: ReactNode }) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
