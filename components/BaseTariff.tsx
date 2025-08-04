import { Color } from "../enums/style";
import { HtsElement } from "../interfaces/hts";
import { BaseTariffI } from "../libs/hts";
import { classNames } from "../utilities/style";
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
          "text-white font-bold flex gap-2 justify-between items-end border-b border-base-content/50"
        )}
      >
        <div className="flex gap-2 items-start">
          <TertiaryLabel value={htsElement.htsno} color={Color.ACCENT} />
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
