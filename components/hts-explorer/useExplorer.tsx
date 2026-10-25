"use client";

import { createContext, useCallback, useContext, type ComponentType, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import { useHts } from "@/contexts/HtsContext";
import { useHtsSections } from "@/contexts/HtsSectionsContext";
import { HtsElement, HtsSection, HtsSectionAndChapterBase, Navigatable } from "@/interfaces/hts";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { generateBreadcrumbsForHtsElement, getHtsElementParents, getSectionAndChapterFromChapterNumber } from "@/libs/hts";
import { ExplorerNavigationKind, trackExplorerNavigatedToLevel } from "@/libs/explorer-navigation";
import type { ExplorerSurface } from "@/libs/explorer-surface";
import type { NavigatableElement } from "./types";

// What every part of the explorer shares: where it's shown, what "use this code" does there,
// what's selected (the end of the breadcrumbs trail) and which rows of the outline are open

// Only a line with 8 or more digits carries a duty the calculator can work out
export const isTariffLevel = (element: HtsElement) => htsCodeDigitsOnly(element.htsno ?? "").length >= 8;

// The outline's key for each kind of row
export const sectionKey = (n: number) => `s:${n}`;
export const chapterKey = (n: number) => `c:${n}`;
export const lineKey = (element: HtsElement) => `e:${element.uuid}`;

export const keyOfCrumb = (crumb: NavigatableElement | undefined) =>
  !crumb
    ? null
    : crumb.element.type === Navigatable.CHAPTER
      ? chapterKey((crumb.element as HtsSectionAndChapterBase).number)
      : crumb.element.type === Navigatable.ELEMENT
        ? lineKey(crumb.element as HtsElement)
        : null;

export const sectionOfChapter = (sections: HtsSection[], chapter: number) =>
  sections.find((s) => s.chapters.some((c) => c.number === chapter));

interface ExplorerState {
  explorerSurface?: ExplorerSurface;
  // Over a calculator: puts the chosen code in its input bar
  onUseCode?: (element: HtsElement) => void;
  // What that button says, for the page it's over ("Calculate duty" when left out)
  useCodeAction?: UseCodeAction;
  // The outline's open rows
  expanded: Set<string>;
  setExpanded: (update: (prev: Set<string>) => Set<string>) => void;
  // A row to bring into view in the outline, once it's drawn
  reveal: { key: string; at: number } | null;
  setReveal: (reveal: { key: string; at: number } | null) => void;
  // While searching: go back to the outline, at the selection
  showInSchedule?: () => void;
}

export interface UseCodeAction {
  label: string;
  Icon: ComponentType<{ className?: string }>;
}

const ExplorerContext = createContext<ExplorerState | null>(null);

export const ExplorerProvider = ({ value, children }: { value: ExplorerState; children: ReactNode }) => (
  <ExplorerContext.Provider value={value}>{children}</ExplorerContext.Provider>
);

export const useExplorer = () => {
  const state = useContext(ExplorerContext);
  if (!state) throw new Error("useExplorer must be used within the explorer");
  const pathname = usePathname();
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { htsElements } = useHts();
  const { sections } = useHtsSections();
  const { setReveal, setExpanded } = state;

  // Select the end of a trail. reveal: bring its row into view in the outline, for selections
  // made somewhere other than the row itself (a search result, the path, a link)
  const navigate = useCallback(
    (
      trail: NavigatableElement[],
      kind: ExplorerNavigationKind,
      extra: { hts_code?: string | null; chapter_number?: number | null; breadcrumb_index?: number; hts_path_index?: number } = {},
      reveal = true,
      // false for moves the explorer makes itself (opening on its host's code), not the user's
      track = true
    ) => {
      if (track) {
        trackExplorerNavigatedToLevel({
          pathname,
          explorerSurface: state.explorerSurface,
          navigation_kind: kind,
          from_depth: breadcrumbs.length,
          to_depth: trail.length,
          ...extra,
        });
      }
      setBreadcrumbs(trail);
      const key = keyOfCrumb(trail[trail.length - 1]);
      if (reveal && key) setReveal({ key, at: Date.now() });
    },
    [pathname, state.explorerSurface, breadcrumbs.length, setBreadcrumbs, setReveal]
  );

  // The whole trail down to a line, from the sections
  const trailTo = useCallback(
    (element: HtsElement): NavigatableElement[] | null => {
      const sectionAndChapter = getSectionAndChapterFromChapterNumber(sections, Number(element.chapter));
      if (!sectionAndChapter) return null;
      return generateBreadcrumbsForHtsElement(sections, sectionAndChapter.chapter, [
        ...getHtsElementParents(element, htsElements),
        element,
      ]);
    },
    [sections, htsElements]
  );

  const trailToChapter = (chapter: HtsSectionAndChapterBase): NavigatableElement[] => [
    { title: "Sections", element: { type: Navigatable.SECTIONS, sections } },
    { title: `Chapter ${chapter.number}`, element: { ...chapter, type: Navigatable.CHAPTER } },
  ];

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // The schedule's own copy of a line, without the trail's additions
  const original = (element: HtsElement) => htsElements.find((e) => e.uuid === element.uuid) ?? element;

  return {
    ...state,
    applyCode: state.onUseCode ? (element: HtsElement) => state.onUseCode?.(original(element)) : undefined,
    breadcrumbs,
    selected: breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1] : undefined,
    selectedKey: keyOfCrumb(breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1] : undefined),
    navigate,
    trailTo,
    trailToChapter,
    toggle,
  };
};
