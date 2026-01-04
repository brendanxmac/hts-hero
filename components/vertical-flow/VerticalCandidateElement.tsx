"use client";

import { useState } from "react";
import { useBreadcrumbs } from "../../contexts/BreadcrumbsContext";
import { HtsElement } from "../../interfaces/hts";
import {
  TrashIcon,
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import {
  MagnifyingGlassIcon,
  ChevronRightIcon,
} from "@heroicons/react/16/solid";
import PDF from "../PDF";
import { useHtsSections } from "../../contexts/HtsSectionsContext";
import { useClassification } from "../../contexts/ClassificationContext";
import {
  generateBreadcrumbsForHtsElement,
  getChapterFromHtsElement,
  getDirectChildrenElements,
  getElementsInChapter,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../../libs/hts";
import toast from "react-hot-toast";
import { useHts } from "../../contexts/HtsContext";
import { PDFProps } from "../../interfaces/ui";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import {
  Product,
  userHasActivePurchaseForProduct,
} from "../../libs/supabase/purchase";
import { isWithinPastNDays } from "../../utilities/time";
import { useUser } from "../../contexts/UserContext";
import { SupabaseBuckets } from "../../constants/supabase";

interface Props {
  element: HtsElement;
  classificationLevel: number;
  disabled: boolean;
  onOpenExplore: () => void;
}

export const VerticalCandidateElement = ({
  element,
  classificationLevel,
  disabled = false,
  onOpenExplore,
}: Props) => {
  const { user } = useUser();
  const { htsno, chapter, description, indent } = element;
  const { clearBreadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { sections } = useHtsSections();
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const { classification, updateLevel, setClassification } =
    useClassification();
  const { htsElements } = useHts();
  const { levels, progressionDescription } = classification;

  const currentLevel = levels[classificationLevel];
  const isRecommended = currentLevel?.analysisElement?.uuid === element.uuid;

  const isLevelSelection = Boolean(
    levels.some(
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

  const handleSelect = () => {
    if (isLevelSelection || disabled) {
      return;
    }

    // Truncate levels after the current one (invalidate future steps)
    const newProgressionLevels = levels.slice(0, classificationLevel + 1);
    newProgressionLevels[classificationLevel].selection = element;

    const childrenOfSelectedElement = getDirectChildrenElements(
      element,
      getElementsInChapter(htsElements, element.chapter)
    );

    if (childrenOfSelectedElement.length > 0) {
      // Not complete - add next level with children as candidates
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
    } else {
      // Complete - no more children
      setClassification({
        ...classification,
        isComplete: true,
        progressionDescription:
          progressionDescription + " > " + element.description,
        levels: newProgressionLevels,
      });

      toast.success("Classification Complete!", { duration: 5000 });
      handleClassificationCompleted();
    }
  };

  const handleViewElement = (e: React.MouseEvent) => {
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
    onOpenExplore();
    // Note: In the vertical flow, this would open the Explore modal
    // The parent component handles this via onOpenExplore
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLevelSelection) {
      // If this is the selected element, clear selection and invalidate future levels
      const newClassificationProgression = levels.slice(
        0,
        classificationLevel + 1
      );
      newClassificationProgression[classificationLevel].selection = null;
      newClassificationProgression[classificationLevel].candidates =
        newClassificationProgression[classificationLevel].candidates.filter(
          (candidate) => candidate.uuid !== element.uuid
        );
      setClassification({
        ...classification,
        isComplete: false,
        levels: newClassificationProgression,
      });
    } else {
      // Just remove from candidates
      const newClassificationProgression = levels.slice(
        0,
        classificationLevel + 1
      );
      newClassificationProgression[classificationLevel].candidates =
        newClassificationProgression[classificationLevel].candidates.filter(
          (candidate) => candidate.uuid !== element.uuid
        );
      updateLevel(classificationLevel, {
        candidates:
          newClassificationProgression[classificationLevel].candidates,
      });
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
        isLevelSelection
          ? "bg-success/15 border-2 border-success/40 shadow-lg shadow-success/10"
          : disabled
            ? "bg-base-100 border border-base-content/10 cursor-not-allowed opacity-70"
            : "bg-base-100 border border-base-content/15 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.01] cursor-pointer"
      }`}
      onClick={handleSelect}
    >
      {/* Subtle hover gradient */}
      {!isLevelSelection && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      <div className="relative z-10 p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* HTS Code Badge */}
            <div
              className={`flex items-center gap-2 ${
                isLevelSelection &&
                "bg-success/25 border border-success/40 px-3 py-1.5 rounded-lg"
              }`}
            >
              {isLevelSelection && (
                <CheckCircleIcon className="w-4 h-4 text-success" />
              )}
              {isRecommended && !isLevelSelection && (
                <SparklesIcon className="w-4 h-4 text-primary" />
              )}
              <span
                className={`text-sm ${
                  isLevelSelection
                    ? "text-success"
                    : isRecommended
                      ? "text-primary font-bold"
                      : "text-base-content/60"
                }`}
              >
                {htsno || "Prequalifier"}
              </span>
            </div>

            {/* Recommended Badge */}
            {/* {isRecommended && !isLevelSelection && (
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full">
                Recommended
              </span>
            )} */}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              className="p-1 rounded-lg bg-base-content/10 hover:bg-primary/15 border border-transparent hover:border-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="p-1 rounded-lg bg-base-content/10 hover:bg-primary/15 border border-transparent hover:border-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
              title="View Element"
              onClick={handleViewElement}
            >
              <MagnifyingGlassIcon className="h-4 w-4 text-base-content/60" />
            </button>

            {indent === "0" && (
              <button
                className="p-1 rounded-lg bg-base-content/10 hover:bg-error/15 border border-transparent hover:border-error/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
                title="Remove"
                onClick={handleRemove}
              >
                <TrashIcon className="h-4 w-4 text-base-content/60 hover:text-error" />
              </button>
            )}

            {/* Chevron indicator */}
            {!isLevelSelection && !disabled && (
              <ChevronRightIcon className="h-5 w-5 text-base-content/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 ml-1" />
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-base leading-relaxed font-bold">{description}</p>
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
