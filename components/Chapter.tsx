import { HtsSectionAndChapterBase } from "../interfaces/hts";
import { useEffect, useState } from "react";
import {
  getDirectChildrenElements,
  getElementsAtIndentLevel,
} from "../libs/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { ElementSummary } from "./ElementSummary";
import SquareIconButton from "./SqaureIconButton";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import PDF from "./PDF";
import { useChapters } from "../contexts/ChaptersContext";
import { TertiaryText } from "./TertiaryText";
import { PrimaryLabel } from "./PrimaryLabel";

interface Props {
  chapter: HtsSectionAndChapterBase;
}

export const Chapter = ({ chapter }: Props) => {
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
    <div className="card flex flex-col w-full rounded-md bg-base-300 transition duration-100 ease-in-out cursor-pointer overflow-y-auto">
      <div className="flex items-start justify-between gap-3 pt-4 px-4 sm:pt-6 sm:px-6 pb-2">
        <div className="flex flex-col gap-2">
          <div className="shrink-0">
            <TertiaryText value={`Chapter ${number.toString()}`} />
          </div>

          <PrimaryLabel value={description} />
        </div>
        <SquareIconButton
          icon={<DocumentTextIcon className="h-4 w-4" />}
          onClick={() => setShowNotes(!showNotes)}
          transparent
        />
      </div>

      <div className="flex flex-col rounded-md gap-4 p-4 sm:px-6">
        <TertiaryText value="Headings:" />
        {loadingChapters.includes(number) && (
          <LoadingIndicator text="Fetching Headings" />
        )}
        <div className="flex flex-col gap-2">
          {elementsWithChildren.map((element, i) => {
            return (
              <ElementSummary
                key={`${i}-${element.htsno}`}
                element={element}
                chapter={chapter.number}
              />
            );
          })}
        </div>
      </div>
      {showNotes && (
        <PDF
          title={`Chapter ${number.toString()} Notes`}
          file={notesPath}
          isOpen={showNotes}
          setIsOpen={setShowNotes}
        />
      )}
    </div>
  );
};
