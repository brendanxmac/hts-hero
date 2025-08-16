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

interface Props {
  htsElement: HtsElement;
  tariffElement: HtsElement;
}

export const Tariffs = ({ htsElement, tariffElement }: Props) => {
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

  // Handler to reset all state when countries are cleared
  const handleCountriesChange = (newSelectedCountries: Country[]) => {
    setSelectedCountries(newSelectedCountries);

    // If clearing all countries, reset expanded rows and regenerate clean countries
    if (newSelectedCountries.length === 0) {
      setExpandedRows(new Set());
      // Regenerate clean countries data
      const cleanCountries = addTariffsToCountries(
        Countries,
        htsElement,
        tariffElement,
        codeBasedContentPercentages
      );
      setCountries(cleanCountries);
    } else {
      // When individual countries are removed, clean up their expanded state
      const newSelectedCountryCodes = new Set(
        newSelectedCountries.map((c) => c.code)
      );
      setExpandedRows((prev) => {
        const filteredExpanded = new Set<string>();
        prev.forEach((code) => {
          if (newSelectedCountryCodes.has(code)) {
            filteredExpanded.add(code);
          }
        });
        return filteredExpanded;
      });
    }
  };
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleRow = (countryCode: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(countryCode)) {
      newExpandedRows.delete(countryCode);
    } else {
      newExpandedRows.add(countryCode);
    }
    setExpandedRows(newExpandedRows);
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
  // addTariffsToCountries(
  //   Countries,
  //   htsElement,
  //   tariffElement,
  //   codeBasedContentPercentages
  // );

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
    <div className="flex flex-col gap-2">
      <div className="w-full flex justify-between gap-2 lg:items-end flex-col lg:flex-row">
        <div className="shrink-0">
          <div className="flex gap-2 items-end justify-between">
            <div className="flex gap-2 items-center">
              <h2 className="text-lg md:text-2xl text-white font-bold">
                Tariff Explorer
              </h2>
              <div className="bg-secondary rounded-full">
                <p className="text-base-100 px-2 py-0.5 font-semibold text-xs">
                  Beta
                </p>
              </div>
            </div>
            <a
              href="/tariffs/coverage"
              target="_blank"
              className="btn btn-primary btn-xs btn-link"
            >
              Learn More
            </a>
          </div>
          <TertiaryText
            value="Explore and compare potential tariff values for any number of countries."
            color={Color.NEUTRAL_CONTENT}
          />
        </div>
      </div>

      {/* Show inputs for any content requirements based */}
      {codeBasedContentRequirements.length > 0 && (
        <div className="grow w-full flex flex-col gap-4 my-4">
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
                value={`What percentage of the articles value that is ${contentRequirement}?`}
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

      {sortedCountries.length > 0 && (
        <div className="w-full flex flex-col overflow-x-auto border-2 border-base-content/40 rounded-lg">
          <div className="w-full p-3">
            <CountrySelection
              selectedCountries={selectedCountries}
              setSelectedCountries={handleCountriesChange}
            />
          </div>

          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th className="w-full">Country of Origin</th>
                <th className="w-auto min-w-64">
                  <div className="flex gap-2 items-center">
                    <h3>Rates</h3>
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
                <th className="max-w-20">FTA(s)</th>
              </tr>
            </thead>
            <tbody>
              {sortedCountries.map((country, i) => {
                const isExpanded = expandedRows.has(country.code);
                // const countryAmountRate = getBaseAmountTariffsSum(
                //   country.baseTariffs
                // );
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
                        "w-full cursor-pointer transition-colors hover:bg-base-content/10",
                        !isExpanded &&
                          "not-last:border-b border-base-content/40",
                        isExpanded &&
                          "bg-base-300 hover:bg-primary/50 border-b-0"
                      )}
                      onClick={() => toggleRow(country.code)}
                    >
                      <td className="w-8">
                        <ChevronDownIcon
                          className={`h-4 w-4 text-white transition-transform duration-100 ${
                            isExpanded ? "" : "-rotate-180"
                          }`}
                        />
                      </td>
                      <td>
                        <div className="flex gap-3 items-center">
                          <h2 className="text-white">{country.flag}</h2>
                          <h2 className="text-white">{country.name}</h2>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {countryPercentTariffsSums.map((sum, i) => (
                            <div
                              key={`${country.code}-${i}-percent-sum-${i}`}
                              className="flex gap-2"
                            >
                              <div className="flex gap-1">
                                {countryAmounts && countryAmounts.length > 0 ? (
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
                                ? "+"
                                : null}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <p className="text-lg p-0">
                          {country.specialTradePrograms.length > 0 ? "✅" : "−"}
                        </p>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr
                        className={classNames(
                          "w-full bg-base-300",
                          isExpanded &&
                            "not-last:border-b border-base-content/40"
                        )}
                      >
                        <td colSpan={4} className="p-4">
                          <InlineCountryTariff
                            key={`tariff-${country.code}-${i}`}
                            country={country}
                            htsElement={htsElement}
                            tariffElement={tariffElement}
                            contentRequirements={uiContentPercentages}
                            countryIndex={i}
                            countries={sortedCountries}
                            setCountries={setCountries}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
