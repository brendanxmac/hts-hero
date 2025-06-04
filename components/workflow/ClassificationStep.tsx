import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { LoadingIndicator } from "../LoadingIndicator";
import { useEffect, useState } from "react";
import { Loader } from "../../interfaces/ui";
import { CandidateElements } from "../CandidateElements";
import {
  getBestDescriptionCandidates,
  getDirectChildrenElements,
  getElementsInChapter,
  getProgressionDescriptions,
} from "../../libs/hts";
import { CandidateSelection, HtsElement } from "../../interfaces/hts";
import { HtsSection } from "../../interfaces/hts";
import { getHtsSectionsAndChapters } from "../../libs/hts";
import { setIndexInArray } from "../../utilities/data";
import { elementsAtClassificationLevel } from "../../utilities/data";
import { TertiaryText } from "../TertiaryText";
import { PrimaryLabel } from "../PrimaryLabel";
import { Color } from "../../enums/style";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { StepNavigation } from "./StepNavigation";
import { useClassifyTab } from "../../contexts/ClassifyTabContext";
import { ClassifyTab } from "../../enums/classify";
import {
  createClassification,
  generateClassificationReport,
} from "../../libs/classification";
import { ConfirmationCard } from "../ConfirmationCard";
import { useHts } from "../../contexts/HtsContext";
import { SecondaryLabel } from "../SecondaryLabel";
import { SecondaryText } from "../SecondaryText";

export interface ClassificationStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
  classificationLevel: number | undefined;
  setClassificationLevel: (level: number | undefined) => void;
}

