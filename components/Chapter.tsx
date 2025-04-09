import { HtsElement, HtsSectionAndChapterBase } from "../interfaces/hts";
import { Cell } from "./Cell";
import { NavigatableElement } from "./Elements";
import { useEffect, useState } from "react";
import {
  getDirectChildrenElements,
  getElementsAtIndentLevel,
} from "../libs/hts";
import { PrimaryInformation } from "./PrimaryInformation";
import { LoadingIndicator } from "./LoadingIndicator";
import { ElementSum } from "./ElementSum";
import SquareIconButton from "./SqaureIconButton";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import PDF from "./PDF";
import { useChapters } from "../contexts/ChaptersContext";

interface Props {
  chapter: HtsSectionAndChapterBase;
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
}

export const Chapter = ({ chapter, breadcrumbs, setBreadcrumbs }: Props) => {
  const { number, description, notesPath } = chapter;
  const [showNotes, setShowNotes] = useState(false);
  const { fetchChapter, getChapterElements, loadingChapters } = useChapters();

  useEffect(() => {
    fetchChapter(number);
  }, [number, fetchChapter]);

  const chapterElements = getChapterElements(number);
  const elementsAtIndentLevel = chapterElements
    ? getElementsAtIndentLevel(chapterElements, 0)
    : [];
  const elementsWithChildren = elementsAtIndentLevel.map((element) => {
    const directChildrenElements = getDirectChildrenElements(
      element,
      chapterElements || []
    );

    return {
      ...element,
      children: directChildrenElements,
    };
  });

  return (
    <Cell>
      <div className="card bg-base-200 flex flex-col sm:gap-2 w-full rounded-md transition duration-100 ease-in-out cursor-pointer">
        <div className="flex items-start justify-between gap-3 p-4 sm:p-6">
          <div className="flex gap-2">
            <div className="shrink-0">
              <PrimaryInformation
                label={`Chapter ${number.toString()}: `}
                value={``}
                copyable={false}
              />
            </div>
            <PrimaryInformation value={description} copyable={false} />
          </div>
          <SquareIconButton
            icon={<DocumentMagnifyingGlassIcon className="h-6 w-6" />}
            onClick={() => setShowNotes(!showNotes)}
          />
        </div>

        {showNotes && (
          <PDF
            title={`Chapter ${number.toString()} Notes`}
            file={notesPath}
            isOpen={showNotes}
            setIsOpen={setShowNotes}
          />
        )}

        {loadingChapters.includes(number) && (
          <LoadingIndicator text="Fetching Chapter Data" />
        )}

        <div className="flex flex-col px-3 sm:px-6">
          {elementsWithChildren.map((element, i) => {
            return (
              <ElementSum
                key={`${i}-${element.htsno}`}
                element={element}
                chapter={chapter.number}
                breadcrumbs={breadcrumbs}
                setBreadcrumbs={setBreadcrumbs}
              />
            );
          })}
        </div>
      </div>
    </Cell>
  );
};
