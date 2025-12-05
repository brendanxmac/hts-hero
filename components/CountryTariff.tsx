import { Dispatch, SetStateAction, useEffect, useState, Fragment } from "react";
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
import { Listbox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

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

const DEFAULT_PROGRAM = {
  symbol: "none",
  name: "None",
  description: "No special program",
};

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
  const {
    baseTariffs,
    specialTradePrograms,
    tariffSets,
    selectedTradeProgram,
  } = country;

  const isOtherColumnCountry = Column2CountryCodes.includes(country.code);
  const is15PercentCapCountry =
    EuropeanUnionCountries.includes(country.code) || country.code === "JP";

  const [tariffColumn, setTariffColumn] = useState<TariffColumn>(
    isOtherColumnCountry ? TariffColumn.OTHER : TariffColumn.GENERAL
  );
  const [showInactive, setShowInactive] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedSpecialProgram, setSelectedSpecialProgram] = useState<any>(
    selectedTradeProgram || DEFAULT_PROGRAM
  );

  const adValoremEquivalentRate = get15PercentCountryTotalBaseRate(
    baseTariffs.flatMap((t) => t.tariffs),
    customsValue,
    units
  );
  const below15PercentRuleApplies =
    is15PercentCapCountry && adValoremEquivalentRate < 15;

  // Helper to filter tariffs by selected program
  const filterByProgram = <T extends { programs?: string[] }>(tariffs: T[]) =>
    tariffs.filter((t) =>
      selectedSpecialProgram?.symbol !== "none"
        ? t.programs?.includes(selectedSpecialProgram.symbol)
        : true
    );

  const getFilteredBaseTariffs = () =>
    baseTariffs.filter((t) =>
      selectedSpecialProgram?.symbol !== "none"
        ? t.tariffs.some((tariff) =>
            tariff.programs?.includes(selectedSpecialProgram.symbol)
          )
        : true
    );

  const getTariffColumn = () => {
    if (!selectedSpecialProgram || selectedSpecialProgram.symbol === "none") {
      return isOtherColumnCountry ? TariffColumn.OTHER : TariffColumn.GENERAL;
    }
    return TariffColumn.SPECIAL;
  };

  const getBaseTariffsText = () => {
    if (!baseTariffs?.length) return "";
    const activeBaseTariffs = getFilteredBaseTariffs().flatMap(
      (t) => t.tariffs
    );
    return activeBaseTariffs
      .map((tariff) => {
        const primaryText =
          tariff.value === null && tariff.details
            ? tariff.details
            : tariff.type === "percent"
              ? "Ad Valorem"
              : "Quantity";
        const valueText =
          tariff.value === null
            ? "Needs Review"
            : tariff.type === "percent"
              ? `${tariff.value}%`
              : tariff.raw;
        return `   ${valueText} - General Duty (${primaryText}) - ${tariffElement.htsno}`;
      })
      .join("\n");
  };

  const getTariffSetText = (tariffSet: TariffSet) => {
    const baseTariffsText = getBaseTariffsText();
    const tariffSetText = tariffSet.tariffs
      .filter((t) => t.isActive)
      .map(
        (tariff) =>
          `   ${tariff[tariffColumn] === null ? "Needs Review" : `${tariff[tariffColumn]}% - ${tariff.name} - ${tariff.code}`}`
      )
      .join("\n");

    const filteredBase = filterByProgram(baseTariffs.flatMap((t) => t.tariffs));
    const hasAmountTariffs = filteredBase.some((t) => t.type === "amount");
    const cappedRate = `${getAdValoremRate(tariffColumn, tariffSet.tariffs)}%`;
    const adValoremRate = `${getAdValoremRate(tariffColumn, tariffSet.tariffs, filteredBase)}%`;
    const setTotal =
      is15PercentCapCountry && adValoremEquivalentRate < 15
        ? cappedRate
        : hasAmountTariffs
          ? `${getAmountRatesString(filteredBase)} + ${adValoremRate}`
          : adValoremRate;

    return `${tariffSet.name} Tariffs: ${setTotal}\n${baseTariffsText}\n${tariffSetText}\n`;
  };

  const copyTariffDetails = () => {
    const lines = [
      `Import Tariffs & Fees for ${country.name}:`,
      "",
      selectedTradeProgram?.name
        ? `Trade Program: ${selectedTradeProgram.name}\n`
        : "",
      ...tariffSets.map(getTariffSetText),
      "Harbor Maintenance Fee: 0.125%",
      "",
      "Merchandise Processing Fee: 0.3464%",
      "   Min: $33.58 / Max: $651.50",
    ];
    return lines.filter(Boolean).join("\n");
  };

  const handleCopyClick = () => {
    copyToClipboard(copyTariffDetails());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getNoteForConditionalReciprocalExemption = () => {
    const subheading = Object.keys(
      SubheadingsConditionallyExemptFromReciprocal
    ).find((s) => tariffElement.htsno.includes(s));
    return subheading
      ? SubheadingsConditionallyExemptFromReciprocal[subheading]
      : null;
  };

  // Effects
  useEffect(() => {
    setSelectedSpecialProgram(selectedTradeProgram || DEFAULT_PROGRAM);
  }, [country.code, selectedTradeProgram]);

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
      country.tariffSets
    );
    setCountries(updatedCountries);
    setTariffColumn(getTariffColumn());
  }, [selectedSpecialProgram]);

  // Render helpers
  const renderTariffRate = (tariffSet: TariffSet) => {
    const filteredBase = filterByProgram(baseTariffs.flatMap((t) => t.tariffs));
    const hasAmountTariffs = filteredBase.some((t) => t.type === "amount");

    if (is15PercentCapCountry && adValoremEquivalentRate < 15) {
      return <span>{getAdValoremRate(tariffColumn, tariffSet.tariffs)}%</span>;
    }

    return (
      <span>
        {hasAmountTariffs && <>{getAmountRatesString(filteredBase)} + </>}
        {getAdValoremRate(tariffColumn, tariffSet.tariffs, filteredBase)}%
      </span>
    );
  };

  const exemptionNote = getNoteForConditionalReciprocalExemption();
  const parsingErrors = baseTariffs.flatMap((t) => t.parsingFailures);

  // Calculate summary totals
  const getSummaryTotals = () => {
    const filteredBase = filterByProgram(baseTariffs.flatMap((t) => t.tariffs));
    const hasAmountTariffs = filteredBase.some((t) => t.type === "amount");
    const amountRatesString = hasAmountTariffs
      ? getAmountRatesString(filteredBase)
      : null;

    const totals = tariffSets.map((tariffSet) => {
      const adValoremRate = getAdValoremRate(
        getTariffColumn(),
        tariffSet.tariffs,
        filteredBase
      );
      const cappedRate = getAdValoremRate(getTariffColumn(), tariffSet.tariffs);

      return {
        name: tariffSet.name,
        rate:
          is15PercentCapCountry && adValoremEquivalentRate < 15
            ? cappedRate
            : adValoremRate,
        hasAmountTariffs:
          hasAmountTariffs &&
          !(is15PercentCapCountry && adValoremEquivalentRate < 15),
        amountRatesString,
      };
    });

    return totals;
  };

  const summaryTotals = getSummaryTotals();
  const additionalFeesTotal = 0.4714;

  const content = (
    <div className="flex flex-col gap-4">
      {/* Summary Section */}
      <div className="card bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 border-2 border-primary/30 shadow-lg">
        <div className="card-body p-0">
          <div className="px-4 py-3 bg-primary/20 flex justify-between items-center rounded-t-xl border-b-2 border-primary/30">
            <h3 className="card-title text-primary text-lg font-bold">
              Tariffs Summary
            </h3>
            <div className="flex gap-2 items-center">
              {selectedSpecialProgram?.symbol !== "none" && (
                <div className="badge badge-primary badge-outline font-semibold">
                  {selectedSpecialProgram.name}
                </div>
              )}
              <button
                className="btn btn-sm btn-outline gap-1.5"
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {showInactive ? "Hide Inactive" : "Show All"}
                </span>
              </button>
              <button
                className={`btn btn-sm gap-1.5 ${isCopied ? "btn-success" : "btn-primary"}`}
                onClick={handleCopyClick}
              >
                {isCopied ? (
                  <ClipboardDocumentCheckIcon className="w-4 h-4" />
                ) : (
                  <ClipboardDocumentIcon className="w-4 h-4" />
                )}
                {isCopied ? "Copied" : "Copy"}
              </button>
              {isModal && onClose && (
                <button
                  onClick={onClose}
                  className="btn btn-sm btn-ghost btn-circle"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summaryTotals.map((total, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-4 bg-base-200/50 rounded-xl border border-base-300"
                >
                  <span className="text-sm font-semibold text-base-content/70 uppercase tracking-wide mb-1">
                    {total.name} Tariffs
                  </span>
                  <div className="text-4xl font-black text-primary">
                    {total.hasAmountTariffs && total.amountRatesString && (
                      <span className="text-2xl">
                        {total.amountRatesString} +{" "}
                      </span>
                    )}
                    {total.rate}%
                  </div>
                </div>
              ))}
              <div className="flex flex-col items-center justify-center p-4 bg-base-200/50 rounded-xl border border-base-300">
                <span className="text-sm font-semibold text-base-content/70 uppercase tracking-wide mb-1">
                  Additional Fees
                </span>
                <div className="text-4xl font-black text-primary">
                  {additionalFeesTotal}%
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-base-300 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-sm text-base-content/70 flex gap-1 items-center">
                <p className="font-semibold">HTS Code:</p>{" "}
                <p className="text-primary font-bold">{tariffElement.htsno}</p>
              </div>
              <div className="text-sm text-base-content/70 flex gap-1 items-center">
                <p className="font-semibold">Origin:</p>{" "}
                <p className="text-lg">{country.flag}</p>{" "}
                <p className="font-bold">{country.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Programs Dropdown */}
      <div className="card bg-base-100 dark:bg-base-300 border-2 border-base-300 shadow-sm">
        <div className="card-body p-0">
          <div className="px-4 py-3 bg-base-100 dark:bg-base-300 flex justify-between items-center rounded-t-xl border-b-2 border-base-200">
            <h3 className="card-title text-base-content text-lg">
              Special Trade Program
            </h3>
          </div>
          <div className="p-4">
            <Listbox
              value={selectedSpecialProgram}
              onChange={setSelectedSpecialProgram}
            >
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-lg border border-base-content/20 bg-base-100 py-3 pl-4 pr-10 text-left shadow-sm focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100">
                  <span className="block truncate font-medium">
                    {selectedSpecialProgram?.name}
                    {selectedSpecialProgram?.symbol !== "none" && (
                      <span className="text-primary font-bold ml-2">
                        ({selectedSpecialProgram.symbol})
                      </span>
                    )}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-base-content/40"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg bg-base-100 border-2 border-base-300 py-1 shadow-xl focus:outline-none">
                    {[DEFAULT_PROGRAM, ...specialTradePrograms].map(
                      (program, i) => (
                        <Listbox.Option
                          key={i}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-3 px-4 transition-colors duration-200 ${
                              active
                                ? "bg-primary text-primary-content"
                                : "text-base-content"
                            }`
                          }
                          value={program}
                        >
                          {({ selected, active }) => (
                            <div className="flex items-center justify-between">
                              <div>
                                <span
                                  className={`block ${selected ? "font-semibold" : "font-medium"}`}
                                >
                                  {program.name}
                                  {program.symbol !== "none" && (
                                    <span
                                      className={`font-bold ml-2 ${active ? "text-primary-content" : "text-primary"}`}
                                    >
                                      ({program.symbol})
                                    </span>
                                  )}
                                </span>
                                {"description" in program &&
                                  program.description && (
                                    <p
                                      className={`text-sm mt-0.5 ${active ? "text-primary-content/80" : "text-base-content/70"}`}
                                    >
                                      {program.description}
                                    </p>
                                  )}
                              </div>
                              {selected && (
                                <CheckIcon
                                  className={`h-5 w-5 flex-shrink-0 ${active ? "text-primary-content" : "text-primary"}`}
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          )}
                        </Listbox.Option>
                      )
                    )}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        </div>
      </div>

      {/* Exemption Notice */}
      {exemptionNote && (
        <div className="alert alert-warning shadow-md">
          <ExclamationTriangleIcon className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-bold text-warning-content">Important Notice</h3>
            <p className="text-warning-content/90">
              {exemptionNote}{" "}
              <span className="font-bold">
                is/are EXEMPT from reciprocal tariffs
                {country.code === "BR" && " and the Brazil 40% IEEPA"}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Tariff Sets */}
      <div className="flex flex-col gap-4">
        {tariffSets.map((tariffSet, i) => (
          <div
            key={i}
            className="card bg-base-100 dark:bg-base-300 border-2 border-base-300 shadow-sm"
          >
            {/* Set Header */}
            <div className="card-body p-0">
              <div className="px-4 py-3 bg-base-100 dark:bg-base-300 flex justify-between items-center rounded-t-xl border-b-2 border-base-200">
                <h3 className="card-title text-base-content text-lg">
                  {tariffSet.name} Tariffs
                </h3>
                <div className="badge badge-primary badge-lg text-lg font-bold px-4 py-3">
                  {renderTariffRate(tariffSet)}
                </div>
              </div>

              {/* Tariff Items */}
              <div className="p-4 flex flex-col gap-2">
                {getFilteredBaseTariffs()
                  .flatMap((t) => t.tariffs)
                  .map((t, j) => (
                    <BaseTariff
                      key={`${htsElement.htsno}-${t.raw}-${j}`}
                      index={j}
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

              {/* Parsing Errors */}
              {i === 0 && parsingErrors.length > 0 && (
                <div className="mx-4 mb-4">
                  <div className="alert alert-error shadow-md">
                    <ExclamationCircleIcon className="w-6 h-6 shrink-0" />
                    <div>
                      <h3 className="font-bold">
                        Error parsing base tariff(s)
                      </h3>
                      <ul className="list-disc list-inside mt-1">
                        {parsingErrors.map((err, j) => (
                          <li key={j}>{err}</li>
                        ))}
                      </ul>
                      <p className="mt-2">
                        Please contact{" "}
                        <a
                          href="mailto:support@htshero.com"
                          className="link link-primary font-semibold"
                        >
                          support
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Fees */}
      <div className="card bg-base-100 dark:bg-base-300 border-2 border-base-300 shadow-sm">
        <div className="card-body p-0">
          <div className="px-4 py-3 bg-base-100 dark:bg-base-300 flex justify-between items-center rounded-t-xl border-b-2 border-base-200">
            <h3 className="card-title text-base-content text-lg">
              Additional Fees
            </h3>
            <div className="badge badge-primary badge-lg text-lg font-bold px-4 py-3">
              0.4714%
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center py-2 border-b-2 border-base-200">
              <span className="font-medium text-base-content">
                Harbor Maintenance Fee
              </span>
              <span className="font-bold text-base-content">0.125%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <span className="font-medium text-base-content">
                  Merchandise Processing Fee
                </span>
                <p className="text-sm text-base-content/70 mt-0.5">
                  Min: $33.58 / Max: $651.50
                </p>
              </div>
              <span className="font-bold text-base-content">0.3464%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/60 z-40 animate-fade-in backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto pointer-events-auto animate-slide-up p-6 border-2 border-base-300"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.15s ease-out;
          }
          .animate-slide-up {
            animation: slide-up 0.2s ease-out;
          }
        `}</style>
      </>
    );
  }

  return content;
};
