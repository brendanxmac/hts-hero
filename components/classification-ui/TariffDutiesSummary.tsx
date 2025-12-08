"use client";

import { Country } from "../../constants/countries";

export interface TariffSummaryRate {
  name: string;
  rate: number;
  hasAmountTariffs: boolean;
  amountRatesString: string | null;
}

interface Props {
  selectedCountry: Country | null;
  tariffRates: TariffSummaryRate[];
}

/**
 * Collapsed summary for Tariffs & Duties section
 * Shows country of origin and tariff rates for each tariff set
 */
export function TariffDutiesSummary({ selectedCountry, tariffRates }: Props) {
  if (!selectedCountry) {
    return (
      <div className="text-base text-base-content/50 italic py-2">
        Select a country of origin to see tariffs & duty estimates
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Country */}
      <div className="flex items-center gap-2">
        <span className="text-xl md:text-2xl">{selectedCountry.flag}</span>
        <span className="text-base md:text-lg font-bold text-base-content">
          {selectedCountry.name}
        </span>
      </div>

      <div className="h-5 w-px bg-base-content/20 hidden sm:block" />

      {/* Tariff rates inline */}
      <div className="flex items-center gap-2 flex-wrap">
        {tariffRates.map((rate, index) => (
          <div
            key={rate.name}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/10 border border-secondary/20"
          >
            <span className="text-xs md:text-sm font-medium text-base-content/60">
              {rate.name}:
            </span>
            <span className="text-sm md:text-base font-bold text-secondary">
              {rate.hasAmountTariffs && rate.amountRatesString && (
                <span>{rate.amountRatesString} </span>
              )}
              {rate.hasAmountTariffs && rate.rate > 0 && "+ "}
              {rate.rate}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
