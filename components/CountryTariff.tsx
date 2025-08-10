import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { Country } from "../constants/countries";
import {
  getAdValoremRate,
  getAmountRates,
  getBaseTariffsForColumn as getTariffsForColumn,
  getContentRequirementTariffSets,
  getTariffs,
  getStandardTariffSet,
} from "../public/tariffs/tariffs";
import { Tariff } from "./Tariff";
import { ContentRequirementI } from "./Element";
import { classNames } from "../utilities/style";
import { Footnote, HtsElement } from "../interfaces/hts";
import { BaseTariff } from "./BaseTariff";
import { otherColumnCountryCodes } from "../public/tariffs/tariff-columns";
import { ContentRequirements, TariffColumn } from "../enums/tariff";
import { TariffI, TariffSet } from "../interfaces/tariffs";
import { PrimaryLabel } from "./PrimaryLabel";
import { Color } from "../enums/style";
import { TertiaryText } from "./TertiaryText";
import { TradePrograms, TradeProgramStatus } from "../public/trade-programs";
import { SecondaryLabel } from "./SecondaryLabel";

interface Props {
  country: Country;
  htsElement: HtsElement;
  tariffElement: HtsElement;
  selectedCountries: Country[];
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
  contentRequirements: ContentRequirementI<ContentRequirements>[];
}

