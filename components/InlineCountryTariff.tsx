import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { EuropeanUnionCountries } from "../constants/countries";
import { Tariff } from "./Tariff";
import { ContentRequirementI } from "./Element";
import { HtsElement } from "../interfaces/hts";
import { BaseTariff } from "./BaseTariff";
import { ContentRequirements, TariffColumn } from "../enums/tariff";
import { PrimaryLabel } from "./PrimaryLabel";
import { Color } from "../enums/style";
import { Column2CountryCodes } from "../tariffs/tariff-columns";
import {
  getEUCountryTotalBaseRate,
  getAmountRates,
  getAmountRatesString,
  getAdValoremRate,
  CountryWithTariffs,
  addTariffsToCountry,
} from "../tariffs/tariffs";
import { TertiaryLabel } from "./TertiaryLabel";
import { TradePrograms } from "../public/trade-programs";

interface Props {
  isPayingUser: boolean;
  country: CountryWithTariffs;
  htsElement: HtsElement;
  tariffElement: HtsElement;
  contentRequirements: ContentRequirementI<ContentRequirements>[];
  countryIndex: number;
  countries: CountryWithTariffs[];
  setCountries: Dispatch<SetStateAction<CountryWithTariffs[]>>;
}

export const InlineCountryTariff = ({
  isPayingUser,
  country,
  htsElement,
  tariffElement,
  contentRequirements,
  countryIndex,
  countries,
  setCountries,
}: Props) => {
  const [units, setUnits] = useState<number>(1);
  const [customsValue, setCustomsValue] = useState<number>(1000);
  const isEUCountry = EuropeanUnionCountries.includes(country.code);

  const [tariffColumn, setTariffColumn] = useState<TariffColumn>(
    Column2CountryCodes.includes(country.code)
      ? TariffColumn.OTHER
      : TariffColumn.GENERAL
  );
  const [showInactive, setShowInactive] = useState<boolean>(true);
  const [isSpecialProgramOpen, setIsSpecialProgramOpen] =
    useState<boolean>(false);
  const {
    baseTariffs,
    specialTradePrograms,
    tariffSets,
    selectedTradeProgram,
  } = country;
  const [selectedSpecialProgram, setSelectedSpecialProgram] = useState<any>(
    selectedTradeProgram || {
      symbol: "none",
      name: "None",
      description: "No special program",
    }
  );
  const specialProgramDropdownRef = useRef<HTMLDivElement>(null);
  const isOtherColumnCountry = Column2CountryCodes.includes(country.code);

  useEffect(() => {
    const updatedCountries = [...countries];
    updatedCountries[countryIndex] = addTariffsToCountry(
      country,
      htsElement,
      tariffElement,
      contentRequirements,
      selectedTradeProgram,
      units,
      customsValue
    );
    setCountries(updatedCountries);
  }, [units, customsValue]);

  const getTariffColumn = () => {
    if (selectedSpecialProgram && selectedSpecialProgram.symbol === "none") {
      if (isOtherColumnCountry) {
        return TariffColumn.OTHER;
      } else {
        return TariffColumn.GENERAL;
      }
    } else {
      return TariffColumn.SPECIAL;
    }
  };

  useEffect(() => {
    const tradeProgram = selectedSpecialProgram
      ? TradePrograms.find((p) => p.symbol === selectedSpecialProgram.symbol)
      : null;
    const updatedCountries = [...countries];
    updatedCountries[countryIndex] = addTariffsToCountry(
      country,
      htsElement,
      tariffElement,
      contentRequirements,
      tradeProgram,
      units,
      customsValue
    );
    setCountries(updatedCountries);

    const newTariffColumn = getTariffColumn();
    setTariffColumn(newTariffColumn);
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
    <div className="flex flex-col gap-4">
      {/* Header with Buttons */}
      <div className="w-full flex justify-between">
        {/* Special Tariff Program Selection */}

        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex flex-col gap-1">
            <TertiaryLabel
              value="Potential Special Tariff Programs"
              color={Color.WHITE}
            />
          </div>
          <div
            className="relative w-full max-w-lg"
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
                    ...specialTradePrograms,
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
                            <span className="text-base-content">
                              {" "}
                              ({program.symbol})
                            </span>
                          )}
                        </span>
                        {"description" in program && program.description && (
                          <span className="text-sm text-base-content">
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

        <div className="w-full flex gap-2 justify-end">
          <button
            className="btn btn-xs btn-primary"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? "Hide Inactive Tariffs" : "Show All Tariffs"}
          </button>
          <button
            className="btn btn-xs btn-primary"
            // TODO: implement this reset now with setCountries
            onClick={() => {}}
          >
            Reset
          </button>
        </div>
      </div>

      {isEUCountry &&
        baseTariffs
          .flatMap((t) => t.tariffs)
          .some((t) => t.type === "amount") && (
          <div className="flex flex-wrap gap-2">
            {baseTariffs &&
              baseTariffs.flatMap((t) => t.tariffs).length > 0 &&
              (htsElement.units.length > 0 || tariffElement.units.length > 0) &&
              baseTariffs
                .flatMap((t) => t.tariffs)
                .some((t) => t.type === "amount") && (
                <div>
                  <label className="label">
                    <span className="label-text">
                      {htsElement.units.length > 0 ||
                      tariffElement.units.length > 0
                        ? `${[...htsElement.units, ...tariffElement.units]
                            .reduce((acc, unit) => {
                              if (!acc.includes(unit)) {
                                acc.push(unit);
                              }
                              return acc;
                            }, [])
                            .join(",")}`
                        : ""}
                    </span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="input input-bordered w-full max-w-xs"
                    value={units}
                    onChange={(e) => {
                      setUnits(Number(e.target.value));
                    }}
                  />
                </div>
              )}
            <div>
              <label className="label">
                <span className="label-text">Customs Value (USD)</span>
              </label>
              <input
                type="number"
                min={0}
                className="input input-bordered w-full max-w-xs"
                value={customsValue}
                onChange={(e) => {
                  setCustomsValue(Number(e.target.value));
                }}
              />
            </div>
            <div className="flex flex-col">
              <label className="label">
                <span className="label-text">
                  General Ad Valorem Equivalent Rate
                </span>
              </label>
              <div className="flex flex-col">
                <PrimaryLabel
                  value={`${getEUCountryTotalBaseRate(
                    baseTariffs.flatMap((t) => t.tariffs),
                    customsValue,
                    units
                  ).toFixed(3)}
              %`}
                  color={Color.PRIMARY}
                />
                <p>
                  <sup>
                    &ge; 15% means reciprocal tariff exclusion for EU countries
                  </sup>
                </p>
                {/* <TertiaryText value="Used for EU countries to see if general ad valorem equivalent rate exceeds 15% for reciprocal tariff determination" /> */}
              </div>
            </div>
            <div className="flex flex-col items-end">
              {baseTariffs
                .flatMap((t) => t.tariffs)
                .filter((t) => t.type === "amount").length > 0 && (
                <div>
                  {getAmountRates(baseTariffs.flatMap((t) => t.tariffs)).map(
                    (t) => (
                      <div key={`${t}-${units}-${customsValue}`}>
                        <p>{`${t} * ${units || 1} / ${customsValue} * 100 = ${(
                          ((t * (units || 1)) / customsValue) *
                          100
                        ).toFixed(4)}%`}</p>
                      </div>
                    )
                  )}
                </div>
              )}
              {baseTariffs
                .flatMap((t) => t.tariffs)
                .filter((t) => t.type === "percent")
                .map((t) => (
                  <div
                    key={`${t.raw}-${units}-${customsValue}`}
                    className="flex w-full justify-between"
                  >
                    <p>+</p>
                    <p>{t.value}%</p>
                  </div>
                ))}
              <div className="w-full border-t border-base-content/50 my-2" />
              <div className="flex w-full justify-end">
                <p>
                  {getEUCountryTotalBaseRate(
                    baseTariffs.flatMap((t) => t.tariffs),
                    customsValue,
                    units
                  ).toFixed(3)}
                  %
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Tariff Sets */}
      <div className={"w-full flex flex-col gap-4"}>
        {tariffSets.map((tariffSet, i) => (
          <div key={`tariff-set-${i}`} className="flex flex-col gap-4">
            <TertiaryLabel
              value={`${tariffSet.name} Tariff`}
              color={Color.WHITE}
            />

            <div className="flex flex-col gap-2">
              {baseTariffs &&
                baseTariffs.length > 0 &&
                baseTariffs
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
                    isPayingUser={isPayingUser}
                    key={tariff.code}
                    showInactive={showInactive}
                    tariff={tariff}
                    setIndex={i}
                    tariffSets={tariffSets}
                    countryIndex={countryIndex}
                    setCountries={setCountries}
                    countries={countries}
                    column={tariffColumn}
                  />
                ))}
            </div>
            <div className="-mt-3 w-full flex justify-between items-end gap-2">
              <h2 className="text-white font-bold">Total:</h2>
              <div className="flex gap-2">
                {baseTariffs
                  .flatMap((t) => t.tariffs)
                  .filter((t) => t.type === "amount").length > 0 && (
                  <div className="flex gap-2">
                    <p className="text-base font-bold text-primary transition duration-100">
                      {getAmountRatesString(
                        baseTariffs.flatMap((t) => t.tariffs)
                      )}
                    </p>
                    <p className="text-base font-bold text-primary transition duration-100">
                      +
                    </p>
                  </div>
                )}
                <p className="text-base font-bold text-primary transition duration-100">
                  {getAdValoremRate(
                    tariffColumn,
                    tariffSet.tariffs,
                    baseTariffs.flatMap((t) => t.tariffs)
                  )}
                  %
                </p>
              </div>
            </div>
            {baseTariffs.flatMap((t) => t.parsingFailures).length > 0 && (
              <div className="flex flex-col gap-2 p-4 border-2 border-red-500 rounded-md">
                <h2 className="text-white font-bold">
                  {`Error Parsing ${tariffElement.htsno}'s Base Tariff(s):`}
                </h2>
                <ul className="flex flex-col gap-2 list-disc list-outside">
                  {baseTariffs
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
    </div>
  );
};
