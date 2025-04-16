import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { HtsElement } from "../interfaces/hts";
import { SecondaryInformation } from "./SecondaryInformation";
import { NavigatableElement } from "./Elements";
import SquareIconButton from "./SqaureIconButton";
import { PlusIcon } from "@heroicons/react/24/solid";
import { TertiaryInformation } from "./TertiaryInformation";
import { useClassification } from "../contexts/ClassificationContext";
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
  const { htsno, description, indent } = element;
  const { classificationProgression, setClassificationProgression } =
    useClassification();

  const isSelected = Boolean(
    classificationProgression[0].candidates.find(
      (candidate) => candidate.uuid === element.uuid
    )
  );

  return (
    <div className="flex flex-col gap-2 w-full rounded-md bg-primary/30 dark:bg-primary/30 transition duration-100 ease-in-out cursor-pointer">
      <div className="flex">
        {indent === "0" && (
          <div className="flex items-center justify-center">
            <div className="px-3">
              {isSelected ? (
                <SquareIconButton
                  icon={<XMarkIcon className="h-4 w-4" />}
                  onClick={() => {
                    // TODO: make a function for removing an element from a single classificatino progression
                    const newClassificationProgression =
                      classificationProgression.slice(0, 1);
                    newClassificationProgression[0].candidates =
                      newClassificationProgression[0].candidates.filter(
                        (candidate) => candidate.uuid !== element.uuid
                      );
                    setClassificationProgression(newClassificationProgression);
                  }}
                  color="error"
                />
              ) : (
                <SquareIconButton
                  icon={<PlusIcon className="h-4 w-4" />}
                  onClick={() => {
                    // TODO: make a function for adding an element to a single classificatino progression
                    const newClassificationProgression =
                      classificationProgression.slice(
                        0,
                        classificationProgression.length
                      );
                    newClassificationProgression[0].candidates = [
                      ...newClassificationProgression[0].candidates,
                      element,
                    ];

                    setClassificationProgression(newClassificationProgression);
                  }}
                />
              )}
            </div>

            <div className="h-full w-[1px] bg-base-300 dark:bg-base-content/10" />
          </div>
        )}

        <div
          className="flex items-center justify-between w-full hover:bg-primary/50 rounded-r-md"
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
        >
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
