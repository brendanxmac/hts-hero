import { Dispatch, SetStateAction, useState } from "react";
import { countries, Country } from "../constants/countries";
import {
  getTariffs,
  Metal,
  TariffColumn,
  TariffI,
  tariffIsActive,
} from "../public/tariffs/tariffs";
import { Tariff, TariffUI } from "./Tariff";
import { ContentRequirementI } from "./Element";
import { classNames } from "../utilities/style";
import { HtsElement } from "../interfaces/hts";
import {
  BaseTariffI,
  getBaseTariffs,
  getGeneralNoteFromSpecialTariffSymbol,
} from "../libs/hts";
import { BaseTariff } from "./BaseTariff";
import { SupabaseBuckets } from "../constants/supabase";
import { getStringBetweenParenthesis } from "../utilities/hts";
import { PDFProps } from "../interfaces/ui";
import PDF from "./PDF";
import { otherColumnCountryCodes } from "../public/tariffs/tariff-columns";

interface Props {
  country: Country;
  htsElement: HtsElement;
  selectedCountries: Country[];
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
  contentRequirements: ContentRequirementI<Metal>[];
}

export const CountryTariff = ({
  country,
  htsElement,
  selectedCountries,
  setSelectedCountries,
  contentRequirements,
}: Props) => {
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const htsCode = htsElement.htsno;
  const applicableTariffs = getTariffs(country.code, htsCode).map((t) => ({
    ...t,
    isActive: tariffIsActive(t, country.code, htsCode),
  }));

  // TODO: NEED TO INCLIDE THE ONES TO IGNORE HERE AS WELL....
  // Recursive function to build the complete exception hierarchy
  const buildTariffHierarchy = (
    tariff: TariffUI,
    allTariffs: TariffUI[]
  ): TariffUI => {
    const exceptionTariffs = tariff.exceptions
      ? allTariffs
          .filter((t) => tariff.exceptions?.includes(t.code))
          .map((exceptionTariff) =>
            buildTariffHierarchy(exceptionTariff, allTariffs)
          )
      : [];

    return {
      ...tariff,
      exceptionTariffs,
    };
  };

  // Create a set to track all exception tariff codes (at any level)
  const allExceptionTariffCodes = new Set<string>();

  // Helper function to collect all exception codes recursively
  const collectExceptionCodes = (
    tariff: TariffI,
    exceptionCodes: Set<string>
  ) => {
    if (tariff.exceptions) {
      tariff.exceptions.forEach((code) => {
        exceptionCodes.add(code);
        // Find the exception tariff and recursively collect its exceptions
        const exceptionTariff = applicableTariffs.find((t) => t.code === code);
        if (exceptionTariff) {
          collectExceptionCodes(exceptionTariff, exceptionCodes);
        }
      });
    }
  };

  // Collect all exception codes from all tariffs
  // applicableTariffs.forEach(collectExceptionCodes);

  // Build the complete hierarchy for each tariff
  const tariffsWithExceptions: TariffUI[] = applicableTariffs.map((tariff) =>
    buildTariffHierarchy(tariff, applicableTariffs)
  );

  // Remove tariffs that are exceptions at any level
  const cleanedUpTariffs = tariffsWithExceptions.filter(
    (t) => !allExceptionTariffCodes.has(t.code)
  );

  const getTariffSets = (baseRates?: TariffUI[]): Array<TariffUI[]> => {
    console.log("============================");
    console.log("============================");
    console.log("============================");
    console.log("============================");
    console.log("============================");
    console.log("Getting Tariff Sets");
    const tariffsToIgnore = applicableTariffs
      .filter((t) => t.contentRequirement)
      .map((t) => t.code);

    console.log("Tariffs to ignore:", tariffsToIgnore);
    let exceptionTariffs = new Set<string>();
    let baseSet: TariffUI[] =
      contentRequirements.length > 0
        ? applicableTariffs.filter((t) => !t.contentRequirement)
        : applicableTariffs;
    baseSet.forEach((t) => {
      collectExceptionCodes(t, exceptionTariffs);
    });
    console.log("BASE SET ECs:");
    exceptionTariffs.forEach((code) => {
      console.log(code);
    });
    baseSet = baseSet.map((t) => buildTariffHierarchy(t, baseSet));
    baseSet = baseSet.filter((t) => !exceptionTariffs.has(t.code));
    baseSet = baseSet.map((t) => ({
      ...t,
      exceptionTariffs: t.exceptionTariffs?.map((et) => {
        console.log("ET", et.code);
        if (et.code === "9903.01.33") {
          console.log("IS ACTIBVEEEEEEE");
          console.log(et);
          console.log(
            tariffIsActive(et, country.code, htsCode, tariffsToIgnore)
          );
        }
        return {
          ...et,
          isActive: tariffIsActive(et, country.code, htsCode, tariffsToIgnore),
        };
      }),
      isActive: tariffIsActive(t, country.code, htsCode, tariffsToIgnore),
    }));
    exceptionTariffs.clear();
    const otherSets = [];

    for (const contentRequirement of contentRequirements) {
      let tariffSet = applicableTariffs.filter(
        (t) =>
          !t.contentRequirement ||
          t.contentRequirement === contentRequirement.name
      );
      tariffSet.forEach((t) => {
        collectExceptionCodes(t, exceptionTariffs);
      });
      tariffSet = tariffSet.map((t) => buildTariffHierarchy(t, tariffSet));
      tariffSet = tariffSet.filter((t) => !exceptionTariffs.has(t.code));
      exceptionTariffs.clear();
      otherSets.push(tariffSet);
    }

    console.log("Tariff Sets", [baseSet, ...otherSets]);

    return [baseSet, ...otherSets];
  };

  const [tariffSets, setTariffSets] =
    useState<Array<TariffUI[]>>(getTariffSets());

  const [tariffColumn, setTariffColumn] = useState<TariffColumn>(
    otherColumnCountryCodes.includes(country.code)
      ? TariffColumn.OTHER
      : TariffColumn.GENERAL
  );

  const getBaseTariffsForColumn = (column: TariffColumn) => {
    if (column === TariffColumn.GENERAL) {
      return getBaseTariffs(htsElement.general);
    } else if (column === TariffColumn.SPECIAL) {
      return getBaseTariffs(htsElement.special);
    } else if (column === TariffColumn.OTHER) {
      return getBaseTariffs(htsElement.other);
    }
  };

  // Recursive helper function to calculate rate from a tariff and all its exceptions
  const calculateTariffRate = (
    tariff: TariffUI,
    column: TariffColumn
  ): number => {
    let rate = 0;

    if (tariff.isActive) {
      rate += tariff[column];
    } else if (tariff.exceptionTariffs?.length) {
      // If this tariff is not active, check all its exception tariffs recursively
      tariff.exceptionTariffs.forEach((exceptionTariff) => {
        rate += calculateTariffRate(exceptionTariff, column);
      });
    }

    return rate;
  };

  const getRate = (column: TariffColumn, tariffSet: TariffUI[]) => {
    let rate = 0;
    tariffSet.forEach((tariff) => {
      rate += calculateTariffRate(tariff, column);
    });
    return rate;
  };

  const [tariffs, setTariffs] = useState<TariffUI[]>(cleanedUpTariffs);
  const [showInactive, setShowInactive] = useState<boolean>(true);

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
        </div>
      </div>

      {/* Ability to select between general, special, and other */}
      <div className="flex gap-8">
        {/* General */}
        <div className="flex flex-col gap-2">
          <div className="cursor-pointer flex gap-2 p-0">
            <input
              type="checkbox"
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
        <div className="flex flex-col max-w-xs">
          <div className="cursor-pointer flex gap-2 p-0">
            <input
              type="checkbox"
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
                {getStringBetweenParenthesis(htsElement.special)
                  .split(",")
                  .map((specialTariffSymbol, index) => {
                    const note = getGeneralNoteFromSpecialTariffSymbol(
                      specialTariffSymbol.trim()
                    );
                    return (
                      <div
                        key={`${specialTariffSymbol}-${index}`}
                        className="tooltip tooltip-primary tooltip-bottom"
                        data-tip={note?.description || note?.title || null}
                      >
                        <button
                          className="btn btn-link btn-xs text-xs p-0 hover:text-secondary"
                          onClick={() => {
                            const note = getGeneralNoteFromSpecialTariffSymbol(
                              specialTariffSymbol.trim()
                            );
                            setShowPDF({
                              title: note?.title || "",
                              bucket: SupabaseBuckets.NOTES,
                              filePath: note?.filePath || "",
                            });
                          }}
                        >
                          {specialTariffSymbol}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
        {/* Other */}
        <div className="flex flex-col gap-1">
          <div className="cursor-pointer flex gap-2 p-0">
            <input
              type="checkbox"
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
          <div className="flex flex-wrap text-sm">
            (
            {countries
              .filter((c) => otherColumnCountryCodes.includes(c.code))
              .map((country) => country.name)
              .join(", ")}
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
          <div key={i} className="flex flex-col gap-4">
            {getBaseTariffsForColumn(tariffColumn).length > 0 &&
              getBaseTariffsForColumn(tariffColumn).map((t, i) => (
                <BaseTariff
                  key={`${htsElement.htsno}-${t.raw}-${i}`}
                  index={i}
                  htsElement={htsElement}
                  tariff={t}
                />
              ))}
            {tariffSet.map((tariff) => (
              <Tariff
                key={tariff.code}
                showInactive={showInactive}
                tariff={tariff}
                tariffs={tariffs}
                setTariffs={setTariffs}
              />
            ))}
            <div className="-mt-2 w-full flex justify-between items-end gap-2">
              <h2 className="text-white font-bold">Total:</h2>
              <p className="text-xl font-bold text-primary transition duration-100">
                {getRate(TariffColumn.GENERAL, tariffSet)}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="flex flex-col gap-4 border-b-2 border-white">
        {tariffs.map((tariff) => (
          <Tariff
            key={tariff.code}
            showInactive={showInactive}
            tariff={tariff}
            tariffs={tariffs}
            setTariffs={setTariffs}
          />
        ))}
      </div> */}
      {showPDF && (
        <PDF
          title={showPDF.title}
          bucket={showPDF.bucket}
          filePath={showPDF.filePath}
          isOpen={showPDF !== null}
          setIsOpen={(isOpen) => {
            if (!isOpen) {
              setShowPDF(null);
            }
          }}
        />
      )}
    </div>
  );
};
