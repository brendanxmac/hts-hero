import { Color } from "../enums/style";
import { HtsElement } from "../interfaces/hts";
import { BaseTariffI } from "../libs/hts";
import { classNames } from "../utilities/style";
import { PrimaryLabel } from "./PrimaryLabel";
import { SecondaryText } from "./SecondaryText";
import { TertiaryLabel } from "./TertiaryLabel";

interface Props {
  index: number;
  htsElement: HtsElement;
  tariff: BaseTariffI;
}

export const BaseTariff = ({ index, htsElement, tariff }: Props) => {
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
          <SecondaryText
            value={`${tariff.type === "percent" ? "Ad Valorem Duty" : "Quantity Duty"}`}
            color={Color.WHITE}
          />
        </div>
        <PrimaryLabel
          value={tariff.type === "percent" ? `${tariff.value}%` : tariff.raw}
          // TODO: might need to make this dynamic based on if it applies due to certain cases?
          color={Color.WHITE}
        />
      </div>
    </div>
  );
};
