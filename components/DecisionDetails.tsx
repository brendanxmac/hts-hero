import { ArrowsPointingInIcon } from "@heroicons/react/20/solid";
import { Cell } from "./Cell";
import { CellLabel } from "./CellLabel";
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
        <CellLabel value={level} />

        <div className="flex justify-between gap-3 items-center">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-light">Options</h3>
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
              <h3 className="text-sm font-light">Reasoning</h3>
              <h4 className="text-sm font-bold">{reasoning}</h4>
            </div>
          </div>
          <button
            onClick={() => showDetails(false)}
            type="button"
            className="shrink-0 bg-neutral-700 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold hover:text-black hover:bg-white"
          >
            <ArrowsPointingInIcon
              className={"text-neutral-400 text-inherit h-5 w-5"}
            />
          </button>
        </div>
      </div>
    </Cell>
  );
};
