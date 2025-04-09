import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HtsSection } from "../interfaces/hts";
import { Cell } from "./Cell";
import { useState } from "react";
import { ChapterSummary } from "./ChapterSummary";
import { PrimaryInformation } from "./PrimaryInformation";
import { classNames } from "../utilities/style";
import PDF from "./PDF";
import { NavigatableElement } from "./Elements";
import SquareIconButton from "./SqaureIconButton";

interface Props {
  section: HtsSection;
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
}

export const getChapterRange = (section: HtsSection) => {
  const firstChapter = section.chapters[0];
  const lastChapter = section.chapters[section.chapters.length - 1];

  if (firstChapter.number === lastChapter.number) {
    return `Chapter ${firstChapter.number.toString()}`;
  }

  return `Chapters ${firstChapter.number}-${lastChapter.number}`;
};

export const Section = ({ section, breadcrumbs, setBreadcrumbs }: Props) => {
  const { number, description, notesPath } = section;
  const [showDetails, setShowDetails] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  return (
    <Cell>
      <div
        className={classNames(
          !showDetails && "hover:bg-base-300",
          "w-full flex flex-col gap-4 py-6 px-4 rounded-md transition duration-100 ease-in-out hover:cursor-pointer"
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDetails(!showDetails);
        }}
      >
        <div className="flex items-start justify-between gap-5">
          <div className="flex gap-3 items-start">
            <div className="shrink-0 flex flex-col">
              <PrimaryInformation
                label={`Section ${number.toString()}:`}
                value={``}
                copyable={false}
              />

              <h4 className="text-xs font-semibold text-gray-500">
                {getChapterRange(section)}
              </h4>
            </div>
            <PrimaryInformation value={description} copyable={false} />
          </div>

          {notesPath && showNotes && (
            <PDF
              title={`Section ${number.toString()} Notes`}
              file={notesPath}
              isOpen={showNotes}
              setIsOpen={setShowNotes}
            />
          )}

          <div className="flex gap-5 self-center">
            {notesPath && (
              <SquareIconButton
                icon={<DocumentMagnifyingGlassIcon className="h-6 w-6" />}
                onClick={() => setShowNotes(!showNotes)}
              />
            )}

            <div className="self-center">
              {showDetails ? (
                <ChevronDownIcon className="w-5 h-5 transition duration-500 ease-in-out" />
              ) : (
                <ChevronUpIcon className="w-5 h-5 transition duration-500 ease-in-out" />
              )}
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="flex flex-col pl-6">
            {section.chapters.map((chapter) => {
              return (
                <ChapterSummary
                  key={chapter.number}
                  chapter={chapter}
                  breadcrumbs={breadcrumbs}
                  setBreadcrumbs={setBreadcrumbs}
                />
              );
            })}
          </div>
        )}
      </div>
    </Cell>
  );
};
