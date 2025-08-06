import { Color } from "../enums/style";
import { HtsElement } from "../interfaces/hts";
import { BaseTariffI } from "../libs/hts";
import { classNames } from "../utilities/style";
import { PrimaryLabel } from "./PrimaryLabel";
import { SecondaryText } from "./SecondaryText";
import { TertiaryLabel } from "./TertiaryLabel";
import { SpecialPrograms } from "./SpecialPrograms";

interface Props {
  index: number;
  htsElement: HtsElement;
  tariff: BaseTariffI;
}

export const BaseTariff = ({ index, htsElement, tariff }: Props) => {
  const primaryText =
    tariff.value === null && tariff.details
      ? tariff.details
      : tariff.type === "percent"
        ? `Ad Valorem Duty`
        : `Quantity Duty`;
  // FIXME: at some point, filter out the country based "See" ones so that they don't cause noise here
  const reviewText = tariff.value === null ? "Needs Review" : "";
  const valueText = tariff.type === "percent" ? `${tariff.value}%` : tariff.raw;
  return (
    <div className="w-full flex flex-col gap-2">
      <div
        key={`${htsElement.htsno}-${tariff.raw}-${index}`}
        className={classNames(
          "text-white flex gap-2 justify-between items-end border-b border-base-content/50"
        )}
      >
        <div className="flex flex-col gap-2 items-start">
          <TertiaryLabel value={htsElement.htsno} />

          <div className="flex flex-col">
            <SecondaryText value={primaryText} color={Color.WHITE} />
            {tariff.programs && tariff.programs.length > 0 && (
              <SpecialPrograms programs={tariff.programs} />
            )}
          </div>
        </div>
        {reviewText ? (
          <TertiaryLabel value={reviewText} />
        ) : (
          <PrimaryLabel
            value={valueText}
            // TODO: might need to make this dynamic based on if it applies due to certain cases?
            color={Color.WHITE}
          />
        )}
      </div>
    </div>
  );
};
