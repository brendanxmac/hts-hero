import { useState } from "react";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { HtsElement } from "../interfaces/hts";
import SquareIconButton from "./SqaureIconButton";
import {
  TrashIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import PDF from "./PDF";
import { classNames } from "../utilities/style";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { useClassification } from "../contexts/ClassificationContext";
import { Color } from "../enums/style";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyTab } from "../enums/classify";
import { TertiaryLabel } from "./TertiaryLabel";
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
import { userHasActivePurchase } from "../libs/supabase/purchase";
import { isWithinPastNDays } from "../utilities/time";
import { useUser } from "../contexts/UserContext";
import { SecondaryText } from "./SecondaryText";
import { SupabaseBuckets } from "../constants/supabase";
import { TertiaryText } from "./TertiaryText";
import { SecondaryLabel } from "./SecondaryLabel";

interface Props {
  element: HtsElement;
  classificationLevel: number;
  setClassificationLevel: (level: number | undefined) => void;
  setWorkflowStep: (step: WorkflowStep) => void;
}

export const CandidateElement = ({
  element,
  classificationLevel,
  setClassificationLevel,
  setWorkflowStep,
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
  // const suggestedQuestions =
  //   classification.levels[classificationLevel]?.analysisQuestions;

  // Check all progression levels to see if this element is selected in any of them
  const isLevelSelection = Boolean(
    classification.levels.some(
      (level) => level.selection && level.selection.uuid === element.uuid
    )
  );

  const handleClassificationCompleted = async () => {
    const userCreatedDate = user ? new Date(user.created_at) : null;
    const isTrialUser = userCreatedDate
      ? isWithinPastNDays(userCreatedDate, 14)
      : false;

    const isPayingUser = user ? await userHasActivePurchase(user.id) : false;

    // Track classification completed event
    trackEvent(MixpanelEvent.CLASSIFICATION_COMPLETED, {
      hts_code: element.htsno,
      item: classification.articleDescription,
      is_paying_user: isPayingUser,
      is_trial_user: isTrialUser,
    });
  };

  return (
    <div
      className={classNames(
        "flex w-full rounded-md bg-base-100 p-4 gap-4",
        isLevelSelection && "shadow-[inset_0_0_0_4px_oklch(var(--p))]",
        !isLevelSelection &&
          "hover:cursor-pointer hover:bg-base-300 border-2 border-neutral-content"
      )}
      onClick={() => {
        if (isLevelSelection) {
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
      <div className="flex flex-col w-full gap-5">
        {/* {indent === "0" && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap">
              {getBreadCrumbsForElement(element, sections, htsElements).map(
                (breadcrumb, i) => (
                  <span key={`breadcrumb-${i}`} className="text-xs">
                    {breadcrumb.label && <b>{breadcrumb.label} </b>}
                    <span
                      className={`${!breadcrumb.value ? "font-bold" : "text-white"}`}
                    >
                      {breadcrumb.value}
                    </span>
                    <span className="text-white mx-2">›</span>
                  </span>
                )
              )}
            </div>
            <div className="w-full h-[1px] bg-base-content/10" />
          </div>
        )} */}

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <TertiaryLabel
              value={htsno ? `${htsno}` : "Prequalifier"}
              color={Color.NEUTRAL_CONTENT}
            />
            <div className="flex gap-2">
              <SquareIconButton
                transparent
                tooltip={`Chapter ${chapter} Notes`}
                icon={<DocumentTextIcon className="h-4 w-4" />}
                onClick={() =>
                  setShowPDF({
                    title: `Chapter ${chapter} Notes`,
                    bucket: SupabaseBuckets.NOTES,
                    filePath: `/chapters/Chapter ${chapter}.pdf`,
                  })
                }
              />

              <SquareIconButton
                transparent
                icon={<MagnifyingGlassIcon className="h-4 w-4" />}
                tooltip={`View Element`}
                onClick={() => {
                  clearBreadcrumbs();
                  const sectionAndChapter =
                    getSectionAndChapterFromChapterNumber(
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
              />

              {indent === "0" && (
                <SquareIconButton
                  transparent
                  icon={<TrashIcon className="h-4 w-4" />}
                  tooltip={`Remove`}
                  onClick={() => {
                    if (isLevelSelection) {
                      const newClassificationProgression =
                        classification.levels.slice(0, classificationLevel + 1);
                      newClassificationProgression[
                        classificationLevel
                      ].selection = null;

                      // remove this element from the candidates of this level
                      newClassificationProgression[
                        classificationLevel
                      ].candidates = newClassificationProgression[
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

                      newClassificationProgression[
                        classificationLevel
                      ].candidates = newClassificationProgression[
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
                />
              )}
            </div>
          </div>
          {isLevelSelection ? (
            <SecondaryLabel value={description} color={Color.WHITE} />
          ) : (
            <SecondaryText value={description} color={Color.WHITE} />
          )}
        </div>

        {isRecommended && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-1 text-accent items-center">
              <SparklesIcon className="h-4 w-4 text-primary" />
              <TertiaryLabel value="HTS Hero Analysis" color={Color.PRIMARY} />
            </div>

            <div className="flex flex-col gap-2 ml-1">
              <TertiaryText color={Color.WHITE} value={recommendedReason} />

              <p className="text-xs text-gray-400">
                HTS Hero can make mistakes. Always exercise your own judgement
                as the classifier.
              </p>
            </div>

            {/* {suggestedQuestions && suggestedQuestions.length > 0 && (
              <div className="flex flex-col gap-2">
                <TertiaryLabel value="Potential Clarifications:" />
                <div className="flex flex-col gap-1 ml-2">
                  {suggestedQuestions.map((question, i) => (
                    <p
                      key={`suggested-question-${i}`}
                      className="text-sm dark:text-white/90"
                    >
                      {question}
                    </p>
                  ))}
                </div>
              </div>
            )} */}
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
