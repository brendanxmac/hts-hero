import {
  ChevronRightIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { HtsElement, SectionAndChapterDetails } from "../interfaces/hts";
import SquareIconButton from "./SqaureIconButton";
import { PlusIcon } from "@heroicons/react/24/solid";
import { TertiaryText } from "./TertiaryText";
import { useClassification } from "../contexts/ClassificationContext";
import { Color } from "../enums/style";
import { PrimaryLabel } from "./PrimaryLabel";
import { SecondaryLabel } from "./SecondaryLabel";

interface Props {
  element: HtsElement;
  parents: HtsElement[];
  sectionAndChapter: SectionAndChapterDetails;
  onClick: () => void;
}

export const ElementSearchSummary = ({
  element,
  parents,
  sectionAndChapter,
  onClick,
}: Props) => {
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

  const breadcrumbs = [
    {
      label: `Section ${sectionAndChapter.section.number}:`,
      value: sectionAndChapter.section.description,
    },
    {
      label: `Chapter ${sectionAndChapter.chapter.number}:`,
      value: sectionAndChapter.chapter.description,
    },
    ...parents.map((parent) => ({
      label: parent.htsno && `${parent.htsno}:`,
      value: parent.description,
    })),
  ];

  const isHeading =
    indent === "0" && classification && classification.levels[0];

  return (
    <div className="flex flex-col gap-2 w-full bg-base-100 rounded-md border border-base-content/20 hover:cursor-pointer hover:bg-neutral">
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
          className={`flex py-2 items-center justify-between w-full`}
          onClick={onClick}
        >
          <div className="w-full flex flex-col items-start justify-between gap-6 px-4 py-2">
            <div className="flex flex-col gap-3 breadcrumbs text-sm py-0 overflow-hidden">
              <div className="text-xs">
                {breadcrumbs.map((breadcrumb, i) => (
                  <span key={`breadcrumb-${i}`}>
                    {breadcrumb.label && <b>{breadcrumb.label} </b>}
                    <span className="text-white">{breadcrumb.value}</span>
                    <span className="text-white mx-2">›</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              {htsno && <SecondaryLabel value={htsno} />}
              <PrimaryLabel value={description} color={Color.WHITE} />
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
