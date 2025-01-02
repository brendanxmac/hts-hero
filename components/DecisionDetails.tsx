import { Cell } from "./Cell";
import { PrimaryHeading } from "./CellLabel";
import { HtsLevelDecision } from "../interfaces/hts";
import { SelectionCandidate } from "./SelectionCandidate";
import { Dispatch, SetStateAction } from "react";

interface Props {
  decision: HtsLevelDecision;
  showDetails: Dispatch<SetStateAction<boolean>>;
}

export const DecisionDetails = ({ decision, showDetails }: Props) => {
  const { candidates, level, reasoning, selection } = decision;
  return (
    <Cell>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <PrimaryHeading value={level} />
          <button
            onClick={() => showDetails(false)}
            type="button"
            className="shrink-0 p-2 bg-neutral-700 h-6 rounded-md flex items-center justify-center text-sm text-neutral-400 hover:text-black hover:bg-neutral-200"
          >
            Hide Details
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-white font-bold text-xl md:text-2xl">
            {selection.htsno}
          </h2>
          <h3 className="text-white text-sm md:text-base">
            {selection.description}
          </h3>
        </div>

        <div className="flex justify-between gap-3 items-center mt-2">
          <div className="flex flex-col gap-3">
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
              <h4 className="text-sm">{reasoning}</h4>
            </div>
          </div>
        </div>
      </div>
    </Cell>
  );
};
