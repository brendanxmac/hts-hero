import { useEffect, useState } from "react";
import { HtsLevelDecision } from "../interfaces/hts";
import { Cell } from "./Cell";
import { PrimaryInformation } from "./PrimaryInformation";
import { SectionLabel } from "./SectionLabel";
import { getTariffReferences, getTarrifForProgression } from "../libs/hts";
import { LabelledLoader } from "./LabelledLoader";

interface Props {
  decisionProgression: HtsLevelDecision[];
}

interface Tariff {
  htsCode: string;
  value: string;
  isTemporary: boolean;
}

export const TariffSection = ({ decisionProgression }: Props) => {
  const [loading, setLoading] = useState(false);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [footnotes, setFootnotes] = useState("");
  const getTariffData = async () => {
    console.log(`*** Getting Tariff Data ***`);
    const footnotes = await getTariffReferences(decisionProgression);
    setTariffs({ ...tariffs });
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    getTariffData();
  }, []);

  return (
    <div className="col-span-full grid grid-cols-2 gap-3 mb-10">
      <div className="col-span-full">
        <SectionLabel value="Tariff (China to USA)" />
      </div>

      <Cell>
        <PrimaryInformation
          label="General"
          value={getTarrifForProgression(decisionProgression)}
        />
      </Cell>

      <Cell>
        <PrimaryInformation
          label="Tariff Footnotes"
          value={"Testing value testing value testing value"}
        />
      </Cell>

      {footnotes && (
        <Cell>
          <PrimaryInformation label="Tariff Footnotes" value={footnotes} />
        </Cell>
      )}

      {loading && (
        <div className="mt-3 min-w-full max-w-3xl col-span-full justify-items-center">
          <LabelledLoader text="" />
        </div>
      )}
    </div>
  );
};
