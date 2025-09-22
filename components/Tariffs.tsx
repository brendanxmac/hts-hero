import { useEffect, useState, useRef } from "react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { Countries, Country } from "../constants/countries";
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
} from "../tariffs/tariffs";
import { Color } from "../enums/style";
import { TertiaryText } from "./TertiaryText";
import { classNames } from "../utilities/style";
import React from "react";
import { InlineCountryTariff } from "./InlineCountryTariff";
import { SecondaryLabel } from "./SecondaryLabel";
import { TertiaryLabel } from "./TertiaryLabel";
import { CountrySelection } from "./CountrySelection";
import toast from "react-hot-toast";
import Link from "next/link";

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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleRow = (countryCode: string) => {
    const updatedRows = new Set(expandedRows);

    if (updatedRows.has(countryCode)) {
      updatedRows.delete(countryCode);
    } else {
      updatedRows.add(countryCode);
    }

    setExpandedRows(updatedRows);
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
      return (
        getTotalPercentTariffsSum(a.tariffSets[0], a.baseTariffs) -
        getTotalPercentTariffsSum(b.tariffSets[0], b.baseTariffs)
      );
    });
  };

  const sortByRateDesc = () => {
    return [...countries].sort((a, b) => {
      return (
        getTotalPercentTariffsSum(b.tariffSets[0], b.baseTariffs) -
        getTotalPercentTariffsSum(a.tariffSets[0], a.baseTariffs)
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
    // Recalculate countries when content percentages change
    const updatedCountries = addTariffsToCountries(
      Countries,
      htsElement,
      tariffElement,
      codeBasedContentPercentages
    );
    setCountries(updatedCountries);
  }, [codeBasedContentPercentages]);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-5px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 1000px;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      <div className="flex flex-col gap-2 md:gap-8 my-2">
        {/* Show inputs for any content requirements based */}
        {codeBasedContentRequirements.length > 0 && (
          <div className="grow w-full flex flex-col md:flex-row gap-4">
            {codeBasedContentRequirements.map((contentRequirement) => (
              <div
                key={`${contentRequirement}-content-requirement`}
                className="w-full flex flex-col"
              >
                <SecondaryLabel
                  value={`${contentRequirement} Value Percentage`}
                  color={Color.WHITE}
                />
                <TertiaryText
                  value={`What percent of the articles value is ${contentRequirement}?`}
                  color={Color.NEUTRAL_CONTENT}
                />
                <div className="flex gap-2 items-center mt-3">
                  <input
                    type="range"
                    min={0}
                    max="100"
                    value={
                      uiContentPercentages?.find(
                        (c) => c.name === contentRequirement
                      )?.value || 0
                    }
                    className="range range-primary range-sm p-1"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      handleSliderChange(contentRequirement, value);
                    }}
                  />
                  <TertiaryLabel
                    value={`${
                      uiContentPercentages?.find(
                        (c) => c.name === contentRequirement
                      )?.value || 0
                    }%`}
                    color={Color.NEUTRAL_CONTENT}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <CountrySelection
            selectedCountries={selectedCountries}
            setSelectedCountries={setSelectedCountries}
          />

          <div className="w-full flex flex-col overflow-x-auto border border-base-content/40 rounded-lg">
            <table className="table table-sm table-pin-cols">
              <thead>
                <tr>
                  <th></th>
                  <th>Country of Origin</th>
                  <th className="w-auto min-w-48">
                    <div className="flex gap-2 items-center">
                      <h3>Tariff Rates</h3>
                      <button
                        className={classNames(
                          `btn btn-xs p-0.5`,
                          (sortBy === TariffsTableSortOption.RATE_ASC ||
                            sortBy === TariffsTableSortOption.RATE_DESC) &&
                            "btn-primary",
                          !sortBy && "btn-ghost"
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
                        <ChevronDownIcon
                          className={classNames(
                            "w-4 h-4",
                            sortBy === TariffsTableSortOption.RATE_ASC &&
                              "rotate-180"
                          )}
                        />
                      </button>
                    </div>
                  </th>
                  <th className="hidden md:block max-w-48">
                    Special Trade Program(s)
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCountries.map((country, i) => {
                  const isExpanded = expandedRows.has(country.code);
                  const countryAmounts = getBaseAmountTariffsText(
                    country.baseTariffs
                  );

                  const countryPercentTariffsSums = country.tariffSets.map(
                    (tariffSet) =>
                      getTotalPercentTariffsSum(tariffSet, country.baseTariffs)
                  );

                  return (
                    <React.Fragment key={`${country.code}-${i}`}>
                      <tr
                        className={classNames(
                          "w-full cursor-pointer transition-all duration-200 hover:bg-base-content/10 bg-base-100",
                          !isExpanded &&
                            "not-last:border-b border-base-content/40",
                          isExpanded && "hover:bg-base-200 border-b-0"
                        )}
                        onClick={() => {
                          if (isPayingUser || isTariffImpactTrialUser) {
                            toggleRow(country.code);
                          } else {
                            toast.error(
                              "Please upgrade to view all tariff rates & exemptions"
                            );
                          }
                        }}
                      >
                        <td className="w-6">
                          <ChevronDownIcon
                            className={`h-4 w-4 text-white transition-transform duration-300 ease-in-out ${
                              isExpanded ? "rotate-0" : "-rotate-180"
                            }`}
                          />
                        </td>
                        <td>
                          <div className="flex gap-3 items-center text-sm md:text-base">
                            <h2 className="text-white">{country.flag}</h2>
                            <h2 className="text-white">{country.name}</h2>
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {!isPayingUser && !isTariffImpactTrialUser ? (
                              <Link
                                href="/about/tariffs#pricing"
                                target="_blank"
                                className="link link-primary no-underline text-base-content hover:text-primary hover:underline"
                              >
                                🔒 Get Pro to Unlock
                              </Link>
                            ) : (
                              countryPercentTariffsSums.map((sum, i) => (
                                <div
                                  key={`${country.code}-${i}-percent-sum-${i}`}
                                  className="flex gap-2 text-sm md:text-base"
                                >
                                  <div className="flex gap-1">
                                    {countryAmounts &&
                                    countryAmounts.length > 0 ? (
                                      <p className="text-white">
                                        {countryAmounts} +
                                      </p>
                                    ) : null}
                                    {<p className="text-white">{sum}%</p>}
                                    {i > 0 &&
                                      codeBasedContentRequirements &&
                                      codeBasedContentRequirements.length > 0 &&
                                      uiContentPercentages[i - 1].name && (
                                        <p className="text-white">
                                          for {uiContentPercentages[i - 1].name}
                                        </p>
                                      )}
                                  </div>
                                  {countryPercentTariffsSums.length !== i + 1
                                    ? "|"
                                    : null}
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="hidden md:table-cell align-middle">
                          <p className="text-lg">
                            {country.specialTradePrograms.length > 0
                              ? "✅"
                              : "−"}
                          </p>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr
                          className={classNames(
                            "w-full bg-base-100 transition-all duration-300 ease-in-out",
                            isExpanded &&
                              "not-last:border-b border-b-4 border-b-gray-500"
                          )}
                          style={{
                            animation: "slideDown 0.3s ease-in-out",
                          }}
                        >
                          <td colSpan={4} className="p-4 pl-16">
                            <div
                              className="transition-all duration-300 ease-in-out"
                              style={{
                                animation: "fadeIn 0.3s ease-in-out",
                              }}
                            >
                              <InlineCountryTariff
                                key={`tariff-${country.code}-${i}`}
                                country={country}
                                htsElement={htsElement}
                                tariffElement={tariffElement}
                                contentRequirements={uiContentPercentages}
                                countryIndex={countries.findIndex(
                                  (c) => c.code === country.code
                                )}
                                countries={countries}
                                setCountries={setCountries}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
