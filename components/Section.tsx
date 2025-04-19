import { ChevronUpIcon } from "@heroicons/react/16/solid";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { HtsSection } from "../interfaces/hts";
import { useState } from "react";
import { ChapterSummary } from "./ChapterSummary";
import { PrimaryInformation } from "./PrimaryInformation";
import { classNames } from "../utilities/style";
import PDF from "./PDF";
import { NavigatableElement } from "./Elements";
import SquareIconButton from "./SqaureIconButton";
import { SecondaryInformation } from "./SecondaryInformation";

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
    <div
      className={classNames(
        !showDetails && "hover:bg-primary/50 dark:hover:bg-primary/50",
        "bg-base-100 w-full flex flex-col gap-6 py-6 px-4 rounded-md transition duration-100 ease-in-out hover:cursor-pointer"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDetails(!showDetails);
      }}
    >
      <div className="flex gap-4">
        <div className="grow flex flex-col gap-3">
          <div className="flex flex-col">
            <SecondaryInformation
              label={`Section ${number.toString()}`}
              value={``}
              copyable={false}
            />
            <h4 className="text-xs font-semibold text-base-content">
              {getChapterRange(section)}
            </h4>
          </div>

          <div className="flex flex-col items-start">
            <PrimaryInformation value={description} copyable={false} />
          </div>
        </div>

        <div className="flex flex-col">
          {notesPath && (
            <SquareIconButton
              icon={<DocumentTextIcon className="h-4 w-4" />}
              onClick={() => setShowNotes(!showNotes)}
            />
          )}
          <div className="grow flex gap-5 self-center items-center">
            <ChevronUpIcon
              className={classNames(
                "w-5 h-5 text-primary transition-transform duration-200 ease-in-out",
                showDetails && "rotate-180"
              )}
            />
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="flex flex-col rounded-md gap-2">
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
      {notesPath && showNotes && (
        <PDF
          title={`Section ${number.toString()} Notes`}
          file={notesPath}
          isOpen={showNotes}
          setIsOpen={setShowNotes}
        />
      )}
    </div>
  );
};
