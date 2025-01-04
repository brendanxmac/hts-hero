import { HtsElement, TemporaryTariff } from "../interfaces/hts";
import { SecondaryInformation } from "./SecondaryInformation";
import { SecondaryLabel } from "./SecondaryLabel";
import { TertiaryInformation } from "./TertiaryInformation";

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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <SecondaryLabel value="Standard Rate" />
        <SecondaryInformation value={htsElement.general} />
        {/* TODO: See if need to parse this.. */}
      </div>
      <div className="flex flex-col gap-3">
        <SecondaryLabel value={temporaryGroupLabel} />
        <div className="flex flex-col gap-4">
          {temporaryTariffs.map((tariff, i) => (
            <div key={i} className="flex flex-col gap-1">
              <SecondaryInformation value={tariff.description} />
              {tariff.element && (
                <div className="pl-3 border-l-2 border-neutral-600">
                  <p className="text-[#40C969] font-bold text-sm md:text-base">
                    {tariff.element.general}
                  </p>
                  <TertiaryInformation value={tariff.element.description} />
                  {/* <TertiaryInformation value={tariff.element.general} /> */}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
