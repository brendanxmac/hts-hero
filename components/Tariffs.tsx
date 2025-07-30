import { Dispatch, SetStateAction } from "react";
import { Country } from "../constants/countries";
import { Tariff } from "./Tariff";

interface Props {
  countries: Country[];
  htsCode: string;
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
}

export const Tariffs = ({
  countries,
  htsCode,
  setSelectedCountries,
}: Props) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {countries.map((country, i) => (
        <Tariff
          key={`tariff-${country.code}-${i}`}
          country={country}
          htsCode={htsCode}
          countries={countries}
          setSelectedCountries={setSelectedCountries}
        />
      ))}
    </div>
  );
};
