import {
  ChevronRightIcon,
  SparklesIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/16/solid";
import { HtsElement } from "../interfaces/hts";
import { useClassification } from "../contexts/ClassificationContext";
import { MarkdownProse } from "./MarkdownProse";

interface Props {
  element: HtsElement;
  onClick: () => void;
}

export const ElementSummary = ({ element, onClick }: Props) => {
  const { htsno, description, indent } = element;
  const { classification, updateLevel } = useClassification();

  const isHeadingCandidate = Boolean(
    classification &&
    classification.levels[0] &&
    classification.levels[0].candidates.find(
      (candidate) => candidate.uuid === element.uuid
    )
  );

  const isRecommended =
    classification &&
    classification.levels[0]?.analysisElement?.uuid === element.uuid;
  const recommendedReason =
    classification && classification.levels[0]?.analysisReason;

  const isHeading =
    indent === "0" && classification && classification.levels[0];

  return (
    <div
      className={`group relative overflow-hidden rounded-xl transition-all duration-200 cursor-pointer ${isHeadingCandidate
        ? "bg-base-100 border border-success/40"
        : "bg-base-100 border border-base-300 hover:border-primary/40"
        }`}
    >

      <div className="relative z-10 flex">
        {/* Add/Remove Button for Headings */}
        {isHeading && element.chapter != 98 && element.chapter != 99 && (
          <div className="flex items-center">
            <button
              className={`flex items-center justify-center w-12 h-full transition-colors ${isHeadingCandidate
                ? "bg-error/10 hover:bg-error/20 text-error"
                : "bg-success/10 hover:bg-success/20 text-success"
                }`}
              onClick={(e) => {
                e.stopPropagation();
                if (isHeadingCandidate) {
                  const newClassificationProgression =
                    classification.levels.slice(0, 1);
                  newClassificationProgression[0].candidates =
                    newClassificationProgression[0].candidates.filter(
                      (candidate) => candidate.uuid !== element.uuid
                    );
                  updateLevel(0, {
                    candidates: newClassificationProgression[0].candidates,
                  });
                } else {
                  const newClassificationProgression =
                    classification.levels.slice(
                      0,
                      classification.levels.length
                    );
                  newClassificationProgression[0].candidates = [
                    ...newClassificationProgression[0].candidates,
                    element,
                  ];
                  updateLevel(0, {
                    candidates: newClassificationProgression[0].candidates,
                  });
                }
              }}
              title={
                isHeadingCandidate
                  ? "Remove from candidates"
                  : "Add to candidates"
              }
            >
              {isHeadingCandidate ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <PlusIcon className="h-5 w-5" />
              )}
            </button>
            <div className="h-full w-px bg-base-content/10" />
          </div>
        )}

        {/* Main Content */}
        <div
          className="flex-1 flex items-center justify-between p-4 gap-3"
          onClick={onClick}
        >
          <div className="flex flex-col gap-1.5">
            {htsno && (
              <span className="text-sm inline-flex px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 font-bold text-primary w-fit">
                {htsno}
              </span>
            )}

            <span className="font-medium text-base-content/80 group-hover:text-base-content transition-colors leading-relaxed">
              {description}
            </span>

            {/* AI Recommendation */}
            {isRecommended && (
              <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                    HTS Hero Analysis
                  </span>
                </div>
                <MarkdownProse
                  size="sm"
                  className="prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1 first:prose-headings:mt-0"
                >
                  {recommendedReason}
                </MarkdownProse>
              </div>
            )}
          </div>

          <ChevronRightIcon className="shrink-0 w-5 h-5 text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
        </div>
      </div>
    </div>
  );
};
