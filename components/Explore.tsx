"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { LoadingIndicator } from "./LoadingIndicator";
import { Elements } from "./Elements";
import { Notes } from "./Notes";
import { Tab } from "../interfaces/tab";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { HtsElement, Navigatable } from "../interfaces/hts";
import { ExploreTab } from "../enums/explore";
import Fuse, { FuseResult } from "fuse.js";
import { Loader } from "../interfaces/ui";
import { SearchResults } from "./SearchResults";
import { useHts } from "../contexts/HtsContext";
import { notes } from "../public/notes/notes";
import { useSearchParams } from "next/navigation";
import {
  generateBreadcrumbsForHtsElement,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  DocumentTextIcon,
} from "@heroicons/react/16/solid";

const ExploreTabs: Tab[] = [
  {
    label: "Codes",
    value: ExploreTab.ELEMENTS,
    icon: <BookOpenIcon className="w-4 h-4" />,
  },
  {
    label: "Notes",
    value: ExploreTab.NOTES,
    icon: <DocumentTextIcon className="w-4 h-4" />,
  },
];

export const Explore = () => {
  const searchParams = useSearchParams();
  const [{ isLoading, text: loadingText }, setLoading] = useState<Loader>({
    isLoading: true,
    text: "Loading",
  });
  const [searching, setSearching] = useState(false);
  const [searchValue, setSearchValue] = useState(() => {
    return searchParams.get("code") || searchParams.get("search") || "";
  });
  const [activeTab, setActiveTab] = useState(ExploreTabs[0].value);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { sections, getSections } = useHtsSections();
  const [htsFuse, setHtsFuse] = useState<Fuse<HtsElement> | null>(null);
  const [searchResults, setSearchResults] = useState<FuseResult<HtsElement>[]>(
    []
  );
  const [completedDirectNavigation, setCompletedDirectNavigation] =
    useState(false);
  const { htsElements, fetchElements, revision } = useHts();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSearchingRef = useRef(false);

  // Configure Fuse.js for notes searching
  const notesFuse = useMemo(() => {
    return new Fuse(notes, {
      keys: ["title", "description"],
      threshold: 0.1,
      findAllMatches: true,
      ignoreLocation: true,
    });
  }, []);

  // Filter notes by search query
  const filteredNotes = useMemo(() => {
    if (!searchValue.trim() || activeTab !== ExploreTab.NOTES) {
      return [];
    }

    const searchResults = notesFuse.search(searchValue);
    return searchResults.map((result) => result.item);
  }, [searchValue, notesFuse, activeTab]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading({ isLoading: true, text: "Loading" });
      await Promise.all([fetchElements("latest"), getSections()]);
      setLoading({ isLoading: false, text: "" });
    };

    if (!sections.length || !htsElements.length) {
      loadAllData();
    } else {
      setLoading({ isLoading: false, text: "" });
    }

    if (breadcrumbs.length === 0) {
      setBreadcrumbs([
        {
          title: "Sections",
          element: {
            type: Navigatable.SECTIONS,
            sections,
          },
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (htsElements.length > 0) {
      setHtsFuse(
        new Fuse(htsElements, {
          keys: ["description", "htsno"],
          threshold: 0.1,
          findAllMatches: true,
          ignoreLocation: true,
        })
      );
    }
  }, [htsElements]);

  useEffect(() => {
    if (activeTab !== ExploreTab.ELEMENTS) {
      setActiveTab(ExploreTab.ELEMENTS);
    }
  }, [breadcrumbs]);

  // Scroll to top when breadcrumbs change (navigation occurs)
  useEffect(() => {
    if (breadcrumbs.length > 1) {
      // Find the scrollable container (the one with overflow-y-auto)
      const scrollableContainer = document.querySelector(".overflow-y-auto");
      // if (scrollableContainer) {
      scrollableContainer.scrollTo({ top: 0, behavior: "instant" });
      // } else {
      //   window.scrollTo({ top: 0, behavior: "smooth" });
      // }
    }
  }, [breadcrumbs]);

  const performHtsSearch = useCallback(
    async (query: string) => {
      if (!htsFuse || query.length === 0) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      // If already searching, don't start another search
      if (isSearchingRef.current) {
        return;
      }

      isSearchingRef.current = true;
      setSearching(true);

      try {
        // Use setTimeout to move the search to the next tick and prevent UI blocking
        setTimeout(() => {
          const results = htsFuse.search(query.trim());
          const searchParamExactHtsCodeMatch = results.find(
            (r) => r.item.htsno === query.trim() && searchParams.get("code")
          );

          if (searchParamExactHtsCodeMatch && !completedDirectNavigation) {
            const matchedElement = searchParamExactHtsCodeMatch.item;
            const sectionAndChapter = getSectionAndChapterFromChapterNumber(
              sections,
              Number(matchedElement.chapter)
              // Number(getChapterFromHtsElement(element, htsElements))
            );
            const parents = getHtsElementParents(matchedElement, htsElements);
            const breadcrumbs = generateBreadcrumbsForHtsElement(
              sections,
              sectionAndChapter.chapter,
              [...parents, matchedElement]
            );
            setSearchValue("");
            setActiveTab(ExploreTab.ELEMENTS);
            setSearchResults([]);
            setBreadcrumbs(breadcrumbs);
            setCompletedDirectNavigation(true);
          } else {
            const topResults = results.slice(0, 30);
            setSearchResults(topResults);
          }
          setSearching(false);
          isSearchingRef.current = false;
        }, 0);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setSearching(false);
        isSearchingRef.current = false;
      }
    },
    [htsFuse]
  );

  const debouncedSearch = useCallback(
    (query: string) => {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Clear results immediately if query is empty
      if (query.length === 0) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      // Only perform HTS search if we're on the ELEMENTS tab
      if (activeTab === ExploreTab.ELEMENTS) {
        // Set loading state immediately for better UX
        setSearching(true);

        // Debounce the actual search
        debounceTimeoutRef.current = setTimeout(() => {
          performHtsSearch(query);
        }, 300);
      }
    },
    [performHtsSearch, activeTab]
  );

  useEffect(() => {
    debouncedSearch(searchValue);

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchValue, debouncedSearch]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
    },
    []
  );

  const handleClearSearch = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchValue("");
    setSearchResults([]);
    setSearching(false);
  }, []);

  const getSearchPlaceholder = () => {
    if (activeTab === ExploreTab.ELEMENTS) {
      return "Search HTS Code or Description";
    } else if (activeTab === ExploreTab.NOTES) {
      return "Search all notes...";
    }
    return "Search...";
  };

  return (
    <div className="w-full h-full flex flex-col bg-base-100 overflow-y-auto">
      {isLoading ? (
        <div className="w-full flex-1 flex items-center justify-center py-20">
          <LoadingIndicator text={loadingText} />
        </div>
      ) : (
        <>
          {/* Hero Header */}
          <div className="shrink-0 relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200 border-b border-base-content/5">
            {/* Subtle animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
              <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                  backgroundSize: "32px 32px",
                }}
              />
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left side - Title and version */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/80">
                    <span className="inline-block w-8 h-px bg-primary/40" />
                    Harmonized Tariff Schedule
                  </div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                      <span className="bg-gradient-to-r from-base-content via-base-content to-base-content/80 bg-clip-text">
                        HTS {revision?.split("-")[0]}
                      </span>
                    </h1>
                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                      v{revision?.split("-")[1]}
                    </span>
                  </div>
                </div>

                {/* Right side - Tabs */}
                <div className="flex p-1 gap-1 bg-base-200/60 rounded-xl border border-base-content/5">
                  {ExploreTabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        tab.value === activeTab
                          ? "bg-base-100 text-base-content shadow-sm"
                          : "text-base-content/60 hover:text-base-content hover:bg-base-100/50"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="mt-6">
                <div className="relative max-w-xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    placeholder={getSearchPlaceholder()}
                    value={searchValue}
                    onChange={handleSearchChange}
                    className="w-full h-12 pl-12 pr-20 bg-base-100/80 rounded-xl border border-base-content/10 transition-all duration-200 placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 hover:border-primary/30 hover:bg-base-100 text-base"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                    {searchValue && !searching && (
                      <button
                        onClick={handleClearSearch}
                        className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors"
                        title="Clear search"
                      >
                        Clear
                      </button>
                    )}
                    {searching && (
                      <span className="loading loading-spinner loading-sm text-primary"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
            {activeTab === ExploreTab.ELEMENTS && (
              <>
                {searchValue ? (
                  searching ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <span className="text-sm text-base-content/60">
                          Searching...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <SearchResults
                      results={searchResults}
                      setActiveTab={setActiveTab}
                      setSearchResults={setSearchResults}
                      setSearchValue={setSearchValue}
                    />
                  )
                ) : (
                  <Elements sections={sections} />
                )}
              </>
            )}
            {activeTab === ExploreTab.NOTES && (
              <Notes filteredNotes={filteredNotes} searchValue={searchValue} />
            )}
          </div>
        </>
      )}
    </div>
  );
};
