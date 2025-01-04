import { useEffect, useState } from "react";
import { HtsLevelClassification } from "../interfaces/hts";
import { Cell } from "./Cell";
import { PrimaryInformation } from "./PrimaryInformation";
import { SectionLabel } from "./SectionLabel";
import { findFirstElementInProgressionWithTariff } from "../libs/hts";
import { LabelledLoader } from "./LabelledLoader";
import { PrimaryHeading } from "./PrimaryLabel";
import { TariffDetails } from "./TariffDetails";
import { Tariff } from "../app/classes/tariff";

interface Props {
  classificationProgression: HtsLevelClassification[];
}

export const TariffSection = ({ classificationProgression }: Props) => {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [tariff, setTariff] = useState<Tariff | undefined>(undefined);

  const getTariff = async () => {
    console.log(`*** Getting Tariff Data ***`);
    const tariff = await Tariff.create(classificationProgression);
    setTariff(tariff);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    getTariff();
  }, []);

  return (
    <div className="col-span-full flex flex-col gap-5 mb-10">
      <SectionLabel value="Tariff (China to USA)" />

      <Cell>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <PrimaryHeading value="Total Tariff" />
            {tariff && tariff.temporaryAdjustments.length ? (
              <button
                onClick={() => setShowDetails(!showDetails)}
                type="button"
                className="shrink-0 p-2 bg-neutral-700 h-6 rounded-md flex items-center justify-center text-sm text-neutral-400 hover:text-black hover:bg-neutral-200"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
            ) : undefined}
          </div>

          {tariff && !loading && (
            <>
              <PrimaryInformation value={tariff.getTotal()} />
              {tariff.temporaryAdjustments.length && showDetails ? (
                <TariffDetails
                  htsElement={findFirstElementInProgressionWithTariff(
                    classificationProgression
                  )}
                  temporaryTariffs={tariff.temporaryAdjustments}
                />
              ) : undefined}
            </>
          )}

          {loading && (
            <div className="my-3 min-w-full max-w-3xl col-span-full">
              <LabelledLoader text="" />
            </div>
          )}
        </div>
      </Cell>
    </div>
  );
};
