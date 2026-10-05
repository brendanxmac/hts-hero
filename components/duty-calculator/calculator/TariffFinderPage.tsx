"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Country } from "@/constants/countries";
import { HtsElement } from "@/interfaces/hts";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { TariffWatcher } from "@/components/tariff-watcher/TariffWatcher";
import { THEME } from "@/components/ui/theme";
import * as ui from "@/components/ui/styles";
import { useTariffFinder } from "../lib/useTariffFinder";
import { CalculatorLayout } from "./CalculatorLayout";
import { Disclaimer } from "./Disclaimer";
import { ExploreModal } from "./ExploreModal";
import { ToolTabs } from "./ToolTabs";
import { Tool } from "./tools";

// The Tariff Finder on /duty-calculator: the Tariff Calculator, and the Tariff Watcher behind a tab

// The Tariff Watcher tab is hidden while it moves to a page of its own; the calculator shows alone
const SHOW_TOOL_TABS = false;

// Kept on this device until watch lists are saved to accounts
const WATCH_LIST_KEY = "hts-hero-tariff-watch-list";

export const TariffFinderPage = () => {
  const f = useTariffFinder();
  const searchParams = useSearchParams();
  const [selectedTool, setTool] = useState<Tool>(() =>
    searchParams.get("tool") === "watcher" ? "watcher" : "calculator",
  );
  const tool: Tool = SHOW_TOOL_TABS ? selectedTool : "calculator";
  const [watchList, setWatchList] = useState("");

  // Follow ?tool= when it changes, e.g. from the links in the hero
  const toolParam = searchParams.get("tool");
  useEffect(() => {
    setTool(toolParam === "watcher" ? "watcher" : "calculator");
  }, [toolParam]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WATCH_LIST_KEY);
      if (saved) setWatchList(saved);
    } catch {
      // Storage can be unavailable (private mode); the list starts empty
    }
  }, []);

  const changeWatchList = (text: string) => {
    setWatchList(text);
    try {
      window.localStorage.setItem(WATCH_LIST_KEY, text);
    } catch {
      // Not critical
    }
  };

  const changeTool = (next: Tool) => {
    setTool(next);
    trackEvent(MixpanelEvent.TARIFF_TOOL_CHANGED, { tool: next });
    // null state: Next.js then keeps its router in sync with the new address
    const url = new URL(window.location.href);
    if (next === "watcher") url.searchParams.set("tool", "watcher");
    else url.searchParams.delete("tool");
    window.history.replaceState(null, "", url.toString());
  };

  // A product from the watch list, in full, in the calculator
  const openInCalculator = (element: HtsElement, country: Country) => {
    f.selectElement(element, "tariff_watcher");
    f.changeCountries([country]);
    f.changeView("detailed");
    changeTool("calculator");
    trackEvent(MixpanelEvent.TARIFF_WATCHER_OPENED_IN_CALCULATOR, {
      hts_code: element.htsno,
      country_code: country.code,
    });
    document.getElementById("tariff-tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={`${THEME} w-full pb-20`}>
      <div className={`${ui.container} flex flex-col gap-4`}>
        {SHOW_TOOL_TABS && <ToolTabs tool={tool} onChange={changeTool} />}
        <div
          {...(SHOW_TOOL_TABS
            ? {
              role: "tabpanel",
              id: `tool-panel-${tool}`,
              "aria-labelledby": `tool-tab-${tool}`,
            }
            : {})}
        >
          {tool === "watcher" ? (
            <TariffWatcher
              f={f}
              text={watchList}
              onTextChange={changeWatchList}
              onOpenInCalculator={openInCalculator}
            />
          ) : (
            <CalculatorLayout f={f} />
          )}
        </div>
        <Disclaimer />
      </div>
      <ExploreModal f={f} />
    </div>
  );
};
