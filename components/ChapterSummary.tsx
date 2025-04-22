import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { Navigatable, HtsSectionAndChapterBase } from "../interfaces/hts";
import { SecondaryText } from "./SecondaryText";
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
      className="flex flex-col gap-2 w-full rounded-md bg-primary/30 dark:bg-primary/30 hover:bg-primary/50 transition duration-100 ease-in-out cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex gap-4">
          <div className="shrink-0">
            <SecondaryText
              label={`Chapter ${number.toString()}:`}
              value={""}
              copyable={false}
            />
          </div>
          <SecondaryText value={description} copyable={false} />
        </div>

        <ChevronRightIcon className="self-center shrink-0 w-5 h-5 text-primary" />
      </div>
    </div>
  );
};
