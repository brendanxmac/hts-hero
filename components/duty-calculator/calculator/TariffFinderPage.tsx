"use client";

import { ReactNode, Suspense, useEffect, useRef } from "react";
import { trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import * as mk from "@/components/ui/marketing/styles";
import * as ui from "@/components/ui/styles";
import { LandingEmpty } from "../landing/LandingEmpty";
import { CalculatorWorkspace } from "./CalculatorWorkspace";
import { Disclaimer } from "./Disclaimer";
import { ExploreModal } from "./ExploreModal";
import { Example, useTariffFinder } from "../lib/useTariffFinder";

// The Tariff Calculator on /duty-calculator, and on each country page with that country chosen:
// the calculator band (CalculatorWorkspace, as in the Tariff Tracker), in the Tracker's look
// (DESIGN_SYSTEM.md §15). It follows light and
// dark with the site, unless the host page is held light (the country pages, for now).
// examples: the "Try an import" products (a country page's own)
export const TariffFinderPage = ({
  defaultCountry,
  path,
  examples,
  children,
}: {
  defaultCountry?: string;
  path?: string;
  examples?: Example[];
  // Above the calculator, in the same band: the page's heading (server-rendered by the host)
  children?: ReactNode;
} = {}) => (
  <div className={`${THEME} hts-tracker ${trackerSans.className} w-full pb-16 pt-2`}>
    {children}
    {/* The calculator reads the URL, so it renders on the client; its own Suspense boundary keeps
        the heading above in the server HTML (the page's h1, for crawlers) */}
    <Suspense
      fallback={
        <div className={mk.container}>
          <div className={`${ui.skeleton} h-64 w-full`} />
        </div>
      }
    >
      <Calculator defaultCountry={defaultCountry} path={path} examples={examples} />
    </Suspense>
  </div>
);

const Calculator = ({ defaultCountry, path, examples }: { defaultCountry?: string; path?: string; examples?: Example[] }) => {
  const f = useTariffFinder({ defaultCountry, path, examples });

  // A link to a code opens on its results: once they're in, glide down to the calculator
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
    <div ref={calculatorRef} className={`${mk.container} scroll-mt-4`}>
      <div className="flex flex-col gap-4">
        <CalculatorWorkspace
          f={f}
          page="calculator"
          empty={<LandingEmpty f={f} />}
        />
        <Disclaimer />
        <ExploreModal f={f} />
      </div>
    </div>
  );
};
