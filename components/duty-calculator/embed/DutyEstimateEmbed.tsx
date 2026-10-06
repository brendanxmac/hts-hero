"use client";

import { Country } from "@/constants/countries";
import { HtsElement } from "@/interfaces/hts";
import { THEME_EMBEDDED } from "@/components/ui/theme";
import { ChooseCountryPrompt } from "./ChooseCountryPrompt";
import { EstimateInputs } from "./EstimateInputs";
import { FullEstimate } from "./FullEstimate";
import { SimpleEstimate } from "./SimpleEstimate";
import { Surface, useDutyEstimate } from "./useDutyEstimate";

// A duty estimate for one HTS code, embedded in another page (the HTS explorer, a
// classification's Duty & Tariffs tab). Same engine and pieces as the Tariff Calculator,
// with a link to open the estimate there in full.
export const DutyEstimateEmbed = ({
  element,
  tariffElement,
  initialCountry = null,
  countryOfOrigin = null,
  surface,
  variant = "full",
}: {
  element: HtsElement;
  // The line with the base rates, when the page already knows it
  tariffElement?: HtsElement;
  initialCountry?: Country | null;
  // The classification's country of origin, to offer going back to it
  countryOfOrigin?: Country | null;
  surface: Surface;
  // "simple": the headline figures and a call to open the Tariff Calculator for the rest
  variant?: "full" | "simple";
}) => {
  const estimate = useDutyEstimate({
    element,
    tariffElementOverride: tariffElement,
    initialCountry,
    surface,
  });
  const { country, result } = estimate;
  const simple = variant === "simple";

  return (
    <div className={`${THEME_EMBEDDED} flex flex-col gap-4`}>
      <EstimateInputs
        estimate={estimate}
        ids={`de-${surface}`}
        simple={simple}
        countryOfOrigin={countryOfOrigin}
      />

      {!country || !result ? (
        <ChooseCountryPrompt />
      ) : simple ? (
        <SimpleEstimate
          estimate={estimate}
          result={result}
        />
      ) : (
        <FullEstimate
          estimate={estimate}
          result={result}
        />
      )}
    </div>
  );
};
