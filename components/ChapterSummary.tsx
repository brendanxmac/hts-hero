import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { Navigatable, HtsSectionAndChapterBase } from "../interfaces/hts";
import { SecondaryText } from "./SecondaryText";
import { NavigatableElement } from "./Elements";
import { Color } from "../enums/style";
import { TertiaryLabel } from "./TertiaryLabel";

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
    <div
      onClick={(e) => {
        e.stopPropagation();
        setBreadcrumbs([
          ...breadcrumbs,
          {
            title: `Chapter ${number.toString()}`,
            element: {
              type: Navigatable.CHAPTER,
              ...chapter,
            },
          },
        ]);
      }}
      className="flex flex-col gap-2 w-full rounded-md bg-primary/20 border border-base-content/10 hover:bg-primary/40 transition duration-100 ease-in-out cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex flex-col gap-1">
          <div className="shrink-0">
            <TertiaryLabel
              value={`Chapter ${number.toString()}`}
              color={Color.BASE_CONTENT}
            />
          </div>
          <SecondaryText value={description} color={Color.WHITE} />
        </div>

        <ChevronRightIcon className="self-center shrink-0 w-5 h-5 text-primary" />
      </div>
    </div>
  );
};
