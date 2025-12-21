import { useEffect, useState, useRef } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CheckCircleIcon,
} from "@heroicons/react/16/solid";
import {
  Countries,
  Country,
  EuropeanUnionCountries,
} from "../constants/countries";
import { ContentRequirementI } from "./Element";
import { HtsElement } from "../interfaces/hts";
import { ContentRequirements } from "../enums/tariff";
import {
  tariffIsApplicableToCode,
  TariffsList,
  getTotalPercentTariffsSum,
  CountryWithTariffs,
  addTariffsToCountries,
  getBaseAmountTariffsText,
  get15PercentCountryTotalBaseRate,
} from "../tariffs/tariffs";
import { classNames } from "../utilities/style";
import React from "react";
import { CountryTariff } from "./CountryTariff";
import { CountrySelection } from "./CountrySelection";
import toast from "react-hot-toast";
import Link from "next/link";
import { NumberInput } from "./NumberInput";
import { PercentageInput } from "./PercentageInput";

interface Props {
  isPayingUser: boolean;
  isTariffImpactTrialUser: boolean;
  htsElement: HtsElement;
  tariffElement: HtsElement;
}

export const Tariffs = ({
  htsElement,
  tariffElement,
  isPayingUser,
  isTariffImpactTrialUser,
}: Props) => {
  // UI states - update immediately for responsive feedback
  const [uiUnits, setUiUnits] = useState<number>(1000);
  const [uiCustomsValue, setUiCustomsValue] = useState<number>(10000);
  // Calculation states - update after debounce for expensive operations
  const [units, setUnits] = useState<number>(1000);
  const [customsValue, setCustomsValue] = useState<number>(10000);
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] =
    useState<CountryWithTariffs | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unitsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const customsValueTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const codeBasedContentRequirements = Array.from(
    TariffsList.filter((t) =>
      tariffIsApplicableToCode(t, htsElement.htsno)
    ).reduce((acc, t) => {
      if (t.contentRequirement) {
        acc.add(t.contentRequirement.content);
      }
      return acc;
    }, new Set<ContentRequirements>())
  );
  // UI state - updates immediately for responsive slider
  const [uiContentPercentages, setUiContentPercentages] = useState<
    ContentRequirementI<ContentRequirements>[]
  >(
    codeBasedContentRequirements.map((contentRequirement) => ({
      name: contentRequirement,
      value: 80,
    }))
  );
  // Calculation state - updates after debounce for expensive operations
  const [codeBasedContentPercentages, setCodeBasedContentPercentages] =
    useState<ContentRequirementI<ContentRequirements>[]>(
      codeBasedContentRequirements.map((contentRequirement) => ({
        name: contentRequirement,
        value: 80,
      }))
    );

  const handleRowClick = (country: CountryWithTariffs) => {
    // if (isPayingUser || isTariffImpactTrialUser) {
    setSelectedCountry(country);
    setIsModalOpen(true);
    // } else {
    // toast.error("Please upgrade to view all tariff rates & exemptions");
    // }
  };

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

    // Debounce the expensive recalculation (300ms as requested)
    timeoutRef.current = setTimeout(() => {
      setCodeBasedContentPercentages((prev) =>
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

  const [countries, setCountries] = useState<CountryWithTariffs[]>([]);

  enum TariffsTableSortOption {
    RATE_ASC = "rate-asc",
    RATE_DESC = "rate-desc",
    FTA_ASC = "fta-asc",
    FTA_DESC = "fta-desc",
    COUNTRY_ASC = "country-asc",
    COUNTRY_DESC = "country-desc",
  }

  const sortByRateAsc = () => {
    return [...countries].sort((a, b) => {
      const aIs15CapCountry =
        EuropeanUnionCountries.includes(a.code) ||
        a.code === "JP" ||
        a.code === "KR";
      const bIs15CapCountry =
        EuropeanUnionCountries.includes(b.code) ||
        b.code === "JP" ||
        b.code === "KR";
      const adValoremEquivalentRateA = get15PercentCountryTotalBaseRate(
        a.baseTariffs.flatMap((t) => t.tariffs),
        customsValue,
        units
      );
      const adValoremEquivalentRateB = get15PercentCountryTotalBaseRate(
        b.baseTariffs.flatMap((t) => t.tariffs),
        customsValue,
        units
      );
      const a15PercentCapApplies =
        aIs15CapCountry && adValoremEquivalentRateA < 15;
      const b15PercentCapApplies =
        bIs15CapCountry && adValoremEquivalentRateB < 15;

      return (
        getTotalPercentTariffsSum(
          a.tariffSets[0],
          a.baseTariffs,
          a15PercentCapApplies
        ) -
        getTotalPercentTariffsSum(
          b.tariffSets[0],
          b.baseTariffs,
          b15PercentCapApplies
        )
      );
    });
  };

  const sortByRateDesc = () => {
    return [...countries].sort((a, b) => {
      const aIs15CapCountry =
        EuropeanUnionCountries.includes(a.code) ||
        a.code === "JP" ||
        a.code === "KR";
      const bIs15CapCountry =
        EuropeanUnionCountries.includes(b.code) ||
        b.code === "JP" ||
        b.code === "KR";
      const adValoremEquivalentRateA = get15PercentCountryTotalBaseRate(
        a.baseTariffs.flatMap((t) => t.tariffs),
        customsValue,
        units
      );
      const adValoremEquivalentRateB = get15PercentCountryTotalBaseRate(
        b.baseTariffs.flatMap((t) => t.tariffs),
        customsValue,
        units
      );
      const a15PercentCapApplies =
        aIs15CapCountry && adValoremEquivalentRateA < 15;
      const b15PercentCapApplies =
        bIs15CapCountry && adValoremEquivalentRateB < 15;
      return (
        getTotalPercentTariffsSum(
          b.tariffSets[0],
          b.baseTariffs,
          b15PercentCapApplies
        ) -
        getTotalPercentTariffsSum(
          a.tariffSets[0],
          a.baseTariffs,
          a15PercentCapApplies
        )
      );
    });
  };

  const sortCountries = (sortBy: TariffsTableSortOption) => {
    if (sortBy === TariffsTableSortOption.RATE_ASC) {
      return sortByRateAsc();
    }
    if (sortBy === TariffsTableSortOption.RATE_DESC) {
      return sortByRateDesc();
    }
  };

  const [sortBy, setSortBy] = useState<TariffsTableSortOption | null>(null);
  const [sortedCountries, setSortedCountries] =
    useState<CountryWithTariffs[]>(countries);

  useEffect(() => {
    // Recalculate countries when content percentage, units, or customsValue change
    const updatedCountries = addTariffsToCountries(
      Countries,
      htsElement,
      tariffElement,
      codeBasedContentPercentages,
      undefined,
      units,
      customsValue
    );
    setCountries(updatedCountries);
  }, [codeBasedContentPercentages, units, customsValue]);

  useEffect(() => {
    if (sortBy) {
      setSortedCountries(
        sortCountries(sortBy).filter((country) =>
          selectedCountries.length > 0
            ? selectedCountries.some((c) => c.code === country.code)
            : true
        )
      );
    } else {
      // Only 2 countries here
      setSortedCountries(
        countries.filter((country) =>
          selectedCountries.length > 0
            ? selectedCountries.some((c) => c.code === country.code)
            : true
        )
      );
    }
  }, [sortBy, selectedCountries, countries]);

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

  return (
    <>
      {isModalOpen && selectedCountry && (
        <CountryTariff
          key={`tariff-modal-${selectedCountry.code}`}
          country={selectedCountry}
          htsElement={htsElement}
          tariffElement={tariffElement}
          contentRequirements={uiContentPercentages}
          countryIndex={countries.findIndex(
            (c) => c.code === selectedCountry.code
          )}
          countries={countries}
          setCountries={setCountries}
          units={units}
          customsValue={customsValue}
          isModal={true}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <div className="flex flex-col gap-4">
        {/* Inputs Section */}
        {(codeBasedContentRequirements.length > 0 ||
          sortedCountries.some(
            (c) =>
              c.baseTariffs
                .flatMap((t) => t.tariffs)
                .filter((t) => t.type === "amount").length > 0
          )) && (
          <div className="p-4 rounded-xl bg-base-200/50 border border-base-content/10">
            <div className="flex flex-col gap-4">
              {/* Content Requirements */}
              {codeBasedContentRequirements.length > 0 && (
                <div className="flex flex-col md:flex-row gap-4">
                  {codeBasedContentRequirements.map((contentRequirement) => (
                    <div
                      key={`${contentRequirement}-content-requirement`}
                      className="flex-1 flex flex-col gap-2"
                    >
                      <label className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
                        {contentRequirement} Value Percentage
                      </label>
                      <p className="text-xs text-base-content/50 -mt-1">
                        What percent of the article&apos;s value is{" "}
                        {contentRequirement}?
                      </p>
                      <PercentageInput
                        value={
                          uiContentPercentages?.find(
                            (c) => c.name === contentRequirement
                          )?.value || 0
                        }
                        onChange={(value) =>
                          handleSliderChange(contentRequirement, value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Units and Customs Value */}
              {sortedCountries.some(
                (c) =>
                  c.baseTariffs
                    .flatMap((t) => t.tariffs)
                    .filter((t) => t.type === "amount").length > 0
              ) && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <NumberInput
                      label="Amount / Units / Weight"
                      value={uiUnits}
                      setValue={handleUnitsChange}
                      min={0}
                      subtext={
                        htsElement.units.length > 0 ||
                        tariffElement.units.length > 0
                          ? `${[...htsElement.units, ...tariffElement.units]
                              .reduce((acc, unit) => {
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
                  <div className="flex-1">
                    <NumberInput
                      label="Customs Value (USD)"
                      value={uiCustomsValue}
                      setValue={handleCustomsValueChange}
                      min={0}
                      prefix="$"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Country Selection & Results */}
        <div className="flex flex-col gap-3">
          {/* Country Filter */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <GlobeAltIcon className="h-4 w-4 text-primary/70" />
              <span className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
                Filter by Country
              </span>
            </div>
            <CountrySelection
              selectedCountries={selectedCountries}
              setSelectedCountries={setSelectedCountries}
            />
          </div>

          {/* Results Header */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-base-content/20 to-base-content/20"></div>
            <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
              {sortedCountries.length}{" "}
              {sortedCountries.length === 1 ? "Country" : "Countries"}
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-base-content/20 to-base-content/20"></div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-base-content/50">Sort:</span>
            <button
              className={classNames(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                sortBy === TariffsTableSortOption.RATE_ASC ||
                  sortBy === TariffsTableSortOption.RATE_DESC
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-base-content/5 text-base-content/60 border border-base-content/10 hover:border-base-content/20"
              )}
              onClick={() => {
                if (!sortBy) {
                  setSortBy(TariffsTableSortOption.RATE_ASC);
                }
                if (sortBy === TariffsTableSortOption.RATE_ASC) {
                  setSortBy(TariffsTableSortOption.RATE_DESC);
                }
                if (sortBy === TariffsTableSortOption.RATE_DESC) {
                  setSortBy(null);
                }
              }}
            >
              {sortBy === TariffsTableSortOption.RATE_ASC
                ? "Rate (Low to High)"
                : sortBy === TariffsTableSortOption.RATE_DESC
                  ? "Rate (High to Low)"
                  : "Alphabetical"}
              <ChevronDownIcon
                className={classNames(
                  "w-3.5 h-3.5 transition-transform duration-200",
                  sortBy === TariffsTableSortOption.RATE_ASC && "rotate-180"
                )}
              />
            </button>
          </div>

          {/* Country Cards */}
          <div className="flex flex-col gap-2">
            {sortedCountries.map((country, i) => {
              const adValoremEquivalentRate = get15PercentCountryTotalBaseRate(
                country.baseTariffs
                  .flatMap((t) => t.tariffs)
                  .filter((t) => {
                    if (
                      country.selectedTradeProgram &&
                      country.selectedTradeProgram.symbol !== "none"
                    ) {
                      return t.programs?.includes(
                        country.selectedTradeProgram.symbol
                      );
                    }
                    return true;
                  }),
                customsValue,
                units
              );
              const is15PercentCapCountry =
                EuropeanUnionCountries.includes(country.code) ||
                country.code === "JP" ||
                country.code === "KR";

              const cappedBy15PercentRule =
                is15PercentCapCountry && adValoremEquivalentRate < 15;

              const countryBaseTariffs = country.baseTariffs.filter((t) => {
                if (
                  country.selectedTradeProgram &&
                  country.selectedTradeProgram.symbol !== "none"
                ) {
                  return t.tariffs.some((t) =>
                    t.programs?.includes(country.selectedTradeProgram.symbol)
                  );
                }
                return true;
              });

              const countryAmounts =
                getBaseAmountTariffsText(countryBaseTariffs);

              const countryPercentTariffsSums = country.tariffSets.map(
                (tariffSet) =>
                  getTotalPercentTariffsSum(
                    tariffSet,
                    countryBaseTariffs,
                    cappedBy15PercentRule
                  )
              );

              return (
                <div
                  key={`${country.code}-${i}`}
                  className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 bg-base-100 border border-base-content/15 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01]"
                  onClick={() => handleRowClick(country)}
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="relative z-[1] p-3">
                    <div className="flex items-center justify-between gap-4">
                      {/* Country Info */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{country.flag}</span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-base-content">
                              {country.name}
                            </span>
                            {country.specialTradePrograms.length > 0 && (
                              <>
                                {/* Mobile: just show check icon */}
                                <CheckCircleIcon className="sm:hidden h-4 w-4 text-success shrink-0" />
                                {/* Desktop: show separator and text */}
                                <span className="hidden sm:inline text-base-content/30">
                                  |
                                </span>
                                <span className="hidden sm:inline text-xs text-success font-medium">
                                  Trade Programs Available
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tariff Rate */}
                      <div className="flex items-center gap-3">
                        {/* {!isPayingUser && !isTariffImpactTrialUser ? (
                          <Link
                            href="/about/tariffs"
                            target="_blank"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-content/5 border border-base-content/10 hover:border-primary/30 hover:bg-primary/10 transition-all duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <LockClosedIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">
                              Unlock
                            </span>
                          </Link>
                        ) : ( */}
                        <div className="flex items-center gap-2">
                          {countryPercentTariffsSums.map((sum, i) => {
                            const rawName = country.tariffSets[i]?.name || "";
                            const isArticle =
                              rawName === "Article" || rawName === "";
                            // Remove "Content" suffix and trim for content-based tariffs
                            const displayName = isArticle
                              ? null
                              : rawName.replace(" Content", "");
                            return (
                              <div
                                key={`${country.code}-${i}-percent-sum-${i}`}
                                className="flex items-center gap-2"
                              >
                                {i > 0 && (
                                  <span className="text-base-content/30">
                                    |
                                  </span>
                                )}
                                <div className="flex items-center gap-1">
                                  {displayName && (
                                    <span className="text-xs text-base-content/50 font-medium">
                                      {displayName}:
                                    </span>
                                  )}
                                  <span className="font-bold text-base-content">
                                    {cappedBy15PercentRule
                                      ? null
                                      : countryAmounts &&
                                        countryAmounts.length > 0 &&
                                        i === 0 && (
                                          <span className="text-base">
                                            {countryAmounts} +{" "}
                                          </span>
                                        )}
                                    {sum}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* )} */}

                        {/* Chevron */}
                        <ChevronRightIcon className="h-5 w-5 text-base-content/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
