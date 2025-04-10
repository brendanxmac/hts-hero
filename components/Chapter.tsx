import { HtsSectionAndChapterBase } from "../interfaces/hts";
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
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import PDF from "./PDF";
import { useChapters } from "../contexts/ChaptersContext";
import { TertiaryInformation } from "./TertiaryInformation";

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
      <div className="card flex flex-col w-full rounded-md border border-base-300 dark:border-base-content/20 transition duration-100 ease-in-out cursor-pointer">
        <div className="flex items-start justify-between gap-3 pt-4 px-4 sm:pt-6 sm:px-6 pb-2">
          <div className="flex flex-col gap-2">
            <div className="shrink-0">
              <PrimaryInformation
                label={`Chapter ${number.toString()}: `}
                value={``}
              />
            </div>
            <PrimaryInformation value={description} loud={true} />
          </div>
          <SquareIconButton
            icon={<DocumentTextIcon className="h-5 w-5" />}
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

        <div className="flex flex-col rounded-md pb-2 gap-4 p-4 sm:px-6">
          <TertiaryInformation value="" label="Elements:" />
          <div className="flex flex-col gap-2">
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
      </div>
    </Cell>
  );
};
