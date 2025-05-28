import { HtsElement, HtsSectionAndChapterBase } from "../interfaces/hts";
import { useState } from "react";
import {
  getDirectChildrenElements,
  getElementsAtIndentLevel,
  getElementsForChapter,
} from "../libs/hts";
import { ElementSummary } from "./ElementSummary";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import PDF from "./PDF";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { ButtonWithIcon } from "./ButtonWithIcon";
import { SecondaryLabel } from "./SecondaryLabel";
import { TertiaryLabel } from "./TertiaryLabel";
import { useHts } from "../contexts/HtsContext";

interface Props {
  chapter: HtsSectionAndChapterBase;
}

export const Chapter = ({ chapter }: Props) => {
  const { number, description, notesPath } = chapter;
  const { htsElements } = useHts();
  const [showNotes, setShowNotes] = useState(false);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const chapterElements = getElementsForChapter(htsElements, number);
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
    <div className="card flex flex-col w-full gap-6 rounded-xl bg-base-100 border border-base-content/10 p-4 pt-2 sm:pt-6 transition duration-100 ease-in-out overflow-y-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <TertiaryLabel value={`Chapter ${number.toString()}`} />
          <ButtonWithIcon
            icon={<DocumentTextIcon className="h-4 w-4" />}
            label="Notes"
            onClick={() => setShowNotes(!showNotes)}
          />
        </div>
        <h2 className="text-2xl font-bold text-white">{description}</h2>
      </div>

      <div className="flex flex-col gap-2 bg-base-100">
        <SecondaryLabel value="Headings" />
        <div className="flex flex-col gap-2">
          {elementsWithChildren.map((element, i) => {
            return (
              <ElementSummary
                key={`${i}-${element.htsno}`}
                element={element}
                onClick={() => {
                  setBreadcrumbs([
                    ...breadcrumbs,
                    {
                      title: `${element.htsno || element.description.split(" ").slice(0, 2).join(" ") + "..."}`,
                      element: {
                        ...element,
                        chapter: chapter.number,
                      },
                    },
                  ]);
                }}
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
