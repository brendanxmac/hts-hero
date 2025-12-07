import {
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/16/solid";
import { HtsElement, SectionAndChapterDetails } from "../interfaces/hts";
import { useClassification } from "../contexts/ClassificationContext";

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
  const { htsno, description, indent } = element;
  const { classification, updateLevel } = useClassification();

  const isHeadingCandidate = Boolean(
    classification &&
      classification.levels[0] &&
      classification.levels[0].candidates.find(
        (candidate) => candidate.uuid === element.uuid
      )
  );

  const breadcrumbItems = [
    {
      label: `S${sectionAndChapter.section.number}`,
      value: sectionAndChapter.section.description,
    },
    {
      label: `Ch ${sectionAndChapter.chapter.number}`,
      value: sectionAndChapter.chapter.description,
    },
    ...parents.map((parent) => ({
      label: parent.htsno,
      value: parent.description,
    })),
  ];

  const isHeading =
    indent === "0" && classification && classification.levels[0];

  return (
    <div
      className={`group relative overflow-hidden rounded-xl transition-all duration-200 cursor-pointer ${
        isHeadingCandidate
          ? "bg-gradient-to-br from-success/5 via-base-100 to-success/10 border border-success/30 shadow-sm"
          : "bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      }`}
    >
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 flex">
        {/* Add/Remove Button for Headings */}
        {isHeading && element.chapter != 98 && element.chapter != 99 && (
          <div className="flex items-center">
            <button
              className={`flex items-center justify-center w-12 h-full transition-colors ${
                isHeadingCandidate
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
          <div className="flex flex-col gap-2 min-w-0">
            {/* Breadcrumb Trail */}
            <div className="flex flex-wrap items-center gap-1 text-xs text-base-content/50">
              {breadcrumbItems.map((item, i) => (
                <span key={`bc-${i}`} className="flex items-center gap-1">
                  {item.label && (
                    <span className="font-semibold text-base-content/60">
                      {item.label}
                    </span>
                  )}
                  <span className="truncate max-w-[150px]">{item.value}</span>
                  {i < breadcrumbItems.length - 1 && (
                    <ChevronRightIcon className="w-3 h-3 text-base-content/30 shrink-0" />
                  )}
                </span>
              ))}
            </div>

            {/* HTS Code and Description */}
            <div className="flex flex-col gap-1">
              {htsno && (
                <span className="inline-flex px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary w-fit">
                  {htsno}
                </span>
              )}
              <span className="text-sm font-medium text-base-content group-hover:text-base-content transition-colors leading-relaxed">
                {description}
              </span>
            </div>
          </div>

          <ChevronRightIcon className="shrink-0 w-5 h-5 text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
        </div>
      </div>
    </div>
  );
};
