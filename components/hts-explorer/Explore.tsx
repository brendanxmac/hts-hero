"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { usePathname, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import { useHts } from "@/contexts/HtsContext";
import { useHtsSections } from "@/contexts/HtsSectionsContext";
import { HtsElement, HtsSectionAndChapterBase, Navigatable } from "@/interfaces/hts";
import { htsCodeDigitsOnly, htsCodesEqual } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { resolveExplorerSurface, type ExplorerSurface } from "@/libs/explorer-surface";
import { notes } from "@/public/notes/notes";
import { THEME } from "@/components/ui/theme";
import { trackerDisplay, trackerSans } from "@/components/ui/font";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { Inspector } from "./Inspector";
import { NotesView } from "./NotesView";
import { Outline } from "./Outline";
import { SearchResults } from "./SearchResults";
import type { NavigatableElement } from "./types";
import { chapterKey, ExplorerProvider, lineKey, sectionKey, sectionOfChapter, useExplorer, type UseCodeAction } from "./useExplorer";

export type { ExplorerSurface };

// The HTS explorer: the whole schedule as one outline that opens in place (sections, chapters,
// headings, codes), with whatever is selected shown in full in a panel beside it, and a search
// that lists matches in the outline's place. Nothing jumps: opening and selecting rows leaves the
// list where it is. In the Tariff Tracker's look (DESIGN_SYSTEM.md §15) wherever it's shown: the
// /explore page, and in a dialog over the calculator (where "Calculate duty" puts a code in its input bar)
// or a classification.

type Tab = "codes" | "notes";
const TABS = [
  { id: "codes", label: "HTS Codes" },
  { id: "notes", label: "Notes" },
] as const;

const MAX_RESULTS = 30;
const SEARCH_DELAY_MS = 250;

interface ExploreProps {
  // Mixpanel: where this explorer is shown (falls back to the address)
  explorerSurface?: ExplorerSurface;
  // Open directly on this trail (e.g. the classifier's "View element")
  initialBreadcrumbs?: NavigatableElement[];
  // The global dialog wires this so Cmd/Ctrl+S can refocus the search while open
  onSearchInputMount?: (el: HTMLInputElement | null) => void;
  // Over a calculator: put the chosen code in its input bar (the calculator then being the
  // estimate, a line shows none of its own)
  onUseCode?: (element: HtsElement) => void;
  // What that button says ("Calculate duty" when left out): Sourcing's is "Find Sources"
  useCodeAction?: UseCodeAction;
  // Open on this line (the code already in the calculator), unless the trail was set from outside
  startAt?: HtsElement | null;
  // On a page: its title and intro, which the search sits beside
  heading?: ReactNode;
  // On a page: something beside the heading (/explore: the tariff news sign-up); the search then
  // gets a row of its own, over the schedule
  aside?: ReactNode;
  // In a dialog: its title and close button; the outline and the panel scroll inside it
  dialog?: { title: string; onClose: () => void };
}

