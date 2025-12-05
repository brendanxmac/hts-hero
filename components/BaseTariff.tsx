import { HtsElement } from "../interfaces/hts";
import { BaseTariffI } from "../libs/hts";
import { classNames } from "../utilities/style";
import { SpecialPrograms } from "./SpecialPrograms";

interface Props {
  index: number;
  htsElement: HtsElement;
  tariff: BaseTariffI;
  active: boolean;
}

export const BaseTariff = ({
  index,
  htsElement,
  tariff,
  active = true,
}: Props) => {
  const primaryText =
    tariff.value === null && tariff.details
      ? tariff.details
      : tariff.type === "percent"
        ? `Ad Valorem`
        : `Quantity`;
  // FIXME: at some point, filter out the country based "See" ones so that they don't cause noise here
  const reviewText = tariff.value === null ? "Needs Review" : "";
  const valueText = tariff.type === "percent" ? `${tariff.value}%` : tariff.raw;

  return (
    <div
      key={`${htsElement.htsno}-${tariff.raw}-${index}`}
      className={classNames(
        "flex gap-3 justify-between items-center py-3 px-4 rounded-xl transition-colors bg-base-200/50",
        active ? "" : "opacity-60"
      )}
    >
      <div className="flex flex-col gap-2 items-start flex-1 min-w-0">
        <div className="flex gap-3 items-center flex-wrap">
          <input
            type="checkbox"
            checked
            disabled
            className="checkbox checkbox-primary checkbox-sm shrink-0"
          />
          <div className="flex gap-2 items-center flex-wrap">
            <span
              className={classNames(
                "font-bold",
                active ? "text-base-content" : "text-base-content/60"
              )}
            >
              {htsElement.htsno}
            </span>
            <span className="text-base-content/30">•</span>
            <span
              className={classNames(
                "font-medium text-base-content/70",
                !active && "text-base-content/50"
              )}
            >
              General Duty: {primaryText}
            </span>
          </div>
        </div>

        {tariff.programs && tariff.programs.length > 0 && (
          <div className="ml-9">
            <SpecialPrograms programs={tariff.programs} />
          </div>
        )}
      </div>

      <div className="shrink-0 min-w-[100px] text-right">
        {reviewText ? (
          <span className="badge badge-warning font-semibold">
            {reviewText}
          </span>
        ) : (
          <span
            className={classNames(
              "text-lg font-bold",
              active ? "text-primary" : "line-through text-base-content/40"
            )}
          >
            {valueText}
          </span>
        )}
      </div>
    </div>
  );
};
