import { ClassificationProgression } from "../interfaces/hts";
import { Decision } from "./Decision";
import { SectionLabel } from "./SectionLabel";

interface Props {
  decisionProgression: ClassificationProgression[];
}

export const DecisionProgression = ({ decisionProgression }: Props) => {
  return (
    <div className="w-full max-w-4xl col-span-full">
      <SectionLabel value="Classification" />
      <div className="my-3 col-span-full grid gap-2">
        {decisionProgression.map((decision, i) => {
          return <Decision key={i} {...decision} />;
        })}
      </div>
    </div>
  );
};
