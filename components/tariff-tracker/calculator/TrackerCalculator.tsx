"use client";

import { Suspense, useDeferredValue, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { BreadcrumbsProvider } from "@/contexts/BreadcrumbsContext";
import { useHts } from "@/contexts/HtsContext";
import { CalculatorLayout } from "@/components/duty-calculator/calculator/CalculatorLayout";
import { Disclaimer } from "@/components/duty-calculator/calculator/Disclaimer";
import { ExploreModal } from "@/components/duty-calculator/calculator/ExploreModal";
import { TariffFinder, useTariffFinder } from "@/components/duty-calculator/lib/useTariffFinder";
import { formatMoney } from "@/components/duty-calculator/lib/format";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { HtsElement } from "@/interfaces/hts";
import { AddToCatalogButton } from "../AddToCatalogButton";
import { AnalysisTab } from "../product/analysis/AnalysisTab";
import { TrackedProduct, trackProduct } from "../report";
import { TRACKER_PATH } from "../sections";
import { SubTabs } from "../shell/SubTabs";
import { useTrackerNav } from "../shell/TrackerNav";

// The Tariff Calculator tab: the same calculator as /duty-calculator, without that page's
// marketing, plus the tracker's Analysis of whatever is in it (its duty from every origin, the
// globe, the time-lapse, stability). While it's the open tab, the address follows its inputs; its
// share links open it here.
const CALCULATOR_TAB = { tab: "calculator" };

type CalculatorView = "duty" | "analysis";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// The calculator's inputs as a tracked product, the shape the Analysis works from
const productOf = (f: TariffFinder, htsElements: HtsElement[]): TrackedProduct | null =>
  f.selectedElement && f.country && htsElements.length
    ? trackProduct(
        { line: 1, text: `${f.selectedElement.htsno},${f.country.code}`, element: f.selectedElement, country: f.country },
        htsElements,
        ISO_DATE.test(f.entryDate) ? f.entryDate : new Date().toISOString().slice(0, 10),
        {
          customsValue: f.customsValue,
          quantity: f.quantity,
          transportMode: f.transportMode,
          claimedPreference: f.claimedPreference || undefined,
          answers: f.answers,
        }
      )
    : null;

const Calculator = ({ active }: { active: boolean }) => {
  const f = useTariffFinder({ path: TRACKER_PATH, extraParams: CALCULATOR_TAB, syncAddress: active });
  const nav = useTrackerNav();
  const { htsElements } = useHts();
  const searchParams = useSearchParams();
  // `view=analysis` opens straight onto the Analysis (links from the MCP server use it)
  const [view, setView] = useState<CalculatorView>(() =>
    searchParams.get("view") === "analysis" ? "analysis" : "duty"
  );

  // Worked out only while the Analysis is open, and only when an input changes (a beat behind
  // typing): the same product keeps the same identity, so the analysis isn't redone needlessly
  const inputsKey = useDeferredValue(
    JSON.stringify([
      f.selectedElement?.htsno,
      f.country?.code,
      f.customsValue,
      f.quantity,
      f.entryDate,
      f.transportMode,
      f.claimedPreference,
      f.answers,
    ])
  );
  const product = useMemo(
    () => (view === "analysis" ? productOf(f, htsElements) : null),
    // The inputs, through their key
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, inputsKey, htsElements]
  );
  const ready = Boolean(f.selectedElement && f.country && f.result);

  return (
    <div className="flex flex-col gap-4">
      <SubTabs<CalculatorView>
        label="Calculator"
        tabs={[
          { id: "duty", label: "Duty" },
          { id: "analysis", label: "Analysis", disabled: !ready },
        ]}
        value={ready ? view : "duty"}
        onChange={setView}
      />

      {view === "analysis" && ready && product ? (
        <div className="flex flex-col gap-4">
          {/* What's being analyzed, and the way back to change it */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className={`${mono.className} text-lg font-semibold text-base-content`}>{product.entry.element.htsno}</span>
            <span className="text-sm text-base-content/70">
              {product.entry.country.flag} {product.entry.country.name} · {formatMoney(product.customsValue).replace(/\.00$/, "")}
            </span>
            <button type="button" className={`${ui.link} inline-flex items-center gap-1 text-sm`} onClick={() => setView("duty")}>
              <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
              Change the product or shipment
            </button>
            <span className="ml-auto">
              <AddToCatalogButton f={f} source="tracker_calculator" onOpen={nav.openProduct} />
            </span>
          </div>
          <AnalysisTab product={product} />
        </div>
      ) : (
        <>
          <CalculatorLayout
            f={f}
            resultActions={<AddToCatalogButton f={f} source="tracker_calculator" onOpen={nav.openProduct} />}
          />
          <Disclaimer />
        </>
      )}
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
