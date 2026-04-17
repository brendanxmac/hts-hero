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

    const tariffInSet = tariffSet.tariffs.find((t) => t.code === tariff.code);
    if (tariffInSet) {
      tariffInSet.isActive = toggledValue;
    }

    const isNullTariff =
      tariff.general === null &&
      tariff.special === null &&
      tariff.other === null;
    const skipCascade = toggledValue && tariff.requiresReview && isNullTariff;

    if (!skipCascade) {
      let changed = true;
      let iterations = 0;
      const maxIterations = 10;

      while (changed && iterations < maxIterations) {
        changed = false;
        iterations++;

        for (const t of tariffSet.tariffs) {
          if (t.code === tariff.code) continue;

          let newActive: boolean;
          if (t.requiresReview) {
            const hasActiveException = t.exceptions?.some((exCode) =>
              tariffSet.tariffs.some((et) => et.code === exCode && et.isActive)
            ) ?? false;
            newActive = hasActiveException ? false : t.isActive;
          } else {
            newActive = tariffIsActive(t, tariffSet.tariffs);
          }
          if (t.isActive !== newActive) {
            t.isActive = newActive;
            changed = true;
          }
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

    setCountries(updatedCountries);
  };

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
    <div
      key={`${tariff.code}-${exceptionLevel}`}
      className={classNames(
        "flex gap-2 sm:gap-3 justify-between items-start sm:items-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition-colors",
        tariff.isActive ? "bg-primary/10" : "bg-base-200/50",
        tariff.requiresReview && !tariff.isActive && "hover:bg-base-200",
        tariff.requiresReview && "cursor-pointer",
      )}
      onClick={() => {
        if (tariff.requiresReview) {
          toggleTariff(tariff);
        }
      }}
    >
      <div className="flex gap-2 sm:gap-3 items-start sm:items-center flex-1 min-w-0">
        <input
          type="radio"
          checked={tariff.isActive}
          disabled={
            !tariff.requiresReview ||
            hasExceptionTariffThatDoesNotNeedReviewThatIsActive
          }
          className={classNames(
            "radio radio-primary radio-sm shrink-0 mt-0.5 sm:mt-0",
            tariff.requiresReview &&
            !hasExceptionTariffThatDoesNotNeedReviewThatIsActive &&
            "cursor-pointer"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (
              tariff.requiresReview &&
              !hasExceptionTariffThatDoesNotNeedReviewThatIsActive
            ) {
              toggleTariff(tariff);
            }
          }}
          onChange={() => { }}
        />

        <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
          <div className="flex gap-1.5 sm:gap-2 items-start sm:items-center flex-wrap md:flex-nowrap">
            <div className="flex gap-1.5 sm:gap-2 items-center shrink-0">
              <Link
                href={`/explore?code=${tariff.code}`}
                target="_blank"
                className="link link-primary font-bold text-sm sm:text-base transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {tariff.code}
              </Link>
              <span className="text-base-content/30 hidden sm:inline">•</span>
            </div>
            <span
              className={classNames(
                "font-medium min-w-0 text-sm sm:text-base text-base-content",
                ((!tariff.requiresReview ||
                  hasExceptionTariffThatDoesNotNeedReviewThatIsActive) && !tariff.isActive) && "text-base-content/30"
              )}
            >
              {tariff.name}
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 text-right">
        {tariff[column] === null ? (
          <span className="badge badge-warning badge-sm sm:badge-md font-semibold">
            Needs Review
          </span>
        ) : (
          <span
            className={classNames(
              "text-base sm:text-lg font-bold",
              tariff.isActive
                ? "text-primary"
                : "line-through text-base-content/40"
            )}
          >
            {tariff[column]}%
          </span>
        )}
      </div>
    </div>
  );
};
