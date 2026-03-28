"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HtsElement } from "../interfaces/hts";
import { CountrySelection } from "./CountrySelection";
import type { Country } from "../constants/countries";
import { CountryTariff } from "./CountryTariff";
import {
  addTariffsToCountry,
  type CountryWithTariffs,
  TariffsList,
  tariffIsApplicableToCode,
} from "../tariffs/tariffs";
import { findTariffElement } from "../tariffs/tariff-calculations";
import type { ContentRequirementI } from "./Element";
import { ContentRequirements } from "../enums/tariff";
import { NumberInput } from "./NumberInput";
import { PercentageInput } from "./PercentageInput";
import { SecondaryLabel } from "./SecondaryLabel";
import { ArrowPathIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

export interface SingleCountryDutyTariffCardProps {
  element: HtsElement;
  htsElements: HtsElement[];
  /** When set, use this tariff row instead of findTariffElement (e.g. explorer breadcrumbs). */
  tariffElementOverride?: HtsElement;
  initialSelectedCountry?: Country | null;
  /** When the user changed country away from classification COO, show reset to COO. */
  countryOfOrigin?: Country | null;
}

export function SingleCountryDutyTariffCard({
  element,
  htsElements,
  tariffElementOverride,
  initialSelectedCountry = null,
  countryOfOrigin,
}: SingleCountryDutyTariffCardProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    () => initialSelectedCountry
  );
  const [countryWithTariffs, setCountryWithTariffs] =
    useState<CountryWithTariffs | null>(null);
  const [customsValue, setCustomsValue] = useState(10000);
  const [uiCustomsValue, setUiCustomsValue] = useState(10000);
  const [units, setUnits] = useState(1000);
  const [uiUnits, setUiUnits] = useState(1000);
  const [contentRequirements, setContentRequirements] = useState<
    ContentRequirementI<ContentRequirements>[]
  >([]);
  const [uiContentPercentages, setUiContentPercentages] = useState<
    ContentRequirementI<ContentRequirements>[]
  >([]);

  const customsValueTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unitsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveTariffElement = useMemo(() => {
    if (tariffElementOverride !== undefined) {
      return tariffElementOverride;
    }
    if (!element || !htsElements.length) return null;
    return findTariffElement(element, htsElements);
  }, [tariffElementOverride, element, htsElements]);

  useEffect(() => {
    if (!effectiveTariffElement) {
      setContentRequirements([]);
      setUiContentPercentages([]);
      return;
    }
    const codeBasedContentRequirements = Array.from(
      TariffsList.filter((t) =>
        tariffIsApplicableToCode(t, effectiveTariffElement.htsno)
      ).reduce((acc, t) => {
        if (t.contentRequirement) {
          acc.add(t.contentRequirement.content);
        }
        return acc;
      }, new Set<ContentRequirements>())
    );

    const next = codeBasedContentRequirements.map((contentRequirement) => ({
      name: contentRequirement,
      value: 80,
    }));
    setContentRequirements(next);
    setUiContentPercentages(next);
  }, [effectiveTariffElement]);

  useEffect(() => {
    if (
      element &&
      selectedCountry &&
      htsElements.length > 0 &&
      effectiveTariffElement
    ) {
      setCountryWithTariffs(
        addTariffsToCountry(
          selectedCountry,
          element,
          effectiveTariffElement,
          contentRequirements,
          undefined,
          units,
          customsValue
        )
      );
    } else {
      setCountryWithTariffs(null);
    }
  }, [
    element,
    selectedCountry,
    contentRequirements,
    units,
    customsValue,
    htsElements,
    effectiveTariffElement,
  ]);

  const handleCustomsValueChange = (value: number) => {
    setUiCustomsValue(value);
    if (customsValueTimeoutRef.current) {
      clearTimeout(customsValueTimeoutRef.current);
    }
    customsValueTimeoutRef.current = setTimeout(() => {
      setCustomsValue(value);
    }, 300);
  };

  const handleUnitsChange = (value: number) => {
    setUiUnits(value);
    if (unitsTimeoutRef.current) {
      clearTimeout(unitsTimeoutRef.current);
    }
    unitsTimeoutRef.current = setTimeout(() => {
      setUnits(value);
    }, 300);
  };

  const showCountryOfOriginReset =
    countryOfOrigin &&
    selectedCountry &&
    selectedCountry.code !== countryOfOrigin.code;

  const handleSliderChange = (
    contentRequirement: ContentRequirements,
    value: number
  ) => {
    setUiContentPercentages((prev) =>
      prev.map((c) => (c.name === contentRequirement ? { ...c, value } : c))
    );
    setTimeout(() => {
      setContentRequirements((prev) =>
        prev.map((c) => (c.name === contentRequirement ? { ...c, value } : c))
      );
    }, 300);
  };

  return (
    <div className="bg-base-100 shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 flex flex-col gap-5">
        {showCountryOfOriginReset ? (
          <div className="flex flex-wrap justify-end">
            <button
              type="button"
              onClick={() => setSelectedCountry(countryOfOrigin)}
              className="btn btn-sm btn-outline btn-primary gap-1.5 shrink-0"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" />
              Show Country of Origin Tariffs
            </button>
          </div>
        ) : null}

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <SecondaryLabel value="Select Country" />
            <CountrySelection
              singleSelect
              selectedCountries={selectedCountry ? [selectedCountry] : []}
              setSelectedCountries={(countries) => {
                setSelectedCountry(countries[0] || null);
              }}
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <SecondaryLabel value="Customs Value (USD)" />
            <NumberInput
              value={uiCustomsValue}
              setValue={handleCustomsValueChange}
              min={0}
              prefix="$"
            />
          </div>
        </div>

        {countryWithTariffs &&
          (countryWithTariffs.baseTariffs
            ?.flatMap((t) => t.tariffs)
            ?.some((t) => t.type === "amount") ||
            uiContentPercentages.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {countryWithTariffs.baseTariffs
                ?.flatMap((t) => t.tariffs)
                ?.some((t) => t.type === "amount") && (
                  <div className="flex flex-col gap-2">
                    <SecondaryLabel value="Units / Weight" />
                    <NumberInput
                      value={uiUnits}
                      setValue={handleUnitsChange}
                      min={0}
                      subtext={
                        element &&
                          effectiveTariffElement &&
                          (element.units.length > 0 ||
                            effectiveTariffElement.units.length > 0)
                          ? `${[...element.units, ...effectiveTariffElement.units]
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
                  />
                </div>
              ))}
            </div>
          )}

        {selectedCountry && countryWithTariffs && effectiveTariffElement ? (
          <div className="mt-2">
            <CountryTariff
              units={units}
              customsValue={customsValue}
              country={countryWithTariffs}
              htsElement={element}
              tariffElement={effectiveTariffElement}
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
        ) : (
          <div className="relative overflow-hidden flex flex-col items-center justify-center py-12 px-6 rounded-xl border border-base-content/10 bg-gradient-to-br from-base-200/60 via-base-100 to-base-200/60">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/15 border border-secondary/25">
                <GlobeAltIcon className="w-7 h-7 text-secondary" />
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold text-base-content">
                  Select a Country of Origin
                </h4>
                <p className="text-sm text-base-content/60 mt-1 max-w-sm">
                  Select the country of origin for this item to see applicable
                  tariffs and import duties.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