export const Explore = (props: ExploreProps) => {
  const { initialBreadcrumbs, dialog } = props;
  const { setBreadcrumbs } = useBreadcrumbs();
  const { sections, getSections } = useHtsSections();
  const { htsElements, fetchElements } = useHts();
  const [loading, setLoading] = useState(!sections.length || !htsElements.length);

  // Load the schedule, then start on the given trail, or nothing selected
  useEffect(() => {
    const start = (sectionList: typeof sections) =>
      setBreadcrumbs((prev) => {
        if (prev.length > 0) return prev;
        if (initialBreadcrumbs?.length) return initialBreadcrumbs;
        return [{ title: "Sections", element: { type: Navigatable.SECTIONS, sections: sectionList } }];
      });
    if (sections.length && htsElements.length) {
      start(sections);
      return;
    }
    Promise.all([htsElements.length ? null : fetchElements("latest"), getSections()])
      .then(([, loaded]) => start(loaded ?? sections))
      .catch((e) => console.error("Error loading the HTS:", e))
      .finally(() => setLoading(false));
    // Once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} flex min-h-0 w-full flex-col text-base-content ${
        dialog ? "h-full bg-base-200" : "bg-transparent"
      }`}
    >
      <ExplorerState {...props} loading={loading} />
    </div>
  );
};

// What the explorer remembers while it's open: the search, the tab, the outline-solid's open rows
const ExplorerState = (props: ExploreProps & { loading: boolean }) => {
  const { explorerSurface, onUseCode, useCodeAction, startAt } = props;
  const searchParams = useSearchParams();
  const { breadcrumbs } = useBreadcrumbs();
  const { sections } = useHtsSections();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [reveal, setReveal] = useState<{ key: string; at: number } | null>(null);
  // A ?code= or ?search= in the address starts the search, unless something opens it on a line
  const [searchValue, setSearchValue] = useState(() =>
    breadcrumbs.length > 1 || startAt ? "" : searchParams.get("code") || searchParams.get("search") || ""
  );
  const searching = Boolean(searchValue.trim());

  // Whatever gets selected, open the outline down to it (and it, to show what's under it)
  useEffect(() => {
    const keys: string[] = [];
    for (const crumb of breadcrumbs) {
      if (crumb.element.type === Navigatable.CHAPTER) {
        const number = (crumb.element as HtsSectionAndChapterBase).number;
        const section = sectionOfChapter(sections, number);
        if (section) keys.push(sectionKey(section.number));
        keys.push(chapterKey(number));
      } else if (crumb.element.type === Navigatable.ELEMENT) {
        keys.push(lineKey(crumb.element as HtsElement));
      }
    }
    setExpanded((prev) => (keys.every((k) => prev.has(k)) ? prev : new Set(Array.from(prev).concat(keys))));
  }, [breadcrumbs, sections]);

  return (
    <ExplorerProvider
      value={{
        explorerSurface,
        onUseCode,
        useCodeAction,
        expanded,
        setExpanded,
        reveal,
        setReveal,
        showInSchedule: searching ? () => setSearchValue("") : undefined,
      }}
    >
      <Layout {...props} searchValue={searchValue} setSearchValue={setSearchValue} />
    </ExplorerProvider>
  );
};

const Layout = ({
  loading,
  explorerSurface: explorerSurfaceProp,
  onSearchInputMount,
  startAt,
  heading,
  aside,
  dialog,
  searchValue,
  setSearchValue,
}: ExploreProps & { loading: boolean; searchValue: string; setSearchValue: (value: string) => void }) => {
  const pathname = usePathname();
  const explorerSurface = resolveExplorerSurface(explorerSurfaceProp, pathname);
  const searchParams = useSearchParams();
  const { htsElements, revision } = useHts();
  const { breadcrumbs, navigate, trailTo, selectedKey, setExpanded } = useExplorer();
  const [tab, setTab] = useState<Tab>("codes");
  const codeParam = searchParams.get("code");
  const [query, setQuery] = useState(searchValue.trim());
  const [highlighted, setHighlighted] = useState(0);
  const directlyOpened = useRef(breadcrumbs.length > 1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Search once typing pauses
  useEffect(() => {
    const next = searchValue.trim();
    if (!next) {
      setQuery("");
      return;
    }
    const timer = setTimeout(() => setQuery(next), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchValue]);
  const pending = searchValue.trim() !== query;
  const searching = Boolean(searchValue.trim());

  // Every word must appear in the line or the headings above it, so "cotton t-shirts" finds
  // 6109.10.00 ("Of cotton", under "T-shirts…")
  const fuse = useMemo(
    () =>
      htsElements.length
        ? new Fuse(withHeadings(htsElements), {
            keys: [{ name: "text", weight: 2 }, "htsno"],
            threshold: 0.15,
            ignoreLocation: true,
            useExtendedSearch: true,
          })
        : null,
    [htsElements]
  );
  const notesFuse = useMemo(
    () => new Fuse(notes, { keys: ["title", "description"], threshold: 0.1, findAllMatches: true, ignoreLocation: true }),
    []
  );

  // Digits (with or without dots) find the codes that start with them, in schedule order;
  // anything else searches descriptions and codes
  const results = useMemo(() => {
    if (!query || tab !== "codes" || !fuse) return [];
    if (/^[\d.\s]+$/.test(query) && htsCodeDigitsOnly(query).length >= 2) {
      const digits = htsCodeDigitsOnly(query);
      return htsElements.filter((e) => e.htsno && htsCodeDigitsOnly(e.htsno).startsWith(digits)).slice(0, MAX_RESULTS);
    }
    // Extended search reads a few characters as operators; words are all anyone needs here
    const words = query.replace(/[|!^$='"]/g, " ").trim();
    return words ? fuse.search(words).slice(0, MAX_RESULTS).map((r) => r.item.element) : [];
  }, [query, tab, fuse, htsElements]);
  const noteMatches = useMemo(() => (query && tab === "notes" ? notesFuse.search(query).map((r) => r.item) : []), [query, tab, notesFuse]);

  useEffect(() => setHighlighted(0), [results]);

  // The host's code (the calculator's), or a ?code= that names a line exactly, opens once
  useEffect(() => {
    if (directlyOpened.current || (!startAt && !codeParam) || !htsElements.length) return;
    const match = startAt ?? htsElements.find((e) => e.htsno && codeParam && htsCodesEqual(e.htsno, codeParam.trim()));
    const trail = match && trailTo(match);
    if (!trail) return;
    directlyOpened.current = true;
    setSearchValue("");
    // Counted only for a ?code= link; opening on the host's code (the calculator's) isn't a move
    navigate(trail, "url_code", { hts_code: match.htsno || null }, true, !startAt);
    // Once the schedule is in
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeParam, htsElements, trailTo]);

  // Analytics for each search: once the schedule is in (no empty results before it), and once
  // per query (going back to the Codes tab doesn't search again)
  const lastTrackedQuery = useRef<string | null>(null);
  useEffect(() => {
    if (!query || tab !== "codes" || !fuse || lastTrackedQuery.current === query) return;
    lastTrackedQuery.current = query;
    trackEvent(MixpanelEvent.EXPLORER_COMPLETED_CODE_SEARCH, {
      explorer_surface: explorerSurface,
      query_length: query.length,
      result_count: results.length,
      from_url_code_param: Boolean(codeParam) && query === codeParam?.trim(),
      from_url_search_param: query === searchParams.get("search")?.trim(),
    });
    // Once per search
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);
  useEffect(() => {
    if (!query || tab !== "notes") return;
    // Notes search as you type, so wait a little longer before counting it
    const timer = setTimeout(
      () =>
        trackEvent(MixpanelEvent.EXPLORER_COMPLETED_NOTES_SEARCH, {
          explorer_surface: explorerSurface,
          query_length: query.length,
          result_count: noteMatches.length,
        }),
      450
    );
    return () => clearTimeout(timer);
  }, [query, tab, noteMatches.length, explorerSurface]);

  // A new selection shows it among the codes
  useEffect(() => setTab("codes"), [selectedKey]);

  // Focus the search once the schedule is in
  useEffect(() => {
    if (!loading) setTimeout(() => inputRef.current?.focus(), 0);
  }, [loading]);

  const openResult = (element: HtsElement) => {
    const trail = trailTo(element);
    if (!trail) return;
    navigate(trail, "search_result", { hts_code: element.htsno || null, chapter_number: Number(element.chapter) || null });
  };

  const changeTab = (next: Tab) => {
    if (next === tab) return;
    trackEvent(next === "codes" ? MixpanelEvent.EXPLORER_OPENED_CODES_TAB : MixpanelEvent.EXPLORER_OPENED_NOTES_TAB, {
      explorer_surface: explorerSurface,
    });
    setTab(next);
  };

  const clearSearch = () => {
    trackEvent(MixpanelEvent.EXPLORER_CLEARED_SEARCH, { explorer_surface: explorerSurface });
    setSearchValue("");
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && searching) {
      // Clear the search before the dialog closes
      e.preventDefault();
      e.stopPropagation();
      clearSearch();
      return;
    }
    if (tab !== "codes" || !results.length || pending) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      openResult(results[highlighted]);
    }
  };

  const [year, version] = (revision ?? "").split("-");

  // === The search and tabs, on one compact line ===
  const search = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <label className="relative min-w-0 flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" aria-hidden />
        <input
          ref={(el) => {
            inputRef.current = el;
            onSearchInputMount?.(el);
          }}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={tab === "codes" ? "Search a product or HTS code, like t-shirts or 6109.10" : "Search the notes"}
          aria-label={tab === "codes" ? "Search HTS codes and descriptions" : "Search the notes"}
          className="h-11 w-full rounded-full border border-base-300 bg-base-100 pl-12 pr-20 text-sm text-base-content shadow-xs transition-colors placeholder:text-base-content/60 hover:border-primary/30 focus:border-primary/50 focus:outline-hidden focus:ring-4 focus:ring-primary/10"
        />
        <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
          {pending ? (
            <span className="loading loading-spinner loading-sm mr-2 text-primary" aria-label="Searching" />
          ) : (
            searching && (
              <button type="button" onClick={clearSearch} className={ui.button({ variant: "ghost", size: "sm" })}>
                Clear
              </button>
            )
          )}
        </span>
      </label>
      <SegmentedControl label="What to search" options={TABS} value={tab} onChange={changeTab} />
    </div>
  );

  // === The left column: the outline, or the search's results in its place ===
  const list = (
    <section
      aria-label={searching ? "Search results" : "The Harmonized Tariff Schedule"}
      className={`${tt.panel} flex min-h-0 flex-col overflow-clip lg:overflow-y-auto`}
    >
      <div className={`sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-3xl border-b border-base-300 bg-base-100 px-5 py-3`}>
        <div className="flex min-w-0 items-baseline gap-2">
          <h3 className={tt.title}>{searching ? "Results" : "Schedule"}</h3>
          {searching ? (
            !pending && <span className={tt.chip(results.length ? "primary" : "neutral")}>{results.length}</span>
          ) : (
            revision && (
              <span className="truncate text-xs text-base-content/60" title="The revision of the Harmonized Tariff Schedule shown">
                {year} HTS{version && `, Revision ${version}`}
              </span>
            )
          )}
        </div>
        {searching ? (
          results.length > 0 && <span className="hidden text-xs text-base-content/60 xl:inline">↑ ↓ then Enter</span>
        ) : (
          <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={() => setExpanded(() => new Set())}>
            Collapse all
          </button>
        )}
      </div>
      {loading ? (
        <Loading />
      ) : searching ? (
        pending && !results.length ? (
          <Loading label="Searching the schedule…" />
        ) : (
          <SearchResults query={query} results={results} highlighted={highlighted} onOpen={openResult} />
        )
      ) : (
        <Outline />
      )}
    </section>
  );

  const body =
    tab === "notes" ? (
      <NotesView searchValue={query} matches={noteMatches} />
    ) : (
      // Two columns that each scroll on their own, filling the dialog, or on a page the screen under
      // the site's sticky header (65px). At either end, scrolling carries on to the page.
      <div
        className={`grid gap-4 lg:grid-rows-[minmax(0,1fr)] ${
          dialog
            ? "lg:h-full lg:grid-cols-[minmax(0,6fr)_minmax(0,7fr)]"
            : "lg:h-[calc(100dvh-6rem)] lg:min-h-128 lg:scroll-mt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
        }`}
      >
        {list}
        <Inspector className="min-h-0 lg:overflow-y-auto lg:rounded-3xl" />
      </div>
    );

  if (dialog) {
    return (
      <>
        <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3 border-b border-base-300 bg-base-100 px-5 py-4 sm:px-6">
          <h2 className={`${tt.display} text-lg font-semibold text-base-content`}>{dialog.title}</h2>
          <div className="order-last flex w-full min-w-0 md:order-0 md:w-auto md:flex-1">{search}</div>
          <button
            type="button"
            onClick={dialog.onClose}
            className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base-content/70 transition-colors hover:bg-tt-soft hover:text-base-content md:ml-0"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:overflow-hidden">{body}</div>
      </>
    );
  }
  if (aside)
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-10">
          <div className="min-w-0">{heading}</div>
          {aside}
        </div>
        {search}
        {body}
      </div>
    );
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:items-end lg:gap-10">
        <div className="min-w-0">{heading}</div>
        {search}
      </div>
      {body}
    </div>
  );
};

// Each line with its own description after those of the headings above it. The schedule is in
// order, so the lines above one at a lower indent are its headings.
const withHeadings = (elements: HtsElement[]) => {
  const above: HtsElement[] = [];
  return elements.map((element) => {
    if (above.length && above[above.length - 1].chapter !== element.chapter) above.length = 0;
    while (above.length && Number(above[above.length - 1].indent) >= Number(element.indent)) above.pop();
    const text = [...above.map((e) => e.description), element.description].join(" › ");
    above.push(element);
    return { element, htsno: element.htsno, text };
  });
};

const Loading = ({ label = "Loading the Harmonized Tariff Schedule…" }: { label?: string }) => (
  <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <span className="loading loading-spinner loading-md text-primary" aria-hidden />
    <span className="text-sm text-base-content/70">{label}</span>
  </div>
);
