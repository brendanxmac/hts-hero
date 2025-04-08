import { HtsElement, HtsSectionAndChapterBase } from "../interfaces/hts";
import { Cell } from "./Cell";
import { NavigatableElement } from "./Elements";
import { useEffect, useState } from "react";
import {
  getDirectChildrenElements,
  getElementsAtIndentLevel,
  getHtsChapterData,
} from "../libs/hts";
import { PrimaryInformation } from "./PrimaryInformation";
import { LoadingIndicator } from "./LoadingIndicator";
import { ElementSum } from "./ElementSum";
import SquareIconButton from "./SqaureIconButton";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import PDF from "./PDF";

interface Props {
  chapter: HtsSectionAndChapterBase;
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
}

export const Chapter = ({ chapter, breadcrumbs, setBreadcrumbs }: Props) => {
  // Find a way to keep the data around so if we segue back we don't have to fetch it again
  const { number, description, notesPath } = chapter;
  const [elements, setElements] = useState<HtsElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    const fetchChapterData = async () => {
      const chapterElements = await getHtsChapterData(String(chapter.number));
      const elementsAtIndentLevel = getElementsAtIndentLevel(
        chapterElements,
        0
      );
      const elementsWithChildren = elementsAtIndentLevel.map((element) => {
        const directChildrenElements = getDirectChildrenElements(
          element,
          chapterElements
        );

        return {
          ...element,
          children: directChildrenElements,
        };
      });

      setElements(elementsWithChildren);
      setLoading(false);
    };
    fetchChapterData();
  }, [number]);

  return (
    <Cell>
      <div className="flex flex-col gap-2 w-full rounded-md transition duration-100 ease-in-out cursor-pointer">
        <div className="flex items-start justify-between gap-3 p-4">
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

        {loading && <LoadingIndicator text="Fetching Chapter Data" />}

        <div className="flex flex-col pl-6">
          {elements.map((element, i) => {
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
