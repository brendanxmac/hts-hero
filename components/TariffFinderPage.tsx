"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Countries, Country } from "../constants/countries";
import { CountrySelection } from "./CountrySelection";
import { HtsElement } from "../interfaces/hts";
import { useHts } from "../contexts/HtsContext";
import { LoadingIndicator } from "./LoadingIndicator";
import { SecondaryLabel } from "./SecondaryLabel";
import { CountryTariff } from "./CountryTariff";
import {
  addTariffsToCountry,
  CountryWithTariffs,
  tariffIsApplicableToCode,
  TariffsList,
} from "../tariffs/tariffs";
import { ContentRequirementI } from "./Element";
import { ContentRequirements } from "../enums/tariff";
import { getHtsElementParents } from "../libs/hts";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { HtsCodeSelector } from "./HtsCodeSelector";
import { NumberInput } from "./NumberInput";
import { PercentageInput } from "./PercentageInput";
import { Explore } from "./Explore";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import {
  generateBreadcrumbsForHtsElement,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";

// Helper to count digits in an HTS code (ignoring dots)
const getHtsCodeDigitCount = (htsno: string): number => {
  if (!htsno) return 0;
  return htsno.replace(/\./g, "").length;
};

// Check if an HTS code has 8 or more digits (tariff-level)
const isTariffLevelCode = (htsno: string): boolean => {
  return getHtsCodeDigitCount(htsno) >= 8;
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

// Helper to validate country code
const getCountryByCode = (code: string): Country | null => {
  if (!code || code.length !== 2) return null;
  const upperCode = code.toUpperCase();
  return Countries.find((c) => c.code === upperCode) || null;
};

export const TariffFinderPage = () => {
  // URL params
  const searchParams = useSearchParams();

  // Context
  const { htsElements, fetchElements } = useHts();
  const { sections, getSections } = useHtsSections();
  const { setBreadcrumbs } = useBreadcrumbs();

  // State
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedElement, setSelectedElement] = useState<HtsElement | null>(
    null
  );
  const [tariffElement, setTariffElement] = useState<HtsElement | null>(null);
  const [countryWithTariffs, setCountryWithTariffs] =
    useState<CountryWithTariffs | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);

  // Parse initial customs value from URL params
  const getInitialCustomsValue = (): number => {
    const valueParam = searchParams.get("value");
    if (valueParam) {
      const parsed = parseFloat(valueParam);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return 10000;
  };

  // UI states - update immediately for responsive feedback
  const [uiUnits, setUiUnits] = useState<number>(1000);
  const [uiCustomsValue, setUiCustomsValue] = useState<number>(
    getInitialCustomsValue
  );
  // Calculation states - update after debounce for expensive operations
  const [units, setUnits] = useState<number>(1000);
  const [customsValue, setCustomsValue] = useState<number>(
    getInitialCustomsValue
  );

  // Timeout refs for debouncing
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unitsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const customsValueTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [contentRequirements, setContentRequirements] = useState<
    ContentRequirementI<ContentRequirements>[]
  >([]);
  // UI state for content percentages - updates immediately for responsive slider
  const [uiContentPercentages, setUiContentPercentages] = useState<
    ContentRequirementI<ContentRequirements>[]
  >([]);
  const [showExploreModal, setShowExploreModal] = useState(false);

  // Handle element selection - only show tariffs for 8+ digit codes
  const handleElementSelection = useCallback(
    (element: HtsElement | null) => {
      if (!element) {
        setSelectedElement(null);
        return;
      }

      // Check if the code has 8 or more digits
      if (isTariffLevelCode(element.htsno)) {
        // Tariff-level code - show tariffs normally
        setSelectedElement(element);
      } else {
        // Sub-tariff level code - open explore modal and navigate to this element
        setSelectedElement(null);

        // Generate breadcrumbs to navigate to this element in the explorer
        if (sections.length > 0) {
          const sectionAndChapter = getSectionAndChapterFromChapterNumber(
            sections,
            Number(element.chapter)
          );

          if (sectionAndChapter) {
            const parents = getHtsElementParents(element, htsElements);
            const breadcrumbs = generateBreadcrumbsForHtsElement(
              sections,
              sectionAndChapter.chapter,
              [...parents, element]
            );
            setBreadcrumbs(breadcrumbs);
          }
        }

        setShowExploreModal(true);
      }
    },
    [sections, htsElements, setBreadcrumbs]
  );

  // Close explore modal on Escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showExploreModal) {
        setShowExploreModal(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [showExploreModal]);

  useEffect(() => {
    if (tariffElement) {
      const codeBasedContentRequirements = Array.from(
        TariffsList.filter((t) =>
          tariffIsApplicableToCode(t, tariffElement.htsno)
        ).reduce((acc, t) => {
          if (t.contentRequirement) {
            acc.add(t.contentRequirement.content);
          }
          return acc;
        }, new Set<ContentRequirements>())
      );

      const newContentRequirements = codeBasedContentRequirements.map(
        (contentRequirement) => ({
          name: contentRequirement,
          value: 80,
        })
      );
      setContentRequirements(newContentRequirements);
      setUiContentPercentages(newContentRequirements);
    }
  }, [selectedCountry, tariffElement]);

  // Handlers with debouncing
  const handleSliderChange = (
    contentRequirement: ContentRequirements,
    value: number
  ) => {
    // Update UI immediately for responsive feedback
    setUiContentPercentages((prev) =>
      prev.map((c) => (c.name === contentRequirement ? { ...c, value } : c))
    );

    // Clear existing timeout for expensive calculation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the expensive recalculation (300ms)
    timeoutRef.current = setTimeout(() => {
      setContentRequirements((prev) =>
        prev.map((c) => (c.name === contentRequirement ? { ...c, value } : c))
      );
    }, 300);
  };

  const handleUnitsChange = (value: number) => {
    // Update UI immediately for responsive feedback
    setUiUnits(value);

    // Clear existing timeout for expensive calculation
    if (unitsTimeoutRef.current) {
      clearTimeout(unitsTimeoutRef.current);
    }

    // Debounce the expensive recalculation (300ms)
    unitsTimeoutRef.current = setTimeout(() => {
      setUnits(value);
    }, 300);
  };

  const handleCustomsValueChange = (value: number) => {
    // Update UI immediately for responsive feedback
    setUiCustomsValue(value);

    // Clear existing timeout for expensive calculation
    if (customsValueTimeoutRef.current) {
      clearTimeout(customsValueTimeoutRef.current);
    }

    // Debounce the expensive recalculation (300ms)
    customsValueTimeoutRef.current = setTimeout(() => {
      setCustomsValue(value);
    }, 300);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (unitsTimeoutRef.current) {
        clearTimeout(unitsTimeoutRef.current);
      }
      if (customsValueTimeoutRef.current) {
        clearTimeout(customsValueTimeoutRef.current);
      }
    };
  }, []);

  // Load initial data
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoadingPage(true);
        await Promise.all([fetchElements("latest"), getSections()]);
      } catch (e) {
        console.error("Error loading data:", e);
      } finally {
        setLoadingPage(false);
      }
    };

    if (!htsElements.length || !sections.length) {
      loadAllData();
    } else {
      setLoadingPage(false);
    }
  }, []);

  // Process URL params after data is loaded
  useEffect(() => {
    if (loadingPage || urlParamsProcessed || htsElements.length === 0) return;

    // Process country param
    const countryParam = searchParams.get("country");
    if (countryParam) {
      const country = getCountryByCode(countryParam);
      if (country) {
        setSelectedCountry(country);
      }
    }

    // Process HTS code param
    const codeParam = searchParams.get("code");
    if (codeParam) {
      const normalizedCode = normalizeHtsCode(codeParam.trim());
      const matchingElement = htsElements.find(
        (el) => el.htsno === normalizedCode
      );
      if (matchingElement) {
        // Use the same logic as handleElementSelection
        if (isTariffLevelCode(matchingElement.htsno)) {
          setSelectedElement(matchingElement);
        } else {
          // Sub-tariff level code - open explore modal and navigate to this element
          if (sections.length > 0) {
            const sectionAndChapter = getSectionAndChapterFromChapterNumber(
              sections,
              Number(matchingElement.chapter)
            );

            if (sectionAndChapter) {
              const parents = getHtsElementParents(
                matchingElement,
                htsElements
              );
              const breadcrumbs = generateBreadcrumbsForHtsElement(
                sections,
                sectionAndChapter.chapter,
                [...parents, matchingElement]
              );
              setBreadcrumbs(breadcrumbs);
            }
          }
          setShowExploreModal(true);
        }
      }
    }

    setUrlParamsProcessed(true);
  }, [
    loadingPage,
    urlParamsProcessed,
    htsElements,
    searchParams,
    sections,
    setBreadcrumbs,
  ]);

  // Find the tariff element (the element with actual tariff data)
  const findTariffElement = useCallback(
    (element: HtsElement): HtsElement => {
      // If the element has tariff data, return it
      if (element.general || element.special || element.other) {
        return element;
      }

      // Otherwise, find parent with tariff data
      const parents = getHtsElementParents(element, htsElements);
      for (let i = parents.length - 1; i >= 0; i--) {
        const parent = parents[i];
        if (parent.general || parent.special || parent.other) {
          return parent;
        }
      }

      return element;
    },
    [htsElements]
  );

  // Update tariffs when element or country changes
  useEffect(() => {
    if (selectedElement && selectedCountry && sections.length > 0) {
      const tariffEl = findTariffElement(selectedElement);
      setTariffElement(tariffEl);

      const newCountryWithTariffs = addTariffsToCountry(
        selectedCountry,
        selectedElement,
        tariffEl,
        contentRequirements,
        undefined,
        units,
        customsValue
      );
      setCountryWithTariffs(newCountryWithTariffs);
    } else {
      setCountryWithTariffs(null);
      setTariffElement(null);
    }
  }, [
    selectedElement,
    selectedCountry,
    sections,
    contentRequirements,
    units,
    customsValue,
    findTariffElement,
  ]);

  if (loadingPage) {
    return (
      <main className="w-screen h-screen flex items-center justify-center bg-base-300">
        <LoadingIndicator />
      </main>
    );
  }

  return (
    <main className="w-screen h-full flex flex-col bg-base-100">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200 border-b border-base-content/5">
        {/* Subtle animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left side - Main headline */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/80">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Trusted & Loved By Customs Brokers
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-base-content via-base-content to-base-content/80 bg-clip-text">
                  Instant Tariffs.
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                  Effortless Savings.
                </span>
              </h1>
              <p className="text-base-content/60 text-sm md:text-base max-w-lg mt-1">
                Discover the import cost for any product, and find ways to save.
              </p>
            </div>

            {/* Right side - Quick stats/trust indicators */}
            <div className="flex flex-row md:flex-col gap-4 md:gap-3 md:items-end">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-base-content/70">Updated Dec 2025</span>
              </div>
              {/* <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-base-content/70">
                  All tariffs included
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-5xl mx-auto flex flex-col px-4 sm:px-6 gap-2 py-6">
        {/* Inputs */}
        <div className="w-full flex flex-col md:flex-row gap-3">
          {/* HTS Code Search */}
          <div className="grow flex flex-col gap-1">
            <div className="flex gap-2 justify-between items-end">
              <SecondaryLabel value="HTS Code" />
              <button
                type="button"
                onClick={() => setShowExploreModal(true)}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Search HTS
              </button>
            </div>

            <HtsCodeSelector
              selectedElement={selectedElement}
              onSelectionChange={handleElementSelection}
              autoFocus={!searchParams.get("code")}
            />
          </div>
          {/* Country Selection */}
          <div className="grow flex flex-col gap-2">
            <div className="flex flex-col">
              <SecondaryLabel value="Country of Origin" />
              {/* <SecondaryText value="Select the country your goods are imported from" /> */}
            </div>
            <CountrySelection
              singleSelect
              selectedCountries={selectedCountry ? [selectedCountry] : []}
              setSelectedCountries={(countries) =>
                setSelectedCountry(countries[0] || null)
              }
            />
          </div>
          {/* Customs Value Input */}
          <div className="grow flex flex-col gap-2">
            <div className="flex flex-col">
              <SecondaryLabel value="Customs Value (USD)" />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 font-semibold pointer-events-none">
                $
              </span>
              <input
                type="number"
                className="w-full h-[45px] pl-7 pr-3 bg-base-200/50 rounded-xl border border-base-content/10 transition-all duration-200 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 hover:border-primary/30 hover:bg-base-200/70 font-semibold"
                value={uiCustomsValue}
                onChange={(e) =>
                  handleCustomsValueChange(Number(e.target.value))
                }
                min={0}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {/* Units and Customs Value Inputs */}
          {countryWithTariffs &&
            countryWithTariffs.baseTariffs
              ?.flatMap((t) => t.tariffs)
              ?.some((t) => t.type === "amount") && (
              <div className="col-span-1 flex flex-col gap-2">
                <div className="flex flex-col">
                  <SecondaryLabel value="Amount / Units / Weight" />
                </div>
                <NumberInput
                  value={uiUnits}
                  setValue={handleUnitsChange}
                  min={0}
                  subtext={
                    selectedElement &&
                    tariffElement &&
                    (selectedElement.units.length > 0 ||
                      tariffElement.units.length > 0)
                      ? `${[...selectedElement.units, ...tariffElement.units]
                          .reduce((acc: string[], unit: string) => {
                            if (!acc.includes(unit)) {
                              acc.push(unit);
                            }
                            return acc;
                          }, [])
                          .join(",")}`
                      : ""
                  }
                />
              </div>
            )}
          {/* Content Percentage Inputs */}
          {countryWithTariffs && uiContentPercentages.length > 0 && (
            <div className="flex flex-col gap-4 col-span-1">
              {uiContentPercentages.map((contentPercentage) => (
                <div
                  key={`${contentPercentage.name}-content-requirement`}
                  className="flex flex-col gap-2"
                >
                  <SecondaryLabel
                    value={`${contentPercentage.name} Value Percentage`}
                  />
                  <PercentageInput
                    value={contentPercentage.value}
                    onChange={(value) =>
                      handleSliderChange(contentPercentage.name, value)
                    }
                    className="max-w-48"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Element Ancestry Display */}

        {/* Separator */}
        {(selectedElement || selectedCountry) && (
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-base-content/20 to-base-content/20"></div>
            <span className="text-xs font-medium uppercase tracking-widest text-base-content/40">
              Results
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-base-content/20 to-base-content/20"></div>
          </div>
        )}

        {/* Tariff Results */}
        {selectedElement &&
          selectedCountry &&
          countryWithTariffs &&
          tariffElement && (
            <div className="mt-4">
              <CountryTariff
                units={units}
                customsValue={customsValue}
                country={countryWithTariffs}
                htsElement={selectedElement}
                tariffElement={tariffElement}
                contentRequirements={contentRequirements}
                countryIndex={0}
                countries={[countryWithTariffs]}
                setCountries={(updater) => {
                  const updated =
                    typeof updater === "function"
                      ? updater([countryWithTariffs])
                      : updater;
                  setCountryWithTariffs(updated[0] || null);
                }}
                isModal={false}
              />
            </div>
          )}

        {/* Prompt to select country and HTS code */}
        {(!selectedElement || !selectedCountry) && (
          <div className="relative overflow-hidden flex flex-col items-center justify-center py-16 px-6 rounded-2xl border border-base-content/10 bg-gradient-to-br from-base-200/80 via-base-100 to-base-200/80">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Floating gradient orbs */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />

              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6">
              {/* Icon with animated ring */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-20 blur-xl animate-pulse" />
                <div className="relative p-5 rounded-full bg-base-100 shadow-lg border border-base-content/5">
                  <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10">
                    <MagnifyingGlassIcon className="w-10 h-10 text-primary" />
                  </div>
                </div>
                {/* Animated ring */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping [animation-duration:3s]" />
              </div>

              {/* Text content */}
              <div className="text-center max-w-xl">
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-base-content via-base-content/90 to-base-content bg-clip-text">
                  Find Tariffs For Your Import
                </h3>
                <p className="text-base-content/60 mt-3 text-base leading-relaxed">
                  {!selectedCountry && !selectedElement
                    ? "Select a country of origin and enter an HTS code to discover tariffs, duties, and ways to save."
                    : !selectedCountry
                      ? "Select a country of origin to discover tariffs, duties, and ways to save."
                      : "Enter an HTS code to discover tariffs, duties, and ways to save."}
                </p>
              </div>

              {/* Progress indicators */}
              <div className="flex items-center gap-3 mt-2">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedElement
                      ? "bg-success/15 text-success border border-success/20"
                      : "bg-base-content/5 text-base-content/40 border border-base-content/10"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${selectedElement ? "bg-success" : "bg-base-content/30"}`}
                  />
                  HTS Code
                </div>
                <div className="w-8 h-px bg-base-content/20" />
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCountry
                      ? "bg-success/15 text-success border border-success/20"
                      : "bg-base-content/5 text-base-content/40 border border-base-content/10"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${selectedCountry ? "bg-success" : "bg-base-content/30"}`}
                  />
                  Country
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explore HTS Modal */}
      {showExploreModal && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-7xl h-[90vh] p-0 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-base-content/10">
              <h3 className="font-bold text-lg">Explore HTS Codes</h3>
              <button
                type="button"
                onClick={() => setShowExploreModal(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Explore />
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={() => setShowExploreModal(false)}>
              close
            </button>
          </form>
        </dialog>
      )}
    </main>
  );
};

// {
//   selectedElement && sections.length > 0 && (
//     <div className="mt-6 mb-2">
//       {(() => {
//         const sectionAndChapter = getSectionAndChapterFromChapterNumber(
//           sections,
//           Number(selectedElement.chapter)
//         );
//         const parents = getHtsElementParents(selectedElement, htsElements);

//         if (!sectionAndChapter) return null;

//         const ancestryItems: {
//           label: string | null;
//           value: string;
//           type: "section" | "chapter" | "parent";
//         }[] = [
//           {
//             label: `Section ${sectionAndChapter.section.number}`,
//             value: sectionAndChapter.section.description,
//             type: "section",
//           },
//           {
//             label: `Chapter ${sectionAndChapter.chapter.number}`,
//             value: sectionAndChapter.chapter.description,
//             type: "chapter",
//           },
//           ...parents.map((parent) => ({
//             label: parent.htsno || null,
//             value: parent.description,
//             type: "parent" as const,
//           })),
//         ];

//         return (
//           <div className="relative overflow-hidden rounded-2xl border border-base-content/10 bg-gradient-to-br from-base-200/60 via-base-100 to-base-200/40">
//             {/* Subtle decorative elements */}
//             <div className="absolute inset-0 pointer-events-none">
//               <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
//               <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
//             </div>

//             <div className="relative z-10 p-5">
//               {/* Header with code badge */}
//               <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
//                 <div className="flex items-center gap-3">
//                   <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
//                     <span className="text-primary font-bold text-sm">#</span>
//                   </div>
//                   <div className="flex flex-col">
//                     <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">
//                       Selected Code
//                     </span>
//                     <span className="text-lg font-bold text-base-content">
//                       {selectedElement.htsno || "—"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Main description */}
//               <div className="mb-5 p-4 rounded-xl bg-base-100/80 border border-base-content/5">
//                 <p className="text-base-content font-medium leading-relaxed">
//                   {selectedElement.description}
//                 </p>
//               </div>

//               {/* Ancestry breadcrumb trail */}
//               <div className="flex flex-col gap-2">
//                 <span className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-1">
//                   Classification Path
//                 </span>
//                 <div className="flex flex-wrap items-center gap-1.5">
//                   {ancestryItems.map((item, index) => (
//                     <div key={index} className="flex items-center gap-1.5">
//                       <div
//                         className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-75 ${
//                           item.type === "section"
//                             ? "bg-gradient-to-r from-amber-500/15 to-amber-500/5 border border-amber-500/20 hover:border-amber-500/40"
//                             : item.type === "chapter"
//                               ? "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40"
//                               : "bg-base-content/5 border border-base-content/10 hover:border-base-content/20"
//                         }`}
//                       >
//                         {item.label && (
//                           <span
//                             className={`text-xs font-bold shrink-0 ${
//                               item.type === "section"
//                                 ? "text-amber-600 dark:text-amber-400"
//                                 : item.type === "chapter"
//                                   ? "text-emerald-600 dark:text-emerald-400"
//                                   : "text-primary"
//                             }`}
//                           >
//                             {item.label}
//                           </span>
//                         )}
//                         <span
//                           className="text-xs text-base-content/70 line-clamp-1 max-w-[200px]"
//                           title={item.value}
//                         >
//                           {item.value}
//                         </span>
//                       </div>
//                       {index < ancestryItems.length - 1 && (
//                         <ChevronRightIcon className="w-3.5 h-3.5 text-base-content/30 shrink-0" />
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })()}
//     </div>
//   );
// }
