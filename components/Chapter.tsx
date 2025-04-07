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

interface Props {
  chapter: HtsSectionAndChapterBase;
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
}

export const Chapter = ({ chapter, breadcrumbs, setBreadcrumbs }: Props) => {
  // Find a way to keep the data around so if we segue back we don't have to fetch it again
  const { number, description } = chapter;
  const [elements, setElements] = useState<HtsElement[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="flex items-start gap-3 p-4">
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
        </div>

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
