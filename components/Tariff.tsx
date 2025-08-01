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
  return (
    <div className="w-full flex flex-col gap-4">
      <div
        key={tariff.code}
        className={classNames(
          "text-white font-bold flex gap-2 justify-between items-center",
          exceptionLevel && `ml-${6 * exceptionLevel}`
        )}
      >
        <div className="flex gap-2 items-start">
          {tariff.requiresReview && (
            <input
              type="checkbox"
              checked={tariff.isActive}
              className="checkbox checkbox-primary checkbox-sm"
              onClick={() =>
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
