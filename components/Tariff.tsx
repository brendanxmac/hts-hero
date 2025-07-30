import { Dispatch, SetStateAction, useState } from "react";
import { Country } from "../constants/countries";
import {
  getApplicableInclusions,
  getNonExceptionTariffs,
  getTariffsByCode,
  TariffI,
} from "../public/tariffs/tariffs";

interface Props {
  country: Country;
  htsCode: string;
  countries: Country[];
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
}

interface TariffUI extends TariffI {
  isActive: boolean;
}

export const Tariff = ({
  country,
  htsCode,
  countries,
  setSelectedCountries,
}: Props) => {
  const tariffIsActive = (tariff: TariffI) => {
    if (tariff.requiresReview) return false;
    if (!tariff.exceptions) return true;

    const exceptions = getTariffsByCode(tariff.exceptions);
    console.log("exceptionTariffs", exceptions);

    const applicableExceptions = exceptions.flatMap((t) =>
      getApplicableInclusions(t, country.code, htsCode)
    );

    const noReviewNeeded = applicableExceptions.filter(
      (e) => !e.requiresReview
    );

    console.log("noReviewNeeded", noReviewNeeded);

    return noReviewNeeded.length === 0;
  };

  const applicableTariffs = getNonExceptionTariffs(country.code, htsCode);
  const [tariffs, setTariffs] = useState<TariffUI[]>(
    applicableTariffs.map((tariff) => ({
      ...tariff,
      isActive: tariffIsActive(tariff),
    }))
  );

  return (
    <div className="flex flex-col p-3 border-2 border-base-content/50 bg-base-300 rounded-md gap-4">
      <div className="w-full flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <h2 className="text-white text-3xl font-bold">{country.flag}</h2>
          <h2 className="text-white text-2xl font-bold">{country.name}</h2>
        </div>
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
      </div>
      {tariffs.map((tariff) => (
        <div className="w-full flex flex-col gap-4">
          <div
            key={tariff.code}
            className="w-full text-white font-bold flex gap-2 justify-between items-center"
          >
            <div>
              <span className="text-accent font-bold">
                {tariff.isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-secondary"> {tariff.code} </span>
              <span> - </span>
              <span className="font-normal">{tariff.name}</span>
            </div>
            <p className="shrink-0 min-w-32 text-right text-2xl lg:text-3xl text-secondary">
              {tariff.general}%
            </p>
          </div>

          {tariff.exceptions?.length > 0 &&
            getTariffsByCode(tariff.exceptions).map(
              (exceptionTariff) =>
                // If there's an exception without a matching tariff record
                // we will get null / undefined here, so we need to check for that
                exceptionTariff?.inclusions?.codes?.includes(htsCode) ||
                (exceptionTariff?.inclusions?.countries?.includes(
                  country.code
                ) && (
                  <div
                    key={exceptionTariff.code}
                    className="flex ml-4 justify-between items-center"
                  >
                    <div className="flex gap-2 text-white">
                      <span className="text-accent font-bold">
                        {exceptionTariff.code}
                      </span>
                      <span>-</span>
                      <span className="font-normal">
                        {" "}
                        {exceptionTariff.name}
                      </span>
                    </div>
                    <p className="shrink-0 min-w-32 text-right text-lg lg:text-xl text-accent font-bold">
                      {exceptionTariff.general}%
                    </p>
                  </div>
                ))
            )}
        </div>
      ))}
    </div>
  );
};
