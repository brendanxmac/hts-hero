import { ArrowsPointingOutIcon } from "@heroicons/react/20/solid";
import { HtsLevel } from "../enums/hts";
import { Cell } from "./Cell";
import { CellLabel } from "./CellLabel";
import { Dispatch, SetStateAction } from "react";

interface Props {
  level: HtsLevel;
  code: string;
  description: string;
  showDetails: Dispatch<SetStateAction<boolean>>;
}

export const DecisionSummary = ({
  level,
  code,
  description,
  showDetails,
}: Props) => {
  return (
    <Cell>
      <div className="flex flex-col gap-2">
        <CellLabel value={level} />
        <div className="flex justify-between gap-3 items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-white font-bold text-xl md:text-2xl">
              {code || "Secondary Qualifier..."}
            </h2>
            <h3 className="text-white text-sm md:text-base">{description}</h3>
          </div>
          <button
            onClick={() => showDetails(true)}
            type="button"
            className="shrink-0 bg-neutral-700 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold hover:text-black hover:bg-white"
          >
            <ArrowsPointingOutIcon
              className={"text-neutral-400 text-inherit h-5 w-5"}
            />
          </button>
        </div>
      </div>
    </Cell>
  );
};
