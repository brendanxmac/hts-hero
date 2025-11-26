import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { EuropeanUnionCountries } from "../constants/countries";
import { Tariff } from "./Tariff";
import { ContentRequirementI } from "./Element";
import { HtsElement } from "../interfaces/hts";
import { BaseTariff } from "./BaseTariff";
import { ContentRequirements, TariffColumn } from "../enums/tariff";
import { PrimaryLabel } from "./PrimaryLabel";
import { Column2CountryCodes } from "../tariffs/tariff-columns";
import {
  get15PercentCountryTotalBaseRate,
  getAmountRatesString,
  getAdValoremRate,
  CountryWithTariffs,
  addTariffsToCountry,
} from "../tariffs/tariffs";
import { TertiaryLabel } from "./TertiaryLabel";
import { TradePrograms } from "../public/trade-programs";
import { copyToClipboard } from "../utilities/data";
import { TariffSet } from "../interfaces/tariffs";
import { SubheadingsConditionallyExemptFromReciprocal } from "../tariffs/exclusion-lists.ts/reciprocal-tariff-exlcusions";
import { Color } from "../enums/style";
import { SecondaryLabel } from "./SecondaryLabel";

interface Props {
  units: number;
  customsValue: number;
  country: CountryWithTariffs;
  htsElement: HtsElement;
  tariffElement: HtsElement;
  contentRequirements: ContentRequirementI<ContentRequirements>[];
  countryIndex: number;
  countries: CountryWithTariffs[];
  setCountries: Dispatch<SetStateAction<CountryWithTariffs[]>>;
}