export const ClassificationStep = ({
  setWorkflowStep,
  classificationLevel,
  setClassificationLevel,
}: ClassificationStepProps) => {
  const { setActiveTab } = useClassifyTab();
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });
  const { classification, addLevel, updateLevel, setClassification } =
    useClassification();
  const { articleDescription, levels, progressionDescription } = classification;
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);
  const [sectionCandidates, setSectionCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [locallySelectedElement, setLocallySelectedElement] = useState<
    HtsElement | undefined
  >(undefined);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { htsElements } = useHts();

  const selectionForLevel = levels[classificationLevel]?.selection;

  const selectedElementIsFinalElement = () => {
    const selectedElement = locallySelectedElement || selectionForLevel;

    if (!selectedElement) {
      return false;
    }

    return (
      getDirectChildrenElements(
        selectedElement,
        getElementsInChapter(htsElements, selectedElement.chapter)
      ).length === 0
    );
  };

  const getNextNavigationLabel = () => {
    const isFinalElement = selectedElementIsFinalElement();

    if (isFinalElement) {
      return "Finish";
    } else {
      return "Continue";
    }
  };

  // Get 2-3 Best Sections
  const getSections = async () => {
    setLoading({ isLoading: true, text: "Finding Best Sections" });
    const sectionsResponse = await getHtsSectionsAndChapters();
    setHtsSections(sectionsResponse.sections);
    const sections = sectionsResponse.sections;
    const bestSectionCandidates = await getBestDescriptionCandidates(
      [],
      articleDescription,
      true,
      0,
      2,
      sections.map((s) => s.description)
    );

    const candidates: CandidateSelection[] =
      bestSectionCandidates.bestCandidates.map((sectionCandidate) => ({
        index: sections[sectionCandidate.index].number,
        description: sections[sectionCandidate.index].description,
        logic: sectionCandidate.logic,
      }));

    setSectionCandidates(candidates);
    setLoading({ isLoading: false, text: "" });
  };

  // Get 2-3 Best Chapters
  const getChapters = async () => {
    setLoading({ isLoading: true, text: "Finding Best Chapters" });
    const candidateSections = htsSections.filter((section) => {
      return sectionCandidates.some((candidate) => {
        return candidate.index === section.number;
      });
    });

    const candidatesForChapter: CandidateSelection[] = [];

    await Promise.all(
      candidateSections.map(async (section) => {
        const bestChapterCandidates = await getBestDescriptionCandidates(
          [],
          articleDescription,
          true,
          0,
          2,
          section.chapters.map((c) => c.description)
        );

        const candidates: CandidateSelection[] =
          bestChapterCandidates.bestCandidates.map((chapterCandidate) => ({
            index: section.chapters[chapterCandidate.index].number,
            description: section.chapters[chapterCandidate.index].description,
            logic: chapterCandidate.logic,
          }));

        candidatesForChapter.push(...candidates);
      })
    );

    setChapterCandidates(candidatesForChapter);
    setLoading({ isLoading: false, text: "" });
  };

  // Get up to 2 Best Headings Per Chapter
  const getHeadings = async () => {
    setLoading({ isLoading: true, text: "Finding Best Headings" });
    const candidatesForHeading: HtsElement[] = [];
    await Promise.all(
      chapterCandidates.map(async (chapter) => {
        const chapterElements = getElementsInChapter(
          htsElements,
          chapter.index
        );

        const chapterElementsWithParentIndex = setIndexInArray(chapterElements);
        const elementsAtLevel = elementsAtClassificationLevel(
          chapterElementsWithParentIndex,
          0
        );
        const bestCandidateHeadings = await getBestDescriptionCandidates(
          elementsAtLevel,
          articleDescription,
          false,
          0,
          2,
          elementsAtLevel.map((e) => e.description)
        );

        // Handle Empty Case
        if (bestCandidateHeadings.bestCandidates.length === 0) {
          return;
        }

        // Handle Negative Index Case (sometimes chatGPT will do this)
        if (bestCandidateHeadings.bestCandidates[0].index < 0) {
          return;
        }

        const candidates = bestCandidateHeadings.bestCandidates
          .map((candidate) => {
            return elementsAtLevel[candidate.index];
          })
          .map((candidate) => ({
            ...candidate,
          }));

        candidatesForHeading.push(...candidates);
      })
    );

    updateLevel(0, {
      candidates: candidatesForHeading,
    });

    // DO not move this down, it will break the classification as the timing is critical
    setLoading({ isLoading: false, text: "" });
  };

  useEffect(() => {
    if (classificationLevel === 0 && levels.length === 0) {
      setClassificationLevel(0);
      // TODO: see if we already do this elsewhere and if it should happen here
      addLevel([]);
      getSections();
    }
  }, []);

  useEffect(() => {
    if (
      sectionCandidates &&
      sectionCandidates.length > 0 &&
      chapterCandidates.length === 0
    ) {
      getChapters();
    }
  }, [sectionCandidates]);

  useEffect(() => {
    if (
      chapterCandidates &&
      chapterCandidates.length > 0 &&
      levels[0] &&
      levels[0].candidates.length === 0
    ) {
      getHeadings();
    }
  }, [chapterCandidates]);

  const getStepDescription = () => {
    return "Select the option that best matches the item description";
  };

  const getStepInstructions = () => {
    if (classificationLevel === 0) {
      return (
        <div className="w-full flex justify-between items-center">
          <div className="text-sm">
            Don&apos;t see any options that make sense? You find and add
            candidates to the list using the{" "}
            <button
              className="btn-link"
              onClick={() => setActiveTab(ClassifyTab.EXPLORE)}
              disabled={loading.isLoading}
            >
              explorer
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <TertiaryText
          value="If an option below was added onto the following in-progress classification, which best matches the item description?"
          color={Color.NEUTRAL_CONTENT}
        />
      );
    }
  };

  const completeClassification = async () => {
    setLoading({ isLoading: true, text: "Generating Report" });
    const doc = await generateClassificationReport(classification);

    // Generate a filename based on the current date and time
    const now = new Date();
    const formattedDate = now
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/[/:]/g, "-")
      .replace(",", "");

    // Save the PDF
    doc.save(`hts-hero-classification-${formattedDate}.pdf`);

    setLoading({ isLoading: false, text: "" });
    setShowConfirmation(false);
  };

  return (
    <div className="h-full flex flex-col pt-8">
      {/* Content */}
      <div className="flex-1 overflow-hidden px-8 w-full max-w-3xl mx-auto flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <TertiaryText
              value={`Level ${classificationLevel + 1}`}
              color={Color.NEUTRAL_CONTENT}
            />
            {loading.isLoading && <LoadingIndicator text={loading.text} />}
          </div>
          <div className="w-full flex justify-between items-end">
            <div className="w-full flex flex-col">
              <PrimaryLabel value={getStepDescription()} color={Color.WHITE} />
              {getStepInstructions()}
            </div>
          </div>
          {classificationLevel > 0 && (
            <div className="">
              {getProgressionDescriptions(
                classification,
                classificationLevel - 1
              ).map(
                (description, index) =>
                  description && (
                    <TertiaryText
                      key={index}
                      value={`${"-".repeat(index + 1)} ${description}`}
                      color={Color.NEUTRAL_CONTENT}
                    />
                  )
              )}
            </div>
          )}
        </div>

        <div className="h-full flex flex-col gap-8 overflow-hidden">
          {levels[classificationLevel] &&
            levels[classificationLevel].candidates.length > 0 && (
              <div className="h-full flex flex-col gap-4">
                {/* <SecondaryLabel value="Options:" color={Color.WHITE} /> */}
                <CandidateElements
                  key={`classification-level-${classificationLevel}`}
                  indentLevel={classificationLevel}
                  locallySelectedElement={locallySelectedElement}
                  setLocallySelectedElement={setLocallySelectedElement}
                />
              </div>
            )}
        </div>
      </div>
      {/* Horizontal line */}
      <div className="w-full border-t-2 border-base-100" />
      {/* Navigation */}
      <div className="w-full max-w-3xl mx-auto px-8">
        <StepNavigation
          next={{
            label: getNextNavigationLabel(),
            onClick: () => {
              // * If a local selection has been made, want to:
              // 1. Take the current level and update the selection to be the locally selected element
              // 2. If any children exist for the locally selected element create a new level with those children
              // 3. Regardless of whether a local selection was made,
              //    a. Set locally selected to undefined
              //    b. Increment the classification level

              if (locallySelectedElement) {
                const newProgressionLevels = levels.slice(
                  0,
                  classificationLevel + 1
                );
                newProgressionLevels[classificationLevel].selection =
                  locallySelectedElement;

                const childrenOfSelectedElement = getDirectChildrenElements(
                  locallySelectedElement,
                  getElementsInChapter(
                    htsElements,
                    locallySelectedElement.chapter
                  )
                );

                if (childrenOfSelectedElement.length > 0) {
                  setClassification({
                    ...classification,
                    progressionDescription:
                      progressionDescription +
                      " > " +
                      locallySelectedElement.description,
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
                    progressionDescription:
                      progressionDescription +
                      " > " +
                      locallySelectedElement.description,
                    levels: newProgressionLevels,
                  });
                  setShowConfirmation(true);
                  console.log("HEREREERE");
                }
              }

              if (getNextNavigationLabel() === "Finish") {
                setShowConfirmation(true);
              }

              setLocallySelectedElement(undefined);
            },
            disabled: !locallySelectedElement && !selectionForLevel,
          }}
          previous={{
            label: "Back",
            onClick: () => {
              if (classificationLevel === 0) {
                setWorkflowStep(WorkflowStep.ANALYSIS);
              } else {
                setClassificationLevel(classificationLevel - 1);
              }
            },
          }}
        />
      </div>
      {showConfirmation && (
        <ConfirmationCard
          title="🎉 Classification Complete"
          description="To download a report of the classification, click the button below. NOTE: After closing this window or refreshing the page, your classification will NOT be saved"
          confirmText="Download Report"
          cancelText="Close"
          onConfirm={completeClassification}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};
