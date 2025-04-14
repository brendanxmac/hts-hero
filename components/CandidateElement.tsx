import { useEffect, useState } from "react";
import { useChapters } from "../contexts/ChaptersContext";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import {
  HtsElement,
  Navigatable,
  HtsLevelClassification,
} from "../interfaces/hts";
import SquareIconButton from "./SqaureIconButton";
import { PrimaryInformation } from "./PrimaryInformation";
import {
  DocumentTextIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { PDFProps } from "./Element";
import PDF from "./PDF";
import { CheckIcon } from "@heroicons/react/24/solid";
import { classNames } from "../utilities/style";
import { getDirectChildrenElements, getHtsLevel } from "../libs/hts";
import { TertiaryInformation } from "./TertiaryInformation";
import { useHtsSections } from "../contexts/HtsSectionsContext";

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

//  TODO: figre out a way to remove this candidate from the classification
//  progression level we're currently on that that element belongs to

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
        "flex flex-col w-full rounded-md bg-primary/30 dark:bg-primary/30 p-4 gap-6",
        isSelectedElement
          ? "bg-primary/50 dark:bg-primary/50"
          : "hover:bg-primary/50 transition duration-100 ease-in-out cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="min-w-20 md:min-w-32">
            <PrimaryInformation
              label={htsno ? `${htsno}` : description}
              value={""}
              copyable={false}
            />
          </div>
          {htsno && <PrimaryInformation value={description} copyable={false} />}
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
          {isSelectedElement ? (
            <SquareIconButton
              icon={<XMarkIcon className="h-4 w-4" />}
              onClick={() => {
                setSelectedElement(null);
                const newClassificationProgression =
                  classificationProgression.slice(0, indentLevel + 1);
                newClassificationProgression[indentLevel].selection = null;
                setClassificationProgression(newClassificationProgression);
              }}
              color="error"
            />
          ) : (
            <SquareIconButton
              icon={<CheckIcon className="h-4 w-4" />}
              onClick={() => {
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
                  const newClassificationProgression =
                    classificationProgression.slice(0, indentLevel + 1);
                  newClassificationProgression[indentLevel].selection = element;
                  setClassificationProgression([
                    ...newClassificationProgression,
                    {
                      level: getHtsLevel(htsno || ""),
                      candidates: children,
                      selection: null,
                      reasoning: "",
                    },
                  ]);
                } else {
                  // TADA! classification complete, do something special
                }
              }}
            />
          )}
          <SquareIconButton
            icon={<XMarkIcon className="h-4 w-4" />}
            onClick={() => {
              // TODO: remove this element from this level of the classification progression (should only be possible for heading selection initially)
              const newClassificationProgression =
                classificationProgression.slice(0, indentLevel + 1);

              newClassificationProgression[indentLevel].candidates =
                newClassificationProgression[indentLevel].candidates.filter(
                  (candidate) => candidate.uuid !== element.uuid
                );
              setClassificationProgression(newClassificationProgression);

              // TODO: if it's selected, also make sure that gets cleaned up
            }}
            color="error"
          />
        </div>
      </div>

      {suggested && (
        <div className="flex flex-col gap-2">
          <TertiaryInformation label="Suggested Candidate" value="" loud />
          <TertiaryInformation value={suggestedReasoning} />
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
