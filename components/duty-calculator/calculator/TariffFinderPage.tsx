"use client";

import { useEffect, useRef } from "react";
import { THEME } from "@/components/ui/theme";
import * as ui from "@/components/ui/styles";
import { AddToCatalogButton } from "@/components/tariff-tracker/AddToCatalogButton";
import { useTariffFinder } from "../lib/useTariffFinder";
import { CalculatorLayout } from "./CalculatorLayout";
import { Disclaimer } from "./Disclaimer";
import { ExploreModal } from "./ExploreModal";

// The Tariff Calculator on /duty-calculator, and on each country page with that country chosen
export const TariffFinderPage = ({ defaultCountry, path }: { defaultCountry?: string; path?: string } = {}) => {
  const f = useTariffFinder({ defaultCountry, path });

  // A link to a code opens on its results: once they're in, glide past the hero to the calculator
  const calculatorRef = useRef<HTMLDivElement>(null);
  const scrolledToResults = useRef(false);
  const resultsReady = Boolean(f.result && f.selectedElement && f.country && !f.loading);
  useEffect(() => {
    if (!f.deepLinked || !resultsReady || scrolledToResults.current) return;
    const scroll = () => {
      if (document.visibilityState !== "visible" || scrolledToResults.current) return;
      scrolledToResults.current = true;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      calculatorRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    };
    // A link opened in a background tab scrolls once the tab is first shown
    scroll();
    document.addEventListener("visibilitychange", scroll);
    return () => document.removeEventListener("visibilitychange", scroll);
  }, [f.deepLinked, resultsReady]);

  return (
    <div className={`${THEME} w-full pb-20`}>
      <div ref={calculatorRef} className={`${ui.container} flex flex-col gap-4 scroll-mt-4`}>
        <CalculatorLayout f={f} resultActions={<AddToCatalogButton f={f} source="calculator" />} />
        <Disclaimer />
      </div>
      <ExploreModal f={f} />
    </div>
  );
};
