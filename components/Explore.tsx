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
import { classNames } from "../utilities/style";
import { Color } from "../enums/style";
import { SecondaryLabel } from "./SecondaryLabel";
import { notes } from "../public/notes/notes";
import { useSearchParams } from "next/navigation";
import {
  generateBreadcrumbsForHtsElement,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";

const ExploreTabs: Tab[] = [
  {
    label: "Codes",
    value: ExploreTab.ELEMENTS,
  },
  {
    label: "Notes",
    value: ExploreTab.NOTES,
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
  const { htsElements, fetchElements, revision } = useHts();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
    if (scrollContainerRef.current && breadcrumbs.length > 1) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
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
            (r) => r.item.htsno === query.trim() && !searchParams.get("search")
          );

          if (searchParamExactHtsCodeMatch) {
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
      return "Search HTS code or description";
    } else if (activeTab === ExploreTab.NOTES) {
      return "Search all notes...";
    }
    return "Search...";
  };

  return (
    <div className="w-full h-full p-4 flex flex-col gap-2">
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <LoadingIndicator text={loadingText} />
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="w-full h-full grow flex flex-col gap-4 overflow-y-scroll"
        >
          <div className="flex gap-4 items-center justify-between flex-col md:flex-row">
            <div className="w-full flex gap-4 items-center justify-between md:justify-normal">
              <div className="flex flex-col -space-y-1">
                <div className="flex gap-2 items-start">
                  <h1 className="shrink-0 text-2xl md:text-3xl font-bold text-white">
                    HTS {revision?.name.split("-")[0]}
                  </h1>
                  <div className="mb-0.5">
                    <SecondaryLabel
                      value={`v${revision?.name.split("-")[1]}`}
                      color={Color.PRIMARY}
                    />
                  </div>
                </div>
              </div>

              <div
                role="tablist"
                className="tabs tabs-boxed bg-primary/30 rounded-xl"
              >
                {ExploreTabs.map((tab) => (
                  <a
                    key={tab.value}
                    role="tab"
                    onClick={() => setActiveTab(tab.value)}
                    className={classNames(
                      "tab transition-all duration-200 ease-in text-white font-semibold",
                      tab.value === activeTab && "tab-active"
                    )}
                  >
                    {tab.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="w-full md:max-w-[350px] lg:max-w-[400px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchValue}
                  onChange={handleSearchChange}
                  className="input input-bordered input-md h-10 w-full focus:ring-0 focus:outline-none pr-8"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {searchValue && !searching && (
                    <button
                      onClick={handleClearSearch}
                      className="btn btn-link p-1 btn-sm text-xs hover:text-secondary no-underline"
                      title="Clear search"
                    >
                      clear
                    </button>
                  )}
                  {searching && <LoadingIndicator spinnerOnly />}
                </div>
              </div>
            </div>
          </div>

          {activeTab === ExploreTab.ELEMENTS && (
            <>
              {searchValue ? (
                searching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                      <LoadingIndicator text="Searching..." />
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
      )}
    </div>
  );
};
