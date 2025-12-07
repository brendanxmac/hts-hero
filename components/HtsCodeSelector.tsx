"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import Fuse, { FuseResult } from "fuse.js";
import { HtsElement } from "../interfaces/hts";
import { useHts } from "../contexts/HtsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import {
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { TertiaryLabel } from "./TertiaryLabel";

// Helper to check if a string is a valid HTS code format (8 or 10 digits with dots)
const isValidHtsCodeFormat = (str: string): boolean => {
  // Remove dots and check if it's 8 or 10 digits
  const digitsOnly = str.replace(/\./g, "");
  return /^\d{8}$|^\d{10}$/.test(digitsOnly);
};

// Helper to normalize HTS code format (add dots if missing)
const normalizeHtsCode = (str: string): string => {
  const digitsOnly = str.replace(/\./g, "");
  if (digitsOnly.length === 8) {
    return `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 6)}.${digitsOnly.slice(6, 8)}`;
  }
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 6)}.${digitsOnly.slice(6, 8)}.${digitsOnly.slice(8, 10)}`;
  }
  return str;
};

interface HtsCodeSelectorProps {
  selectedElement: HtsElement | null;
  onSelectionChange: (element: HtsElement | null) => void;
  autoFocus?: boolean;
}

export const HtsCodeSelector = ({
  selectedElement,
  onSelectionChange,
  autoFocus = false,
}: HtsCodeSelectorProps) => {
  // Context
  const { htsElements } = useHts();
  const { sections } = useHtsSections();

  // State
  const [searchValue, setSearchValue] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FuseResult<HtsElement>[]>(
    []
  );
  const [htsFuse, setHtsFuse] = useState<Fuse<HtsElement> | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSearchingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus the input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Compute the display value for the input
  const inputValue = selectedElement ? selectedElement.htsno : searchValue;

  // Initialize Fuse.js when elements are loaded
  useEffect(() => {
    if (htsElements.length > 0) {
      setHtsFuse(
        new Fuse(htsElements, {
          keys: ["htsno"],
          threshold: 0.1,
          findAllMatches: true,
          ignoreLocation: true,
        })
      );
    }
  }, [htsElements]);

  // Perform HTS search
  const performHtsSearch = useCallback(
    async (query: string) => {
      if (!htsFuse || query.length === 0) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      if (isSearchingRef.current) {
        return;
      }

      isSearchingRef.current = true;
      setSearching(true);

      try {
        setTimeout(() => {
          const results = htsFuse.search(query.trim());
          const topResults = results.slice(0, 20);
          setSearchResults(topResults);
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

  // Debounced search
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      if (query.length === 0) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);

      debounceTimeoutRef.current = setTimeout(() => {
        performHtsSearch(query);
      }, 300);
    },
    [performHtsSearch]
  );

  // Check for exact match and auto-select if pasted
  const checkForExactMatch = useCallback(
    (value: string): boolean => {
      if (!htsFuse) return false;

      const normalizedValue = normalizeHtsCode(value.trim());

      if (isValidHtsCodeFormat(normalizedValue)) {
        // Check for exact match
        const exactMatch = htsElements.find(
          (el) => el.htsno === normalizedValue
        );

        if (exactMatch) {
          onSelectionChange(exactMatch);
          setSearchValue("");
          setSearchResults([]);
          setIsDropdownOpen(false);
          return true;
        }
      }
      return false;
    },
    [htsFuse, htsElements, onSelectionChange]
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      setIsDropdownOpen(true);

      // Clear selected element when typing
      if (selectedElement) {
        onSelectionChange(null);
      }

      debouncedSearch(value);
    },
    [debouncedSearch, selectedElement, onSelectionChange]
  );

  // Handle paste event
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedText = e.clipboardData.getData("text");

      // Check if pasted value is a complete HTS code
      if (checkForExactMatch(pastedText)) {
        e.preventDefault();
        return;
      }
    },
    [checkForExactMatch]
  );

  // Handle search result click
  const handleResultClick = useCallback(
    (element: HtsElement | null) => {
      if (element) {
        onSelectionChange(element);
        setSearchValue("");
        setSearchResults([]);
        setIsDropdownOpen(false);
      }
    },
    [onSelectionChange]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    onSelectionChange(null);
    setSearchValue("");
    setSearchResults([]);
    setSearching(false);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  }, [onSelectionChange]);

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (searchValue || selectedElement) {
      setIsDropdownOpen(true);
      if (searchValue) {
        debouncedSearch(searchValue);
      }
    }
  }, [searchValue, selectedElement, debouncedSearch]);

  // Handle input blur
  const handleBlur = useCallback(() => {
    // Delay closing to allow click events on dropdown items
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  }, []);

  // Get section and chapter info for an element
  const getElementInfo = useCallback(
    (element: HtsElement) => {
      const sectionAndChapter = getSectionAndChapterFromChapterNumber(
        sections,
        Number(element.chapter)
      );
      const parents = getHtsElementParents(element, htsElements);
      return { sectionAndChapter, parents };
    },
    [sections, htsElements]
  );

  const showDropdown = isDropdownOpen && searchValue && !selectedElement;

  return (
    <Combobox value={selectedElement} onChange={handleResultClick} nullable>
      <div className="relative">
        <div className="relative">
          <Combobox.Input
            ref={inputRef}
            placeholder="Enter 8 or 10 digit HTS Code"
            value={inputValue}
            onChange={handleSearchChange}
            onPaste={handlePaste}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`w-full h-[45px] px-3 bg-base-200/50 rounded-xl border border-base-content/10 transition-all duration-200 pr-12 placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 hover:border-primary/30 hover:bg-base-200/70 ${
              selectedElement ? "font-semibold text-primary" : ""
            }`}
            displayValue={() => inputValue}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {(searchValue || selectedElement) && !searching && (
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-base-content/10 transition-colors"
                title="Clear"
                type="button"
              >
                <svg
                  className="w-4 h-4 text-base-content/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {searching && <LoadingIndicator spinnerOnly />}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <Transition
            as={Fragment}
            show={true}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setSearchResults([])}
          >
            <Combobox.Options
              static
              className="absolute z-20 w-full mt-2 bg-base-100 border border-base-content/10 rounded-xl shadow-2xl max-h-80 overflow-y-auto focus:outline-none"
            >
              {searching ? (
                <div className="p-6">
                  <div className="flex items-center justify-center gap-3">
                    <LoadingIndicator spinnerOnly />
                    <span className="text-sm text-base-content/60 font-medium">
                      Searching...
                    </span>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result, index) => {
                  const element = result.item;
                  const { parents } = getElementInfo(element);

                  return (
                    <Combobox.Option
                      key={`search-result-${index}`}
                      value={element}
                      className={({ active }) =>
                        `px-4 py-3.5 cursor-pointer border-b border-base-content/5 last:border-b-0 transition-all duration-150 ${
                          active
                            ? "bg-primary text-primary-content"
                            : "hover:bg-base-200/70"
                        }`
                      }
                    >
                      {({ active }) => (
                        <div className="flex flex-col gap-1.5">
                          <p
                            className={`font-bold ${active ? "text-primary-content" : "text-primary"}`}
                          >
                            {element.htsno}
                          </p>
                          <p
                            className={`text-sm line-clamp-2 font-medium ${active ? "text-primary-content/90" : "text-base-content"}`}
                          >
                            {element.description}
                          </p>
                          {parents.length > 0 && (
                            <p
                              className={`text-xs truncate ${active ? "text-primary-content/60" : "text-base-content/50"}`}
                            >
                              {parents
                                .filter((p) => p.htsno)
                                .map((p) => p.htsno)
                                .join(" → ")}
                              {element.htsno && (
                                <>
                                  {parents.some((p) => p.htsno) && " → "}
                                  {element.htsno}
                                </>
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </Combobox.Option>
                  );
                })
              ) : (
                <div className="p-6">
                  <div className="flex items-center justify-center">
                    <span className="text-sm text-base-content/50 font-medium">
                      No HTS codes found matching your search
                    </span>
                  </div>
                </div>
              )}
            </Combobox.Options>
          </Transition>
        )}
      </div>
    </Combobox>
  );
};
