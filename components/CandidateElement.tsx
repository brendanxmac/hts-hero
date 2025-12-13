import { useState } from "react";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { HtsElement } from "../interfaces/hts";
import {
  TrashIcon,
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import PDF from "./PDF";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { useClassification } from "../contexts/ClassificationContext";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyTab } from "../enums/classify";
import {
  generateBreadcrumbsForHtsElement,
  getChapterFromHtsElement,
  getDirectChildrenElements,
  getElementsInChapter,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";
import { useHts } from "../contexts/HtsContext";
import { WorkflowStep } from "../enums/hts";
import { PDFProps } from "../interfaces/ui";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import {
  Product,
  userHasActivePurchaseForProduct,
} from "../libs/supabase/purchase";
import { isWithinPastNDays } from "../utilities/time";
import { useUser } from "../contexts/UserContext";
import { SupabaseBuckets } from "../constants/supabase";

interface Props {
  element: HtsElement;
  classificationLevel: number;
  setClassificationLevel: (level: number | undefined) => void;
  setWorkflowStep: (step: WorkflowStep) => void;
  disabled: boolean;
}

export const CandidateElement = ({
  element,
  classificationLevel,
  setClassificationLevel,
  setWorkflowStep,
  disabled = false,
}: Props) => {
  const { user } = useUser();
  const { htsno, chapter, description, indent } = element;
  const { clearBreadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { setActiveTab } = useClassifyTab();
  const { sections } = useHtsSections();
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const { classification, updateLevel, setClassification } =
    useClassification();
  const { htsElements } = useHts();
  const { levels, progressionDescription } = classification;
  const isRecommended =
    classification.levels[classificationLevel]?.analysisElement?.uuid ===
    element.uuid;
  const recommendedReason =
    classification.levels[classificationLevel]?.analysisReason;

  const isLevelSelection = Boolean(
    classification.levels.some(
      (level) => level.selection && level.selection.uuid === element.uuid
    )
  );

  const handleClassificationCompleted = async () => {
    const userCreatedDate = user ? new Date(user.created_at) : null;
    const isClassifyTrialUser = userCreatedDate
      ? isWithinPastNDays(userCreatedDate, 7)
      : false;

    const isPayingUser = user
      ? await userHasActivePurchaseForProduct(user.id, Product.CLASSIFY)
      : false;

    trackEvent(MixpanelEvent.CLASSIFICATION_COMPLETED, {
      hts_code: element.htsno,
      item: classification.articleDescription,
      is_paying_user: isPayingUser,
      is_trial_user: isClassifyTrialUser,
    });
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
        isLevelSelection
          ? "bg-gradient-to-br from-success/15 to-success/5 border-2 border-success/40 shadow-lg shadow-success/10"
          : disabled
            ? "bg-base-200/50 border border-base-content/10 cursor-not-allowed opacity-70"
            : "bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.01] cursor-pointer"
      }`}
      onClick={() => {
        if (isLevelSelection || disabled) {
          return;
        }

        const newProgressionLevels = levels.slice(0, classificationLevel + 1);
        newProgressionLevels[classificationLevel].selection = element;
        const childrenOfSelectedElement = getDirectChildrenElements(
          element,
          getElementsInChapter(htsElements, element.chapter)
        );
        if (childrenOfSelectedElement.length > 0) {
          setClassification({
            ...classification,
            isComplete: false,
            progressionDescription:
              progressionDescription + " > " + element.description,
            levels: [
              ...newProgressionLevels,
              {
                candidates: childrenOfSelectedElement,
              },
            ],
          });
          setClassificationLevel(classificationLevel + 1);
        } else {
          setClassification({
            ...classification,
            isComplete: true,
            progressionDescription:
              progressionDescription + " > " + element.description,
            levels: newProgressionLevels,
          });

          setWorkflowStep(WorkflowStep.RESULT);

          handleClassificationCompleted();
        }
      }}
    >
      {/* Subtle hover gradient */}
      {!isLevelSelection && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      <div className="relative z-10 p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {/* HTS Code Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              isLevelSelection
                ? "bg-success/20 border border-success/30"
                : "bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20"
            }`}>
              {isLevelSelection && (
                <CheckCircleIcon className="w-4 h-4 text-success" />
              )}
              <span className={`text-sm font-bold ${
                isLevelSelection ? "text-success" : "text-primary"
              }`}>
                {htsno || "Prequalifier"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              className="p-2 rounded-lg bg-base-content/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
              title={`Chapter ${chapter} Notes`}
              onClick={(e) => {
                e.stopPropagation();
                  setShowPDF({
                    title: `Chapter ${chapter} Notes`,
                    bucket: SupabaseBuckets.NOTES,
                    filePath: `/chapters/Chapter ${chapter}.pdf`,
                });
              }}
            >
              <DocumentTextIcon className="h-4 w-4 text-base-content/60" />
            </button>

            <button
              className="p-2 rounded-lg bg-base-content/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
              title="View Element"
              onClick={(e) => {
                e.stopPropagation();
                  clearBreadcrumbs();
                const sectionAndChapter = getSectionAndChapterFromChapterNumber(
                      sections,
                      Number(getChapterFromHtsElement(element, htsElements))
                    );

                  const parents = getHtsElementParents(element, htsElements);
                  const breadcrumbs = generateBreadcrumbsForHtsElement(
                    sections,
                    sectionAndChapter.chapter,
                    [...parents, element]
                  );

                  setBreadcrumbs(breadcrumbs);
                  setActiveTab(ClassifyTab.EXPLORE);
                }}
            >
              <MagnifyingGlassIcon className="h-4 w-4 text-base-content/60" />
            </button>

              {indent === "0" && (
              <button
                className="p-2 rounded-lg bg-base-content/5 hover:bg-error/10 border border-transparent hover:border-error/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={disabled}
                title="Remove"
                onClick={(e) => {
                  e.stopPropagation();
                    if (isLevelSelection) {
                      const newClassificationProgression =
                        classification.levels.slice(0, classificationLevel + 1);
                    newClassificationProgression[classificationLevel].selection =
                      null;
                    newClassificationProgression[classificationLevel].candidates =
                      newClassificationProgression[
                        classificationLevel
                      ].candidates.filter(
                        (candidate) => candidate.uuid !== element.uuid
                      );
                      setClassification({
                        ...classification,
                        levels: newClassificationProgression,
                      });
                    } else {
                      const newClassificationProgression =
                        classification.levels.slice(0, classificationLevel + 1);
                    newClassificationProgression[classificationLevel].candidates =
                      newClassificationProgression[
                        classificationLevel
                      ].candidates.filter(
                        (candidate) => candidate.uuid !== element.uuid
                      );
                      updateLevel(classificationLevel, {
                        candidates:
                          newClassificationProgression[classificationLevel]
                            .candidates,
                      });
                    }
                  }}
              >
                <TrashIcon className="h-4 w-4 text-base-content/60 hover:text-error" />
              </button>
            )}

            {/* Chevron indicator */}
            {!isLevelSelection && !disabled && (
              <ChevronRightIcon className="h-5 w-5 text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 ml-1" />
              )}
          </div>
        </div>

        {/* Description */}
        <p className={`text-base leading-relaxed ${
          isLevelSelection
            ? "font-semibold text-base-content"
            : "text-base-content/80"
        }`}>
          {description}
        </p>

        {/* AI Analysis Section */}
        {isRecommended && (
          <div className="mt-4 pt-4 border-t border-base-content/10">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20 p-4">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    HTS Hero Analysis
                  </span>
                </div>

                <p className="text-sm text-base-content/80 leading-relaxed mb-2">
                  {recommendedReason}
                </p>

                <p className="text-xs text-base-content/50 italic">
                  HTS Hero can make mistakes. Always exercise your own judgement as the classifier.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPDF && (
        <PDF
          title={showPDF.title}
          bucket={showPDF.bucket}
          filePath={showPDF.filePath}
          isOpen={showPDF !== null}
          setIsOpen={(isOpen) => {
            if (!isOpen) {
              setShowPDF(null);
            }
          }}
        />
      )}
    </div>
  );
};
