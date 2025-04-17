import { useEffect, useState } from "react";
import { useChapters } from "../contexts/ChaptersContext";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import {
  HtsElement,
  Navigatable,
  HtsLevelClassification,
  Classification,
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

interface Props {
  element: HtsElement;
  isSelectedElement: boolean;
  indentLevel: number;
  setSelectedElement: (element: HtsElement) => void;
  classificationProgression: HtsLevelClassification[];
  setClassificationProgression: (
    classificationProgression: HtsLevelClassification[]
  ) => void;
}

export const CandidateElement = ({
  element,
  isSelectedElement,
  setSelectedElement,
  classificationProgression,
  indentLevel,
  setClassificationProgression,
}: Props) => {
  const { htsno, chapter, description, suggested, suggestedReasoning } =
    element;
  const { fetchChapter, getChapterElements } = useChapters();
  const { addBreadcrumb, clearBreadcrumbs } = useBreadcrumbs();
  const { findChapterByNumber } = useHtsSections();
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const [loading, setLoading] = useState(false);
  const { classification, updateProgressionLevel, addToProgressionLevels } =
    useClassification();

  useEffect(() => {
    const loadChapterData = async () => {
      setLoading(true);
      await fetchChapter(chapter);
      setLoading(false);
    };
    loadChapterData();
  }, [chapter, fetchChapter]);

  return (
    <div
      className={classNames(
        "flex flex-col w-full rounded-md bg-primary/30 dark:bg-primary/30 p-4 gap-4",
        isSelectedElement
          ? "bg-secondary/50 dark:bg-secondary/50"
          : "hover:bg-primary/50 transition duration-100 ease-in-out hover:cursor-pointer"
      )}
      onClick={() => {
        if (isSelectedElement) {
          setSelectedElement(null);
          updateProgressionLevel(indentLevel, { selection: null });
        } else {
          setSelectedElement(element);
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
            updateProgressionLevel(indentLevel, { selection: element });
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
      <div className="flex items-start justify-between gap-3">
        <div className="w-full flex items-center justify-between gap-2">
          <div className="min-w-20 md:min-w-32">
            <TertiaryInformation
              label={htsno ? `${htsno}` : description}
              value={""}
            />
          </div>
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
            <SquareIconButton
              icon={<XMarkIcon className="h-4 w-4" />}
              onClick={() => {
                const newClassificationProgression =
                  classificationProgression.slice(0, indentLevel + 1);

                newClassificationProgression[indentLevel].candidates =
                  newClassificationProgression[indentLevel].candidates.filter(
                    (candidate) => candidate.uuid !== element.uuid
                  );
                setClassificationProgression(newClassificationProgression);
              }}
              color="error"
            />
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
