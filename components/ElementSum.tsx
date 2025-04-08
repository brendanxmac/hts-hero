import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { HtsElement } from "../interfaces/hts";
import { SecondaryInformation } from "./SecondaryInformation";
import { Cell } from "./Cell";
import { NavigatableElement } from "./Elements";

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
    <Cell>
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
        className="flex flex-col gap-2 w-full rounded-md hover:bg-primary/30 transition duration-100 ease-in-out cursor-pointer"
      >
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex gap-4">
            <div className="min-w-32">
              <SecondaryInformation
                label={htsno ? `${htsno}` : description}
                value={""}
                copyable={false}
              />
            </div>
            {htsno && (
              <SecondaryInformation value={description} copyable={false} />
            )}
          </div>

          <ChevronRightIcon className="shrink-0 w-5 h-5" />
        </div>
      </div>
    </Cell>
  );
};
