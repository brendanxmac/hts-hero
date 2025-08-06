import { Dispatch, SetStateAction, useState } from "react";
import { countries, Country } from "../constants/countries";
import {
  applicableTariffIsActive,
  getTariffs,
  Metal,
  TariffColumn,
  TariffI,
} from "../public/tariffs/tariffs";
import { Tariff, UITariff } from "./Tariff";
import { ContentRequirementI } from "./Element";
import { classNames } from "../utilities/style";
import { HtsElement } from "../interfaces/hts";
import { BaseTariffI, getBaseTariffs, splitOnClosingParen } from "../libs/hts";
import { BaseTariff } from "./BaseTariff";
import { getStringBetweenParenthesis } from "../utilities/hts";
import { otherColumnCountryCodes } from "../public/tariffs/tariff-columns";
import { SpecialPrograms } from "./SpecialPrograms";

interface Props {
  country: Country;
  htsElement: HtsElement;
  selectedCountries: Country[];
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
  contentRequirements: ContentRequirementI<Metal>[];
}

export interface TariffSet {
  exceptionCodes: Set<string>;
  tariffs: UITariff[];
}

export const CountryTariff = ({
  country,
  htsElement,
  selectedCountries,
  setSelectedCountries,
  contentRequirements,
}: Props) => {
  const htsCode = htsElement.htsno;
  const applicableTariffs = getTariffs(country.code, htsCode);
  const lol = applicableTariffs.map((t) => ({
    ...t,
    exceptions: t.exceptions?.filter((e) =>
      applicableTariffs.some((t) => t.code === e)
    ),
    isActive: false,
  }));
  const applicableUITariffs: UITariff[] = lol.map((t) => ({
    ...t,
    isActive: applicableTariffIsActive(t, lol, country.code, htsCode),
  }));

  // const baseExceptionCodes = new Set<string>();
  // const baseTariffSet = getBaseTariffSet(applicableUITariffs);

  // const sets = [...getBaseSet(), getContentExceptionSets()]

  console.log("APPLICABLE UI TARIFFS", applicableUITariffs);

  // const getExceptionTariffsForTariff = (
  //   tariff: UITariff,
  //   tariffSet: UITariff[]
  // ): UITariff => {
  //   const tariffHasExceptions =
  //     tariff.exceptions && tariff.exceptions.length > 0;

  //   if (!tariffHasExceptions) {
  //     return tariff;
  //   }

  //   const exceptionTariffs = tariffSet
  //     .filter((t) => tariff.exceptions.includes(t.code))
  //     .map((exceptionTariff) =>
  //       getExceptionTariffsForTariff(exceptionTariff, tariffSet)
  //     );

  //   return {
  //     ...tariff,
  //     exceptionTariffs,
  //   };
  // };

  // Create a set to track all exception tariff codes (at any level)
  const allExceptionTariffCodes = new Set<string>();

  // Helper function to collect all exception codes recursively
  const collectExceptionCodes = (
    tariff: UITariff,
    tariffs: UITariff[],
    exceptionCodes: Set<string>
  ) => {
    if (tariff.exceptions) {
      tariff.exceptions.forEach((code) => {
        exceptionCodes.add(code);
        // Find the exception tariff and recursively collect its exceptions
        const exceptionTariff = tariffs.find((t) => t.code === code);
        if (exceptionTariff) {
          collectExceptionCodes(exceptionTariff, tariffs, exceptionCodes);
        }
      });
    }
  };

  // Collect all exception codes from all tariffs
  // applicableTariffs.forEach(collectExceptionCodes);

  // Build the complete hierarchy for each tariff
  // const tariffsWithExceptions: UITariff[] = applicableUITariffs.map((tariff) =>
  //   getExceptionTariffsForTariff(tariff, applicableUITariffs)
  // );

  // Remove tariffs that are exceptions at any level
  const cleanedUpTariffs = applicableUITariffs.filter(
    (t) => !allExceptionTariffCodes.has(t.code)
  );

  const getBaseTariffSet = (tariffs: UITariff[]): TariffSet => {
    let contentRequirementCodes = new Set<string>();
    const contentRequirementTariffs = tariffs.filter(
      (t) => t.contentRequirement
    );
    contentRequirementTariffs.forEach((t) => {
      collectExceptionCodes(t, tariffs, contentRequirementCodes);
    });

    let exceptionCodes = new Set<string>();
    // ????? Use to pass contentRequirements.length > 0 check here and use tariffs if not
    const baseSet = tariffs.filter((t) => !t.contentRequirement);

    // Recursively get all the exceptions for all applicables minus content requirement ones
    baseSet.forEach((t) => {
      collectExceptionCodes(t, tariffs, exceptionCodes);
    });

    // Are there any in contentRequirementExceptionTariffs that do NOT exist in exceptionTariffs?
    const exceptionsThatOnlyContentRequirementsHave = Array.from(
      contentRequirementCodes
    ).filter((t) => !exceptionCodes.has(t));

    const baseSetWithoutContentRequirementTariffs = baseSet.filter(
      (t) => !exceptionsThatOnlyContentRequirementsHave.includes(t.code)
    );

    return {
      exceptionCodes: exceptionCodes,
      tariffs: baseSetWithoutContentRequirementTariffs,
    };
  };

  const getContentRequirementTariffSets = (
    tariffs: UITariff[],
    contentRequirements: ContentRequirementI<Metal>[]
  ): TariffSet[] => {
    const sets: TariffSet[] = [];

    for (const contentRequirement of contentRequirements) {
      const exceptionCodes = new Set<string>();
      let tariffSet = tariffs.filter(
        (t) =>
          !t.contentRequirement ||
          t.contentRequirement === contentRequirement.name
      );

      tariffSet.forEach((t) => {
        collectExceptionCodes(t, tariffs, exceptionCodes);
      });

      sets.push({
        exceptionCodes,
        tariffs: tariffSet,
      });
    }

    return sets;
  };

  const getTariffForColumn = (column: TariffColumn, htsElement: HtsElement) => {
    if (column === TariffColumn.GENERAL) {
      return htsElement.general;
    } else if (column === TariffColumn.SPECIAL) {
      return htsElement.special;
    } else if (column === TariffColumn.OTHER) {
      return htsElement.other;
    }
  };

  const getBaseTariffsForColumn = (column: TariffColumn) => {
    const tariffString = getTariffForColumn(column, htsElement);
    // only needed if string has countries specified, which USITC writes within parenthesis ()
    // if not parenthesis then the function just returns the tariff as an element in array
    const tariffParts = splitOnClosingParen(tariffString);

    return tariffParts.map((part) => getBaseTariffs(part));
  };

  // Recursive helper function to calculate rate from a tariff and all its exceptions
  // const calculateTariffRate = (
  //   tariff: UITariff,
  //   column: TariffColumn
  // ): number => {
  //   let rate = 0;

  //   if (tariff.isActive) {
  //     rate += tariff[column];
  //   } else if (tariff.exceptionTariffs?.length) {
  //     // If this tariff is not active, check all its exception tariffs recursively
  //     tariff.exceptionTariffs.forEach((exceptionTariff) => {
  //       rate += calculateTariffRate(exceptionTariff, column);
  //     });
  //   }

  //   return rate;
  // };

  // const getAdValoremRate = (
  //   column: TariffColumn,
  //   tariffSet: UITariff[],
  //   baseTariffs: BaseTariffI[]
  // ) => {
  //   let rate = 0;
  //   tariffSet.forEach((tariff) => {
  //     rate += calculateTariffRate(tariff, column);
  //   });

  //   if (baseTariffs && baseTariffs.length > 0) {
  //     baseTariffs
  //       .filter((tariff) => tariff.type === "percent")
  //       .forEach((t) => {
  //         rate += t.value;
  //       });
  //   }

  //   return rate;
  // };

  const getAmountRates = (baseTariffs: BaseTariffI[]) => {
    return baseTariffs
      .filter((t) => t.type === "amount")
      .map((t) => t.raw)
      .join(" + ");
  };

  const [tariffSets, setTariffSets] = useState<TariffSet[]>([
    getBaseTariffSet(applicableUITariffs),
    ...getContentRequirementTariffSets(
      applicableUITariffs,
      contentRequirements
    ),
  ]);
  const [tariffColumn, setTariffColumn] = useState<TariffColumn>(
    otherColumnCountryCodes.includes(country.code)
      ? TariffColumn.OTHER
      : TariffColumn.GENERAL
  );
  const [tariffs, setTariffs] = useState<UITariff[]>(cleanedUpTariffs);
  const [showInactive, setShowInactive] = useState<boolean>(true);
  const isOtherColumnCountry = otherColumnCountryCodes.includes(country.code);
  const columnTariffs = getBaseTariffsForColumn(tariffColumn);
  const columnHasTariffs = columnTariffs.some((t) => t.tariffs.length > 0);

  return (
    <div className="flex flex-col p-8 border-2 border-base-content/50 bg-base-300 rounded-md gap-6">
      <div className="w-full flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <h2 className="text-white text-3xl font-bold">{country.flag}</h2>
          <h2 className="text-white text-2xl font-bold">{country.name}</h2>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md p-1 bg-primary/30 text-white hover:text-primary transition-colors"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
          </button>
          <button
            className="rounded-md p-1 bg-primary/30 text-white hover:text-primary transition-colors"
            onClick={() => {
              setTariffs(cleanedUpTariffs);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
          <button
            className="rounded-md p-1 bg-primary/30 text-white hover:text-primary transition-colors"
            onClick={() =>
              setSelectedCountries(
                selectedCountries.filter((c) => c.code !== country.code)
              )
            }
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tariff Column Selection */}
      <div className="flex gap-8">
        {/* General */}
        <div className="flex flex-col gap-2">
          <div className="cursor-pointer flex gap-2 p-0">
            <input
              type="checkbox"
              disabled={isOtherColumnCountry}
              checked={tariffColumn === TariffColumn.GENERAL}
              className="checkbox checkbox-primary"
              onChange={() => {
                if (tariffColumn !== TariffColumn.GENERAL) {
                  setTariffColumn(TariffColumn.GENERAL);
                }
              }}
            />
            <span className="label-text font-bold text-lg">General Rate</span>
          </div>
        </div>

        {/* Special */}
        <div className="flex flex-col max-w-sm">
          <div className="cursor-pointer flex gap-2 p-0">
            <input
              type="checkbox"
              disabled={isOtherColumnCountry}
              checked={tariffColumn === TariffColumn.SPECIAL}
              className="checkbox checkbox-primary"
              onChange={() => {
                if (tariffColumn !== TariffColumn.SPECIAL) {
                  setTariffColumn(TariffColumn.SPECIAL);
                }
              }}
            />
            <span className="label-text font-bold text-lg">Special Rate</span>
          </div>
          {getStringBetweenParenthesis(htsElement.special) && (
            <div className="flex flex-col">
              <div className="flex flex-wrap gap-x-1">
                {getStringBetweenParenthesis(htsElement.special) && (
                  <SpecialPrograms
                    programs={getStringBetweenParenthesis(htsElement.special)
                      .split(",")
                      .map((p) => p.trim())}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        {/* Other */}
        <div className="flex flex-col gap-1">
          <div className="cursor-pointer flex gap-2 p-0">
            <input
              type="checkbox"
              disabled={!isOtherColumnCountry}
              checked={tariffColumn === TariffColumn.OTHER}
              className="checkbox checkbox-primary"
              onChange={() => {
                if (tariffColumn !== TariffColumn.OTHER) {
                  setTariffColumn(TariffColumn.OTHER);
                }
              }}
            />
            <span className="label-text font-bold text-lg">Other Rate</span>
          </div>
          <div className="flex flex-wrap text-sm gap-1">
            (
            {countries
              .filter((c) => otherColumnCountryCodes.includes(c.code))
              .map((otherColumnCountry, index) => (
                <span
                  key={index}
                  className={classNames(
                    country.code === otherColumnCountry.code &&
                      "font-bold text-white"
                  )}
                >
                  {otherColumnCountry.name}
                  {index <
                    countries.filter((c) =>
                      otherColumnCountryCodes.includes(c.code)
                    ).length -
                      1 && ", "}
                </span>
              ))}
            )
          </div>
        </div>
      </div>

      <div
        className={classNames(
          tariffSets.length > 1 ? "grid grid-cols-2 gap-4" : "flex flex-col"
        )}
      >
        {tariffSets.map((tariffSet, i) => (
          <div key={`tariff-set-${i}`} className="flex flex-col gap-4">
            {columnHasTariffs &&
              columnTariffs
                .flatMap((t) => t.tariffs)
                .map((t, i) => (
                  <BaseTariff
                    key={`${htsElement.htsno}-${t.raw}-${i}`}
                    index={i}
                    htsElement={htsElement}
                    tariff={t}
                  />
                ))}
            {tariffSet.tariffs
              .filter((t) => !tariffSet.exceptionCodes.has(t.code))
              .map((tariff) => (
                <Tariff
                  key={tariff.code}
                  showInactive={showInactive}
                  tariff={tariff}
                  setIndex={i}
                  tariffSets={tariffSets}
                  setTariffSets={setTariffSets}
                />
              ))}
            <div className="-mt-2 w-full flex justify-between items-end gap-2">
              <h2 className="text-white font-bold">Total:</h2>
              <div className="flex gap-2">
                {columnTariffs
                  .flatMap((t) => t.tariffs)
                  .filter((t) => t.type === "amount").length > 0 && (
                  <div className="flex gap-2">
                    <p className="text-xl font-bold text-primary transition duration-100">
                      {getAmountRates(columnTariffs.flatMap((t) => t.tariffs))}
                    </p>
                    <p className="text-xl font-bold text-primary transition duration-100">
                      +
                    </p>
                  </div>
                )}
                {/* <p className="text-xl font-bold text-primary transition duration-100">
                  {getAdValoremRate(
                    tariffColumn,
                    tariffSet,
                    columnTariffs.flatMap((t) => t.tariffs)
                  )}
                  %
                </p> */}
              </div>
            </div>
            {columnTariffs.flatMap((t) => t.parsingFailures).length > 0 && (
              <div className="flex flex-col gap-2 p-4 border-2 border-red-500 rounded-md">
                <h2 className="text-white font-bold">
                  {`Error Parsing ${htsElement.htsno}'s Base Tariff(s):`}
                </h2>
                <ul className="flex flex-col gap-2 list-disc list-outside">
                  {columnTariffs
                    .flatMap((t) => t.parsingFailures)
                    .map((t, i) => (
                      <li
                        key={`${htsElement.htsno}-${t}-${i}`}
                        className="ml-6 text-red-500 font-bold text-lg"
                      >
                        {t}
                      </li>
                    ))}
                </ul>

                <p className="text-base-content">
                  Please send{" "}
                  <a
                    href="mailto:support@htshero.com"
                    className="text-primary font-bold"
                  >
                    support
                  </a>{" "}
                  a screenshot of this error.
                </p>
                <p className="text-base-content">
                  All tariffs are still presented so you can manually add them
                  them while we work on the fix
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
