import { UITariff, TariffSet } from "../interfaces/tariffs";
import {
  CountryWithTariffs,
  getTariffsByCode,
  isAncestorTariff,
  isDescendantTariff,
  tariffIsActive,
} from "../tariffs/tariffs";
import { classNames } from "../utilities/style";
import { TariffColumn } from "../enums/tariff";
import Link from "next/link";
import { TertiaryLabel } from "./TertiaryLabel";
import { Color } from "../enums/style";

interface Props {
  showInactive: boolean;
  exceptionLevel?: number;
  tariff: UITariff;
  setIndex: number;
  tariffSets: TariffSet[];
  // setTariffSets: (tariffs: TariffSet[]) => void;
  countryIndex: number;
  countries: CountryWithTariffs[];
  setCountries: (countries: CountryWithTariffs[]) => void;
  renderedCodes?: Set<string>;
  column: TariffColumn;
}

export const Tariff = ({
  exceptionLevel = 0,
  showInactive,
  tariff,
  setIndex,
  tariffSets,
  countryIndex,
  countries,
  setCountries,
  // setTariffSets,
  renderedCodes = new Set(),
  column,
}: Props) => {
  if (renderedCodes.has(tariff.code)) {
    return null;
  }

  renderedCodes.add(tariff.code);

  const toggleTariff = (tariff: UITariff) => {
    const tariffSet = tariffSets[setIndex];
    const toggledValue = !tariff.isActive;

    for (const t of tariffSet.tariffs) {
      if (t.code === tariff.code) {
        t.isActive = toggledValue;
        continue;
      }

      if (
        isAncestorTariff(t, tariff, tariffSet.tariffs) ||
        isDescendantTariff(t, tariff, tariffSet.tariffs)
      ) {
        if (toggledValue) {
          // TODO: I think this is missing additionalDuties?
          const isNullTariff =
            tariff.general === null &&
            tariff.special === null &&
            tariff.other === null;

          // For certain special tariffs that need review and have null for their %'s
          // we do not want to toggle parents or descendants because they don't actually
          // turn anything on or off, just alter the VALUE of what's tariffs (e.g. NON US Content)
          if (tariff.requiresReview && isNullTariff) {
            continue;
          } else {
            t.isActive = false;
            continue;
          }
        } else if (!t.requiresReview) {
          t.isActive = tariffIsActive(t, tariffSet.tariffs);
        }
      }
    }

    // call setTariffSets and update the given set within it while keeping all other sets the same
    const updatedTariffSets = [...tariffSets];
    updatedTariffSets[setIndex] = tariffSet;

    const updatedCountries = [...countries];
    updatedCountries[countryIndex] = {
      ...countries[countryIndex],
      tariffSets: updatedTariffSets,
    };

    // setTariffSets(updatedTariffSets);
    setCountries(updatedCountries);
  };

  // Map exception levels to Tailwind margin classes
  // const marginClasses: Record<number, string> = {
  //   0: "",
  //   1: "ml-6",
  //   2: "ml-12",
  //   3: "ml-18",
  //   4: "ml-24",
  //   5: "ml-30",
  // };

  // const marginClass = marginClasses[exceptionLevel] || "";
  const exceptions = getTariffsByCode(tariff.exceptions || []);
  const exceptionsThatDontNeedReview = exceptions.filter(
    (e) => !e.requiresReview
  );
  const applicableExceptionsThatDontNeedReview = getTariffsByCode(
    Array.from(tariffSets[setIndex].exceptionCodes).filter((e) =>
      exceptionsThatDontNeedReview.some((t) => t.code === e)
    )
  );

  const hasExceptionTariffThatDoesNotNeedReviewThatIsActive =
    applicableExceptionsThatDontNeedReview
      .filter(Boolean)
      .some((e) => tariffIsActive(e, tariffSets[setIndex].tariffs));

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        key={`${tariff.code}-${exceptionLevel}`}
        className={classNames(
          "text-white flex gap-2 justify-between items-end border-b border-base-content/20"
          // !tariff.isActive && !showInactive && "hidden"
        )}
      >
        <div className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={tariff.isActive}
            disabled={
              !tariff.requiresReview ||
              hasExceptionTariffThatDoesNotNeedReviewThatIsActive
            }
            className="checkbox checkbox-primary checkbox-xs"
            onChange={() => {
              if (tariff.requiresReview) {
                toggleTariff(tariff);
              }
            }}
          />

          <div className="flex flex-col gap-1 py-0.5">
            <div className="flex gap-2 items-center">
              <Link
                href={`/explore?code=${tariff.code}`}
                target="_blank"
                className="link link-primary no-underline font-medium"
              >
                {tariff.code}
              </Link>
              -
              <TertiaryLabel
                value={tariff.name}
                color={tariff.isActive ? Color.WHITE : Color.NEUTRAL_CONTENT}
              />
            </div>
          </div>
        </div>
        <p
          className={classNames(
            "shrink-0 min-w-32 text-right text-base",
            tariff.isActive
              ? "text-white font-bold"
              : tariff[column] === null
                ? "text-neutral-content"
                : "line-through text-neutral-content"
          )}
        >
          {tariff[column] === null ? "Needs Review" : `${tariff[column]}%`}
        </p>
      </div>

      {/* {tariff.exceptions?.length > 0 &&
        tariff.exceptions
          .map((e) => tariffSets[setIndex].tariffs.find((t) => t.code === e))
          .filter(Boolean)
          .map((exceptionTariff) => (
            <Tariff
              key={exceptionTariff.code}
              exceptionLevel={exceptionLevel + 1}
              setIndex={setIndex}
              showInactive={showInactive}
              tariff={exceptionTariff}
              tariffSets={tariffSets}
              // setTariffSets={setTariffSets}
              renderedCodes={renderedCodes}
              column={column}
              countryIndex={countryIndex}
              countries={countries}
              setCountries={setCountries}
            />
          ))} */}
    </div>
  );
};
