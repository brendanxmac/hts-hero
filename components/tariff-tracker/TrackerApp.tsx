"use client";

import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import * as ui from "@/components/ui/styles";
import { DEFAULT_SECTION, MOVED_TABS, productUrl, SECTIONS, SectionSlug, sectionBySlug, sectionUrl } from "./sections";
import { PlannedSection } from "./shell/PlannedSection";
import { SectionPage } from "./shell/SectionPage";
import { TrackerNav, TrackerNavContext } from "./shell/TrackerNav";
import { ImportTakeover } from "./onboarding/ImportTakeover";
import { FeatureTour } from "./onboarding/tour/FeatureTour";
import { TourTriggers } from "./onboarding/tour/TourTriggers";
import { TrackerShell } from "./shell/TrackerShell";
import { TrackerProvider } from "./TrackerContext";
import { TrackerAccessProvider } from "./access/TrackerAccessProvider";
import { UpgradeStatsBridge } from "./access/UpgradeStatsBridge";
import { InsightsProvider } from "./insights/InsightsContext";
import { AlertSettingsProvider } from "./alerts/AlertSettingsContext";
import { EntriesProvider } from "./entries/EntriesContext";
import { OpportunitiesProvider } from "./opportunities/OpportunitiesContext";
import { rememberSection } from "./overview/seenSections";

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
const Overview = dynamic(() => import("./overview/Overview").then((m) => m.Overview), { loading: PanelSkeleton });
const Savings = dynamic(() => import("./savings/Savings").then((m) => m.Savings), { loading: PanelSkeleton });
const EntryAudit = dynamic(() => import("./entries/EntryAudit").then((m) => m.EntryAudit), { loading: PanelSkeleton });
const Sourcing = dynamic(() => import("./sourcing/Sourcing").then((m) => m.Sourcing), { loading: PanelSkeleton });
const TariffChanges = dynamic(() => import("./changes/TariffChanges").then((m) => m.TariffChanges), { loading: PanelSkeleton });
const ExpertHelp = dynamic(() => import("./expert-help/ExpertHelp").then((m) => m.ExpertHelp), { loading: PanelSkeleton });
const TrackerCalculator = dynamic(
  () => import("./calculator/TrackerCalculator").then((m) => m.TrackerCalculator),
  { loading: PanelSkeleton }
);


const BASE_TITLE = "Tariff Tracker | HTS Hero";

