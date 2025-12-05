"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Country } from "../constants/countries";
import { CountrySelection } from "./CountrySelection";
import { HtsElement } from "../interfaces/hts";
import { useHts } from "../contexts/HtsContext";
import { LoadingIndicator } from "./LoadingIndicator";
import { PrimaryLabel } from "./PrimaryLabel";
import { SecondaryText } from "./SecondaryText";
import { SecondaryLabel } from "./SecondaryLabel";
import { TertiaryText } from "./TertiaryText";
import { TertiaryLabel } from "./TertiaryLabel";
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

export const TariffFinderPage = () => {
  // Context
  const { htsElements, fetchElements } = useHts();
  const { sections, getSections } = useHtsSections();

  // State
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedElement, setSelectedElement] = useState<HtsElement | null>(
    null
  );
  const [tariffElement, setTariffElement] = useState<HtsElement | null>(null);
  const [countryWithTariffs, setCountryWithTariffs] =
    useState<CountryWithTariffs | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);

  // UI states - update immediately for responsive feedback
  const [uiUnits, setUiUnits] = useState<number>(1000);
  const [uiCustomsValue, setUiCustomsValue] = useState<number>(10000);
  // Calculation states - update after debounce for expensive operations
  const [units, setUnits] = useState<number>(1000);
  const [customsValue, setCustomsValue] = useState<number>(10000);

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

  console.log("countryWithTariffs:");
  console.log(countryWithTariffs && countryWithTariffs.baseTariffs);

  return (
    <main className="w-screen h-full flex flex-col bg-base-100 py-6">
      <div className="w-full max-w-5xl mx-auto flex flex-col px-4 sm:px-6 gap-6 pb-6">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          Tariff Finder
        </h1>

        {/* Inputs */}
        <div className="w-full flex flex-col md:flex-row gap-3">
          {/* HTS Code Search */}
          <div className="grow flex flex-col gap-2">
            <div className="flex flex-col">
              <PrimaryLabel value="HTS Code" />
              {/* <SecondaryText value="Enter or paste an HTS code to find applicable tariffs" /> */}
            </div>

            <HtsCodeSelector
              selectedElement={selectedElement}
              onSelectionChange={setSelectedElement}
            />
          </div>
          {/* Country Selection */}
          <div className="grow flex flex-col gap-2">
            <div className="flex flex-col">
              <PrimaryLabel value="Country of Origin" />
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
        </div>

        <div className="grid grid-cols-3 gap-x-3">
          {/* Customs Value Input */}
          <div className="col-span-1 flex flex-col gap-2">
            <div className="flex flex-col">
              <PrimaryLabel value="Customs Value (USD)" />
            </div>
            <input
              type="number"
              className="input input-bordered w-full"
              value={uiCustomsValue}
              onChange={(e) => handleCustomsValueChange(Number(e.target.value))}
              min={0}
            />
          </div>
          {/* Content Percentage Sliders and Units/Customs Value Inputs */}
          {countryWithTariffs && uiContentPercentages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Content Percentage Sliders */}
              {uiContentPercentages.map((contentPercentage) => (
                <div
                  key={`${contentPercentage.name}-content-requirement`}
                  className="col-span-1 flex flex-col"
                >
                  <PrimaryLabel
                    value={`${contentPercentage.name} Value Percentage`}
                  />
                  {/* <TertiaryText
                    value={`What percent of the articles value is ${contentPercentage.name}?`}
                  /> */}
                  <div className="flex gap-2 items-center mt-3">
                    <input
                      type="range"
                      min={0}
                      max="100"
                      value={contentPercentage.value}
                      className="range range-primary range-sm p-1"
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        handleSliderChange(contentPercentage.name, value);
                      }}
                    />
                    <TertiaryLabel value={`${contentPercentage.value}%`} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Units and Customs Value Inputs */}
          {countryWithTariffs && (
            // countryWithTariffs.baseTariffs
            //   ?.flatMap((t) => t.tariffs)
            //   ?.some((t) => t.type === "amount") && (
            <div className="col-span-1 flex flex-col gap-2">
              <div className="flex flex-col">
                <PrimaryLabel value="Amount / Units / Weight" />
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
        </div>

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
          <div className="flex flex-col items-center justify-center py-12 gap-4 bg-base-200 rounded-xl border-2 border-base-300">
            <MagnifyingGlassIcon className="w-12 h-12" />
            <div className="text-center">
              <h3 className="text-xl font-bold">
                Find Tariffs For Your Import
              </h3>
              <p className="text-base-content/70 mt-2 max-w-md">
                {!selectedCountry && !selectedElement
                  ? "Select a country of origin and enter an HTS code to see applicable tariffs"
                  : !selectedCountry
                    ? "Select a country of origin to see applicable tariffs"
                    : "Enter an HTS code to see applicable tariffs"}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
