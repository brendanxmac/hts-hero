import { HtsElement, TemporaryTariff } from "../interfaces/hts";
import { stripTrailingPeriods } from "../utilities/data";
import { SecondaryInformation } from "./SecondaryInformation";
import { SecondaryLabel } from "./SecondaryLabel";

interface Props {
  htsElement: HtsElement;
  temporaryTariffs: TemporaryTariff[];
}

export const TariffDetails = ({ htsElement, temporaryTariffs }: Props) => {
  const moreThanOneTemporary = temporaryTariffs.length > 1;
  const temporaryGroupLabel = moreThanOneTemporary
    ? "Temporary Rates"
    : "Temporary Rate";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <SecondaryLabel value="Standard Rate" />
        <SecondaryInformation value={htsElement.general} />
      </div>
      <div className="flex flex-col gap-2">
        <SecondaryLabel value={temporaryGroupLabel} />
        <div className="flex flex-col gap-4">
          {temporaryTariffs.map((tariff, i) => (
            <div key={i} className="flex flex-col gap-1">
              <SecondaryInformation
                value={stripTrailingPeriods(tariff.description)}
              />
              {tariff.element && (
                <div className="pl-3 border-l-2 border-neutral-600">
                  {/* TODO: make component for this? */}
                  <p className="text-neutral-600 text-sm md:text-base">
                    {tariff.element.htsno}
                  </p>
                  <p className="text-[#40C969] font-bold text-sm md:text-base">
                    {tariff.element.general}
                  </p>
                  {/* TODO: consider adding this back in for detail purposes */}
                  {/* <TertiaryInformation value={tariff.element.description} /> */}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
