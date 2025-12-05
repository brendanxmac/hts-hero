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
    <div
      key={`${tariff.code}-${exceptionLevel}`}
      className={classNames(
        "flex gap-3 justify-between items-center py-3 px-4 rounded-xl transition-colors",
        tariff.isActive ? "bg-primary/10" : "bg-base-200/50",
        tariff.requiresReview && "hover:bg-base-200 cursor-pointer"
      )}
      onClick={() => {
        if (tariff.requiresReview) {
          toggleTariff(tariff);
        }
      }}
    >
      <div className="flex gap-3 items-center flex-1 min-w-0">
        <input
          type="checkbox"
          checked={tariff.isActive}
          disabled={
            !tariff.requiresReview ||
            hasExceptionTariffThatDoesNotNeedReviewThatIsActive
          }
          className="checkbox checkbox-primary checkbox-sm shrink-0"
          onChange={() => {
            if (tariff.requiresReview) {
              toggleTariff(tariff);
            }
          }}
        />

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex gap-2 items-center shrink-0">
              <Link
                href={`/explore?code=${tariff.code}`}
                target="_blank"
                className="link link-primary font-bold transition-colors"
              >
                {tariff.code}
              </Link>
              <span className="text-base-content/30">•</span>
            </div>
            <span
              className={classNames(
                "font-medium min-w-0 flex-1",
                tariff.isActive ? "text-base-content" : "text-base-content/70"
              )}
            >
              {tariff.name}
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 min-w-[100px] text-right">
        {tariff[column] === null ? (
          <span className="badge badge-warning font-semibold">
            Needs Review
          </span>
        ) : (
          <span
            className={classNames(
              "text-lg font-bold",
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
