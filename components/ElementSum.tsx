import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { HtsElement } from "../interfaces/hts";
import { SecondaryInformation } from "./SecondaryInformation";
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
      className="flex flex-col gap-2 w-full rounded-md bg-primary/30 dark:bg-primary/30 hover:bg-primary/50 transition duration-100 ease-in-out cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex flex-col gap-2">
          <div className="min-w-20 md:min-w-32">
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

        <ChevronRightIcon className="self-center shrink-0 w-5 h-5 text-primary" />
      </div>
    </div>
  );
};
