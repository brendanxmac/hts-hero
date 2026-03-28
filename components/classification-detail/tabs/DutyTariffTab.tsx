"use client";

import { useMemo } from "react";
import { useClassification } from "../../../contexts/ClassificationContext";
import { useHts } from "../../../contexts/HtsContext";
import { UserProfile } from "../../../libs/supabase/user";
import { ClassificationRecord } from "../../../interfaces/hts";
import { Countries, Country } from "../../../constants/countries";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { SingleCountryDutyTariffCard } from "../../SingleCountryDutyTariffCard";

interface Props {
  classificationRecord?: ClassificationRecord;
  userProfile: UserProfile | null;
  countryOfOrigin?: Country | null;
}

export const DutyTariffTab = ({
  classificationRecord,
  userProfile: _userProfile,
  countryOfOrigin,
}: Props) => {
  const { classification } = useClassification();
  const { htsElements } = useHts();
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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

      <SingleCountryDutyTariffCard
        element={element}
        htsElements={htsElements}
        initialSelectedCountry={initialSelectedCountry}
        countryOfOrigin={countryOfOrigin}
      />
    </div>
  );
};
