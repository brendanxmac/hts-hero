import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { HtsElement } from "../interfaces/hts";
import { SecondaryInformation } from "./SecondaryInformation";
import { NavigatableElement } from "./Elements";
import SquareIconButton from "./SqaureIconButton";
import { PlusIcon } from "@heroicons/react/24/solid";
import { TertiaryInformation } from "./TertiaryInformation";

interface Props {
  element: HtsElement;
  chapter: number;
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
}

export const ElementSum = ({
  element,
  chapter,
  breadcrumbs,
  setBreadcrumbs,
}: Props) => {
  const { htsno, description } = element;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setBreadcrumbs([
          ...breadcrumbs,
          {
            title: `${htsno || description.split(" ").slice(0, 2).join(" ") + "..."}`,
            element: {
              ...element,
              chapter,
            },
          },
        ]);
      }}
      className="flex flex-col gap-2 w-full rounded-md bg-primary/30 dark:bg-primary/30 transition duration-100 ease-in-out cursor-pointer"
    >
      <div className="flex">
        <div className="flex items-center justify-center">
          <div className="px-3">
            <SquareIconButton
              icon={<PlusIcon className="h-4 w-4" />}
              onClick={() => {
                // TODO: add heading to candidates via classification progression
              }}
            />
          </div>

          <div className="h-full w-[1px] bg-base-300 dark:bg-base-content/10" />
        </div>

        <div className="flex items-center justify-between w-full hover:bg-primary/50 rounded-r-md">
          <div className="w-full flex flex-col items-start justify-between gap-1 p-4">
            {htsno && (
              <div className="min-w-20 md:min-w-32">
                <TertiaryInformation value={htsno} />
              </div>
            )}

            <div className="w-full flex items-center justify-between gap-2">
              <SecondaryInformation label={description} value="" />
            </div>
          </div>
          <div className="flex items-center justify-center pr-3">
            {/* <div className="h-full w-[1px] bg-base-300 dark:bg-base-content/10 mx-2" /> */}
            <ChevronRightIcon className="shrink-0 w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};
