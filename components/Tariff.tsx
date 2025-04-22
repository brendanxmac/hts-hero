import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { HtsLevelClassification } from "../interfaces/hts";
import { Cell } from "./Cell";
import { PrimaryText } from "./PrimaryText";
import { SectionLabel } from "./SectionLabel";
import { findFirstElementInProgressionWithTariff } from "../libs/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { TariffDetails } from "./TariffDetails";
import { Tariff } from "../app/classes/tariff";
import { TariffSummary } from "./TariffSummary";

interface Props {
  classificationProgression: HtsLevelClassification[];
  setUpdateScrollHeight: Dispatch<SetStateAction<number>>;
}

export const TariffSection = ({
  classificationProgression,
  setUpdateScrollHeight,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [tariff, setTariff] = useState<Tariff | undefined>(undefined);

  const getTariff = async () => {
    const tariff = await Tariff.create(classificationProgression);
    setTariff(tariff);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    getTariff();
  }, []);

  useEffect(() => {
    setUpdateScrollHeight(Math.random());
  }, [tariff, showDetails]);

  return (
    <div className="col-span-full flex flex-col gap-5">
      <SectionLabel value="Tariff (China to USA)" />

      <Cell>
        <div className="flex flex-col gap-3">
          <TariffSummary
            tariff={tariff}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
          />

          {tariff && !loading && (
            <>
              <PrimaryText value={tariff.getTotal()} />
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
              <LoadingIndicator />
            </div>
          )}
        </div>
      </Cell>
    </div>
  );
};
