import { Dispatch, SetStateAction } from "react";
import { Country } from "../constants/countries";
import { CountryTariff } from "./CountryTariff";
import { ContentRequirementI } from "./Element";
import { HtsElement } from "../interfaces/hts";
import { Metal } from "../enums/tariff";

interface Props {
  selectedCountries: Country[];
  htsElement: HtsElement;
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
  contentRequirements: ContentRequirementI<Metal>[];
}

export const Tariffs = ({
  selectedCountries,
  htsElement,
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
          selectedCountries={selectedCountries}
          setSelectedCountries={setSelectedCountries}
          contentRequirements={contentRequirements}
        />
      ))}
    </div>
  );
};
