import { HtsElement } from "../interfaces/hts";
import { BaseTariffI } from "../libs/hts";
import { classNames } from "../utilities/style";
import { TertiaryLabel } from "./TertiaryLabel";
import { SpecialPrograms } from "./SpecialPrograms";
import { TertiaryText } from "./TertiaryText";
import { Color } from "../enums/style";

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
    <div className="w-full flex flex-col gap-2">
      <div
        key={`${htsElement.htsno}-${tariff.raw}-${index}`}
        className={classNames(
          "flex gap-2 justify-between items-end border-b border-base-content/20"
        )}
      >
        <div className="flex flex-col gap-2 items-start">
          <div className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked
              disabled
              className="checkbox checkbox-primary checkbox-xs"
            />
            <div className="flex gap-2 items-center">
              <TertiaryText
                value={htsElement.htsno}
                color={active ? Color.WHITE : Color.NEUTRAL_CONTENT}
              />
              -
              <TertiaryLabel
                value={`General Duty: ${primaryText}`}
                color={active ? Color.WHITE : Color.NEUTRAL_CONTENT}
              />
            </div>
          </div>

          <div className="flex gap-2">
            {tariff.programs && tariff.programs.length > 0 && (
              <SpecialPrograms programs={tariff.programs} />
            )}
          </div>
        </div>
        {reviewText ? (
          <TertiaryLabel value={reviewText} color={Color.WHITE} />
        ) : (
          <p
            className={classNames(
              "shrink-0 min-w-32 text-right text-base",
              active ? "font-bold" : "line-through text-neutral-content"
            )}
          >
            {valueText}
          </p>
        )}
      </div>
    </div>
  );
};