export const InlineCountryTariff = ({
  units,
  customsValue,
  country,
  htsElement,
  tariffElement,
  contentRequirements,
  countryIndex,
  countries,
  setCountries,
}: Props) => {
  const [tariffColumn, setTariffColumn] = useState<TariffColumn>(
    Column2CountryCodes.includes(country.code)
      ? TariffColumn.OTHER
      : TariffColumn.GENERAL
  );
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [isSpecialProgramOpen, setIsSpecialProgramOpen] =
    useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
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
  const is15PercentCapCountry =
    EuropeanUnionCountries.includes(country.code) || country.code === "JP";
  const adValoremEquivalentRate = get15PercentCountryTotalBaseRate(
    country.baseTariffs.flatMap((t) => t.tariffs),
    customsValue,
    units
  );
  const below15PercentRuleApplies =
    is15PercentCapCountry && adValoremEquivalentRate < 15;

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

  const getBaseTariffsText = () => {
    if (baseTariffs && baseTariffs.length > 0) {
      const activeBaseTariffs = baseTariffs
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
        .flatMap((t) => t.tariffs);

      const baseTariffsAsText = activeBaseTariffs.map((tariff) => {
        const primaryText =
          tariff.value === null && tariff.details
            ? tariff.details
            : tariff.type === "percent"
              ? `Ad Valorem`
              : `Quantity`;
        // FIXME: at some point, filter out the country based "See" ones so that they don't cause noise here
        const reviewText = tariff.value === null ? "Needs Review" : "";
        const valueText =
          tariff.type === "percent" ? `${tariff.value}%` : tariff.raw;
        return `   ${reviewText ? "Needs Review" : valueText} - General Duty (${primaryText}) - ${tariffElement.htsno}`;
      });
      return baseTariffsAsText.join("\n");
    }

    return "";
  };

  const getTariffSetText = (tariffSet: TariffSet) => {
    const tariffSetTitle = tariffSet.name
      ? `${tariffSet.name} Tariffs`
      : "Tariffs";
    const baseTariffsText = getBaseTariffsText();
    const tariffSetText = tariffSet.tariffs.map((tariff) => {
      if (tariff.isActive) {
        return `   ${tariff[tariffColumn] === null ? "Needs Review" : `${tariff[tariffColumn]}% - ${tariff.name} - ${tariff.code} `}`;
      }
      return "";
    });

    const is15PercentCapCountryLessThan15Percent =
      is15PercentCapCountry &&
      get15PercentCountryTotalBaseRate(
        baseTariffs.flatMap((t) => t.tariffs),
        customsValue,
        units
      ) < 15;
    const cappedCountryRate = `${getAdValoremRate(tariffColumn, tariffSet.tariffs)}%`;
    const hasBaseTariffs =
      baseTariffs
        .flatMap((t) => t.tariffs)
        .filter((t) => {
          if (
            selectedSpecialProgram &&
            selectedSpecialProgram.symbol !== "none"
          ) {
            return t.programs?.includes(selectedSpecialProgram.symbol);
          }
          return true;
        })
        .filter((t) => t.type === "amount").length > 0;
    const baseTariffRates = `${getAmountRatesString(
      baseTariffs
        .flatMap((t) => t.tariffs)
        .filter((t) => {
          if (
            selectedSpecialProgram &&
            selectedSpecialProgram.symbol !== "none"
          ) {
            return t.programs?.includes(selectedSpecialProgram.symbol);
          }
          return true;
        })
    )} + `;
    const adValoremRate = `${getAdValoremRate(
      tariffColumn,
      tariffSet.tariffs,
      baseTariffs
        .flatMap((t) => t.tariffs)
        .filter((t) => {
          if (
            selectedSpecialProgram &&
            selectedSpecialProgram.symbol !== "none"
          ) {
            return t.programs?.includes(selectedSpecialProgram.symbol);
          }
          return true;
        })
    )}%`;

    const setTotal = is15PercentCapCountryLessThan15Percent
      ? cappedCountryRate
      : hasBaseTariffs
        ? baseTariffRates + adValoremRate
        : adValoremRate;

    return `${tariffSetTitle}: ${setTotal}\n${baseTariffsText}\n${tariffSetText.filter((t) => t !== "").join("\n")}\n`;
  };

  const copyTariffDetails = () => {
    const tariffContext = `Import Tariffs & Fees for ${country.name}:`;
    const harborMaintenanceFee = `Harbor Maintenance Fee: 0.125%`;
    const merchandiseProcessingFee = `Merchandise Processing Fee: 0.3464%\n   Min:$33.58 / Max:$651.50`;
    const tradeProgramText = selectedTradeProgram?.name
      ? `Trade Program Applied: ${selectedTradeProgram.name}\n\n`
      : "";
    return `${tariffContext}\n\n${tradeProgramText}${tariffSets.map((set) => getTariffSetText(set)).join("\n")}\n${harborMaintenanceFee}\n\n${merchandiseProcessingFee}`;
  };

  const handleCopyClick = () => {
    copyToClipboard(copyTariffDetails() || "");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
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
      customsValue,
      country.tariffSets // Pass existing tariff sets to preserve isActive states
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

  const getNoteForConditionalReciprocalExemption = () => {
    const subheading = Object.keys(
      SubheadingsConditionallyExemptFromReciprocal
    ).find((subheading) => tariffElement.htsno.includes(subheading));
    return subheading
      ? SubheadingsConditionallyExemptFromReciprocal[subheading]
      : null;
  };

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Header with Buttons */}
      <div className="w-full flex justify-between items-end">
        {/* Special Tariff Program Selection */}
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex flex-col gap-1">
            <PrimaryLabel value="Special Trade Programs" />
          </div>
          <div
            className="relative w-full max-w-lg"
            ref={specialProgramDropdownRef}
          >
            <div
              className="w-full px-3 py-1 border-2 border-base-content/10 rounded-lg cursor-pointer bg-base-100 flex gap-3 items-center justify-between hover:bg-base-content/10 transition-colors min-h-10"
              onClick={() => setIsSpecialProgramOpen(!isSpecialProgramOpen)}
            >
              <div className="flex-1 flex items-center">
                {selectedSpecialProgram ? (
                  <p className="font-semibold">
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

        <div className="w-full flex gap-2 justify-end items-center">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? "Hide Inactive Tariffs" : "Show All Tariffs"}
          </button>
          <button
            className={`btn btn-sm ${isCopied ? "btn-accent" : "btn-primary"} min-w-40`}
            onClick={handleCopyClick}
          >
            {isCopied ? "Copied!" : "Copy Tariff Details"}
          </button>
        </div>
      </div>

      {/* Tariff Sets */}
      <div className={"w-full flex flex-col gap-4"}>
        {getNoteForConditionalReciprocalExemption() && (
          <div>
            <p className="text-warning font-semibold">
              Note: {getNoteForConditionalReciprocalExemption()}{" "}
              <span className="underline">
                is/are EXEMPT from reciprocal tariffs
                {country.code === "BR" ? " and the Brazil 40% IEEPA" : ""}
              </span>
            </p>
            <p className="text-base-content">
              If applicable to your import, be sure to apply this to the
              calculations below
            </p>
          </div>
        )}

        {tariffSets.map((tariffSet, i) => (
          <div key={`tariff-set-${i}`} className="flex flex-col gap-2">
            <PrimaryLabel value={`${tariffSet.name} Tariff Details`} />
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
                      active={!below15PercentRuleApplies}
                    />
                  ))}
              {tariffSet.tariffs
                .filter((t) => t.isActive || showInactive)
                .map((tariff) => (
                  <Tariff
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

            <div className="w-full flex justify-between items-end gap-2">
              <TertiaryLabel value="Total:" />
              {is15PercentCapCountry &&
              get15PercentCountryTotalBaseRate(
                baseTariffs.flatMap((t) => t.tariffs),
                customsValue,
                units
              ) < 15 ? (
                <p className="text-base font-bold text-primary transition duration-100">
                  {getAdValoremRate(tariffColumn, tariffSet.tariffs)}%
                </p>
              ) : (
                <div className="flex gap-2">
                  {baseTariffs
                    .flatMap((t) => t.tariffs)
                    .filter((t) => {
                      if (
                        selectedSpecialProgram &&
                        selectedSpecialProgram.symbol !== "none"
                      ) {
                        return t.programs?.includes(
                          selectedSpecialProgram.symbol
                        );
                      }
                      return true;
                    })
                    .filter((t) => t.type === "amount").length > 0 && (
                    <div className="flex gap-2">
                      <p className="text-base font-bold text-primary transition duration-100">
                        {getAmountRatesString(
                          baseTariffs
                            .flatMap((t) => t.tariffs)
                            .filter((t) => {
                              if (
                                selectedSpecialProgram &&
                                selectedSpecialProgram.symbol !== "none"
                              ) {
                                return t.programs?.includes(
                                  selectedSpecialProgram.symbol
                                );
                              }
                              return true;
                            })
                        )}
                      </p>
                      <p className="font-bold text-primary transition duration-100">
                        +
                      </p>
                    </div>
                  )}
                  <p className="font-bold text-primary transition duration-100">
                    {getAdValoremRate(
                      tariffColumn,
                      tariffSet.tariffs,
                      baseTariffs
                        .flatMap((t) => t.tariffs)
                        .filter((t) => {
                          if (
                            selectedSpecialProgram &&
                            selectedSpecialProgram.symbol !== "none"
                          ) {
                            return t.programs?.includes(
                              selectedSpecialProgram.symbol
                            );
                          }
                          return true;
                        })
                    )}
                    %
                  </p>
                </div>
              )}
            </div>
            {baseTariffs.flatMap((t) => t.parsingFailures).length > 0 && (
              <div className="flex flex-col gap-2 p-4 border-2 border-red-500 rounded-md">
                <h2 className=" font-bold">
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
      <div className="flex flex-col gap-2">
        {/* Harbor Maintenance Fee */}
        <div className="flex justify-between items-center gap-2">
          <PrimaryLabel value="Harbor Maintenance Fee" />
          <SecondaryLabel value="0.125%" color={Color.PRIMARY} />
        </div>
        {/* Merchandise Processing Fee */}
        <div className="flex justify-between items-center gap-2">
          <PrimaryLabel value="Merchandise Processing Fee" />
          <SecondaryLabel value="0.3464%" color={Color.PRIMARY} />
        </div>
      </div>
    </div>
  );
};
