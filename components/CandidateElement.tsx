import { useEffect, useState } from "react";
import { useChapters } from "../contexts/ChaptersContext";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import {
  HtsElement,
  Navigatable,
  HtsLevelClassification,
} from "../interfaces/hts";
import SquareIconButton from "./SqaureIconButton";
import {
  DocumentTextIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { PDFProps } from "./Element";
import PDF from "./PDF";
import { classNames } from "../utilities/style";
import { getDirectChildrenElements, getHtsLevel } from "../libs/hts";
import { TertiaryInformation } from "./TertiaryInformation";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { SecondaryInformation } from "./SecondaryInformation";
import { useClassification } from "../contexts/ClassificationContext";
import { PrimaryInformation } from "./PrimaryInformation";

interface Props {
  element: HtsElement;
  indentLevel: number;
}

export const CandidateElement = ({ element, indentLevel }: Props) => {
  const { htsno, chapter, description, suggested, suggestedReasoning, indent } =
    element;
  const { fetchChapter, getChapterElements } = useChapters();
  const { addBreadcrumb, clearBreadcrumbs } = useBreadcrumbs();
  const { findChapterByNumber } = useHtsSections();
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    classification,
    updateProgressionLevel,
    addToProgressionLevels,
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
    classification.progressionLevels.some(
      (level) => level.selection && level.selection.uuid === element.uuid
    )
  );

  console.log(`${element.htsno || element.description}: ${isSelected}`);

  // const isSelected = Boolean(
  //   classification.progressionLevels[indentLevel] &&
  //     classification.progressionLevels[indentLevel].selection &&
  //     classification.progressionLevels[indentLevel].selection.uuid ===
  //       element.uuid
  // );

  return (
    <div
      className={classNames(
        "flex w-full rounded-md bg-primary/30 dark:bg-primary/30 p-4 gap-4",
        isSelected
          ? "bg-primary/80 dark:bg-primary/80"
          : "hover:bg-primary/50 transition duration-100 ease-in-out hover:cursor-pointer"
      )}
      onClick={() => {
        if (isSelected) {
          // TODO: remove all progressions levels beyond this one
          const newClassificationProgression =
            classification.progressionLevels.slice(0, indentLevel + 1);
          newClassificationProgression[indentLevel].selection = null;

          setClassification({
            ...classification,
            progressionLevels: newClassificationProgression,
          });

          // updateProgressionLevel(indentLevel, { selection: null });
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

          const children = getDirectChildrenElements(
            element,
            getChapterElements(chapter)
          );

          if (children.length > 0) {
            addToProgressionLevels(
              getHtsLevel(htsno || ""),
              children,
              null,
              ""
            );
          } else {
            // TADA! classification complete, do something special
          }
        }
      }}
    >
      <div className="flex items-center justify-center">
        <input
          readOnly
          type="radio"
          name="radio"
          className="radio radio-primary"
          checked={isSelected}
        />
      </div>

      <div className="flex flex-col w-full gap-2">
        <div className="flex items-start justify-between">
          <div className="w-full flex items-center justify-between gap-2">
            <PrimaryInformation
              label={htsno ? `${htsno}` : description}
              value={""}
            />
            <div className="flex gap-2">
              <SquareIconButton
                icon={<DocumentTextIcon className="h-4 w-4" />}
                onClick={() =>
                  setShowPDF({
                    title: `Chapter ${chapter} Notes`,
                    file: `/notes/chapter/Chapter ${chapter}.pdf`,
                  })
                }
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
                }}
              />
              {indent === "0" && (
                <SquareIconButton
                  icon={<XMarkIcon className="h-4 w-4" />}
                  onClick={() => {
                    if (isSelected) {
                      // TODO: remove all progressions levels beyond this one
                      const newClassificationProgression =
                        classification.progressionLevels.slice(
                          0,
                          indentLevel + 1
                        );
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
                        progressionLevels: newClassificationProgression,
                      });
                    } else {
                      const newClassificationProgression =
                        classification.progressionLevels.slice(
                          0,
                          indentLevel + 1
                        );

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

        {htsno && <SecondaryInformation value={description} />}

        {suggested && (
          <div className="flex flex-col gap-2 bg-base-300 rounded-md p-2">
            <div className="flex gap-2 text-accent">
              <SparklesIcon className="h-4 w-4" />
              <TertiaryInformation label="Suggested" value="" />
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
