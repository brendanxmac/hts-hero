import { useEffect, useState } from "react";
import {
  HtsElement,
  HtsLevelClassification,
  Tariff,
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
} from "../libs/hts";
import { LabelledLoader } from "./LabelledLoader";
import { PrimaryHeading } from "./PrimaryLabel";
import { TariffDetails } from "./TariffDetails";

interface Props {
  classificationProgression: HtsLevelClassification[];
}

export const TariffSection = ({ classificationProgression }: Props) => {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [temporaryTariffs, setTemporaryTariffs] = useState<TemporaryTariff[]>(
    []
  );

  // Determine if footnotes or not
  // getFootnotesForHtsElement
  // if (!generalFootnotes) show general as total, done
  // if (generalFootnotes.length === 1)
  //    if (simple) grab rate and combine with original
  //    if (complex) just show details...
  // if (generalFootnotes.length > 1)
  //    forEach ->
  //      if (simple) grab rate (DONT combine with total)
  //      if (complex) just show details...

  const getTemporaryTariffData = async () => {
    console.log(`*** Getting Temporary Tariff Data ***`);

    const selectionElementWithTariff = findFirstElementInProgressionWithTariff(
      classificationProgression
    );
    const tempTariffs = await getTemporaryTariffs(selectionElementWithTariff);
    console.log(`All Enriched Temp Tariffs`);
    console.log(tempTariffs);
    setTemporaryTariffs(tempTariffs);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    getTemporaryTariffData();
  }, []);

  return (
    <div className="col-span-full flex flex-col gap-5 mb-10">
      <SectionLabel value="Tariff (China to USA)" />

      <Cell>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <PrimaryHeading value="Total Tariff" />
            {temporaryTariffs.length ? (
              <button
                onClick={() => setShowDetails(!showDetails)}
                type="button"
                className="shrink-0 p-2 bg-neutral-700 h-6 rounded-md flex items-center justify-center text-sm text-neutral-400 hover:text-black hover:bg-neutral-200"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
            ) : undefined}
          </div>
          {/* TODO: calculate total based on all within */}
          <PrimaryInformation
            value={getBaseTariff(classificationProgression).rate}
          />
          {temporaryTariffs.length && showDetails ? (
            <TariffDetails
              htsElement={findFirstElementInProgressionWithTariff(
                classificationProgression
              )}
              temporaryTariffs={temporaryTariffs}
            />
          ) : undefined}
        </div>
      </Cell>

      {loading && (
        <div className="mt-3 min-w-full max-w-3xl col-span-full justify-items-center">
          <LabelledLoader text="" />
        </div>
      )}
    </div>
  );
};
