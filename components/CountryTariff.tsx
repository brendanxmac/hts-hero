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
  ChevronDownIcon,
  ChevronUpDownIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
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

// Fee constants
const HARBOR_MAINTENANCE_FEE_RATE = 0.00125; // 0.125%
const MERCHANDISE_PROCESSING_FEE_RATE = 0.003464; // 0.3464%
const MPF_MIN = 33.58;
const MPF_MAX = 651.5;

interface DutyEstimate {
  tariffSetName: string;
  percentRate: number;
  amountDuty: number; // Duty from amount-based tariffs (e.g., $/kg)
  adValoremDuty: number; // Duty from percentage-based tariffs
  totalDuty: number;
  applicableValue: number; // The portion of customs value this applies to
  contentPercentage: number; // 100 for article, or the content % for content sets
}

interface FeeEstimate {
  name: string;
  rate: number;
  amount: number;
  note?: string;
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
  const [expandedSets, setExpandedSets] = useState<Record<number, boolean>>({});
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
    const isArticleSet = tariffSet.name === "Article" || tariffSet.name === "";

    // Base tariffs only apply to Article set
    const shouldIncludeBaseTariffs =
      isArticleSet && !(is15PercentCapCountry && adValoremEquivalentRate < 15);
    const hasAmountTariffs =
      shouldIncludeBaseTariffs && filteredBase.some((t) => t.type === "amount");

    if (!shouldIncludeBaseTariffs) {
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
    const amountRatesString = getAmountRatesString(filteredBase);

    const totals = tariffSets.map((tariffSet) => {
      const isArticleSet =
        tariffSet.name === "Article" || tariffSet.name === "";

      // Base tariffs only apply to Article set
      const shouldIncludeBaseTariffs =
        isArticleSet &&
        !(is15PercentCapCountry && adValoremEquivalentRate < 15);

      const adValoremRate = shouldIncludeBaseTariffs
        ? getAdValoremRate(getTariffColumn(), tariffSet.tariffs, filteredBase)
        : getAdValoremRate(getTariffColumn(), tariffSet.tariffs);

      const hasAmountTariffs =
        shouldIncludeBaseTariffs &&
        filteredBase.some((t) => t.type === "amount");

      return {
        name: tariffSet.name,
        rate: adValoremRate,
        hasAmountTariffs,
        amountRatesString: hasAmountTariffs ? amountRatesString : null,
      };
    });

    return totals;
  };

  const summaryTotals = getSummaryTotals();
  const additionalFeesTotal = 0.4714;

  // Calculate duty estimates for each tariff set
  const calculateDutyEstimates = (): DutyEstimate[] => {
    const filteredBase = filterByProgram(baseTariffs.flatMap((t) => t.tariffs));
    const estimates: DutyEstimate[] = [];

    // Get content percentages for content-based tariff sets
    const contentPercentageMap = new Map<string, number>();
    contentRequirements.forEach((cr) => {
      contentPercentageMap.set(cr.name, cr.value);
    });

    // Calculate total content percentage used
    const totalContentPercentage = contentRequirements.reduce(
      (sum, cr) => sum + cr.value,
      0
    );

    // Article set gets the remaining percentage (100 - sum of content percentages)
    // But capped at 100 and minimum 0
    const articlePercentage = Math.max(
      0,
      Math.min(100, 100 - totalContentPercentage)
    );

    tariffSets.forEach((tariffSet, index) => {
      // Determine if this is the Article set (first set, or unnamed set when no content requirements)
      const isArticleSet =
        tariffSet.name === "Article" || tariffSet.name === "";

      // Determine content percentage for this set
      let contentPercentage = 100;
      if (isArticleSet) {
        contentPercentage =
          contentRequirements.length > 0 ? articlePercentage : 100;
      } else {
        // Extract content name from "X Content" format
        const contentName = tariffSet.name.replace(" Content", "");
        contentPercentage = contentPercentageMap.get(contentName) || 0;
      }

      // Calculate applicable value based on content percentage
      const applicableValue = (customsValue * contentPercentage) / 100;

      // Base tariffs (general duty) only apply to the Article set, not to content sets
      // Content sets have their own specific tariffs (like 232 metal tariffs)
      const shouldIncludeBaseTariffs =
        isArticleSet &&
        !(is15PercentCapCountry && adValoremEquivalentRate < 15);

      // Calculate ad valorem rate for this set
      const adValoremRate = shouldIncludeBaseTariffs
        ? getAdValoremRate(getTariffColumn(), tariffSet.tariffs, filteredBase)
        : getAdValoremRate(getTariffColumn(), tariffSet.tariffs);

      // Calculate ad valorem duty
      const adValoremDuty = (applicableValue * adValoremRate) / 100;

      // Calculate amount-based duty (only applies to base tariffs on Article set)
      let amountDuty = 0;
      if (shouldIncludeBaseTariffs) {
        const amountTariffs = filteredBase.filter((t) => t.type === "amount");
        amountTariffs.forEach((tariff) => {
          // tariff.value is in dollars per unit (e.g., $0.37 per kg)
          // For Article set, apply to the article's portion of the units
          const applicableUnits = (units * contentPercentage) / 100;
          amountDuty += (tariff.value || 0) * applicableUnits;
        });
      }

      estimates.push({
        tariffSetName: tariffSet.name || "Article",
        percentRate: adValoremRate,
        amountDuty,
        adValoremDuty,
        totalDuty: amountDuty + adValoremDuty,
        applicableValue,
        contentPercentage,
      });
    });

    return estimates;
  };

