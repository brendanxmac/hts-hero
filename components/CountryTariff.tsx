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
import { Metal, TariffColumn } from "../enums/tariff";
import { TariffI, TariffSet } from "../interfaces/tariffs";
import { PrimaryLabel } from "./PrimaryLabel";
import { Color } from "../enums/style";
import { SecondaryText } from "./SecondaryText";
import { TertiaryText } from "./TertiaryText";
import { TradePrograms, TradeProgramStatus } from "../public/trade-programs";

interface Props {
  country: Country;
  htsElement: HtsElement;
  tariffElement: HtsElement;
  selectedCountries: Country[];
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
  contentRequirements: ContentRequirementI<Metal>[];
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

  const [tariffSets, setTariffSets] = useState<TariffSet[]>([
    getStandardTariffSet(applicableUITariffs),
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
  const [showInactive, setShowInactive] = useState<boolean>(true);
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
      t.programs.forEach((p) => {
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

      {/* Special Tariff Program Selection */}
      {!isOtherColumnCountry && (
        <div className="flex flex-col gap-2">
          <label className="text-white font-bold text-lg">
            Special Tariff Program
          </label>
          <div className="relative" ref={specialProgramDropdownRef}>
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
              value={`${tariffSet.name} Tariffs`}
              color={Color.ACCENT}
            />
            {/* TODO: add a title for the set here */}
            {columnHasTariffs &&
              columnTariffs
                .filter((t) => {
                  if (
                    selectedSpecialProgram &&
                    selectedSpecialProgram.symbol !== "none"
                  ) {
                    return t.tariffs.some((t) =>
                      t.programs.includes(selectedSpecialProgram.symbol)
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
      {footnotesForColumn.length > 0 && (
        <div className="flex flex-col gap-2 border-2 border-base-content/20 rounded-md p-4">
          <PrimaryLabel value="Footnotes" color={Color.WHITE} />
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
      )}
    </div>
  );
};
