import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { HtsSectionAndChapterBase } from "../interfaces/hts";
import { NestedCell } from "./NestedCell";
import { SecondaryInformation } from "./SecondaryInformation";
import { useState } from "react";

interface Props {
  chapter: HtsSectionAndChapterBase;
}

export const Chapter = ({ chapter }: Props) => {
  const { number, description } = chapter;
  const [showDetails, setShowDetails] = useState(false);

  // TODO: Add an effect to go and fetch the chapter data

  return (
    <NestedCell>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowDetails(!showDetails);
        }}
        className="flex flex-col gap-2 w-full p-3 rounded-md bg-primary/5 hover:bg-primary/10"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-4">
            <div className="shrink-0">
              <SecondaryInformation
                value={`Chapter ${number.toString()}:`}
                loud={false}
                copyable={false}
              />
            </div>
            <SecondaryInformation
              value={description}
              loud={true}
              copyable={false}
            />
          </div>

          <ChevronRightIcon className="w-5 h-5" />
        </div>

        {/* {showDetails &&
          chapter.chapters.map((chapter) => {
            return (
              <NestedCell key={chapter.number}>
                <TertiaryInformation
                  value={`Chapter ${chapter.number}: ${chapter.description}`}
                  loud={true}
                  copyable={false}
                />
              </NestedCell>
            );
          })} */}
      </div>
    </NestedCell>
  );
};
