"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import * as ui from "@/components/ui/styles";
import { DEFAULT_SECTION, productUrl, SECTIONS, SectionSlug, sectionBySlug, sectionUrl } from "./sections";
import { PlannedSection } from "./shell/PlannedSection";
import { SectionPage } from "./shell/SectionPage";
import { TrackerNav, TrackerNavContext } from "./shell/TrackerNav";
import { TrackerShell } from "./shell/TrackerShell";
import { TrackerProvider } from "./TrackerContext";

// The Tariff Tracker: one page, with a tab per section. A tab's code loads the first time it's
// opened; after that it stays mounted (hidden while another tab is open), so switching back is
// instant and keeps its state. The open tab is in the address (?tab=), so it can be linked to
// and the back button moves between tabs.

const PanelSkeleton = () => (
  <div className="flex flex-col gap-3" aria-busy="true">
    <div className={`${ui.skeleton} h-40 w-full`} />
    <div className={`${ui.skeleton} h-64 w-full`} />
  </div>
);

const ProductCatalog = dynamic(() => import("./ProductCatalog").then((m) => m.ProductCatalog), {
  loading: PanelSkeleton,
});
const TrackerCalculator = dynamic(
  () => import("./calculator/TrackerCalculator").then((m) => m.TrackerCalculator),
  { loading: PanelSkeleton }
);


const BASE_TITLE = "Tariff Tracker | HTS Hero";

export const TrackerApp = () => {
  const searchParams = useSearchParams();
  const tab = sectionBySlug(searchParams.get("tab"))?.slug ?? DEFAULT_SECTION;
  // A catalog product open in its own view
  const product = tab === "catalog" ? searchParams.get("product") : null;

  // Tabs opened so far, kept mounted
  const [visited, setVisited] = useState<SectionSlug[]>([tab]);
  useEffect(() => {
    setVisited((prev) => (prev.includes(tab) ? prev : [...prev, tab]));
  }, [tab]);

  useEffect(() => {
    const section = sectionBySlug(tab);
    document.title = section && tab !== DEFAULT_SECTION ? `${section.title} · ${BASE_TITLE}` : BASE_TITLE;
  }, [tab]);

  // The built tabs; the rest show what's planned
  const panels: Partial<Record<SectionSlug, (active: boolean) => ReactNode>> = {
    calculator: (active) => <TrackerCalculator key={calculatorRun} active={active} />,
    catalog: () => <ProductCatalog />,
  };

  // Bumped to start the calculator over from the address, for a calculator link opened in place
  const [calculatorRun, setCalculatorRun] = useState(0);

  // Whether the open product was opened from the list, so going back returns to it (scroll and
  // filters intact) rather than adding another history entry
  const openedFromList = useRef(false);

  const nav: TrackerNav = useMemo(
    () => ({
      tab,
      // pushState without a navigation: Next.js keeps useSearchParams in step, and nothing reloads
      openTab: (slug) => {
        if (slug !== tab) window.history.pushState(null, "", sectionUrl(slug));
      },
      product,
      openProduct: (key, fromList = false) => {
        openedFromList.current = fromList;
        window.history.pushState(null, "", productUrl(key));
      },
      closeProduct: () => {
        if (openedFromList.current) window.history.back();
        else window.history.pushState(null, "", sectionUrl("catalog"));
        openedFromList.current = false;
      },
      openCalculator: (url) => {
        const { pathname, search } = new URL(url, window.location.origin);
        window.history.pushState(null, "", `${pathname}${search}`);
        setCalculatorRun((n) => n + 1);
      },
    }),
    [tab, product]
  );

  return (
    <TrackerProvider>
      <TrackerNavContext.Provider value={nav}>
        <TrackerShell>
          {SECTIONS.filter((s) => visited.includes(s.slug)).map((section) => {
            const active = section.slug === tab;
            const panel = panels[section.slug];
            return (
              <div
                key={section.slug}
                role="tabpanel"
                id={`tt-panel-${section.slug}`}
                aria-labelledby={`tt-tab-${section.slug}`}
                hidden={!active}
              >
                <SectionPage section={section} showHeader={!(section.slug === "catalog" && product)}>
                  {panel ? panel(active) : <PlannedSection section={section} />}
                </SectionPage>
              </div>
            );
          })}
        </TrackerShell>
      </TrackerNavContext.Provider>
    </TrackerProvider>
  );
};
