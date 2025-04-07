import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { HtsElementType, HtsSectionAndChapterBase } from "../interfaces/hts";
import { SecondaryInformation } from "./SecondaryInformation";
import { Cell } from "./Cell";
import { NavigatableElement } from "./Elements";

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
  const { number, description } = chapter;

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
        className="flex flex-col gap-2 w-full rounded-md hover:bg-base-300 transition duration-100 ease-in-out cursor-pointer"
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

          <ChevronRightIcon className="shrink-0 w-5 h-5" />
        </div>
      </div>
    </Cell>
  );
};
