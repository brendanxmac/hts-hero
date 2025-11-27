import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { EuropeanUnionCountries } from "../constants/countries";
import { Tariff } from "./Tariff";
import { ContentRequirementI } from "./Element";
import { HtsElement } from "../interfaces/hts";
import { BaseTariff } from "./BaseTariff";
import { ContentRequirements, TariffColumn } from "../enums/tariff";
import { Column2CountryCodes } from "../tariffs/tariff-columns";
import {
  get15PercentCountryTotalBaseRate,
  getAmountRatesString,
  getAdValoremRate,
  CountryWithTariffs,
  addTariffsToCountry,
} from "../tariffs/tariffs";
import { TradePrograms } from "../public/trade-programs";
import { copyToClipboard } from "../utilities/data";
import { TariffSet } from "../interfaces/tariffs";
import { SubheadingsConditionallyExemptFromReciprocal } from "../tariffs/exclusion-lists.ts/reciprocal-tariff-exlcusions";

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
  isModal?: boolean;
  onClose?: () => void;
}

export const CountryTariff = ({
  units,
  customsValue,
  country,
  htsElement,
  tariffElement,
  contentRequirements,
  countryIndex,
  countries,
  setCountries,
  isModal = false,
  onClose,
}: Props) => {
  const [tariffColumn, setTariffColumn] = useState<TariffColumn>(
    Column2CountryCodes.includes(country.code)
      ? TariffColumn.OTHER
      : TariffColumn.GENERAL
  );
  const [showInactive, setShowInactive] = useState<boolean>(true);
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

  const content = (
    <div className="flex flex-col gap-4 pb-6">
      {/* Country Header with Actions */}
      <div className="bg-base-100">
        <div className="w-full flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Country Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-base-content/80 uppercase tracking-wide">
                  Import Duties For{" "}
                  <span className="text-primary">{tariffElement.htsno}</span>{" "}
                  From
                </span>
                <div className="flex gap-2 items-center">
                  <h2 className="text-4xl font-bold text-base-content leading-tight">
                    {country.flag}
                  </h2>
                  <h2 className="text-3xl font-bold text-base-content leading-tight">
                    {country.name}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end items-center">
            <button
              className="btn btn-sm btn-outline btn-primary gap-2 hover:shadow-md transition-shadow"
              onClick={() => setShowInactive(!showInactive)}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    showInactive
                      ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  }
                />
              </svg>
              {showInactive ? "Hide Inactive Tariffs" : "Show All Tariffs"}
            </button>
            <button
              className={`btn btn-sm ${isCopied ? "btn-success" : "btn-primary"} gap-2 min-w-[160px] hover:shadow-md transition-all`}
              onClick={handleCopyClick}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isCopied
                      ? "M5 13l4 4L19 7"
                      : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  }
                />
              </svg>
              {isCopied ? "Copied!" : "Copy Details"}
            </button>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="btn btn-sm btn-circle btn-ghost hover:bg-base-200"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Special Trade Programs Section */}
      <div className="bg-base-200 rounded-xl border-2 border-base-300 shadow-sm">
        {/* Special Trade Programs Header */}
        <div className="bg-base-300 px-6 py-3 border-b-2 border-base-content/10 rounded-t-xl">
          <h3 className="text-lg sm:text-xl font-bold">
            Special Trade Programs
          </h3>
        </div>

        {/* Special Trade Programs Content */}
        <div className="p-4">
          <div className="relative w-full" ref={specialProgramDropdownRef}>
            <div
              className="w-full px-4 py-3 border-2 border-base-content/20 rounded-xl cursor-pointer bg-base-100 flex gap-3 items-center justify-between hover:border-primary hover:shadow-md transition-all duration-200 min-h-[48px]"
              onClick={() => setIsSpecialProgramOpen(!isSpecialProgramOpen)}
            >
              <div className="flex-1 flex items-center">
                {selectedSpecialProgram ? (
                  <p className="font-semibold text-base-content">
                    {selectedSpecialProgram.name}
                    {selectedSpecialProgram.symbol &&
                      selectedSpecialProgram.symbol !== "none" && (
                        <span className="text-primary ml-1 font-normal">
                          ({selectedSpecialProgram.symbol})
                        </span>
                      )}
                  </p>
                ) : (
                  <span className="text-sm text-base-content/80">
                    Select Special Tariff Program
                  </span>
                )}
              </div>
              <svg
                className={`w-5 h-5 transition-transform text-base-content/70 ${isSpecialProgramOpen ? "rotate-180" : ""}`}
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
              <div className="absolute z-10 w-full mt-2 bg-base-100 border-2 border-primary rounded-xl shadow-2xl max-h-80 overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
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
                      className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                        selectedSpecialProgram?.symbol === program.symbol
                          ? "bg-primary/20 border-primary"
                          : "hover:bg-base-200"
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
                      <div className="flex flex-col gap-1">
                        <span className="text-base-content font-semibold">
                          {program.name}
                          {program.symbol && program.symbol !== "none" && (
                            <span className="text-primary ml-1 font-normal">
                              ({program.symbol})
                            </span>
                          )}
                        </span>
                        {"description" in program && program.description && (
                          <span className="text-sm text-base-content/80">
                            {program.description}
                          </span>
                        )}
                      </div>
                      {selectedSpecialProgram?.symbol === program.symbol && (
                        <svg
                          className="w-5 h-5 text-primary"
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
      </div>

      {/* Conditional Exemption Notice */}
      {getNoteForConditionalReciprocalExemption() && (
        <div className="bg-warning/10 border-l-4 border-warning rounded-lg p-5">
          <div className="flex gap-3">
            <svg
              className="w-6 h-6 text-warning shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex flex-col gap-2">
              <p className="text-warning font-bold text-base">
                Important Notice
              </p>
              <p className="text-base-content">
                {getNoteForConditionalReciprocalExemption()}{" "}
                <span className="font-semibold underline">
                  is/are EXEMPT from reciprocal tariffs
                  {country.code === "BR" ? " and the Brazil 40% IEEPA" : ""}
                </span>
              </p>
              <p className="text-base-content/90 text-sm">
                If applicable to your import, be sure to apply this to the
                calculations below
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tariff Sets */}
      <div className="w-full flex flex-col gap-6">
        {tariffSets.map((tariffSet, i) => (
          <div
            key={`tariff-set-${i}`}
            className="bg-base-200 rounded-xl border-2 border-base-300 shadow-sm overflow-hidden"
          >
            {/* Tariff Set Header */}
            <div className="bg-base-300 px-6 py-3 border-b-2 border-base-content/10 rounded-t-xl flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold">
                {tariffSet.name} Tariffs
              </h3>
              {is15PercentCapCountry &&
              get15PercentCountryTotalBaseRate(
                baseTariffs.flatMap((t) => t.tariffs),
                customsValue,
                units
              ) < 15 ? (
                <p className="text-2xl font-bold">
                  {getAdValoremRate(tariffColumn, tariffSet.tariffs)}%
                </p>
              ) : (
                <div className="flex gap-2 items-center">
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
                    <>
                      <p className="text-2xl font-bold">
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
                      <p className="text-xl font-bold">+</p>
                    </>
                  )}
                  <p className="text-2xl font-bold">
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

            {/* Tariff Items */}
            <div className="p-4 flex flex-col gap-2">
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

            {/* Error Section */}
            {baseTariffs.flatMap((t) => t.parsingFailures).length > 0 && (
              <div className="mx-6 mb-6 flex flex-col gap-3 p-4 bg-error/10 border-l-4 border-error rounded-lg">
                <div className="flex gap-3">
                  <svg
                    className="w-6 h-6 text-error shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-error">
                      Error Parsing {tariffElement.htsno}'s Base Tariff(s)
                    </h4>
                    <ul className="flex flex-col gap-1 list-disc list-inside">
                      {baseTariffs
                        .flatMap((t) => t.parsingFailures)
                        .map((t, i) => (
                          <li
                            key={`${tariffElement.htsno}-${t}-${i}`}
                            className="text-error text-sm"
                          >
                            {t}
                          </li>
                        ))}
                    </ul>
                    <p className="text-base-content text-sm">
                      Please send{" "}
                      <a
                        href="mailto:support@htshero.com"
                        className="text-primary font-semibold hover:underline"
                      >
                        support
                      </a>{" "}
                      a screenshot of this error. All tariffs are still
                      presented so you can manually add them while we work on
                      the fix.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Fees Section */}
      <div className="bg-base-200 rounded-xl border-2 border-base-300 shadow-sm overflow-hidden">
        <div className="bg-base-300 px-6 py-3 border-b-2 border-base-content/10 rounded-t-xl flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-lg sm:text-xl font-bold">Additional Fees</h3>
          </div>
          <p className="text-2xl font-bold">{0.125 + 0.3464}%</p>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {/* Harbor Maintenance Fee */}
          <div className="flex justify-between items-center pb-3 border-b border-base-content/20">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
              <span className="font-semibold text-base-content">
                Harbor Maintenance Fee
              </span>
            </div>
            <div className="flex flex-col text-right">
              <p className="text-xl font-bold text-primary">0.125%</p>
              <p className="text-xs text-base-content/80 uppercase tracking-tight font-semibold">
                On Total Customs Value
              </p>
            </div>
          </div>
          {/* Merchandise Processing Fee */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-semibold text-base-content">
                Merchandise Processing Fee
              </span>
            </div>
            <div className="flex flex-col text-right">
              <p className="text-xl font-bold text-primary">0.3464%</p>
              <p className="text-xs text-base-content/80 uppercase tracking-tight font-semibold">
                On Total Customs Value
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto pointer-events-auto animate-slideUp border-2 border-base-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-6">{content}</div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }

          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
        `}</style>
      </>
    );
  }

  return content;
};