export const CountryTariff = ({
  country,
  htsElement,
  tariffElement,
  selectedCountries,
  setSelectedCountries,
  contentRequirements,
}: Props) => {
  const htsCode = htsElement.htsno;
  const applicableTariffs = getTariffs(country.code, htsCode);
  const applicableUITariffs: TariffI[] = applicableTariffs.map((t) => ({
    ...t,
    exceptions: t.exceptions?.filter((e) =>
      applicableTariffs.some((t) => t.code === e)
    ),
  }));

  const [tariffSets, setTariffSets] = useState<TariffSet[]>([]);
  const [tariffColumn, setTariffColumn] = useState<TariffColumn>(
    otherColumnCountryCodes.includes(country.code)
      ? TariffColumn.OTHER
      : TariffColumn.GENERAL
  );
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [isSpecialProgramOpen, setIsSpecialProgramOpen] =
    useState<boolean>(false);
  const [selectedSpecialProgram, setSelectedSpecialProgram] = useState<any>({
    symbol: "none",
    name: "None",
    description: "No special program",
  });
  const specialProgramDropdownRef = useRef<HTMLDivElement>(null);
  const isOtherColumnCountry = otherColumnCountryCodes.includes(country.code);
  const columnTariffs = getTariffsForColumn(tariffElement, tariffColumn);
  const columnHasTariffs = columnTariffs.some((t) => t.tariffs.length > 0);
  const specialTariffProgramSymbols = getTariffsForColumn(
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
    .filter(
      (p) =>
        p.status === TradeProgramStatus.ACTIVE &&
        (p.qualifyingCountries?.includes(country.code) ||
          (!p.qualifyingCountries && p.requiresReview))
    );
  const footnotesForColumn: Footnote[] = [
    ...tariffElement.footnotes,
    ...htsElement.footnotes,
  ].reduce((acc, footnote) => {
    if (
      footnote.columns.includes(tariffColumn) ||
      footnote.columns.some(
        (c) =>
          c !== TariffColumn.GENERAL &&
          c !== TariffColumn.SPECIAL &&
          c !== TariffColumn.OTHER
      )
    ) {
      if (!acc.some((f) => f.value === footnote.value)) {
        acc.push(footnote);
      }
    }
    return acc;
  }, []);

  useEffect(() => {
    const contentRequirementAt100 = contentRequirements.find(
      (r) => r.value === 100
    );
    const contentRequirementsNotAt0 = contentRequirements.filter(
      (r) => r.value > 0
    );

    if (contentRequirementAt100) {
      setTariffSets(
        getContentRequirementTariffSets(applicableUITariffs, [
          contentRequirementAt100,
        ])
      );
    } else {
      const contentRequirementSets = getContentRequirementTariffSets(
        applicableUITariffs,
        contentRequirementsNotAt0
      );
      // if (contentRequirementSets.length > 0) {
      setTariffSets([
        getStandardTariffSet(applicableUITariffs, [
          // Iron or Steel
          "9903.81.87",
          "9903.81.88",
          // Iron or Steel Derivatives
          "9903.81.89",
          "9903.81.90",
          "9903.81.91",
          "9903.81.92",
          "9903.81.93",
          // Aluminum
          "9903.85.02",
          // Aluminum Derivatives
          "9903.85.04",
          "9903.85.07",
          "9903.85.08",
          "9903.85.09",
          // Copper
          "9903.78.01",
        ]),
        ...contentRequirementSets,
      ]);
      // } else {
      // setTariffSets([getStandardTariffSet(applicableUITariffs)]);
      // }
    }
  }, [contentRequirements]);

  useEffect(() => {
    if (selectedSpecialProgram && selectedSpecialProgram.symbol === "none") {
      if (isOtherColumnCountry) {
        setTariffColumn(TariffColumn.OTHER);
      } else {
        setTariffColumn(TariffColumn.GENERAL);
      }
    } else {
      setTariffColumn(TariffColumn.SPECIAL);
    }
  }, [selectedSpecialProgram]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        specialProgramDropdownRef.current &&
        !specialProgramDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSpecialProgramOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col p-8 border-2 border-base-content/50 bg-base-300 rounded-md gap-6">
      {/* Header with Buttons */}
      <div className="w-full flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <h2 className="text-white text-3xl font-bold">{country.flag}</h2>
          <h2 className="text-white text-2xl font-bold">{country.name}</h2>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-primary rounded-md"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? "Hide Inactive Tariffs" : "Show All Tariffs"}
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setTariffSets([
                getStandardTariffSet(applicableUITariffs),
                ...getContentRequirementTariffSets(
                  applicableUITariffs,
                  contentRequirements
                ),
              ]);
              setSelectedSpecialProgram({
                symbol: "none",
                name: "None",
                description: "No special program",
              });
              setTariffColumn(TariffColumn.GENERAL);
            }}
          >
            Reset
          </button>
          <button
            className="btn btn-sm btn-square btn-primary"
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
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Special Tariff Program Selection */}
      {!isOtherColumnCountry && specialTariffPrograms.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <SecondaryLabel
              value="Potential Special Tariff Program(s)"
              color={Color.WHITE}
            />
            <TertiaryText value="Select from special tariff programs that might apply" />
          </div>
          <div
            className="relative w-full max-w-md"
            ref={specialProgramDropdownRef}
          >
            <div
              className="w-full px-3 py-1 border-2 border-base-content/10 rounded-lg cursor-pointer bg-base-300 flex gap-3 items-center justify-between hover:bg-primary/20 transition-colors min-h-10"
              onClick={() => setIsSpecialProgramOpen(!isSpecialProgramOpen)}
            >
              <div className="flex-1 flex items-center">
                {selectedSpecialProgram ? (
                  <p className="text-white font-semibold">
                    {selectedSpecialProgram.name}
                    {selectedSpecialProgram.symbol &&
                      selectedSpecialProgram.symbol !== "none" && (
                        <span className="text-accent">
                          {" "}
                          ({selectedSpecialProgram.symbol})
                        </span>
                      )}
                  </p>
                ) : (
                  <span className="text-sm">Select Special Tariff Program</span>
                )}
              </div>
              <svg
                className={`w-4 h-4 transition-transform text-base-content/70 ${isSpecialProgramOpen ? "" : "rotate-180"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {isSpecialProgramOpen && (
              <div className="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-60 overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {[
                    {
                      symbol: "none",
                      name: "None",
                      description: "No special program",
                    },
                    ...specialTariffPrograms,
                  ].map((program, index) => (
                    <div
                      key={index}
                      className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                        selectedSpecialProgram?.symbol === program.symbol
                          ? "bg-primary/10 border-l-2 border-primary"
                          : "hover:bg-primary/20"
                      }`}
                      onClick={() => {
                        setSelectedSpecialProgram(
                          program.symbol === "none"
                            ? {
                                symbol: "none",
                                name: "None",
                                description: "No special program",
                              }
                            : program
                        );
                        setIsSpecialProgramOpen(false);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="text-base-content font-medium">
                          {program.name}
                          {program.symbol && program.symbol !== "none" && (
                            <span className="text-base-content/60">
                              {" "}
                              ({program.symbol})
                            </span>
                          )}
                        </span>
                        {"description" in program && program.description && (
                          <span className="text-sm text-base-content/60">
                            {program.description}
                          </span>
                        )}
                      </div>
                      {selectedSpecialProgram?.symbol === program.symbol && (
                        <svg
                          className="w-4 h-4 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tariff Sets */}
      <div
        className={classNames(
          tariffSets.length > 1 ? "grid grid-cols-2 gap-4" : "flex flex-col"
        )}
      >
        {tariffSets.map((tariffSet, i) => (
          <div
            key={`tariff-set-${i}`}
            className="flex flex-col gap-4 border-2 p-4 rounded-md border-base-content/20"
          >
            <PrimaryLabel
              value={`${tariffSet.name} Tariff`}
              color={Color.WHITE}
            />

            <div className="flex flex-col gap-2">
              {columnHasTariffs &&
                columnTariffs
                  .filter((t) => {
                    if (
                      selectedSpecialProgram &&
                      selectedSpecialProgram.symbol !== "none"
                    ) {
                      return t.tariffs.some((t) =>
                        t.programs?.includes(selectedSpecialProgram.symbol)
                      );
                    }
                    return true;
                  })
                  .flatMap((t) => t.tariffs)
                  .map((t, i) => (
                    <BaseTariff
                      key={`${htsElement.htsno}-${t.raw}-${i}`}
                      index={i}
                      htsElement={tariffElement}
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
                    column={tariffColumn}
                  />
                ))}
            </div>
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
                <p className="text-xl font-bold text-primary transition duration-100">
                  {getAdValoremRate(
                    tariffColumn,
                    tariffSet.tariffs,
                    columnTariffs.flatMap((t) => t.tariffs)
                  )}
                  %
                </p>
              </div>
            </div>
            {columnTariffs.flatMap((t) => t.parsingFailures).length > 0 && (
              <div className="flex flex-col gap-2 p-4 border-2 border-red-500 rounded-md">
                <h2 className="text-white font-bold">
                  {`Error Parsing ${tariffElement.htsno}'s Base Tariff(s):`}
                </h2>
                <ul className="flex flex-col gap-2 list-disc list-outside">
                  {columnTariffs
                    .flatMap((t) => t.parsingFailures)
                    .map((t, i) => (
                      <li
                        key={`${tariffElement.htsno}-${t}-${i}`}
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

      {/* Footnotes */}
      {/* {footnotesForColumn.length > 0 && (
        <div className="flex flex-col gap-2">
          <SecondaryLabel value="Footnotes" />
          <ul className="flex flex-col gap-2 ml-5">
            {footnotesForColumn.map((footnote: Footnote, i) => (
              <li
                key={`${tariffElement.htsno}-${footnote}-${i}`}
                className="list-disc list-outside"
              >
                <SecondaryText value={footnote.value} color={Color.WHITE} />
                <TertiaryText
                  value={`Applies to: ${footnote.columns.join(", ")} column(s)`}
                />
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
};
