import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import { HtsSection } from "../interfaces/hts";
import { Cell } from "./Cell";
import { useState } from "react";
import { Chapter } from "./Chapter";
import { PrimaryInformation } from "./PrimaryInformation";
import { classNames } from "../utilities/style";
interface Props {
  section: HtsSection;
}

export const getChapterRange = (section: HtsSection) => {
  const firstChapter = section.chapters[0];
  const lastChapter = section.chapters[section.chapters.length - 1];

  if (firstChapter.number === lastChapter.number) {
    return `Chapter ${firstChapter.number.toString()}`;
  }

  return `Chapters ${firstChapter.number}-${lastChapter.number}`;
};

export const Section = ({ section }: Props) => {
  const { number, description } = section;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Cell>
      <div
        className={classNames(
          !showDetails && "hover:bg-base-content/10",
          "w-full flex flex-col gap-4 py-6 px-4 rounded-md transition duration-100 ease-in-out hover:cursor-pointer"
        )}
      >
        <div
          className="flex items-start justify-between gap-3"
          onClick={(e) => {
            setShowDetails(!showDetails);
          }}
        >
          <div className="flex gap-3 items-start">
            <div className="shrink-0 flex flex-col">
              <PrimaryInformation
                label={`Section ${number.toString()}`}
                value={``}
                copyable={false}
              />

              <h4 className="text-xs font-semibold text-gray-500">
                {getChapterRange(section)}
              </h4>
            </div>
            <PrimaryInformation value={description} copyable={false} />
          </div>

          <div>
            {showDetails ? (
              <ChevronDownIcon className="w-5 h-5 transition duration-500 ease-in-out" />
            ) : (
              <ChevronUpIcon className="w-5 h-5 transition duration-500 ease-in-out" />
            )}
          </div>
        </div>

        {showDetails && (
          <div className="flex flex-col pl-6">
            {section.chapters.map((chapter) => {
              return <Chapter key={chapter.number} chapter={chapter} />;
            })}
          </div>
        )}
      </div>
    </Cell>
  );
};
