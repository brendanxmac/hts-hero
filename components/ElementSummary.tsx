import {
  ChevronRightIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { HtsElement } from "../interfaces/hts";
import SquareIconButton from "./SqaureIconButton";
import { PlusIcon } from "@heroicons/react/24/solid";
import { TertiaryText } from "./TertiaryText";
import { useClassification } from "../contexts/ClassificationContext";
import { Color } from "../enums/style";
import { SecondaryLabel } from "./SecondaryLabel";

interface Props {
  element: HtsElement;
  onClick: () => void;
}

export const ElementSummary = ({ element, onClick }: Props) => {
  const { htsno, description, indent, recommended, recommendedReason } =
    element;
  const { classification, updateLevel: updateProgressionLevel } =
    useClassification();

  const isHeadingCandidate = Boolean(
    classification &&
      classification.levels[0] &&
      classification.levels[0].candidates.find(
        (candidate) => candidate.uuid === element.uuid
      )
  );

  const isHeading =
    indent === "0" && classification && classification.levels[0];

  return (
    <div className="flex flex-col gap-2 w-full rounded-md bg-base-100 border border-neutral">
      <div className="flex">
        {isHeading && (
          <div className="flex items-center justify-center">
            <div className="px-3">
              {isHeadingCandidate ? (
                <SquareIconButton
                  icon={<XMarkIcon className="h-4 w-4" />}
                  onClick={() => {
                    // TODO: make a function for removing an element from a single classificatino progression
                    const newClassificationProgression =
                      classification.levels.slice(0, 1);
                    newClassificationProgression[0].candidates =
                      newClassificationProgression[0].candidates.filter(
                        (candidate) => candidate.uuid !== element.uuid
                      );
                    updateProgressionLevel(0, {
                      candidates: newClassificationProgression[0].candidates,
                    });
                  }}
                  color="error"
                />
              ) : (
                <SquareIconButton
                  icon={<PlusIcon className="h-4 w-4" />}
                  onClick={() => {
                    // TODO: make a function for adding an element to a single classification progression
                    const newClassificationProgression =
                      classification.levels.slice(
                        0,
                        classification.levels.length
                      );
                    newClassificationProgression[0].candidates = [
                      ...newClassificationProgression[0].candidates,
                      element,
                    ];

                    updateProgressionLevel(0, {
                      candidates: newClassificationProgression[0].candidates,
                    });
                  }}
                />
              )}
            </div>

            <div className="h-full w-[1px] bg-base-300 dark:bg-base-content/10" />
          </div>
        )}

        <div
          className={`flex items-center justify-between w-full hover:bg-neutral rounded-r-md ${!isHeading && "hover:rounded-md"}`}
          onClick={onClick}
        >
          <div className="w-full flex flex-col items-start justify-between gap-1 px-4 py-2">
            {htsno && (
              <div className="min-w-20 md:min-w-32">
                <TertiaryText value={htsno} />
              </div>
            )}

            <div className="w-full flex items-center justify-between gap-2">
              <SecondaryLabel value={description} color={Color.WHITE} />
            </div>

            {recommended && (
              <div className="flex flex-col gap-2 bg-base-300 rounded-md p-2">
                <div className="flex gap-2 text-accent">
                  <SparklesIcon className="h-4 w-4" />
                  <TertiaryText value="Suggested" />
                </div>
                <p className="text-sm dark:text-white/90">
                  {recommendedReason}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center pr-3">
            <ChevronRightIcon className="shrink-0 w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};
