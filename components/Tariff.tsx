import { Color } from "../enums/style";
import { UITariff, TariffSet } from "../interfaces/tariffs";
import {
  isAncestorTariff,
  isDescendantTariff,
  tariffIsActive,
} from "../public/tariffs/tariffs";
import { classNames } from "../utilities/style";

import { SecondaryText } from "./SecondaryText";
import { TertiaryLabel } from "./TertiaryLabel";
import { TertiaryText } from "./TertiaryText";

interface Props {
  showInactive: boolean;
  exceptionLevel?: number;
  tariff: UITariff;
  setIndex: number;
  tariffSets: TariffSet[];
  setTariffSets: (tariffs: TariffSet[]) => void;
  renderedCodes?: Set<string>;
}

export const Tariff = ({
  exceptionLevel = 0,
  showInactive,
  tariff,
  setIndex,
  tariffSets,
  setTariffSets,
  renderedCodes = new Set(),
}: Props) => {
  if (renderedCodes.has(tariff.code)) {
    return null;
  }

  renderedCodes.add(tariff.code);

  const toggleTariff = (tariff: UITariff) => {
    const set = tariffSets[setIndex];
    const toggledValue = !tariff.isActive;

    for (const t of set.tariffs) {
      if (t.code === tariff.code) {
        t.isActive = toggledValue;
        continue;
      }

      if (
        isAncestorTariff(t, tariff, set.tariffs) ||
        isDescendantTariff(t, tariff, set.tariffs)
      ) {
        if (toggledValue) {
          t.isActive = false;
          continue;
        } else if (!t.requiresReview) {
          t.isActive = tariffIsActive(t, set.tariffs);
        }
      }
    }

    // call setTariffSets and update the given set within it while keeping all other sets the same
    const updatedTariffSets = [...tariffSets];
    updatedTariffSets[setIndex] = set;

    setTariffSets(updatedTariffSets);
  };

  // Map exception levels to Tailwind margin classes
  const marginClasses: Record<number, string> = {
    0: "",
    1: "ml-6",
    2: "ml-12",
    3: "ml-18",
    4: "ml-24",
    5: "ml-30",
  };

  const marginClass = marginClasses[exceptionLevel] || "";

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        key={`${tariff.code}-${exceptionLevel}`}
        className={classNames(
          "text-white flex gap-2 justify-between items-end border-b border-base-content/50",
          marginClass
        )}
      >
        <div className="flex gap-2 items-start">
          {exceptionLevel > 0 && tariff.requiresReview && (
            <input
              type="checkbox"
              checked={tariff.isActive}
              className="checkbox checkbox-primary checkbox-sm"
              onChange={() => {
                if (exceptionLevel > 0) {
                  toggleTariff(tariff);
                }
              }}
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
            <SecondaryText value={tariff.name} color={Color.WHITE} />
          </div>
        </div>
        <p
          className={classNames(
            "shrink-0 min-w-32 text-right text-xl",
            tariff.isActive
              ? "text-white font-bold"
              : "line-through text-neutral-content"
          )}
        >
          {tariff.general}%
        </p>
      </div>

      {tariff.exceptions?.length > 0 &&
        tariff.exceptions
          .map((e) => tariffSets[setIndex].tariffs.find((t) => t.code === e))
          .filter(Boolean)
          .map(
            (exceptionTariff) =>
              (exceptionTariff.isActive || showInactive) && (
                <Tariff
                  key={exceptionTariff.code}
                  exceptionLevel={exceptionLevel + 1}
                  setIndex={setIndex}
                  showInactive={showInactive}
                  tariff={exceptionTariff}
                  tariffSets={tariffSets}
                  setTariffSets={setTariffSets}
                  renderedCodes={renderedCodes}
                />
              )
          )}
    </div>
  );
};
