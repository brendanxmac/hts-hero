import { useEffect, useState } from "react";
import { useChapters } from "../contexts/ChaptersContext";
import { HtsElement } from "../interfaces/hts";
import SquareIconButton from "./SqaureIconButton";
import { PrimaryInformation } from "./PrimaryInformation";
import { DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { PDFProps } from "./Element";
import PDF from "./PDF";
import { CheckIcon } from "@heroicons/react/24/solid";
import { classNames } from "../utilities/style";

interface Props {
  element: HtsElement;
  isRecommendedElement: boolean;
  isSelectedElement: boolean;
  setSelectedElement: (element: HtsElement) => void;
}

export const CandidateElement = ({
  element,
  isRecommendedElement,
  isSelectedElement,
  setSelectedElement,
}: Props) => {
  const { htsno, description, chapter, suggested } = element;
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const { fetchChapter, getChapterElements } = useChapters();

  useEffect(() => {
    const chapterElements = getChapterElements(element.chapter);
    if (!chapterElements) {
      fetchChapter(element.chapter);
    }
  }, [element.chapter, fetchChapter, getChapterElements]);

  return (
    <div
      className={classNames(
        "card border border-base-300 rounded-md dark:border-base-content/20 w-full flex flex-col items-start justify-between gap-6 p-4 sm:p-6",
        isSelectedElement && "bg-primary/10"
      )}
    >
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="w-full flex flex-col gap-3">
          <div className="flex justify-between items-center gap-2">
            {htsno && (
              <PrimaryInformation
                label={htsno ? `${htsno}: ` : ``}
                value={``}
              />
            )}

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
              {suggested && (
                <SquareIconButton
                  icon={
                    isSelectedElement ? (
                      <XMarkIcon className="h-4 w-4" />
                    ) : (
                      <CheckIcon className="h-4 w-4" />
                    )
                  }
                  onClick={() => {
                    if (isSelectedElement) {
                      setSelectedElement(null);
                    } else {
                      setSelectedElement(element);
                    }
                  }}
                  color={isSelectedElement ? "error" : "accent"}
                />
              )}
            </div>
          </div>
          <div>
            {/* {getParentDescriptionsFromBreadcrumbs(element).length > 0 && (
              <div className="flex flex-col gap-1">
                <TertiaryInformation
                  key={description}
                  value={getParentDescriptionsFromBreadcrumbs(element)}
                />
              </div>
            )} */}
            {htsno ? (
              <PrimaryInformation value={description} />
            ) : (
              <PrimaryInformation label={description} value="" />
            )}
          </div>
          {element.suggested && (
            <p
              className={classNames(
                "text-xs font-bold mt-2",
                isRecommendedElement && "text-accent"
              )}
            >
              {isRecommendedElement ? "Best Suggestion" : "Suggested"}
            </p>
          )}
        </div>
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
