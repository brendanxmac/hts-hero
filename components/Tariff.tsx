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

interface Props {
  country: Country;
  htsCode: string;
  countries: Country[];
  setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
}

interface TariffUI extends TariffI {
  exceptionTariffs?: TariffUI[];
  isActive: boolean;
}

export const Tariff = ({
  country,
  htsCode,
  countries,
  setSelectedCountries,
}: Props) => {
  const applicableTariffs = getTariffs(country.code, htsCode).map((t) => ({
    ...t,
    isActive: tariffIsActive(t, country.code, htsCode),
  }));

  // Create a set to add exception tariffs to
  const exceptionTariffs = new Set<string>();
  // go through the list and setup the relationships between the tariffs
  // for any identified exception add to the set as well
  const enrichedTariffs: TariffUI[] = applicableTariffs.map((tariff) => ({
    ...tariff,
    exceptionTariffs: tariff.exceptions
      ? applicableTariffs.filter((t) => {
          if (tariff.exceptions?.includes(t.code)) {
            exceptionTariffs.add(t.code);
            return true;
          }
          return false;
        })
      : [],
  }));

  // If a given tariff is within exceptionTariffs, remove it from enrichedTariffs
  const cleanedUpTariffs = enrichedTariffs.filter(
    (t) => !exceptionTariffs.has(t.code)
  );

  const getRate = (column: TariffColumn) => {
    let rate = 0;
    tariffs.forEach((tariff) => {
      if (tariff.isActive) {
        rate += tariff[column];
      } else if (tariff.exceptionTariffs?.length) {
        tariff.exceptionTariffs.forEach((et) => {
          if (et.isActive) {
            rate += et[column];
          }
        });
      }
    });
    return rate;
  };

  const [tariffs, setTariffs] = useState<TariffUI[]>(cleanedUpTariffs);
  const [showInactive, setShowInactive] = useState<boolean>(true);

  const toggleTariff = (tariff: TariffUI) => {
    setTariffs(
      tariffs.map((t) => {
        if (t.code === tariff.code) {
          const newIsActive = !t.isActive;

          // If the tariff is being turned ON, turn off all exceptions
          if (newIsActive && t.exceptionTariffs?.length) {
            const updatedExceptionTariffs = t.exceptionTariffs.map((et) => ({
              ...et,
              isActive: false,
            }));

            return {
              ...t,
              isActive: newIsActive,
              exceptionTariffs: updatedExceptionTariffs,
            };
          }

          // If the tariff is being turned OFF, just toggle the tariff itself
          return {
            ...t,
            isActive: newIsActive,
          };
        }
        return t;
      })
    );
  };

  const toggleExceptionTariff = (exceptionTariff: TariffUI) => {
    setTariffs(
      tariffs.map((t) => {
        // Check if this tariff contains the clicked exception
        const hasClickedException = t.exceptionTariffs?.some(
          (et) => et.code === exceptionTariff.code
        );

        if (hasClickedException) {
          // First, update the exception tariffs
          const updatedExceptionTariffs = t.exceptionTariffs?.map((et) =>
            et.code === exceptionTariff.code
              ? { ...et, isActive: !et.isActive }
              : et
          );

          // Check if any exceptions are active after the toggle
          const hasActiveExceptions = updatedExceptionTariffs?.some(
            (et) => et.isActive
          );

          return {
            ...t,
            isActive: !hasActiveExceptions, // Parent is active only if no exceptions are active
            exceptionTariffs: updatedExceptionTariffs,
          };
        }

        return t;
      })
    );
  };

  console.log(tariffs);

  return (
    <div className="flex flex-col p-4 border-2 border-base-content/50 bg-base-300 rounded-md gap-8">
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
      {tariffs.map((tariff) => (
        <div className="w-full flex flex-col gap-4">
          <div
            key={tariff.code}
            className="w-full text-white font-bold flex gap-2 justify-between items-center"
          >
            <div className="flex gap-2 items-start">
              {tariff.requiresReview && (
                <input
                  type="checkbox"
                  checked={tariff.isActive}
                  className="checkbox checkbox-primary checkbox-sm"
                  onClick={() => toggleTariff(tariff)}
                />
              )}
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <TertiaryLabel
                    value={tariff.code}
                    color={Color.NEUTRAL_CONTENT}
                  />
                  {tariff.requiresReview && (
                    <TertiaryText value={"[Needs Review]"} />
                  )}
                </div>
                <PrimaryText value={tariff.name} color={Color.WHITE} />
              </div>
            </div>
            <p
              className={classNames(
                "shrink-0 min-w-32 text-right text-2xl lg:text-3xl",
                tariff.isActive
                  ? "text-primary"
                  : "line-through text-neutral-content"
              )}
            >
              {tariff.general}%
            </p>
          </div>

          {tariff.exceptionTariffs?.length > 0 &&
            tariff.exceptionTariffs.map(
              (exceptionTariff) =>
                (exceptionTariff.isActive || showInactive) && (
                  <div
                    key={exceptionTariff.code}
                    className="flex ml-6 justify-between items-center"
                  >
                    <div className="flex gap-2 items-center">
                      <div className="form-control">
                        <input
                          type="checkbox"
                          checked={exceptionTariff.isActive}
                          className="checkbox checkbox-primary checkbox-sm"
                          onClick={() => toggleExceptionTariff(exceptionTariff)}
                        />
                      </div>
                      <div className="flex flex-col text-white">
                        <div className="flex gap-2 items-center">
                          <TertiaryLabel
                            value={exceptionTariff.code}
                            color={Color.NEUTRAL_CONTENT}
                          />
                          {exceptionTariff.requiresReview && (
                            <TertiaryText value={"[Needs Review]"} />
                          )}
                        </div>

                        <PrimaryLabel
                          value={exceptionTariff.name}
                          color={Color.WHITE}
                        />
                      </div>
                    </div>
                    <p
                      className={classNames(
                        "shrink-0 min-w-32 text-right text-2xl lg:text-3xl font-bold",
                        exceptionTariff.isActive && "text-primary"
                      )}
                    >
                      {exceptionTariff.general}%
                    </p>
                  </div>
                )
            )}
        </div>
      ))}

      <hr className="border-base-content/50" />
      <div className="w-full flex justify-between items-center gap-2">
        <h2 className="text-white text-2xl font-bold">Total Rate</h2>
        <p className="text-5xl font-bold text-primary transition duration-100">
          {getRate(TariffColumn.GENERAL)}%
        </p>
      </div>
    </div>
  );
};
