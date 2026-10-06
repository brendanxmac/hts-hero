"use client";

import { THEME } from "@/components/ui/theme";
import * as ui from "@/components/ui/styles";
import { AddToCatalogButton } from "@/components/tariff-tracker/AddToCatalogButton";
import { useTariffFinder } from "../lib/useTariffFinder";
import { CalculatorLayout } from "./CalculatorLayout";
import { Disclaimer } from "./Disclaimer";
import { ExploreModal } from "./ExploreModal";

// The Tariff Calculator on /duty-calculator
export const TariffFinderPage = () => {
  const f = useTariffFinder();

  return (
    <div className={`${THEME} w-full pb-20`}>
      <div className={`${ui.container} flex flex-col gap-4`}>
        <CalculatorLayout f={f} resultActions={<AddToCatalogButton f={f} source="calculator" />} />
        <Disclaimer />
      </div>
      <ExploreModal f={f} />
    </div>
  );
};
