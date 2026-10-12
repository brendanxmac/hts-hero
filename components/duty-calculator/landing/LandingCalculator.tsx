"use client";

import { useRef, useState } from "react";
import { trackerSans } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { THEME } from "@/components/ui/theme";
import { Disclaimer } from "../calculator/Disclaimer";
import { ExploreModal } from "../calculator/ExploreModal";
import { TariffFinder } from "../lib/useTariffFinder";
import { ProhibitedNotice } from "../notices/ProhibitedNotice";
import { VerifiedNotice } from "../notices/VerifiedNotice";
import { AdjustmentsTab } from "./AdjustmentsTab";
import { AnswerCard } from "./AnswerCard";
import { CalculatorTab, CalculatorTabs, TabInfo } from "./CalculatorTabs";
import { CompareTab } from "./CompareTab";
import { HistoryTab } from "./HistoryTab";
import { InputBar } from "./InputBar";
import { LandingEmpty } from "./LandingEmpty";
import { DownloadPdfButton, ShareButton } from "./ShareButtons";
import { TrackImportButton } from "./TrackImportButton";
import { TrackThisImport } from "./TrackThisImport";

// The Tariff Calculator on /duty-calculator and the country pages (DESIGN_SYSTEM.md §15 look,
// light or dark with the site): every input on one bar, then one full-width box with four tabs:
// Results (the total and every line), Possible Adjustments (what they change, before and after),
// Compare (other countries, and
// Sourcing Intelligence teased) and Duty Over Time (a few facts, and the history chart teased).
// Signed-in visitors are sent to the Tariff Tracker's calculator instead of this page.
export const LandingCalculator = ({ f }: { f: TariffFinder }) => {
  const { result, country, selectedElement } = f;
  const ready = Boolean(result && selectedElement && country && !f.loading);
  // Possible Adjustments and Duty Over Time are this page's own tabs
  const [pageTab, setPageTab] = useState<"adjustments" | "history" | null>(null);
  // The default comparison is added once a visit, so removing it sticks
  const autoAdded = useRef(false);

  // Compare is the finder's own view, so a shared link opens on it
  const tab: CalculatorTab = pageTab ?? (f.view === "compare" ? "compare" : "results");
  const changeTab = (next: CalculatorTab) => {
    if (next === "adjustments" || next === "history") {
      setPageTab(next);
      return;
    }
    setPageTab(null);
    f.changeView(next === "compare" ? "compare" : "detailed");
  };
  // Open questions that could change the total, plus an unclaimed trade preference
  const adjustments = f.openQuestions + (result && result.availablePreferences.length > 0 && !f.claimedPreference ? 1 : 0);

  const changes = f.history.filter((s) => s.changes.length > 0).length;
  const tabs: TabInfo[] = [
    { id: "results", label: "Results" },
    {
      id: "adjustments",
      label: "Possible Adjustments",
      // Adjustments still to check
      badge: adjustments,
    },
    { id: "compare", label: "Compare" },
    // How many times the duty on this import has changed
    { id: "history", label: "Duty Over Time", badge: changes },
  ];

  return (
    <div className={`${THEME} hts-tracker ${trackerSans.className} flex flex-col gap-4 bg-transparent`}>
      <InputBar f={f} />
      {f.loading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <div className={`${ui.skeleton} h-[28rem] rounded-3xl`} />
        </div>
      ) : ready && result ? (
        <>
          <VerifiedNotice f={f} />
          <ProhibitedNotice prohibitions={result.prohibitions} />
          <section className={tt.panel}>
            <CalculatorTabs
              tabs={tabs}
              value={tab}
              onChange={changeTab}
              actions={
                <>
                  <DownloadPdfButton />
                  <ShareButton f={f} />
                  <TrackImportButton f={f} size="sm" />
                </>
              }
            />
            <div role="tabpanel" id={`dc-panel-${tab}`} aria-labelledby={`dc-tab-${tab}`} className="p-6 lg:p-8">
              {tab === "results" ? (
                <AnswerCard f={f} result={result} adjustments={adjustments} onOpenAdjustments={() => changeTab("adjustments")} />
              ) : tab === "adjustments" ? (
                <AdjustmentsTab f={f} result={result} />
              ) : tab === "compare" ? (
                <CompareTab f={f} autoAdded={autoAdded} onViewDetails={() => setPageTab(null)} />
              ) : (
                <HistoryTab f={f} />
              )}
            </div>
          </section>
          <TrackThisImport />
        </>
      ) : (
        <LandingEmpty f={f} />
      )}
      <Disclaimer />
      <ExploreModal f={f} />
    </div>
  );
};
