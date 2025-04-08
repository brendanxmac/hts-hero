import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HtsElementType, HtsSectionAndChapterBase } from "../interfaces/hts";
import { SecondaryInformation } from "./SecondaryInformation";
import { Cell } from "./Cell";
import { NavigatableElement } from "./Elements";
import { useState } from "react";
import PDF from "./PDF";
import SquareIconButton from "./SqaureIconButton";
interface Props {
  chapter: HtsSectionAndChapterBase;
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
}

export const ChapterSummary = ({
  chapter,
  breadcrumbs,
  setBreadcrumbs,
}: Props) => {
  const { number, description, notesPath } = chapter;
  const [showNotes, setShowNotes] = useState(false);

  return (
    <Cell>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setBreadcrumbs([
            ...breadcrumbs,
            {
              title: `Chapter ${number.toString()}`,
              element: {
                type: HtsElementType.CHAPTER,
                ...chapter,
              },
            },
          ]);
        }}
        className="flex flex-col gap-2 w-full rounded-md hover:bg-primary/30 transition duration-100 ease-in-out cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3 p-4">
          <div className="flex gap-4">
            <div className="shrink-0">
              <SecondaryInformation
                label={`Chapter ${number.toString()}:`}
                value={""}
                copyable={false}
              />
            </div>
            <SecondaryInformation value={description} copyable={false} />
          </div>

          {notesPath && showNotes && (
            <PDF
              title={`Chapter ${number.toString()} Notes`}
              file={notesPath}
              isOpen={showNotes}
              setIsOpen={setShowNotes}
            />
          )}

          <div className="flex items-center gap-2">
            {notesPath && (
              <SquareIconButton
                icon={<DocumentMagnifyingGlassIcon className="h-6 w-6" />}
                onClick={() => setShowNotes(!showNotes)}
              />
            )}
            <ChevronRightIcon className="shrink-0 w-5 h-5" />
          </div>
        </div>
      </div>
    </Cell>
  );
};
