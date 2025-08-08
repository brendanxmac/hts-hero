import { Dispatch, SetStateAction } from "react";
import { Country } from "../constants/countries";
import { CountryTariff } from "./CountryTariff";
import { ContentRequirementI } from "./Element";
import { HtsElement } from "../interfaces/hts";
import { ContentRequirements } from "../enums/tariff";

interface Props {
  selectedCountries: Country[];
  htsElement: HtsElement;
  tariffElement: HtsElement;
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
  contentRequirements: ContentRequirementI<ContentRequirements>[];
}

export const Tariffs = ({
  selectedCountries,
  htsElement,
  tariffElement,
  setSelectedCountries,
  contentRequirements,
}: Props) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {selectedCountries.map((country, i) => (
        <CountryTariff
          key={`tariff-${country.code}-${i}`}
          country={country}
          htsElement={htsElement}
          tariffElement={tariffElement}
          selectedCountries={selectedCountries}
          setSelectedCountries={setSelectedCountries}
          contentRequirements={contentRequirements}
        />
      ))}
    </div>
  );
};
