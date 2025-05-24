import { Cell } from "./Cell";
import { PrimaryLabel } from "./PrimaryLabel";
import { PrimaryText } from "./PrimaryText";
import { SectionLabel } from "./SectionLabel";

interface Props {
  htsCode: string;
}

export const ClassificationSection = ({ htsCode }: Props) => {
  return (
    <div className="col-span-full grid grid-cols-2 gap-3 mb-10">
      <div className="col-span-full">
        <SectionLabel value="Classification" />
      </div>

      <Cell>
        <div className="grid col-span-full gap-3">
          <div className="flex flex-col">
            <PrimaryLabel value="HTS Code" />
            <PrimaryText value={htsCode || ""} />
          </div>
        </div>
      </Cell>
    </div>
  );
};
