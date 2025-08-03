import { Color } from "../enums/style";
import { HtsElement } from "../interfaces/hts";
import { BaseTariffI } from "../libs/hts";
import { classNames } from "../utilities/style";
import { SecondaryText } from "./SecondaryText";
import { TertiaryLabel } from "./TertiaryLabel";
import { TertiaryText } from "./TertiaryText";

// export interface BaseTariffUI extends BaseTariff {
//   isActive: boolean;
// }

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
          "text-white font-bold flex gap-2 justify-between items-end border-b border-base-content/50"
        )}
      >
        <div className="flex gap-2 items-start">
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <TertiaryLabel value={htsElement.htsno} color={Color.PRIMARY} />
            </div>
            <SecondaryText
              value={`Base Tariff ${index + 1}`}
              color={Color.SECONDARY}
            />
          </div>
        </div>
        <p
          className={classNames(
            "shrink-0 min-w-32 text-right text-xl text-white"
          )}
        >
          {tariff.type === "percent" ? `${tariff.value}%` : tariff.raw}
        </p>
      </div>
    </div>
  );
};