  // Calculate fee estimates
  const calculateFeeEstimates = (): FeeEstimate[] => {
    // Harbor Maintenance Fee
    const hmfAmount = customsValue * HARBOR_MAINTENANCE_FEE_RATE;

    // Merchandise Processing Fee with min/max
    let mpfAmount = customsValue * MERCHANDISE_PROCESSING_FEE_RATE;
    let mpfNote: string | undefined;
    if (mpfAmount < MPF_MIN) {
      mpfNote = `Minimum applied ($${MPF_MIN.toFixed(2)})`;
      mpfAmount = MPF_MIN;
    } else if (mpfAmount > MPF_MAX) {
      mpfNote = `Maximum applied ($${MPF_MAX.toFixed(2)})`;
      mpfAmount = MPF_MAX;
    }

    return [
      {
        name: "Harbor Maintenance Fee",
        rate: HARBOR_MAINTENANCE_FEE_RATE * 100,
        amount: hmfAmount,
      },
      {
        name: "Merchandise Processing Fee",
        rate: MERCHANDISE_PROCESSING_FEE_RATE * 100,
        amount: mpfAmount,
        note: mpfNote,
      },
    ];
  };

  const dutyEstimates = calculateDutyEstimates();
  const feeEstimates = calculateFeeEstimates();
  const totalTariffDuty = dutyEstimates.reduce(
    (sum, e) => sum + e.totalDuty,
    0
  );
  const totalFees = feeEstimates.reduce((sum, f) => sum + f.amount, 0);
  const totalImportDuty = totalTariffDuty + totalFees;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const content = (
    <div className="flex flex-col gap-5">
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{country.flag}</span>
            <div>
              <h2 className="text-2xl font-bold text-base-content">
                {country.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-primary font-semibold">
                  {tariffElement.htsno}
                </span>
                {selectedSpecialProgram?.symbol !== "none" && (
                  <span className="badge badge-success badge-sm font-semibold">
                    {selectedSpecialProgram.symbol}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <button
            className={`btn btn-sm gap-1.5 ${isCopied ? "btn-success" : "btn-primary"}`}
            onClick={handleCopyClick}
          >
            {isCopied ? (
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
            ) : (
              <ClipboardDocumentIcon className="w-4 h-4" />
            )}
            {isCopied ? "Copied" : "Copy Tariff Details"}
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

      {/* Total Import Duty Summary */}
      <div className="card bg-base-100 border border-base-300 shadow-lg rounded-xl">
        <div className="px-5 py-4 bg-base-200/50 border-b border-base-300 rounded-t-xl">
          <h3 className="text-lg font-bold text-base-content">
            Total Estimated Costs
          </h3>
        </div>
        <div className="p-5">
          <div className="flex md:flex-row flex-col gap-4 mb-5">
            {/* Duty & Fees */}
            <div className="grow flex flex-col items-center justify-center p-6 bg-secondary/10 rounded-xl">
              <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">
                Duty & Fees
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-secondary">
                {formatCurrency(totalImportDuty)}
              </h2>
              <div className="text-sm text-base-content/50 mt-2">
                on {formatCurrency(customsValue)} customs value
              </div>
            </div>
            {/* Landed Cost */}
            <div className="grow flex flex-col items-center justify-center p-6 bg-accent/10 rounded-xl">
              <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">
                Landed Cost
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-accent">
                {formatCurrency(totalImportDuty + customsValue)}
              </h2>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dutyEstimates.map((estimate, i) => (
              <div
                key={i}
                className="flex flex-col p-4 bg-base-200/50 rounded-xl"
              >
                <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1">
                  {estimate.tariffSetName} Duty
                </span>
                <div className="text-2xl font-black text-primary mb-2">
                  {formatCurrency(estimate.totalDuty)}
                </div>
                <div className="text-xs text-base-content/50 space-y-1">
                  {estimate.amountDuty > 0 && (
                    <div className="flex justify-between">
                      <span>Amount-based:</span>
                      <span className="font-medium">
                        {formatCurrency(estimate.amountDuty)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Ad valorem ({estimate.percentRate}%):</span>
                    <span className="font-medium">
                      {formatCurrency(estimate.adValoremDuty)}
                    </span>
                  </div>
                  {contentRequirements.length > 0 && (
                    <div className="flex justify-between border-t border-base-300 pt-1 mt-1">
                      <span>Applied to:</span>
                      <span className="font-medium">
                        {estimate.contentPercentage}% (
                        {formatCurrency(estimate.applicableValue)})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="flex flex-col p-4 bg-base-200/50 rounded-xl">
              <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1">
                Additional Fees
              </span>
              <div className="text-2xl font-black text-primary mb-2">
                {formatCurrency(totalFees)}
              </div>
              <div className="text-xs text-base-content/50 space-y-1">
                {feeEstimates.map((fee, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{fee.name}:</span>
                    <span className="font-medium">
                      {formatCurrency(fee.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tariff Rates Summary */}
      <div className="card bg-base-100 border border-base-300 shadow-lg rounded-xl">
        <div className="px-5 py-4 bg-base-200/50 border-b border-base-300 rounded-t-xl">
          <h3 className="text-lg font-bold text-base-content">Tariff Rates</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaryTotals.map((total, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-4 bg-base-200/50 rounded-xl"
              >
                <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1">
                  {total.name} Tariff Rate
                </span>
                <div className="text-3xl font-black text-primary">
                  {total.hasAmountTariffs && total.amountRatesString && (
                    <span className="text-xl">
                      {total.amountRatesString} +{" "}
                    </span>
                  )}
                  {total.rate}%
                </div>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center p-4 bg-base-200/50 rounded-xl">
              <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1">
                Additional Fees
              </span>
              <div className="text-3xl font-black text-primary">
                {additionalFeesTotal}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Programs Dropdown */}
      <div className="card bg-base-100 border border-base-300 shadow-lg rounded-xl">
        <div className="px-5 py-4 bg-base-200/50 border-b border-base-300 rounded-t-xl">
          <h3 className="text-lg font-bold text-base-content">
            Special Trade Program
          </h3>
        </div>
        <div className="p-5">
          <Listbox
            value={selectedSpecialProgram}
            onChange={setSelectedSpecialProgram}
          >
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-base-200/50 py-3.5 pl-4 pr-10 text-left transition-colors hover:bg-base-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
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
                <Listbox.Options className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl bg-base-100 border border-base-300 py-1 shadow-xl focus:outline-none">
                  {[DEFAULT_PROGRAM, ...specialTradePrograms].map(
                    (program, i) => (
                      <Listbox.Option
                        key={i}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-3 px-4 transition-colors ${
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
                                    className={`text-sm mt-0.5 ${active ? "text-primary-content/80" : "text-base-content/60"}`}
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

      {/* Exemption Notice */}
      {exemptionNote && (
        <div className="alert alert-warning shadow-lg">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
          <div>
            <h3 className="font-bold">Important Notice</h3>
            <p className="text-sm">
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
      <div className="flex flex-col gap-5">
        {tariffSets.map((tariffSet, i) => {
          const estimate = dutyEstimates[i];
          const isExpanded = expandedSets[i] ?? false;
          const inactiveTariffs = tariffSet.tariffs.filter((t) => !t.isActive);
          const hasInactiveTariffs = inactiveTariffs.length > 0;

          return (
            <div
              key={i}
              className="card bg-base-100 border border-base-300 shadow-lg rounded-xl"
            >
              {/* Set Header */}
              <div
                className={`px-5 py-4 bg-base-200/50 flex flex-wrap justify-between items-center gap-3 border-b border-base-300 rounded-t-xl ${hasInactiveTariffs ? "cursor-pointer hover:bg-base-300 transition-colors" : ""}`}
                onClick={() => {
                  if (hasInactiveTariffs) {
                    setExpandedSets((prev) => ({ ...prev, [i]: !prev[i] }));
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-base-content">
                    {tariffSet.name} Tariffs
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base-content/60 font-semibold">
                    {renderTariffRate(tariffSet)}
                  </span>
                  {estimate && (
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(estimate.totalDuty)}
                    </span>
                  )}
                  {hasInactiveTariffs && (
                    <ChevronDownIcon
                      className={`w-5 h-5 text-base-content/60 transition-transform duration-200 ${isExpanded ? "" : "-rotate-180"}`}
                    />
                  )}
                </div>
              </div>

              {/* Tariff Items */}
              <div className="p-5 flex flex-col gap-4">
                {/* Base Tariffs */}
                {getFilteredBaseTariffs().flatMap((t) => t.tariffs).length >
                  0 && (
                  <div className="flex flex-col gap-2">
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
                  </div>
                )}

                {/* Standard Tariffs (no label) */}
                {tariffSet.tariffs
                  .filter(
                    (t) =>
                      !tariffSet.exceptionCodes.has(t.code) &&
                      (t.isActive || isExpanded)
                  )
                  .map((tariff) => (
                    <Tariff
                      key={tariff.code}
                      showInactive={isExpanded}
                      tariff={tariff}
                      setIndex={i}
                      tariffSets={tariffSets}
                      countryIndex={countryIndex}
                      setCountries={setCountries}
                      countries={countries}
                      column={tariffColumn}
                    />
                  ))}

                {/* Exception/Exemption Tariffs */}
                {(() => {
                  const visibleExceptionTariffs = tariffSet.tariffs.filter(
                    (t) =>
                      tariffSet.exceptionCodes.has(t.code) &&
                      (t.isActive || isExpanded)
                  );

                  if (visibleExceptionTariffs.length === 0) return null;

                  return (
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-success uppercase tracking-wider flex items-center gap-1.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Exemptions & Exceptions
                        </span>
                        <div className="flex-1 h-px bg-success/30" />
                      </div>
                      <p className="text-xs text-base-content/50 -mt-1 mb-1">
                        These may reduce or eliminate tariffs above if your
                        product qualifies
                      </p>
                      {visibleExceptionTariffs.map((tariff) => (
                        <Tariff
                          key={tariff.code}
                          showInactive={isExpanded}
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
                  );
                })()}
              </div>

              {/* Parsing Errors */}
              {i === 0 && parsingErrors.length > 0 && (
                <div className="mx-5 mb-5">
                  <div className="alert alert-error shadow-lg">
                    <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                    <div>
                      <h3 className="font-bold">
                        Error parsing base tariff(s)
                      </h3>
                      <ul className="list-disc list-inside mt-1 text-sm">
                        {parsingErrors.map((err, j) => (
                          <li key={j}>{err}</li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm">
                        Please contact{" "}
                        <a
                          href="mailto:support@htshero.com"
                          className="link font-semibold"
                        >
                          support
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Fees */}
      <div className="card bg-base-100 border border-base-300 shadow-lg rounded-xl">
        <div className="px-5 py-4 bg-base-200/50 flex flex-wrap justify-between items-center gap-3 border-b border-base-300 rounded-t-xl">
          <h3 className="text-lg font-bold text-base-content">
            Additional Fees
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-base-content/60 font-semibold">
              {additionalFeesTotal}%
            </span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(totalFees)}
            </span>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {feeEstimates.map((fee, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 px-4 bg-base-200/50 rounded-xl"
            >
              <div>
                <span className="font-medium text-base-content">
                  {fee.name}
                </span>
                {fee.name === "Merchandise Processing Fee" && (
                  <p className="text-xs text-base-content/50 mt-0.5">
                    Min: $33.58 / Max: $651.50
                  </p>
                )}
                {fee.note && (
                  <p className="text-xs text-warning font-medium mt-0.5">
                    {fee.note}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-primary text-lg">
                  {formatCurrency(fee.amount)}
                </span>
                <span className="text-xs text-base-content/50">
                  {fee.rate}%
                </span>
              </div>
            </div>
          ))}
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
