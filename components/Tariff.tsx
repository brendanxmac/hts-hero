import { Color } from "../enums/style";
import { TariffI } from "../public/tariffs/tariffs";
import { classNames } from "../utilities/style";
import { PrimaryText } from "./PrimaryText";
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
  tariffs: TariffUI[];
  setTariffs: (tariffs: TariffUI[]) => void;
}

export const Tariff = ({
  exceptionLevel = 0,
  showInactive,
  tariff,
  tariffs,
  setTariffs,
}: Props) => {
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
    setTariffs(
      updateTariffRecursively(tariffs, tariff.code, (t) => {
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
      })
    );
  };

  const toggleExceptionTariff = (exceptionTariff: TariffUI) => {
    // Find the parent tariff that contains this exception
    const { parent, path } = findParentTariff(tariffs, exceptionTariff.code);

    if (!parent) {
      return; // Should not happen, but safety check
    }

    setTariffs(
      updateTariffRecursively(tariffs, parent.code, (parentTariff) => {
        // Update the specific exception tariff
        const updatedExceptionTariffs = parentTariff.exceptionTariffs?.map(
          (et) => {
            if (et.code === exceptionTariff.code) {
              return { ...et, isActive: !et.isActive };
            }
            return et;
          }
        );

        // Check if any exceptions are active after the toggle
        const hasActiveExceptionsAfterToggle = updatedExceptionTariffs?.some(
          (et) => et.isActive || hasActiveExceptions(et)
        );

        return {
          ...parentTariff,
          isActive: !hasActiveExceptionsAfterToggle, // Parent is active only if no exceptions are active
          exceptionTariffs: updatedExceptionTariffs,
        };
      })
    );
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
    <div className="w-full flex flex-col gap-4">
      <div
        key={`${tariff.code}-${exceptionLevel}`}
        className={classNames(
          "text-white font-bold flex gap-2 justify-between items-center",
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
              <Tariff
                key={exceptionTariff.code}
                exceptionLevel={exceptionLevel + 1}
                showInactive={showInactive}
                tariff={exceptionTariff}
                tariffs={tariffs}
                setTariffs={setTariffs}
              />
            )
        )}
    </div>
  );
};
