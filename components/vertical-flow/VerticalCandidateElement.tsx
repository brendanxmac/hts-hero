"use client";

import { useExploreModal } from "../../contexts/ExploreModalContext";
import { HtsElement } from "../../interfaces/hts";
import {
  TrashIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
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
import { useHts } from "../../contexts/HtsContext";
import { openUsitcHtsFileInNewTab } from "@/libs/usitc-hts-file-url";
import { isAboveSixDigits } from "../../libs/hts-code";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import {
  Product,
  userHasActivePurchaseForProduct,
} from "../../libs/supabase/purchase";
import { useUser } from "../../contexts/UserContext";
import { useIsReadOnly } from "../../contexts/ReadOnlyContext";

interface Props {
  element: HtsElement;
  classificationLevel: number;
  disabled: boolean;
}

export const VerticalCandidateElement = ({
  element,
  classificationLevel,
  disabled = false,
}: Props) => {
  const readOnly = useIsReadOnly();
  const { openExplore } = useExploreModal();
  const { user } = useUser();
  const { htsno, chapter, description, indent } = element;
  const { sections } = useHtsSections();
  const { classification, classificationId, updateLevel, setClassification } =
    useClassification();
  const { htsElements } = useHts();
  const { levels, progressionDescription } = classification;

  const currentLevel = levels[classificationLevel];
  const isAiRecommended =
    currentLevel?.analysisElement?.uuid === element.uuid;
  const isRecommended =
    isAiRecommended && !isAboveSixDigits(htsno ?? "");

  const isLevelSelection = Boolean(
    levels.some(
      (level) => level.selection && level.selection.uuid === element.uuid
    )
  );

  const handleClassificationCompleted = async () => {
    const isPayingUser = user
      ? await userHasActivePurchaseForProduct(user.id, Product.CLASSIFY)
      : false;

    trackEvent(MixpanelEvent.CLASSIFICATION_COMPLETED, {
      hts_code: element.htsno,
      item: classification.articleDescription,
      is_paying_user: isPayingUser,
      is_anonymous: !user,
    });
    if (!user) {
      trackEvent(MixpanelEvent.ANONYMOUS_CLASSIFICATION_COMPLETED, {
        classification_id: classificationId,
        hts_code: element.htsno,
        item: classification.articleDescription,
      });
    }
  };

  const handleSelect = () => {
    if (isLevelSelection || disabled) {
      return;
    }

    const childrenOfSelectedElement = getDirectChildrenElements(
      element,
      getElementsInChapter(htsElements, element.chapter)
    );
    const completesClassification = childrenOfSelectedElement.length === 0;

    trackEvent(MixpanelEvent.CANDIDATE_SELECTED, {
      classification_id: classificationId,
      hts_code: element.htsno,
      level: classificationLevel,
      completes_classification: completesClassification,
      is_recommended: isRecommended,
    });

    const newProgressionLevels = levels.slice(0, classificationLevel + 1);
    newProgressionLevels[classificationLevel].selection = element;

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
    } else {
      setClassification({
        ...classification,
        isComplete: true,
        progressionDescription:
          progressionDescription + " > " + element.description,
        levels: newProgressionLevels,
      });

      handleClassificationCompleted();
    }
  };

  const handleViewElement = (e: React.MouseEvent) => {
    e.stopPropagation();
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

    openExplore("classification_modal", breadcrumbs);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLevelSelection) {
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
      className={`group relative rounded-lg border transition-all duration-150 ${isLevelSelection
        ? "bg-success/5 border-success/40 ring-1 ring-success/20"
        : readOnly
          ? "bg-base-100 border-base-300"
          : disabled
            ? "bg-base-100 border-base-300 cursor-not-allowed opacity-60"
            : "bg-base-100 border-base-300 hover:border-primary/40 hover:bg-base-200/30 cursor-pointer"
        }`}
      onClick={readOnly ? undefined : handleSelect}
    >
      <div className="p-3">
        {/* Top row: code + actions */}
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            {isRecommended && !isLevelSelection && (
              <SparklesIcon className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
            <span
              className={`text-xs sm:text-sm font-mono font-semibold truncate ${isLevelSelection
                ? "text-success"
                : isRecommended
                  ? "text-primary"
                  : "text-base-content/50"
                }`}
            >
              {htsno || "—"}
            </span>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                className="btn btn-ghost btn-xs btn-square"
                disabled={disabled}
                title={`Chapter ${chapter} Notes`}
                onClick={(e) => {
                  e.stopPropagation();
                  openUsitcHtsFileInNewTab(`Chapter ${chapter}`);
                }}
              >
                <DocumentTextIcon className="h-3.5 w-3.5 text-base-content/40" />
              </button>

              <button
                className="btn btn-ghost btn-xs btn-square"
                disabled={disabled}
                title="View Element"
                onClick={handleViewElement}
              >
                <MagnifyingGlassIcon className="h-3.5 w-3.5 text-base-content/40" />
              </button>

              {indent === "0" && (
                <button
                  className="btn btn-ghost btn-xs btn-square"
                  disabled={disabled}
                  title="Remove"
                  onClick={handleRemove}
                >
                  <TrashIcon className="h-3.5 w-3.5 text-base-content/40 hover:text-error" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p
          className={`text-sm md:text-base leading-relaxed ${isLevelSelection
            ? "font-semibold text-base-content"
            : "font-medium text-base-content/80"
            }`}
        >
          {description}
        </p>
      </div>

    </div>
  );
};
