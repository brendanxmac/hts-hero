"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useClassification } from "../../../contexts/ClassificationContext";
import { useClassifications } from "../../../contexts/ClassificationsContext";
import { useHts } from "../../../contexts/HtsContext";
import { UserProfile } from "../../../libs/supabase/user";
import {
  ClassificationRecord,
  HtsElement,
} from "../../../interfaces/hts";
import { updateClassification } from "../../../libs/classification";
import { CountrySelection } from "../../CountrySelection";
import { Countries, Country } from "../../../constants/countries";
import { CountryTariff } from "../../CountryTariff";
import {
  addTariffsToCountry,
  CountryWithTariffs,
  TariffsList,
  tariffIsApplicableToCode,
  getAdValoremRate,
  getAmountRatesString,
  get15PercentCountryTotalBaseRate,
} from "../../../tariffs/tariffs";
import { TariffColumn } from "../../../enums/tariff";
import { EuropeanUnionCountries } from "../../../constants/countries";
import { Column2CountryCodes } from "../../../tariffs/tariff-columns";
import { ContentRequirementI } from "../../Element";
import { ContentRequirements } from "../../../enums/tariff";
import { getHtsElementParents } from "../../../libs/hts";
import { NumberInput } from "../../NumberInput";
import { PercentageInput } from "../../PercentageInput";
import { SecondaryLabel } from "../../SecondaryLabel";
import {
  GlobeAltIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface Props {
  classificationRecord?: ClassificationRecord;
  userProfile: UserProfile | null;
}

export const DutyTariffTab = ({ classificationRecord, userProfile }: Props) => {
  const { classification, classificationId } = useClassification();
  const { refreshClassifications } = useClassifications();
  const { htsElements } = useHts();
  const { levels } = classification;
  const element = levels[levels.length - 1]?.selection;

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(() => {
    if (classificationRecord?.country_of_origin) {
      return (
        Countries.find(
          (c) => c.code === classificationRecord.country_of_origin
        ) || null
      );
    }
    return null;
  });
  const [countryWithTariffs, setCountryWithTariffs] =
    useState<CountryWithTariffs | null>(null);
  const [tariffElement, setTariffElement] = useState<HtsElement | null>(null);
  const [customsValue, setCustomsValue] = useState<number>(10000);
  const [uiCustomsValue, setUiCustomsValue] = useState<number>(10000);
  const [units, setUnits] = useState<number>(1000);
  const [uiUnits, setUiUnits] = useState<number>(1000);
  const [contentRequirements, setContentRequirements] = useState<
    ContentRequirementI<ContentRequirements>[]
  >([]);
  const [uiContentPercentages, setUiContentPercentages] = useState<
    ContentRequirementI<ContentRequirements>[]
  >([]);

  const customsValueTimeoutRef = useState<NodeJS.Timeout | null>(null);
  const unitsTimeoutRef = useState<NodeJS.Timeout | null>(null);

  const findTariffElement = useCallback(
    (el: HtsElement): HtsElement => {
      if (el.general || el.special || el.other) {
        return el;
      }
      const parents = getHtsElementParents(el, htsElements);
      for (let i = parents.length - 1; i >= 0; i--) {
        const parent = parents[i];
        if (parent.general || parent.special || parent.other) {
          return parent;
        }
      }
      return el;
    },
    [htsElements]
  );

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
  }, [tariffElement]);

  useEffect(() => {
    if (element && selectedCountry) {
      const tariffEl = findTariffElement(element);
      setTariffElement(tariffEl);

      const newCountryWithTariffs = addTariffsToCountry(
        selectedCountry,
        element,
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
    element,
    selectedCountry,
    contentRequirements,
    units,
    customsValue,
    findTariffElement,
  ]);

  const handleCustomsValueChange = (value: number) => {
    setUiCustomsValue(value);
    if (customsValueTimeoutRef[0]) {
      clearTimeout(customsValueTimeoutRef[0]);
    }
    const timeout = setTimeout(() => {
      setCustomsValue(value);
    }, 300);
    customsValueTimeoutRef[1](timeout);
  };

  const handleUnitsChange = (value: number) => {
    setUiUnits(value);
    if (unitsTimeoutRef[0]) {
      clearTimeout(unitsTimeoutRef[0]);
    }
    const timeout = setTimeout(() => {
      setUnits(value);
    }, 300);
    unitsTimeoutRef[1](timeout);
  };

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

  if (!element) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-base-200 border border-base-300 mb-6">
          <CurrencyDollarIcon className="w-8 h-8 text-base-content/30" />
        </div>
        <h2 className="text-xl font-bold text-base-content mb-2">
          Duty / Tariffs
        </h2>
        <p className="text-sm text-base-content/50 max-w-md">
          Complete the classification to see applicable tariffs and duty rates.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-base-content">Duty / Tariffs</h2>
        <p className="text-sm text-base-content/60 mt-1">
          Calculate import duties and tariffs for your classified item.
        </p>
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Country & Value Inputs */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <SecondaryLabel value="Country of Origin" />
              <CountrySelection
                singleSelect
                selectedCountries={selectedCountry ? [selectedCountry] : []}
                setSelectedCountries={(countries) => {
                  const country = countries[0] || null;
                  setSelectedCountry(country);
                  if (classificationId) {
                    updateClassification(
                      classificationId,
                      undefined,
                      undefined,
                      undefined,
                      undefined,
                      country?.code || undefined
                    ).then(() => refreshClassifications());
                  }
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

          {/* Units and Content Requirements */}
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
                        tariffElement &&
                        (element.units.length > 0 ||
                          tariffElement.units.length > 0)
                          ? `${[...element.units, ...tariffElement.units]
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

          {/* Tariff Results */}
          {selectedCountry && countryWithTariffs && tariffElement ? (
            <div className="mt-2">
              <CountryTariff
                units={units}
                customsValue={customsValue}
                country={countryWithTariffs}
                htsElement={element}
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
    </div>
  );
};
