import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import { HtsSection } from "../interfaces/hts";
import { Cell } from "./Cell";
import { useState } from "react";
import { Chapter } from "./Chapter";
import { PrimaryInformation } from "./PrimaryInformation";
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
      <div className="w-full flex flex-col gap-4">
        <div
          className="flex items-start justify-between gap-3"
          onClick={() => {
            setShowDetails(!showDetails);
          }}
        >
          <div className="flex gap-3 items-start">
            <div className="shrink-0 flex flex-col">
              <PrimaryInformation
                value={`Section ${number.toString()}:`}
                loud={false}
                copyable={false}
              />

              <h4 className="text-xs font-semibold text-primary">
                {getChapterRange(section)}
              </h4>
            </div>
            <PrimaryInformation
              value={description}
              loud={true}
              copyable={false}
            />
          </div>

          <div>
            {showDetails ? (
              <ChevronDownIcon className="w-5 h-5" />
            ) : (
              <ChevronUpIcon className="w-5 h-5" />
            )}
          </div>
        </div>

        {showDetails && (
          <div className="flex flex-col gap-2">
            {section.chapters.map((chapter) => {
              return <Chapter key={chapter.number} chapter={chapter} />;
            })}
          </div>
        )}
      </div>
    </Cell>
  );
};
