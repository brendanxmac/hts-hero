import { Dispatch, SetStateAction } from "react";
import {
  countries,
  Country,
  EuropeanUnionCountries,
} from "../constants/countries";
import { CountryTariff } from "./CountryTariff";
import { ContentRequirementI } from "./Element";
import { HtsElement } from "../interfaces/hts";
import { ContentRequirements, TariffColumn } from "../enums/tariff";
import {
  getBaseTariffsForColumn,
  getEUCountryTotalBaseRate,
  getStandardTariffSet,
  getTariffs,
  section232MetalTariffs,
} from "../tariffs/tariffs";
import { TariffI } from "../interfaces/tariffs";
import { otherColumnCountryCodes } from "../tariffs/tariff-columns";

interface Props {
  selectedCountries: Country[];
  htsElement: HtsElement;
  tariffElement: HtsElement;
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
  contentRequirements: ContentRequirementI<ContentRequirements>[];
}

interface TariffWithRates extends Country {
  amountRate: number;
  generalRate: number;
}

export const Tariffs = ({
  selectedCountries,
  htsElement,
  tariffElement,
  setSelectedCountries,
  contentRequirements,
}: Props) => {
  const countriesWithTariffs: TariffWithRates[] = countries.map((country) => {
    const isOtherColumnCountry = otherColumnCountryCodes.includes(country.code);
    const column = isOtherColumnCountry
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
      contentRequirements
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

  const showSorted = true;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-2">
        {selectedCountries.map((country, i) => (
          <CountryTariff
            key={`tariff-${country.code}-${i}`}
            country={country}
            htsElement={htsElement}
            tariffElement={tariffElement}
            selectedCountries={selectedCountries}
            setSelectedCountries={setSelectedCountries}
            contentRequirements={contentRequirements}
          />
        ))}
      </div>
      {showSorted && sortedCountries.length > 0 && (
        <div className="w-full flex flex-col justify-start items-start gap-x-4">
          {sortedCountries.map((c) => (
            <div className="w-full flex justify-between items-center border-b border-base-content/40">
              <div className="flex gap-3 items-center">
                <h2 className="text-white">{c.flag}</h2>
                <h2 className="text-white">{c.name}</h2>
              </div>
              <div className="flex gap-2">
                {c.amountRate ? (
                  <p className="text-white text-lg font-bold">{c.amountRate}</p>
                ) : null}
                {c.generalRate && (
                  <p className="text-white">{c.generalRate}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
