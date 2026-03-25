"use client";

import { useMemo } from "react";
import { ClassificationI } from "../../interfaces/hts";
import { HtsElement } from "../../interfaces/hts";
import { Country } from "../../constants/countries";
import { useHts } from "../../contexts/HtsContext";
import { addTariffsToCountry } from "../../tariffs/tariffs";
import {
  findTariffElement,
  getTariffContext,
  calculateAllTariffs,
  TariffCalculationResult,
} from "../../tariffs/tariff-calculations";
import { get15PercentCountryTotalBaseRate } from "../../tariffs/tariffs";
import { EstimatedCostsDisplay } from "../tariff-ui/EstimatedCostsDisplay";
import { DashboardCard, DashboardCardHeader } from "./DashboardCard";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/16/solid";

const DEFAULT_CUSTOMS_VALUE = 10000;
const DEFAULT_UNITS = 1000;

export function useTariffCalculation(
  countryOfOrigin: Country | null,
  classification: ClassificationI,
  htsElements: HtsElement[]
): TariffCalculationResult | null {
  return useMemo(() => {
    if (
      !countryOfOrigin ||
      !classification.isComplete ||
      htsElements.length === 0
    )
      return null;

    const element =
      classification.levels[classification.levels.length - 1]?.selection;
    if (!element) return null;

    const tariffEl = findTariffElement(element, htsElements);
    const cwt = addTariffsToCountry(
      countryOfOrigin,
      element,
      tariffEl,
      [],
      undefined,
      DEFAULT_UNITS,
      DEFAULT_CUSTOMS_VALUE
    );

    const { tariffColumn, is15Cap } = getTariffContext(countryOfOrigin.code);
    const baseFlat = cwt.baseTariffs.flatMap((t) => t.tariffs);
    const adValoremEquiv = get15PercentCountryTotalBaseRate(
      baseFlat,
      DEFAULT_CUSTOMS_VALUE,
      DEFAULT_UNITS
    );
    const below15Rule = is15Cap && adValoremEquiv < 15;

    return calculateAllTariffs(
      cwt.tariffSets,
      cwt.baseTariffs,
      DEFAULT_CUSTOMS_VALUE,
      DEFAULT_UNITS,
      [],
      tariffColumn,
      below15Rule
    );
  }, [countryOfOrigin, classification, htsElements]);
}

export function TariffDashboardSection({
  countryOfOrigin,
  classification,
  onNavigateToDuty,
}: {
  countryOfOrigin: Country | null;
  classification: ClassificationI;
  onNavigateToDuty: () => void;
}) {
  const { htsElements } = useHts();
  const tariffData = useTariffCalculation(
    countryOfOrigin,
    classification,
    htsElements
  );

  return (
    <DashboardCard>
      <DashboardCardHeader
        title="Tariff Summary"
        icon={<CurrencyDollarIcon className="w-4 h-4" />}
        action={
          <button
            onClick={onNavigateToDuty}
            className="btn btn-sm btn-primary"
          >
            See All Tariff Details
            <ArrowRightIcon className="w-3 h-3" />
          </button>
        }
      />
      <div className="flex flex-col gap-5">
        {tariffData ? (
          <div className="p-4">
            <EstimatedCostsDisplay
              dutyEstimates={tariffData.dutyEstimates}
              feeEstimates={tariffData.feeEstimates}
              summaryTotals={tariffData.summaryTotals}
              totalImportDuty={tariffData.totalImportDuty}
              totalFees={tariffData.totalFees}
              customsValue={DEFAULT_CUSTOMS_VALUE}
            />
          </div>
        ) : countryOfOrigin && !classification.isComplete ? (
          <div className="text-center py-6">
            <p className="text-sm text-base-content/60">
              Complete the classification to see tariff estimates.
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-base-content/60">
              Select a country of origin on the dashboard to see tariff estimates.
            </p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
