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
import { SupabaseBuckets } from "../constants/supabase";
import { TertiaryLabel } from "./TertiaryLabel";
interface Props {
  section: HtsSection;
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
  allExpanded?: boolean;
}

export const getChapterRange = (section: HtsSection) => {
  const firstChapter = section.chapters[0];
  const lastChapter = section.chapters[section.chapters.length - 1];

  if (firstChapter.number === lastChapter.number) {
    return `Chapter ${firstChapter.number.toString()}`;
  }

  return `Chapters ${firstChapter.number}-${lastChapter.number}`;
};

export const Section = ({
  section,
  breadcrumbs,
  setBreadcrumbs,
  allExpanded,
}: Props) => {
  const { number, description, filePath: notesPath } = section;
  const [showDetails, setShowDetails] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  // Use manual override if set, otherwise use allExpanded prop, otherwise use local state
  const isExpanded =
    manualOverride !== null
      ? manualOverride
      : allExpanded !== undefined
        ? allExpanded
        : showDetails;

  return (
    <div
      className={classNames(
        !isExpanded && "hover:border-primary hover:shadow-lg",
        "card border-2 border-base-content/40 w-full flex flex-col gap-6 py-6 px-4 rounded-xl transition-all duration-100 ease-in-out hover:cursor-pointer"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const newExpanded = !isExpanded;
        setManualOverride(newExpanded);
        setShowDetails(newExpanded);
      }}
    >
      <div className={"flex flex-col gap-4"}>
        <div className="flex gap-4">
          <div className="grow flex flex-col gap-3">
            <div className="w-full flex gap-4 items-center justify-between">
              <TertiaryText
                uppercase
                value={`Section ${number.toString()}`}
                color={Color.BASE_CONTENT_70}
              />
              {notesPath && (
                <ButtonWithIcon
                  icon={<DocumentTextIcon className="h-4 w-4" />}
                  label="Notes"
                  onClick={() => setShowNotes(!showNotes)}
                />
              )}
            </div>

            <div className="flex flex-col items-start">
              <PrimaryLabel value={description} />
              <TertiaryText value={getChapterRange(section)} />
            </div>
          </div>

          <ChevronUpIcon
            className={classNames(
              "shrink-0 w-6 h-6 text-primary transition-transform duration-200 ease-in-out",
              isExpanded && "rotate-180"
            )}
          />
        </div>
        {isExpanded && (
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
