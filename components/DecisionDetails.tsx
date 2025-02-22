import { HtsLevelClassification } from "../interfaces/hts";
import { SelectionCandidate } from "./SelectionCandidate";

interface Props {
  decision: HtsLevelClassification;
}

export const DecisionDetails = ({ decision }: Props) => {
  const { candidates, reasoning, selection } = decision;
  return (
    <div className="flex flex-col gap-3 mt-3">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm text-neutral-400 font-bold">Options</h3>
        <div className="flex flex-col gap-2">
          {candidates.map(({ htsno, description }, i) => (
            <SelectionCandidate
              key={i}
              code={htsno}
              description={description}
              selected={description === selection.description}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm text-neutral-400 font-bold">Reasoning</h3>
        <h4 className="text-sm whitespace-pre-line">{reasoning}</h4>
      </div>
    </div>
  );
};
