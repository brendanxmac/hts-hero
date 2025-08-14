import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import {
  countries,
  Country,
  EuropeanUnionCountries,
} from "../constants/countries";
import { ContentRequirementI } from "./Element";
import { HtsElement } from "../interfaces/hts";
import { ContentRequirements, TariffColumn } from "../enums/tariff";
import {
  getBaseTariffsForColumn,
  getEUCountryTotalBaseRate,
  getStandardTariffSet,
  getTariffs,
  section232MetalTariffs,
  tariffIsApplicableToCode,
  TariffsList,
} from "../tariffs/tariffs";
import { TariffI } from "../interfaces/tariffs";
import { Column2CountryCodes } from "../tariffs/tariff-columns";
import Link from "next/link";
import { Color } from "../enums/style";
import { TertiaryText } from "./TertiaryText";
import { classNames } from "../utilities/style";
import React from "react";
import { InlineCountryTariff } from "./InlineCountryTariff";
import { SecondaryLabel } from "./SecondaryLabel";
import { TertiaryLabel } from "./TertiaryLabel";
import { TradePrograms, TradeProgramStatus } from "../public/trade-programs";

interface Props {
  htsElement: HtsElement;
  tariffElement: HtsElement;
}

interface TariffWithRates extends Country {
  amountRate: number;
  generalRate: number;
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
  const [searchTerm, setSearchTerm] = useState("");

  const toggleRow = (countryCode: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(countryCode)) {
      newExpandedRows.delete(countryCode);
    } else {
      newExpandedRows.add(countryCode);
    }
    setExpandedRows(newExpandedRows);
  };

  const countriesWithTariffs: TariffWithRates[] = countries.map((country) => {
    const isColumn2ColumnCountry = Column2CountryCodes.includes(country.code);
    const column = isColumn2ColumnCountry
      ? TariffColumn.OTHER
      : TariffColumn.GENERAL;
    const isEUCountry = EuropeanUnionCountries.includes(country.code);
    const columnTariffs = getBaseTariffsForColumn(tariffElement, column);
    const applicableTariffs = getTariffs(country.code, htsElement.htsno).filter(
      (t) => {
        if (isEUCountry) {
          const totalBaseRate = getEUCountryTotalBaseRate(
            columnTariffs.flatMap((t) => t.tariffs),
            1000,
            10
          );

          if (totalBaseRate >= 15) {
            return t.code !== "9903.02.20";
          } else {
            return t.code !== "9903.02.19";
          }
        }

        return true;
      }
    );
    const applicableUITariffs: TariffI[] = applicableTariffs.map((t) => ({
      ...t,
      exceptions: t.exceptions?.filter((e) =>
        applicableTariffs.some((t) => t.code === e)
      ),
    }));
    const generalTariffs = getStandardTariffSet(
      applicableUITariffs,
      section232MetalTariffs,
      codeBasedContentPercentages
    );

    const baseAmountRate =
      columnTariffs && columnTariffs.length > 0
        ? columnTariffs
            .flatMap((t) => t.tariffs)
            .filter((t) => t.type === "amount")
            .reduce((acc, t) => acc + t.value, 0)
        : 0;

    const baseAdValoremRate =
      columnTariffs && columnTariffs.length > 0
        ? columnTariffs
            .flatMap((t) => t.tariffs)
            .filter((t) => t.type === "percent")
            .reduce((acc, t) => acc + t.value, 0)
        : 0;

    const generalAdValorem =
      generalTariffs &&
      generalTariffs.tariffs &&
      generalTariffs.tariffs.length > 0
        ? generalTariffs.tariffs
            .filter((t) => t.isActive)
            .reduce((acc, t) => acc + t.general, 0)
        : 0;

    return {
      ...country,
      amountRate: baseAmountRate,
      generalRate: baseAdValoremRate + generalAdValorem,
    };
  });

  const sortedCountries = countriesWithTariffs.sort((a, b) => {
    if (a.amountRate === b.amountRate) {
      return a.generalRate - b.generalRate;
    }
    return a.amountRate - b.amountRate;
  });

  // Filter countries based on search term
  const filteredCountries = sortedCountries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Link
              href="/tariffs/coverage"
              className="btn btn-primary btn-xs btn-link"
            >
              Learn More
            </Link>
          </div>
          <TertiaryText
            value="Explore and compare potential tariff values for any number of countries."
            color={Color.NEUTRAL_CONTENT}
          />
        </div>
        {/* Search Input */}
        <div className="w-full flex flex-col gap-2">
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
          <table className="table">
            <thead>
              <tr>
                <th>Country of Origin</th>
                <th>Rate</th>
                <th>FTA's</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCountries.map((c, i) => {
                const isExpanded = expandedRows.has(c.code);
                const specialTariffProgramSymbols = getBaseTariffsForColumn(
                  tariffElement,
                  TariffColumn.SPECIAL
                ).reduce((acc, t) => {
                  t.tariffs.forEach((t) => {
                    t.programs?.forEach((p) => {
                      if (!acc.includes(p)) {
                        acc.push(p);
                      }
                    });
                  });
                  return acc;
                }, []);
                const specialTariffPrograms = specialTariffProgramSymbols
                  .map((p) => TradePrograms.find((t) => t.symbol === p))
                  .filter(Boolean)
                  .filter(
                    (p) =>
                      p.status === TradeProgramStatus.ACTIVE &&
                      (p.qualifyingCountries?.includes(c.code) ||
                        (!p.qualifyingCountries && p.requiresReview))
                  );
                return (
                  <React.Fragment key={`${c.code}-${i}`}>
                    <tr
                      className={classNames(
                        "w-full cursor-pointer transition-colors hover:bg-base-content/10",
                        !isExpanded &&
                          "not-last:border-b border-base-content/40",
                        isExpanded && "bg-primary/70 hover:bg-primary"
                      )}
                      onClick={() => toggleRow(c.code)}
                    >
                      <td>
                        <div className="flex gap-3 items-center">
                          <h2 className="text-white">{c.flag}</h2>
                          <h2 className="text-white">{c.name}</h2>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {c.amountRate ? (
                            <p className="text-white text-lg font-bold">
                              {c.amountRate}
                            </p>
                          ) : null}
                          {<p className="text-white">{c.generalRate}%</p>}
                        </div>
                      </td>
                      <td>
                        <p className="text-lg p-0">
                          {specialTariffPrograms.length > 0 ? "✅" : "−"}
                        </p>
                      </td>
                      <td className="w-8">
                        <ChevronDownIcon
                          className={`h-4 w-4 text-white transition-transform duration-200 ${
                            isExpanded ? "" : "-rotate-180"
                          }`}
                        />
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
                            key={`tariff-${c.code}-${i}`}
                            country={c}
                            htsElement={htsElement}
                            tariffElement={tariffElement}
                            contentRequirements={codeBasedContentPercentages}
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
