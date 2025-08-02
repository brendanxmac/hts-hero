import { Dispatch, SetStateAction } from "react";
import { Country } from "../constants/countries";
import { CountryTariff } from "./CountryTariff";
import { ContentRequirementI } from "./Element";
import { Metal } from "../public/tariffs/tariffs";

interface Props {
  countries: Country[];
  htsCode: string;
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
  contentRequirements: ContentRequirementI<Metal>[];
}

export const Tariffs = ({
  countries,
  htsCode,
  setSelectedCountries,
  contentRequirements,
}: Props) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {countries.map((country, i) => (
        <CountryTariff
          key={`tariff-${country.code}-${i}`}
          country={country}
          htsCode={htsCode}
          countries={countries}
          setSelectedCountries={setSelectedCountries}
          contentRequirements={contentRequirements}
        />
      ))}
    </div>
  );
};
