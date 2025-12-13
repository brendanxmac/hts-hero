import { ChevronUpIcon, DocumentTextIcon } from "@heroicons/react/16/solid";
import { HtsSection } from "../interfaces/hts";
import { useState } from "react";
import { ChapterSummary } from "./ChapterSummary";
import PDF from "./PDF";
import { NavigatableElement } from "./Elements";
import { SupabaseBuckets } from "../constants/supabase";

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
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer ${
        isExpanded
          ? "bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-primary/20 shadow-lg"
          : "bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const newExpanded = !isExpanded;
        setManualOverride(newExpanded);
        setShowDetails(newExpanded);
      }}
    >
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-xs font-bold text-primary">
                  Section {number}
                </span>
              </div>
              {notesPath && (
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-base-content/5 hover:bg-primary/10 border border-base-content/10 hover:border-primary/20 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotes(!showNotes);
                  }}
                >
                  <DocumentTextIcon className="h-3.5 w-3.5 text-primary/70" />
                  Notes
                </button>
              )}
            </div>

            <h3 className="text-lg font-bold text-base-content leading-snug">
              {description}
            </h3>

            <span className="text-sm text-base-content/50">
              {getChapterRange(section)}
            </span>
          </div>

          <ChevronUpIcon
            className={`shrink-0 w-6 h-6 text-primary transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Chapters List */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-base-content/10">
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
