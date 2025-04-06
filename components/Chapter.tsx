import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { HtsSectionAndChapterBase } from "../interfaces/hts";
import { SecondaryInformation } from "./SecondaryInformation";
import { useState } from "react";
import { Cell } from "./Cell";

interface Props {
  chapter: HtsSectionAndChapterBase;
}

export const Chapter = ({ chapter }: Props) => {
  const { number, description } = chapter;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Cell>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowDetails(!showDetails);
        }}
        className="flex flex-col gap-2 w-full rounded-md hover:bg-base-300 transition duration-100 ease-in-out cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3 p-4">
          <div className="flex gap-4">
            <div className="shrink-0">
              <SecondaryInformation
                value={`Chapter ${number.toString()}:`}
                loud={true}
                copyable={false}
              />
            </div>
            <SecondaryInformation value={description} copyable={false} />
          </div>

          <ChevronRightIcon className="w-5 h-5" />
        </div>
      </div>
    </Cell>
  );
};
