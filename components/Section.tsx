import { ChevronUpIcon } from "@heroicons/react/16/solid";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { HtsSection } from "../interfaces/hts";
import { useState } from "react";
import { ChapterSummary } from "./ChapterSummary";
import { classNames } from "../utilities/style";
import PDF from "./PDF";
import { NavigatableElement } from "./Elements";
import { SecondaryLabel } from "./SecondaryLabel";
import { TertiaryText } from "./TertiaryText";
import { PrimaryLabel } from "./PrimaryLabel";
import { Color } from "../enums/style";
import { ButtonWithIcon } from "./ButtonWithIcon";
import { TertiaryLabel } from "./TertiaryLabel";
import { SupabaseBuckets } from "../constants/supabase";
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
  const { number, description, filePath: notesPath } = section;
  const [showDetails, setShowDetails] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const disabled = section.number === 22;

  return (
    <div
      className={classNames(
        !showDetails && "hover:bg-neutral",
        "bg-base-100 border-2 border-base-content/40 w-full flex flex-col gap-6 py-6 px-4 rounded-md transition duration-100 ease-in-out"
        // disabled ? "pointer-events-none" : "hover:cursor-pointer"
      )}
      onClick={(e) => {
        // if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setShowDetails(!showDetails);
      }}
    >
      <div className={"flex flex-col gap-4"}>
        <div className="flex gap-4">
          <div className="grow flex flex-col gap-3">
            <div className="w-full flex gap-4 items-center justify-between">
              <SecondaryLabel value={`Section ${number.toString()}`} />
              {/* {disabled && (
                <div className="bg-accent px-3 py-1 rounded-md">
                  <TertiaryLabel value="Coming Soon!" color={Color.BLACK} />
                </div>
              )} */}
              {notesPath && (
                <ButtonWithIcon
                  icon={<DocumentTextIcon className="h-4 w-4" />}
                  label="Notes"
                  onClick={() => setShowNotes(!showNotes)}
                />
              )}
            </div>

            <div className="flex flex-col items-start">
              <PrimaryLabel
                value={description}
                // color={disabled ? Color.BASE_CONTENT : Color.WHITE}
                color={Color.WHITE}
              />
              <TertiaryText value={getChapterRange(section)} />
            </div>
          </div>

          <ChevronUpIcon
            className={classNames(
              "shrink-0 w-6 h-6 text-primary transition-transform duration-200 ease-in-out",
              showDetails && "rotate-180"
            )}
          />
        </div>
        {showDetails && (
          <div className="flex flex-col gap-2">
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

      {notesPath && showNotes && (
        <PDF
          title={`Section ${number.toString()} Notes`}
          bucket={SupabaseBuckets.NOTES}
          filePath={notesPath}
          isOpen={showNotes}
          setIsOpen={setShowNotes}
        />
      )}
    </div>
  );
};
