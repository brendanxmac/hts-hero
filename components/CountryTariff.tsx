import { Dispatch, SetStateAction, useState } from "react";
import { Country } from "../constants/countries";
import {
  getTariffs,
  TariffColumn,
  TariffI,
  tariffIsActive,
} from "../public/tariffs/tariffs";
import { classNames } from "../utilities/style";
import { PrimaryText } from "./PrimaryText";
import { Color } from "../enums/style";
import { PrimaryLabel } from "./PrimaryLabel";
import { TertiaryLabel } from "./TertiaryLabel";
import { TertiaryText } from "./TertiaryText";
import { Tariff, TariffUI } from "./Tariff";

interface Props {
  country: Country;
  htsCode: string;
  countries: Country[];
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
}

export const CountryTariff = ({
  country,
  htsCode,
  countries,
  setSelectedCountries,
}: Props) => {
  const applicableTariffs = getTariffs(country.code, htsCode).map((t) => ({
    ...t,
    isActive: tariffIsActive(t, country.code, htsCode),
  }));

  // Recursive function to build the complete exception hierarchy
  const buildTariffHierarchy = (
    tariff: TariffI & { isActive: boolean },
    allTariffs: (TariffI & { isActive: boolean })[]
  ): TariffUI => {
    const exceptionTariffs = tariff.exceptions
      ? allTariffs
          .filter((t) => tariff.exceptions?.includes(t.code))
          .map((exceptionTariff) =>
            buildTariffHierarchy(exceptionTariff, allTariffs)
          )
      : [];

    return {
      ...tariff,
      exceptionTariffs,
    };
  };

  // Create a set to track all exception tariff codes (at any level)
  const allExceptionTariffCodes = new Set<string>();

  // Helper function to collect all exception codes recursively
  const collectExceptionCodes = (tariff: TariffI) => {
    if (tariff.exceptions) {
      tariff.exceptions.forEach((code) => {
        allExceptionTariffCodes.add(code);
        // Find the exception tariff and recursively collect its exceptions
        const exceptionTariff = applicableTariffs.find((t) => t.code === code);
        if (exceptionTariff) {
          collectExceptionCodes(exceptionTariff);
        }
      });
    }
  };

  // Collect all exception codes from all tariffs
  applicableTariffs.forEach(collectExceptionCodes);

  // Build the complete hierarchy for each tariff
  const tariffsWithExceptions: TariffUI[] = applicableTariffs.map((tariff) =>
    buildTariffHierarchy(tariff, applicableTariffs)
  );

  // Remove tariffs that are exceptions at any level
  const cleanedUpTariffs = tariffsWithExceptions.filter(
    (t) => !allExceptionTariffCodes.has(t.code)
  );

  // Recursive helper function to calculate rate from a tariff and all its exceptions
  const calculateTariffRate = (
    tariff: TariffUI,
    column: TariffColumn
  ): number => {
    let rate = 0;

    if (tariff.isActive) {
      rate += tariff[column];
    } else if (tariff.exceptionTariffs?.length) {
      // If this tariff is not active, check all its exception tariffs recursively
      tariff.exceptionTariffs.forEach((exceptionTariff) => {
        rate += calculateTariffRate(exceptionTariff, column);
      });
    }

    return rate;
  };

  const getRate = (column: TariffColumn) => {
    let rate = 0;
    tariffs.forEach((tariff) => {
      rate += calculateTariffRate(tariff, column);
    });
    return rate;
  };

  const [tariffs, setTariffs] = useState<TariffUI[]>(cleanedUpTariffs);
  const [showInactive, setShowInactive] = useState<boolean>(true);

  console.log(tariffs);

  return (
    <div className="flex flex-col p-8 border-2 border-base-content/50 bg-base-300 rounded-md gap-6">
      <div className="w-full flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <h2 className="text-white text-3xl font-bold">{country.flag}</h2>
          <h2 className="text-white text-2xl font-bold">{country.name}</h2>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md p-1 bg-primary/30 text-white hover:text-primary transition-colors"
            onClick={() =>
              setSelectedCountries(
                countries.filter((c) => c.code !== country.code)
              )
            }
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="rounded-md p-1 bg-primary/30 text-white hover:text-primary transition-colors"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
          </button>
          <button
            className="rounded-md p-1 bg-primary/30 text-white hover:text-primary transition-colors"
            onClick={() => {
              setTariffs(cleanedUpTariffs);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-b-4 border-base-content">
        {tariffs.map((tariff) => (
          <Tariff
            key={tariff.code}
            showInactive={showInactive}
            tariff={tariff}
            tariffs={tariffs}
            setTariffs={setTariffs}
          />
        ))}
      </div>

      <div className="-mt-2 w-full flex justify-between items-center gap-2">
        <h2 className="text-white font-bold">Total</h2>
        <p className="text-xl font-bold text-secondary transition duration-100">
          {getRate(TariffColumn.GENERAL)}%
        </p>
      </div>
    </div>
  );
};
