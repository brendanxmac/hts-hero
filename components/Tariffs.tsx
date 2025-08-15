import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { Countries, Country } from "../constants/countries";
import { ContentRequirementI } from "./Element";
import { HtsElement } from "../interfaces/hts";
import { ContentRequirements } from "../enums/tariff";
import {
  tariffIsApplicableToCode,
  TariffsList,
  getTotalPercentTariffsSum,
  getBaseAmountTariffsSum,
  CountryWithTariffs,
  addTariffsToCountries,
  getBasePercentTariffs,
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

  const [codeBasedContentPercentages, setCodeBasedContentPercentages] =
    useState<ContentRequirementI<ContentRequirements>[]>(
      codeBasedContentRequirements.map((contentRequirement) => ({
        name: contentRequirement,
        value: 80,
      }))
    );
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);

  const toggleRow = (countryCode: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(countryCode)) {
      newExpandedRows.delete(countryCode);
    } else {
      newExpandedRows.add(countryCode);
    }
    setExpandedRows(newExpandedRows);
  };

  const [countries, setCountries] = useState<CountryWithTariffs[]>(
    addTariffsToCountries(
      Countries,
      htsElement,
      tariffElement,
      codeBasedContentPercentages
    )
  );

  const sortedCountries = countries.sort((a, b) => {
    const aTotalPercentTariffsSum = getTotalPercentTariffsSum(
      a.tariffSets[0],
      a.baseTariffs
    );
    const bTotalPercentTariffsSum = getTotalPercentTariffsSum(
      b.tariffSets[0],
      b.baseTariffs
    );

    return aTotalPercentTariffsSum - bTotalPercentTariffsSum;
  });

  // Filter countries based on search term
  const filteredCountries = sortedCountries.filter((country) =>
    selectedCountries.length > 0
      ? selectedCountries.some((c) => c.code === country.code)
      : true
  );

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
                    codeBasedContentPercentages?.find(
                      (c) => c.name === contentRequirement
                    )?.value || 0
                  }
                  className="range range-primary range-sm p-1"
                  onChange={(e) => {
                    setCodeBasedContentPercentages((prev) =>
                      prev.map((c) =>
                        c.name === contentRequirement
                          ? {
                              ...c,
                              value: parseInt(e.target.value),
                            }
                          : c
                      )
                    );
                  }}
                />
                <TertiaryLabel
                  value={`${
                    codeBasedContentPercentages?.find(
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

      {filteredCountries.length > 0 && (
        <div className="w-full flex flex-col overflow-x-auto border-2 border-base-content/40 rounded-lg">
          <div className="w-full p-3">
            <CountrySelection
              selectedCountries={selectedCountries}
              setSelectedCountries={setSelectedCountries}
            />
          </div>

          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th className="w-full">Country of Origin</th>
                <th className="min-w-48">Rate(s)</th>
                <th className="max-w-20">FTA(s)</th>
              </tr>
            </thead>
            <tbody>
              {filteredCountries.map((country, i) => {
                const isExpanded = expandedRows.has(country.code);
                const countryAmountRate = getBaseAmountTariffsSum(
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
                              {countryAmountRate ? (
                                <p className="text-white">
                                  {countryAmountRate} +
                                </p>
                              ) : null}
                              {<p className="text-white">{sum}%</p>}
                              {countryPercentTariffsSums.length !== i + 1
                                ? "|"
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
                            contentRequirements={codeBasedContentPercentages}
                            countryIndex={i}
                            countries={filteredCountries}
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

{
  /* Search Input */
}
{
  /* <div className="w-full flex flex-col gap-2">
          <div className="w-full lg:ml-auto lg:max-w-xs flex flex-col gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter countries by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered input-md h-10 w-full focus:ring-0 focus:outline-none pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="btn btn-link p-1 btn-xs hover:text-secondary no-underline"
                    title="Clear filter"
                  >
                    clear
                  </button>
                )}
               </div>
            </div>
          </div>
        </div> */
}
