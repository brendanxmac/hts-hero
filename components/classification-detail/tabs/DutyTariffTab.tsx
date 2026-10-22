"use client";

import { Suspense, useMemo } from "react";
import { useClassification } from "../../../contexts/ClassificationContext";
import { BreadcrumbsProvider } from "../../../contexts/BreadcrumbsContext";
import { UserProfile } from "../../../libs/supabase/user";
import { ClassificationRecord, HtsElement } from "../../../interfaces/hts";
import { Countries, Country } from "../../../constants/countries";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { CalculatorWorkspace } from "@/components/duty-calculator/calculator/CalculatorWorkspace";
import { Disclaimer } from "@/components/duty-calculator/calculator/Disclaimer";
import { ExploreModal } from "@/components/duty-calculator/calculator/ExploreModal";
import { useTariffFinder } from "@/components/duty-calculator/lib/useTariffFinder";
import { todayIso } from "@/components/duty-calculator/lib/format";
import { trackerSans } from "@/components/ui/font";
import { THEME_EMBEDDED } from "@/components/ui/theme";
import * as ui from "@/components/ui/styles";

interface Props {
  classificationRecord?: ClassificationRecord;
  userProfile: UserProfile | null;
  countryOfOrigin?: Country | null;
}

// The same Tariff Calculator as /duty-calculator (CalculatorWorkspace), started on the
// classification's code and country of origin (China when it has none, as on /duty-calculator).
// It leaves the page's address alone.
const Calculator = ({ element, country }: { element: HtsElement; country: Country }) => {
  const f = useTariffFinder({
    syncAddress: false,
    initial: { element, country, customsValue: 10000, quantity: 1000, entryDate: todayIso(), transportMode: "ocean" },
  });
  return (
    // Themed, on the classification page's own background
    <div className={`${THEME_EMBEDDED} hts-tracker ${trackerSans.className} flex flex-col gap-4`}>
      <CalculatorWorkspace f={f} page="calculator" />
      <Disclaimer />
      <ExploreModal f={f} />
    </div>
  );
};

export const DutyTariffTab = ({
  classificationRecord,
  userProfile: _userProfile,
  countryOfOrigin,
}: Props) => {
  const { classification } = useClassification();
  const { levels } = classification;
  const element = levels[levels.length - 1]?.selection;

  const initialSelectedCountry = useMemo(() => {
    if (classificationRecord?.country_of_origin) {
      return (
        Countries.find(
          (c) => c.code === classificationRecord.country_of_origin
        ) || null
      );
    }
    return null;
  }, [classificationRecord?.country_of_origin]);

  if (!element) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-base-200 border border-base-300 mb-6">
          <CurrencyDollarIcon className="w-8 h-8 text-base-content/30" />
        </div>
        <h2 className="text-xl font-bold text-base-content mb-2">
          Duty / Tariffs
        </h2>
        <p className="text-sm text-base-content/50 max-w-md">
          Complete the classification to see applicable tariffs and duty rates.
        </p>
      </div>
    );
  }

  const country =
    countryOfOrigin ?? initialSelectedCountry ?? Countries.find((c) => c.code === "CN")!;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-base-content">
            Duty / Tariffs
          </h2>
          <p className="text-sm text-base-content/60 mt-1">
            Calculate import duties and tariffs for{" "}
            {classification.levels[classification.levels.length - 1]?.selection
              ?.htsno || "your item"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {/* Its own breadcrumbs, so the calculator's don't replace the page's. Started again when
            the classification's code or country changes */}
        <BreadcrumbsProvider>
          <Suspense fallback={<div className={`${ui.card} h-64`} />}>
            <Calculator key={`${element.htsno}-${country.code}`} element={element} country={country} />
          </Suspense>
        </BreadcrumbsProvider>
      </div>
    </div>
  );
};
