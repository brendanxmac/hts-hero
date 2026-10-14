"use client";

import { Suspense } from "react";
import { BreadcrumbsProvider } from "@/contexts/BreadcrumbsContext";
import { CalculatorWorkspace } from "@/components/duty-calculator/calculator/CalculatorWorkspace";
import { Disclaimer } from "@/components/duty-calculator/calculator/Disclaimer";
import { ExploreModal } from "@/components/duty-calculator/calculator/ExploreModal";
import { useTariffFinder } from "@/components/duty-calculator/lib/useTariffFinder";
import * as ui from "@/components/ui/styles";
import { AddToCatalogButton } from "../AddToCatalogButton";
import { productKey } from "../adjustments";
import { TRACKER_PATH } from "../sections";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";

// The Tariff Calculator tab: the same calculator as /duty-calculator (CalculatorWorkspace),
// without that page's marketing, with "Add to catalog" in its results. While it's the open tab,
// the address follows its inputs; its share links open it here.
const CALCULATOR_TAB = { tab: "calculator" };

const Calculator = ({ active }: { active: boolean }) => {
  const f = useTariffFinder({ path: TRACKER_PATH, extraParams: CALCULATOR_TAB, syncAddress: active });
  const nav = useTrackerNav();
  const { products } = useTracker();
  // This import's own Savings tab when it's one of the user's imports; the Savings section if not
  const key = f.selectedElement && f.country ? productKey(f.selectedElement.htsno, f.country) : null;
  const checkSavings = () => (key && products.some((p) => p.key === key) ? nav.openProduct(key, false, "savings") : nav.openTab("savings"));
  return (
    <div className="flex flex-col gap-4">
      <CalculatorWorkspace f={f} page="tracker_calculator" onCheckSavings={checkSavings} actions={<AddToCatalogButton f={f} source="tracker_calculator" onOpen={nav.openProduct} />} />
      <Disclaimer />
      <ExploreModal f={f} />
    </div>
  );
};

export const TrackerCalculator = ({ active }: { active: boolean }) => (
  <BreadcrumbsProvider>
    {/* useSearchParams needs a Suspense boundary */}
    <Suspense fallback={<div className={`${ui.card} h-64`} />}>
      <Calculator active={active} />
    </Suspense>
  </BreadcrumbsProvider>
);
