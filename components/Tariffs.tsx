import { Dispatch, SetStateAction } from "react";
import { Country } from "../constants/countries";
import { CountryTariff } from "./CountryTariff";
import { ContentRequirementI } from "./Element";
import { Metal } from "../public/tariffs/tariffs";
import { HtsElement } from "../interfaces/hts";

interface Props {
  countries: Country[];
  htsElement: HtsElement;
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
  contentRequirements: ContentRequirementI<Metal>[];
}

export const Tariffs = ({
  countries,
  htsElement,
  setSelectedCountries,
  contentRequirements,
}: Props) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {countries.map((country, i) => (
        <CountryTariff
          key={`tariff-${country.code}-${i}`}
          country={country}
          htsElement={htsElement}
          countries={countries}
          setSelectedCountries={setSelectedCountries}
          contentRequirements={contentRequirements}
        />
      ))}
    </div>
  );
};
