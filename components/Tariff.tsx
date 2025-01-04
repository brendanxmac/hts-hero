import { useEffect, useState } from "react";
import {
  HtsElement,
  HtsLevelClassification,
  TariffI,
  TemporaryTariff,
} from "../interfaces/hts";
import { Cell } from "./Cell";
import { PrimaryInformation } from "./PrimaryInformation";
import { SectionLabel } from "./SectionLabel";
import {
  getTemporaryTariffsForClassification,
  getTarrifForProgression,
  getGeneralFootnotes,
  isDirectHtsElementReference,
  getBaseTariff,
  getTemporaryTariffs,
  findFirstElementInProgressionWithTariff,
  extractPercentage,
  sumPercentages,
} from "../libs/hts";
import { LabelledLoader } from "./LabelledLoader";
import { PrimaryHeading } from "./PrimaryLabel";
import { TariffDetails } from "./TariffDetails";
import { Tariff } from "../interfaces/tariff";

interface Props {
  classificationProgression: HtsLevelClassification[];
}

export const TariffSection = ({ classificationProgression }: Props) => {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [tariff, setTariff] = useState<Tariff | undefined>(undefined);
  // const [totalTariff, setTotalTariff] = useState("");
  // const [temporaryTariffs, setTemporaryTariffs] = useState<TemporaryTariff[]>(
  //   []
  // );

  const getTariff = async () => {
    console.log(`*** Getting Tariff Data ***`);

    // const selectionElementWithTariff = findFirstElementInProgressionWithTariff(
    //   classificationProgression
    // );
    // const tempTariffs = await getTemporaryTariffs(selectionElementWithTariff);

    // console.log(`All Enriched Temp Tariffs`);
    // console.log(tempTariffs);

    const tariff = await Tariff.create(classificationProgression);
    setTariff(tariff);

    // setTemporaryTariffs(tempTariffs);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    getTariff();
  }, []);

  // useEffect(() => {
  //   let totalTariff = "";
  //   const baseTariff = getBaseTariff(classificationProgression).rate;

  //   if (temporaryTariffs.length === 0) {
  //     console.log(1);
  //     totalTariff = baseTariff;
  //   } else if (temporaryTariffs.length === 1 && temporaryTariffs[0].element) {
  //     const additionalRate = temporaryTariffs[0].element.general;
  //     const additionalPercentage = extractPercentage(additionalRate);
  //     const baseTariffIsCompound =
  //       baseTariff.includes("+") || baseTariff.toLowerCase().includes("plus");
  //     if (additionalPercentage && !baseTariffIsCompound) {
  //       console.log(2);
  //       const baseAsPercentage =
  //         baseTariff.toLowerCase() == "free" ? "0%" : baseTariff;
  //       // TODO: see about summing the %'s in simple cases...?
  //       totalTariff = sumPercentages(
  //         `${baseAsPercentage} + ${additionalPercentage}`
  //       );
  //     } else {
  //       console.log(3);
  //       if (
  //         additionalRate
  //           .toLowerCase()
  //           .includes("the duty provided in the applicable subheading + ")
  //       ) {
  //         const simplifiedAdittionalRate = additionalRate
  //           .toLowerCase()
  //           .split("the duty provided in the applicable subheading + ")[1];

  //         totalTariff = sumPercentages(
  //           `${baseTariff} + ${simplifiedAdittionalRate}`
  //         );
  //       } else {
  //         totalTariff = `${baseTariff} + ${additionalRate}`;
  //       }
  //     }
  //   } else {
  //     console.log(4);
  //     totalTariff = "Needs Review";
  //   }

  //   setTotalTariff(totalTariff);
  // }, [temporaryTariffs]);

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