export const TrackerApp = () => {
  const searchParams = useSearchParams();
  // Links into the catalog from before it had a tab of its own (?add=, ?product=) still land there
  const asked =
    sectionBySlug(searchParams.get("tab"))?.slug ??
    (searchParams.get("add") || searchParams.get("product") ? "catalog" : DEFAULT_SECTION);
  // A section that moved into another (Tariff News into Tariff Changes…) opens there
  const moved = MOVED_TABS[asked];
  const tab = moved?.tab ?? asked;
  useEffect(() => {
    if (!moved) return;
    // The address says where it now lives, keeping the rest of it (?update=, ?slack=…)
    const params = new URLSearchParams(window.location.search);
    params.set("tab", moved.tab);
    if (moved.view && !params.get("view")) params.set("view", moved.view);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [moved]);
  // A catalog product open in its own view
  const product = tab === "catalog" ? searchParams.get("product") : null;

  // Tabs opened so far, kept mounted
  const [visited, setVisited] = useState<SectionSlug[]>([tab]);
  useEffect(() => {
    setVisited((prev) => (prev.includes(tab) ? prev : [...prev, tab]));
    rememberSection(tab);
  }, [tab]);

  useEffect(() => {
    const section = sectionBySlug(tab);
    document.title = section && tab !== DEFAULT_SECTION ? `${section.title} · ${BASE_TITLE}` : BASE_TITLE;
  }, [tab]);

  // The built tabs; the rest show what's planned
  const built: Partial<Record<SectionSlug, (active: boolean) => ReactNode>> = {
    calculator: (active) => <TrackerCalculator key={calculatorRun} active={active} />,
    catalog: () => <ProductCatalog />,
    overview: () => <Overview />,
    savings: () => <Savings />,
    sourcing: () => <Sourcing />,
    changes: () => <TariffChanges />,
    entries: () => <EntryAudit />,
    "expert-help": () => <ExpertHelp />,
  };
  const panels = Object.fromEntries(
    Object.entries(built).filter(([slug]) => sectionBySlug(slug)?.ready)
  ) as typeof built;

  // Bumped to start the calculator over from the address, for a calculator link opened in place
  const [calculatorRun, setCalculatorRun] = useState(0);

  // Whether the user has moved around the Tracker since the page loaded: then an import's Back
  // returns to wherever they came from (scroll and filters intact). Landing straight on an import
  // (a shared link, an alert email) has nowhere to go back to in the Tracker, so Back opens Your
  // Imports instead.
  const wandered = useRef(false);
  const firstView = useRef(`${tab}:${product ?? ""}`);
  useEffect(() => {
    if (`${tab}:${product ?? ""}` !== firstView.current) wandered.current = true;
  }, [tab, product]);

  // Each view's scroll position (the Tracker's one scroller is its <main>), kept as the user
  // scrolls. Going back or forward (the browser's buttons, or an import's Back) returns to where
  // that view was; a new view opens at the top.
  const scrolls = useRef(new Map<string, number>());
  const viewKey = `${tab}:${product ?? ""}`;
  const currentView = useRef(viewKey);
  // The views visited, in order: arriving at the one before the current is going back
  const viewStack = useRef<string[]>([viewKey]);
  // Between leaving a view and the next one settling, scroll events are the browser clamping the
  // old view's position, so they aren't kept
  const settling = useRef(false);
  const leaveView = () => {
    const main = document.querySelector("main");
    if (main && !settling.current) scrolls.current.set(currentView.current, main.scrollTop);
    settling.current = true;
    // In case the view doesn't change after all (the same import on another tab)
    window.setTimeout(() => (settling.current = false), 1500);
  };
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const onScroll = () => {
      if (!settling.current) scrolls.current.set(currentView.current, main.scrollTop);
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (currentView.current === viewKey) return;
    currentView.current = viewKey;
    const main = document.querySelector("main");
    if (!main) return;
    const stack = viewStack.current;
    const back = stack.length > 1 && stack[stack.length - 2] === viewKey;
    if (back) stack.pop();
    else stack.push(viewKey);
    const target = back ? (scrolls.current.get(viewKey) ?? 0) : 0;
    // The view may still be filling in (charts, rows): try for a few frames until it's tall enough
    let frames = 0;
    const restore = () => {
      main.scrollTop = target;
      if (Math.abs(main.scrollTop - target) > 2 && frames++ < 30) requestAnimationFrame(restore);
      else settling.current = false;
    };
    restore();
  }, [viewKey]);

  const nav: TrackerNav = useMemo(
    () => ({
      tab,
      // pushState without a navigation: Next.js keeps useSearchParams in step, and nothing reloads
      openTab: (slug) => {
        if (slug === tab && !product) return;
        leaveView();
        window.history.pushState(null, "", sectionUrl(slug));
      },
      product,
      openProduct: (key, _fromList = false, productTab) => {
        leaveView();
        window.history.pushState(null, "", productUrl(key, productTab));
      },
      closeProduct: () => {
        if (wandered.current) window.history.back();
        else {
          leaveView();
          window.history.pushState(null, "", sectionUrl("catalog"));
        }
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
    <TrackerAccessProvider>
      <TrackerProvider>
        <OpportunitiesProvider>
          <InsightsProvider>
            <AlertSettingsProvider>
              <EntriesProvider>
                <TrackerNavContext.Provider value={nav}>
                  <UpgradeStatsBridge />
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
                          className="tt-enter"
                        >
                          <SectionPage section={section} showHeader={!["overview", "catalog", "expert-help", "changes", "calculator"].includes(section.slug)}>
                            {panel ? panel(active) : <PlannedSection section={section} />}
                          </SectionPage>
                        </div>
                      );
                    })}
                  </TrackerShell>
                  {/* Over everything, until the account has imports of its own */}
                  <ImportTakeover />
                  {/* The feature tour: by itself on the first visit and after the first imports, and from the sidebar */}
                  <FeatureTour />
                  <TourTriggers />
                </TrackerNavContext.Provider>
              </EntriesProvider>
            </AlertSettingsProvider>
          </InsightsProvider>
        </OpportunitiesProvider>
      </TrackerProvider>
    </TrackerAccessProvider>
  );
};
