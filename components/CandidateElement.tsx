import { useEffect, useState } from "react";
import { useChapters } from "../contexts/ChaptersContext";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { HtsElement, HtsLevelClassification } from "../interfaces/hts";
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
import { getHtsLevel } from "../libs/hts";

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
  const { fetchChapter, getChapterElements } = useChapters();
  const { addBreadcrumb, clearBreadcrumbs } = useBreadcrumbs();
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadChapterData = async () => {
      setLoading(true);
      await fetchChapter(element.chapter);
      setLoading(false);
    };
    loadChapterData();
  }, [element.chapter, fetchChapter]);

  return (
    <div
      className={classNames(
        "flex flex-col gap-2 w-full rounded-md bg-primary/5 dark:bg-primary/10 hover:bg-primary/20 transition duration-100 ease-in-out cursor-pointer",
        isSelectedElement && "bg-primary/30 dark:bg-primary/30"
      )}
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex flex-col gap-2">
          <div className="min-w-20 md:min-w-32">
            <PrimaryInformation
              label={element.htsno ? `${element.htsno}` : element.description}
              value={""}
              copyable={false}
            />
          </div>
          {element.htsno && (
            <PrimaryInformation value={element.description} copyable={false} />
          )}
        </div>

        <div className="flex gap-2">
          <SquareIconButton
            icon={<DocumentTextIcon className="h-4 w-4" />}
            onClick={() =>
              setShowPDF({
                title: `Chapter ${element.chapter} Notes`,
                file: `/notes/chapter/Chapter ${element.chapter}.pdf`,
              })
            }
          />
          <SquareIconButton
            icon={<MagnifyingGlassIcon className="h-4 w-4" />}
            onClick={() => {
              clearBreadcrumbs();
              addBreadcrumb(element);
            }}
          />
          {isSelectedElement ? (
            <SquareIconButton
              icon={<XMarkIcon className="h-4 w-4" />}
              onClick={() => {
                setSelectedElement(null);
                setClassificationProgression(
                  classificationProgression.slice(0, indentLevel + 1)
                );
              }}
            />
          ) : (
            <SquareIconButton
              icon={<CheckIcon className="h-4 w-4" />}
              onClick={() => {
                setSelectedElement(element);
                clearBreadcrumbs();
                addBreadcrumb(element);
                setClassificationProgression([
                  ...classificationProgression,
                  {
                    level: getHtsLevel(""), // FIXME: set the actual level if possible
                    candidates: [],
                  },
                ]);
              }}
            />
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
