"use client";

import {
  HtsElement,
  Navigatable,
  HtsSection,
  HtsSectionAndChapterBase,
} from "../interfaces/hts";
import { Breadcrumbs } from "./Breadcrumbs";
import { Sections } from "./Sections";
import { Chapter } from "./Chapter";
import { Element } from "./Element";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useEffect, useState, useCallback, useRef } from "react";
import { useHts } from "../contexts/HtsContext";
import Fuse, { FuseResult } from "fuse.js";
import { SearchResults } from "./SearchResults";
import { Loader } from "../interfaces/ui";
import { LoadingIndicator } from "./LoadingIndicator";

interface ElementsProps {
  sections: HtsSection[];
}

export type NavigatableElementType =
  | { type: Navigatable.SECTIONS; sections: HtsSection[] }
  | HtsSectionAndChapterBase
  | HtsElement;

export interface NavigatableElement {
  title: string;
  element: NavigatableElementType;
}

export const Elements = ({ sections }: ElementsProps) => {
  const [{ isLoading, text: loadingText }, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });
  const { htsElements } = useHts();
  const [fuse, setFuse] = useState<Fuse<HtsElement> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const [searchResults, setSearchResults] = useState<FuseResult<HtsElement>[]>(
    []
  );
  const currentElement = breadcrumbs[breadcrumbs.length - 1];
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSearchingRef = useRef(false);

  if (!currentElement) {
    return;
  }

  useEffect(() => {
    if (htsElements.length > 0) {
      setFuse(
        new Fuse(htsElements, {
          keys: ["description", "htsno"],
          threshold: 0.4,
          findAllMatches: true,
          ignoreLocation: true,
        })
      );
    }
  }, [htsElements]);

  const performSearch = useCallback(
    async (query: string) => {
      if (!fuse || query.length === 0) {
        setSearchResults([]);
        setLoading({ isLoading: false, text: "" });
        return;
      }

      // If already searching, don't start another search
      if (isSearchingRef.current) {
        return;
      }

      isSearchingRef.current = true;
      setLoading({ isLoading: true, text: "Searching..." });

      try {
        // Use setTimeout to move the search to the next tick and prevent UI blocking
        setTimeout(() => {
          const results = fuse.search(query);
          setSearchResults(results);
          setLoading({ isLoading: false, text: "" });
          isSearchingRef.current = false;
        }, 0);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setLoading({ isLoading: false, text: "" });
        isSearchingRef.current = false;
      }
    },
    [fuse]
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
        setLoading({ isLoading: false, text: "" });
        return;
      }

      // Set loading state immediately for better UX
      setLoading({ isLoading: true, text: "Searching..." });

      // Debounce the actual search
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    },
    [performSearch]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
    },
    []
  );

  const handleClearSearch = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery("");
    setSearchResults([]);
    setLoading({ isLoading: false, text: "" });
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex gap-2 items-center justify-between">
        {breadcrumbs.length > 1 && !searchResults.length ? (
          <Breadcrumbs
            breadcrumbs={breadcrumbs}
            setBreadcrumbs={setBreadcrumbs}
          />
        ) : (
          <div className="w-full"></div>
        )}
        <div className="relative max-w-[350px] w-full">
          <input
            type="text"
            placeholder={`Search HTS code or description`}
            value={searchQuery}
            onChange={handleSearchChange}
            className="input input-bordered input-md h-10 w-full focus:ring-0 focus:outline-none pr-8"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {searchQuery && !isLoading && (
              <button
                onClick={handleClearSearch}
                className="btn btn-link p-1 btn-sm text-xs hover:text-secondary no-underline"
                title="Clear search"
              >
                clear
              </button>
            )}
            {isLoading && <LoadingIndicator spinnerOnly />}
          </div>
        </div>
      </div>

      {searchQuery ? (
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <LoadingIndicator />
              </div>
            </div>
          ) : (
            <SearchResults
              results={searchResults}
              setActiveTab={() => {}}
              setSearchResults={setSearchResults}
              setSearchValue={setSearchQuery}
            />
          )}
        </div>
      ) : currentElement.element.type === Navigatable.SECTIONS ? (
        <Sections
          sections={sections}
          breadcrumbs={breadcrumbs}
          setBreadcrumbs={setBreadcrumbs}
        />
      ) : currentElement.element.type === Navigatable.CHAPTER ? (
        <Chapter chapter={currentElement.element as HtsSectionAndChapterBase} />
      ) : (
        <Element element={currentElement.element as HtsElement} />
      )}
    </div>
  );
};
