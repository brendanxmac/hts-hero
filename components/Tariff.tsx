import { Color } from "../enums/style";
import { TariffI } from "../public/tariffs/tariffs";
import { classNames } from "../utilities/style";
import { SecondaryText } from "./SecondaryText";
import { TertiaryLabel } from "./TertiaryLabel";
import { TertiaryText } from "./TertiaryText";

export interface TariffUI extends TariffI {
  exceptionTariffs?: TariffUI[];
  isActive: boolean;
}

interface Props {
  showInactive: boolean;
  exceptionLevel?: number;
  tariff: TariffUI;
  setIndex: number;
  tariffSets: Array<TariffUI[]>;
  setTariffSets: (tariffs: Array<TariffUI[]>) => void;
}

export const Tariff = ({
  exceptionLevel = 0,
  showInactive,
  tariff,
  setIndex,
  tariffSets,
  setTariffSets,
}: Props) => {
  // TODO: get column by using country and checking if in Other or Special
  // Recursive helper function to find and update a tariff by code
  const updateTariffRecursively = (
    tariffList: TariffUI[],
    targetCode: string,
    updateFn: (tariff: TariffUI) => TariffUI
  ): TariffUI[] => {
    return tariffList.map((t) => {
      if (t.code === targetCode) {
        return updateFn(t);
      }

      // Recursively update exception tariffs
      if (t.exceptionTariffs?.length) {
        return {
          ...t,
          exceptionTariffs: updateTariffRecursively(
            t.exceptionTariffs,
            targetCode,
            updateFn
          ),
        };
      }

      return t;
    });
  };

  // Recursive helper function to find a tariff by code
  const findTariffRecursively = (
    tariffList: TariffUI[],
    targetCode: string
  ): TariffUI | null => {
    for (const t of tariffList) {
      if (t.code === targetCode) {
        return t;
      }

      if (t.exceptionTariffs?.length) {
        const found = findTariffRecursively(t.exceptionTariffs, targetCode);
        if (found) return found;
      }
    }

    return null;
  };

  // Recursive helper function to find the parent tariff of a given exception
  const findParentTariff = (
    tariffList: TariffUI[],
    exceptionCode: string,
    parent: TariffUI | null = null
  ): { parent: TariffUI | null; path: TariffUI[] } => {
    for (const t of tariffList) {
      if (t.exceptionTariffs?.some((et) => et.code === exceptionCode)) {
        return { parent: t, path: parent ? [parent, t] : [t] };
      }

      if (t.exceptionTariffs?.length) {
        const result = findParentTariff(t.exceptionTariffs, exceptionCode, t);
        if (result.parent) {
          return {
            parent: result.parent,
            path: parent ? [parent, ...result.path] : result.path,
          };
        }
      }
    }

    return { parent: null, path: [] };
  };

  // Recursive helper function to turn off all exceptions of a tariff
  const turnOffAllExceptions = (tariff: TariffUI): TariffUI => {
    if (!tariff.exceptionTariffs?.length) {
      return tariff;
    }

    return {
      ...tariff,
      exceptionTariffs: tariff.exceptionTariffs.map((et) => ({
        ...turnOffAllExceptions(et),
        isActive: false,
      })),
    };
  };

  // Recursive helper function to check if any exceptions are active
  const hasActiveExceptions = (tariff: TariffUI): boolean => {
    if (!tariff.exceptionTariffs?.length) {
      return false;
    }

    return tariff.exceptionTariffs.some(
      (et) => et.isActive || hasActiveExceptions(et)
    );
  };

  const toggleTariff = (tariff: TariffUI) => {
    const updatedTariffSets = tariffSets.map((set, index) => {
      if (index === setIndex) {
        return updateTariffRecursively(set, tariff.code, (t) => {
          const newIsActive = !t.isActive;

          // If the tariff is being turned ON, turn off all exceptions recursively
          if (newIsActive) {
            return {
              ...turnOffAllExceptions(t),
              isActive: newIsActive,
            };
          }

          // If the tariff is being turned OFF, just toggle the tariff itself
          return {
            ...t,
            isActive: newIsActive,
          };
        });
      }
      return set;
    });

    setTariffSets(updatedTariffSets);
  };

  const toggleExceptionTariff = (exceptionTariff: TariffUI) => {
    // Find ALL tariffs with the same code across all tariff sets and toggle them
    const updatedTariffSets = tariffSets.map((set) => {
      // First, update all tariffs with the same code
      let updatedSet = updateTariffRecursively(
        set,
        exceptionTariff.code,
        (tariff) => {
          return { ...tariff, isActive: !tariff.isActive };
        }
      );

      // Then, find all parent tariffs that contain this exception and update them
      const allParents: TariffUI[] = [];
      const findParentsRecursively = (
        tariffList: TariffUI[],
        parent: TariffUI | null = null
      ) => {
        for (const t of tariffList) {
          if (
            t.exceptionTariffs?.some((et) => et.code === exceptionTariff.code)
          ) {
            allParents.push(t);
          }
          if (t.exceptionTariffs?.length) {
            findParentsRecursively(t.exceptionTariffs, t);
          }
        }
      };

      findParentsRecursively(updatedSet);

      // Update each parent tariff
      for (const parent of allParents) {
        updatedSet = updateTariffRecursively(
          updatedSet,
          parent.code,
          (parentTariff) => {
            // Check if any exceptions are active after the toggle
            const hasActiveExceptionsAfterToggle =
              parentTariff.exceptionTariffs?.some(
                (et) => et.isActive || hasActiveExceptions(et)
              );

            return {
              ...parentTariff,
              isActive: !hasActiveExceptionsAfterToggle, // Parent is active only if no exceptions are active
            };
          }
        );
      }

      return updatedSet;
    });

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
          {exceptionLevel > 0 && (
            <input
              type="checkbox"
              checked={tariff.isActive}
              className="checkbox checkbox-primary checkbox-sm"
              onChange={() =>
                exceptionLevel > 0
                  ? toggleExceptionTariff(tariff)
                  : toggleTariff(tariff)
              }
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

      {tariff.exceptionTariffs?.length > 0 &&
        tariff.exceptionTariffs.map(
          (exceptionTariff) =>
            (exceptionTariff.isActive ||
              hasActiveExceptions(exceptionTariff) ||
              showInactive) && (
              <Tariff
                key={exceptionTariff.code}
                exceptionLevel={exceptionLevel + 1}
                setIndex={setIndex}
                showInactive={showInactive}
                tariff={exceptionTariff}
                tariffSets={tariffSets}
                setTariffSets={setTariffSets}
              />
            )
        )}
    </div>
  );
};
