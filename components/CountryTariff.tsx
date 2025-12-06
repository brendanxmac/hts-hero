import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import { classNames } from "../utilities/style";
import { SubheadingsConditionallyExemptFromReciprocal } from "../tariffs/exclusion-lists.ts/reciprocal-tariff-exlcusions";
import {
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import config from "../config";

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
  const [isCostCopied, setIsCostCopied] = useState(false);
  const [isTariffDetailsCopied, setIsTariffDetailsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
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

  // Generate shareable link
  const generateShareLink = () => {
    // Get Base Url
    const baseUrl = window.location.origin;
    const path = "/tariff-finder";
    const params = new URLSearchParams({
      code: tariffElement.htsno,
      country: country.code,
      value: customsValue.toString(),
    });
    return `${baseUrl}${path}?${params.toString()}`;
  };

  const handleShareClick = () => {
    copyToClipboard(generateShareLink());
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  // Copy cost details as beautifully formatted text
  const copyCostDetails = () => {
    const tradeProgramLine =
      selectedSpecialProgram?.symbol !== "none"
        ? `Trade Program: ${selectedSpecialProgram.name} (${selectedSpecialProgram.symbol})`
        : null;

    const lines = [
      `Estimated Import Costs for ${tariffElement.htsno} from ${country.name}`,
      ``,
      `COST SUMMARY`,
      `────────────────────────────────────────`,
      `Customs Value:        ${formatCurrency(customsValue)}`,
      `Total Duty & Fees:    ${formatCurrency(totalImportDuty)}`,
      `Landed Cost:          ${formatCurrency(totalImportDuty + customsValue)}`,
      ``,
      `DUTY BREAKDOWN`,
      `────────────────────────────────────────`,
      ...dutyEstimates.flatMap((estimate) => {
        const lines = [
          `${estimate.tariffSetName} Duty: ${formatCurrency(estimate.totalDuty)}`,
        ];
        if (estimate.amountDuty > 0) {
          lines.push(
            `  - Amount-based: ${formatCurrency(estimate.amountDuty)}`
          );
        }
        lines.push(
          `  - Ad valorem (${estimate.percentRate}%): ${formatCurrency(estimate.adValoremDuty)}`
        );
        if (contentRequirements.length > 0) {
          lines.push(
            `  - Applied to ${estimate.contentPercentage}% of value (${formatCurrency(estimate.applicableValue)})`
          );
        }
        return lines;
      }),
      ``,
      `ADDITIONAL FEES`,
      `────────────────────────────────────────`,
      ...feeEstimates.flatMap((fee) => {
        const lines = [
          `${fee.name}: ${formatCurrency(fee.amount)} (${fee.rate}%)`,
        ];
        if (fee.note) {
          lines.push(``, `  Note: ${fee.note}`);
        }
        return lines;
      }),
      ``,
      `Estimates generated by HTS Hero ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    ];
    return lines.filter((line) => line !== null).join("\n");
  };

  const handleCopyCostClick = () => {
    copyToClipboard(copyCostDetails());
    setIsCostCopied(true);
    setTimeout(() => setIsCostCopied(false), 2000);
  };

  // Copy tariff details as beautifully formatted text
  const copyTariffDetailsFormatted = () => {
    const filteredBase = filterByProgram(baseTariffs.flatMap((t) => t.tariffs));
    const tradeProgramLine =
      selectedSpecialProgram?.symbol !== "none"
        ? `Trade Program: ${selectedSpecialProgram.name} (${selectedSpecialProgram.symbol})`
        : null;

    const lines: (string | null)[] = [
      `Tariff Details for ${tariffElement.htsno} from ${country.name}`,
      tradeProgramLine,
      ``,
    ];

    // Add tariff sets
    tariffSets.forEach((tariffSet) => {
      const isArticleSet =
        tariffSet.name === "Article" || tariffSet.name === "";
      const shouldIncludeBaseTariffs =
        isArticleSet &&
        !(is15PercentCapCountry && adValoremEquivalentRate < 15);
      const hasAmountTariffs =
        shouldIncludeBaseTariffs &&
        filteredBase.some((t) => t.type === "amount");

      const adValoremRate = shouldIncludeBaseTariffs
        ? getAdValoremRate(getTariffColumn(), tariffSet.tariffs, filteredBase)
        : getAdValoremRate(getTariffColumn(), tariffSet.tariffs);

      const rateDisplay = hasAmountTariffs
        ? `${getAmountRatesString(filteredBase)} + ${adValoremRate}%`
        : `${adValoremRate}%`;

      lines.push(`${tariffSet.name.toUpperCase() || "ARTICLE"} TARIFFS`);
      lines.push(`────────────────────────────────────────`);
      lines.push(`Total Rate: ${rateDisplay}`);

      // Base tariffs (for Article set)
      if (shouldIncludeBaseTariffs && getFilteredBaseTariffs().length > 0) {
        lines.push(``);
        lines.push(`Base Duties:`);
        getFilteredBaseTariffs()
          .flatMap((t) => t.tariffs)
          .forEach((tariff) => {
            const valueText =
              tariff.value === null
                ? "Needs Review"
                : tariff.type === "percent"
                  ? `${tariff.value}%`
                  : tariff.raw;
            const typeText =
              tariff.type === "percent" ? "Ad Valorem" : "Quantity";
            lines.push(`  - ${valueText} (${typeText})`);
          });
      }

      // Active tariffs
      const activeTariffs = tariffSet.tariffs.filter(
        (t) => t.isActive && !tariffSet.exceptionCodes.has(t.code)
      );
      if (activeTariffs.length > 0) {
        lines.push(``);
        lines.push(`Additional Tariffs:`);
        activeTariffs.forEach((tariff) => {
          const rate = tariff[tariffColumn];
          lines.push(
            `  - ${tariff.name}: ${rate === null ? "Needs Review" : `${rate}%`}`
          );
          lines.push(`    Code: ${tariff.code}`);
        });
      }

      // Exceptions/Exemptions
      const exceptionTariffs = tariffSet.tariffs.filter(
        (t) => t.isActive && tariffSet.exceptionCodes.has(t.code)
      );
      if (exceptionTariffs.length > 0) {
        lines.push(``);
        lines.push(`Exemptions & Exceptions:`);
        exceptionTariffs.forEach((tariff) => {
          const rate = tariff[tariffColumn];
          lines.push(
            `  - ${tariff.name}: ${rate === null ? "Needs Review" : `${rate}%`}`
          );
        });
      }

      lines.push(``);
      lines.push(``);
    });

    // Additional fees
    lines.push(`ADDITIONAL FEES`);
    lines.push(`────────────────────────────────────────`);
    lines.push(`Harbor Maintenance Fee: 0.125%`);
    lines.push(`Merchandise Processing Fee: 0.3464%`);
    lines.push(`  Min: $33.58 / Max: $651.50`);
    lines.push(``);
    lines.push(
      `Generated by HTS Hero ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
    );

    return lines.filter((line) => line !== null).join("\n");
  };

  const handleCopyTariffDetailsClick = () => {
    copyToClipboard(copyTariffDetailsFormatted());
    setIsTariffDetailsCopied(true);
    setTimeout(() => setIsTariffDetailsCopied(false), 2000);
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
      <div className="flex flex-row items-center justify-between gap-4">
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
            className={`btn btn-sm gap-1.5 btn-primary`}
            onClick={handleShareClick}
          >
            {isLinkCopied ? (
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
            ) : (
              <LinkIcon className="w-4 h-4" />
            )}
            {isLinkCopied ? "Results Link Copied!" : "Share Results"}
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

      {/* Estimated Costs Header */}
      <div className="flex justify-between items-center pt-4">
        <h2 className="text-3xl font-black text-base-content">
          Estimated Costs
        </h2>
        <button
          className={`btn btn-sm gap-1.5 btn-outline btn-primary`}
          onClick={handleCopyCostClick}
        >
          {isCostCopied ? (
            <ClipboardDocumentCheckIcon className="w-4 h-4" />
          ) : (
            <ClipboardDocumentIcon className="w-4 h-4" />
          )}
          {isCostCopied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Total Import Duty Summary */}
      <div className="card bg-base-100 border border-base-300 shadow-lg rounded-xl">
        <div className="p-5">
          <div className="flex md:flex-row flex-col gap-4 mb-5">
            {/* Duty & Fees */}
            <div className="flex-1 basis-0 flex flex-col items-center justify-center p-6 bg-secondary/10 rounded-xl">
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
            <div className="flex-1 basis-0 flex flex-col items-center justify-center p-6 bg-accent/10 rounded-xl">
              <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">
                Landed Cost
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-accent">
                {formatCurrency(totalImportDuty + customsValue)}
              </h2>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-4">
            {dutyEstimates.map((estimate, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-4 bg-base-200/50 rounded-xl sm:flex-1 sm:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.667rem)]"
              >
                <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1">
                  {estimate.tariffSetName} Duty
                </span>
                <div className="text-3xl font-black text-primary mb-2">
                  {formatCurrency(estimate.totalDuty)}
                </div>
                <div className="text-xs text-base-content/50 space-y-1 text-center">
                  {estimate.amountDuty > 0 && (
                    <div className="flex justify-center gap-2">
                      <span>Amount-based:</span>
                      <span className="font-medium">
                        {formatCurrency(estimate.amountDuty)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-center gap-2">
                    <span>Ad valorem ({estimate.percentRate}%):</span>
                    <span className="font-medium">
                      {formatCurrency(estimate.adValoremDuty)}
                    </span>
                  </div>
                  {contentRequirements.length > 0 && (
                    <div className="flex justify-center">
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
            <div className="flex flex-col items-center justify-center p-4 bg-base-200/50 rounded-xl sm:flex-1 sm:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.667rem)]">
              <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1">
                Additional Fees
              </span>
              <div className="text-3xl font-black text-primary mb-2">
                {formatCurrency(totalFees)}
              </div>
              <div className="text-xs text-base-content/50 space-y-1 text-center">
                {feeEstimates.map((fee, i) => (
                  <div key={i} className="flex justify-center gap-2">
                    <span>{fee.name}:</span>
                    <span className="font-medium">
                      {formatCurrency(fee.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Tariff Rates */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
            {summaryTotals.map((total, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-4 bg-base-200/50 rounded-xl sm:flex-1 sm:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.667rem)]"
              >
                <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1">
                  {total.name} Tariff Rate
                </span>
                <div className="text-3xl font-black text-primary">
                  {total.hasAmountTariffs && total.amountRatesString && (
                    <span className="text-3xl">
                      {total.amountRatesString} +{" "}
                    </span>
                  )}
                  {total.rate}%
                </div>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center p-4 bg-base-200/50 rounded-xl sm:flex-1 sm:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.667rem)]">
              <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1">
                Additional Fee Rate
              </span>
              <div className="text-3xl font-black text-primary">
                {additionalFeesTotal}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tariff Details Header */}
      <div className="flex justify-between items-center pt-4">
        <h2 className="text-3xl font-black text-base-content">
          Tariff Details
        </h2>
        <button
          className={`btn btn-sm gap-1.5 btn-outline btn-primary`}
          onClick={handleCopyTariffDetailsClick}
        >
          {isTariffDetailsCopied ? (
            <ClipboardDocumentCheckIcon className="w-4 h-4" />
          ) : (
            <ClipboardDocumentIcon className="w-4 h-4" />
          )}
          {isTariffDetailsCopied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Trade Programs */}
      <div className="card bg-base-100 border border-base-300 shadow-lg rounded-xl">
        <div className="px-5 py-4 bg-base-200/50 border-b border-base-300 rounded-t-xl">
          <h3 className="text-lg font-bold text-base-content">
            Special Trade Programs
          </h3>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {[DEFAULT_PROGRAM, ...specialTradePrograms].map((program, i) => {
            const isSelected =
              selectedSpecialProgram?.symbol === program.symbol;
            return (
              <div
                key={i}
                className={classNames(
                  "flex gap-3 justify-between items-center py-3 px-4 rounded-xl transition-colors hover:bg-base-200 cursor-pointer",
                  isSelected ? "bg-primary/10" : "bg-base-200/50"
                )}
                onClick={() => setSelectedSpecialProgram(program)}
              >
                <div className="flex gap-3 items-center flex-1 min-w-0">
                  <input
                    type="radio"
                    name="trade-program"
                    checked={isSelected}
                    onChange={() => setSelectedSpecialProgram(program)}
                    className="radio radio-primary radio-sm shrink-0"
                  />
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex gap-2 items-center flex-wrap">
                      {program.symbol !== "none" && (
                        <div className="flex gap-2 items-center shrink-0">
                          <span className="font-bold text-primary">
                            {program.symbol}
                          </span>
                          <span className="text-base-content/30">•</span>
                        </div>
                      )}
                      <span className="font-medium min-w-0 flex-1 text-base-content">
                        {program.name}
                      </span>
                    </div>
                    {"description" in program && program.description && (
                      <p className="text-sm text-base-content/60">
                        {program.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
              <div className="px-5 py-4 bg-base-200/50 flex flex-wrap justify-between items-center gap-3 border-b border-base-300 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-base-content">
                    {tariffSet.name} Tariffs
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base-content/60 font-semibold">
                    {renderTariffRate(tariffSet)}
                  </span>
                  <span className="text-base-content/50">|</span>
                  {estimate && (
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(estimate.totalDuty)}
                    </span>
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

              {/* Show/Hide Inactive Tariffs Button */}
              {hasInactiveTariffs && (
                <div className="px-5 pb-5 flex justify-center">
                  <button
                    className="btn btn-sm btn-ghost gap-2"
                    onClick={() =>
                      setExpandedSets((prev) => ({ ...prev, [i]: !prev[i] }))
                    }
                  >
                    <ChevronDownIcon
                      className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                    {isExpanded ? "Hide Inactive Tariffs" : "Show All Tariffs"}
                    <ChevronDownIcon
                      className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
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
            <span className="text-base-content/50">|</span>
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
