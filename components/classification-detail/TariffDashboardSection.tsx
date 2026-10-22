"use client";

import { useMemo } from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { ClassificationI } from "../../interfaces/hts";
import { Country } from "../../constants/countries";
import { useHts } from "../../contexts/HtsContext";
import { microEstimate } from "../../libs/hts-micro-estimate";
import { findTariffElement } from "../duty-calculator/lib/estimate";
import { todayIso } from "../duty-calculator/lib/format";
import { MicroCalculator } from "../hts-code-page/MicroCalculator";
import { DashboardCard, DashboardCardHeader } from "./DashboardCard";
import { THEME_EMBEDDED } from "../ui/theme";

// The classification's duty at a glance: the quick estimate from the /hts code pages, for its
// country of origin (China when it has none, as on those pages). The Duty & Tariffs tab has the
// full calculator.
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
  const element = classification.levels[classification.levels.length - 1]?.selection;
  const tariffElement = useMemo(
    () => (element && htsElements.length ? findTariffElement(element, htsElements) : null),
    [element, htsElements],
  );

  if (!classification.isComplete || !element || !tariffElement) {
    return (
      <DashboardCard>
        <DashboardCardHeader title="Tariff Summary" icon={<CurrencyDollarIcon className="w-4 h-4" />} />
        <div className="text-center py-6">
          <p className="text-sm text-base-content/60">Complete the classification to see tariff estimates.</p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <div className={THEME_EMBEDDED}>
      {/* Started again when the code or the classification's country changes */}
      <Estimate
        key={`${element.htsno}-${countryOfOrigin?.code ?? ""}`}
        htsno={element.htsno}
        baseRates={{ general: tariffElement.general, special: tariffElement.special, other: tariffElement.other }}
        country={countryOfOrigin?.code ?? "CN"}
        onNavigateToDuty={onNavigateToDuty}
      />
    </div>
  );
}

const Estimate = ({
  htsno,
  baseRates,
  country,
  onNavigateToDuty,
}: {
  htsno: string;
  baseRates: { general: string | null; special: string | null; other: string | null };
  country: string;
  onNavigateToDuty: () => void;
}) => {
  const initial = useMemo(
    () => microEstimate({ htsCode: htsno, baseRates, country, asOf: todayIso() }),
    // Once: it's keyed by the code and country
    [],
  );
  return (
    <MicroCalculator
      htsno={htsno}
      baseRates={baseRates}
      initial={initial}
      inClassification
      onUseCode={onNavigateToDuty}
      useCodeLabel="See All Tariff Details"
    />
  );
};
