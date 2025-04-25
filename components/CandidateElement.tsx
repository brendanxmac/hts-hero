import { useEffect, useState } from "react";
import { useChapters } from "../contexts/ChaptersContext";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { HtsElement, Navigatable } from "../interfaces/hts";
import SquareIconButton from "./SqaureIconButton";
import {
  DocumentTextIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { PDFProps } from "./Element";
import PDF from "./PDF";
import { classNames } from "../utilities/style";
import { TertiaryText } from "./TertiaryText";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { SecondaryText } from "./SecondaryText";
import { useClassification } from "../contexts/ClassificationContext";
import { Color } from "../enums/style";
import { SecondaryLabel } from "./SecondaryLabel";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyTab } from "./workflow/ClassificationNavigation";

interface Props {
  element: HtsElement;
  indentLevel: number;
}

export const CandidateElement = ({ element, indentLevel }: Props) => {
  const { htsno, chapter, description, suggested, suggestedReasoning, indent } =
    element;
  const { fetchChapter } = useChapters();
  const { addBreadcrumb, clearBreadcrumbs } = useBreadcrumbs();
  const { setActiveTab } = useClassifyTab();
  const { findChapterByNumber } = useHtsSections();
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    classification,
    updateLevel: updateProgressionLevel,
    addLevel: addToProgressionLevels,
    setClassification,
  } = useClassification();

  useEffect(() => {
    const loadChapterData = async () => {
      setLoading(true);
      await fetchChapter(chapter);
      setLoading(false);
    };
    loadChapterData();
  }, [chapter, fetchChapter]);

  // Check all progression levels to see if this element is selected in any of them
  const isSelected = Boolean(
    classification.levels.some(
      (level) => level.selection && level.selection.uuid === element.uuid
    )
  );

  return (
    <div
      className={classNames(
        "flex w-full rounded-md bg-base-100 p-4 gap-4 transition duration-100 ease-in-out",
        // FIXME: this won't work in daisyUI v5, https://chatgpt.com/c/680acac7-5db4-8000-a309-b4ba81c63e8c
        isSelected
          ? "dark:shadow-[inset_0_0_0_4px_oklch(var(--p))] shadow-[inset_0_0_0_4px_oklch(var(--p))]"
          : "hover:cursor-pointer hover:bg-base-200 dark:shadow-[inset_0_0_0_1px_oklch(var(--n))]"
      )}
      onClick={() => {
        if (isSelected) {
          const newClassificationProgression = classification.levels.slice(
            0,
            indentLevel + 1
          );
          newClassificationProgression[indentLevel].selection = null;

          setClassification({
            ...classification,
            levels: newClassificationProgression,
          });
        } else {
          updateProgressionLevel(indentLevel, { selection: element });

          clearBreadcrumbs();
          const ch = findChapterByNumber(element.chapter);
          if (ch) {
            addBreadcrumb({
              type: Navigatable.CHAPTER,
              ...ch,
            });
          }
          addBreadcrumb(element);
        }
      }}
    >
      <div className="flex flex-col w-full gap-4">
        <div className="flex items-start justify-between">
          <div className="w-full flex items-center justify-between gap-2">
            <SecondaryText value={htsno ? `${htsno}` : description} />
            <div className="flex gap-2">
              <SquareIconButton
                icon={<DocumentTextIcon className="h-4 w-4" />}
                onClick={() =>
                  setShowPDF({
                    title: `Chapter ${chapter} Notes`,
                    file: `/notes/chapter/Chapter ${chapter}.pdf`,
                  })
                }
                transparent
              />
              <SquareIconButton
                icon={<MagnifyingGlassIcon className="h-4 w-4" />}
                onClick={() => {
                  clearBreadcrumbs();
                  const chapter = findChapterByNumber(element.chapter);
                  if (chapter) {
                    addBreadcrumb({
                      type: Navigatable.CHAPTER,
                      ...chapter,
                    });
                  }
                  addBreadcrumb({
                    ...element,
                  });
                  setActiveTab(ClassifyTab.EXPLORE);
                }}
                transparent
              />
              <SquareIconButton
                icon={<PencilSquareIcon className="h-4 w-4" />}
                onClick={() => {
                  console.log("Add notes for element");
                }}
                transparent
              />
              {indent === "0" && (
                <SquareIconButton
                  icon={<TrashIcon className="h-4 w-4 text-error" />}
                  onClick={() => {
                    if (isSelected) {
                      const newClassificationProgression =
                        classification.levels.slice(0, indentLevel + 1);
                      newClassificationProgression[indentLevel].selection =
                        null;

                      // remove this element from the candidates of this level
                      newClassificationProgression[indentLevel].candidates =
                        newClassificationProgression[
                          indentLevel
                        ].candidates.filter(
                          (candidate) => candidate.uuid !== element.uuid
                        );

                      setClassification({
                        ...classification,
                        levels: newClassificationProgression,
                      });
                    } else {
                      const newClassificationProgression =
                        classification.levels.slice(0, indentLevel + 1);

                      newClassificationProgression[indentLevel].candidates =
                        newClassificationProgression[
                          indentLevel
                        ].candidates.filter(
                          (candidate) => candidate.uuid !== element.uuid
                        );
                      updateProgressionLevel(indentLevel, {
                        candidates:
                          newClassificationProgression[indentLevel].candidates,
                      });
                    }
                  }}
                  color="error"
                />
              )}
            </div>
          </div>
        </div>

        {htsno && <SecondaryLabel value={description} color={Color.WHITE} />}

        {suggested && (
          <div className="flex flex-col gap-2 bg-base-300 rounded-md p-2">
            <div className="flex gap-2 text-accent">
              <SparklesIcon className="h-4 w-4" />
              <TertiaryText value="Suggested" />
            </div>
            <p className="text-sm dark:text-white/90">{suggestedReasoning}</p>
          </div>
        )}
      </div>

      {showPDF && (
        <PDF
          title={showPDF.title}
          file={showPDF.file}
          isOpen={showPDF !== null}
          setIsOpen={(isOpen) => {
            if (!isOpen) {
              setShowPDF(null);
            }
          }}
        />
      )}
    </div>
  );
};
