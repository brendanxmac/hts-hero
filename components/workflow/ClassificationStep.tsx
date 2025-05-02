import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { LoadingIndicator } from "../LoadingIndicator";
import { useEffect, useState } from "react";
import { Loader } from "../../interfaces/ui";
import { CandidateElements } from "../CandidateElements";
import {
  getBestDescriptionCandidates,
  getDirectChildrenElements,
} from "../../libs/hts";
import { CandidateSelection, HtsElement } from "../../interfaces/hts";
import { HtsSection } from "../../interfaces/hts";
import { getHtsSectionsAndChapters } from "../../libs/hts";
import { useChapters } from "../../contexts/ChaptersContext";
import { setIndexInArray } from "../../utilities/data";
import { elementsAtClassificationLevel } from "../../utilities/data";
import { TertiaryText } from "../TertiaryText";
import { PrimaryLabel } from "../PrimaryLabel";
import { Color } from "../../enums/style";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { StepNavigation } from "./StepNavigation";
import { useClassifyTab } from "../../contexts/ClassifyTabContext";
import { ClassifyTab } from "../../enums/classify";
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
  const { fetchChapter, getChapterElements } = useChapters();
  const { classification, addLevel, updateLevel, setClassification } =
    useClassification();
  const { articleDescription, levels } = classification;
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

  const selectionForLevel = levels[classificationLevel]?.selection;

  const selectedElementIsFinalElement = () => {
    const selectedElement = locallySelectedElement || selectionForLevel;

    if (!selectedElement) {
      return false;
    }

    return (
      getDirectChildrenElements(
        selectedElement,
        getChapterElements(selectedElement.chapter)
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

    let candidatesForChapter: CandidateSelection[] = [];

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

    // Fetch Chapter Data for the best candidates
    await Promise.all(
      candidatesForChapter.map(async (chapter) => {
        const chapterElements = getChapterElements(chapter.index);
        if (!chapterElements) {
          await fetchChapter(chapter.index);
        }
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
        let chapterData = getChapterElements(chapter.index);
        if (!chapterData) {
          await fetchChapter(chapter.index);
          chapterData = getChapterElements(chapter.index);
        }

        const chapterDataWithParentIndex = setIndexInArray(chapterData);
        const elementsAtLevel = elementsAtClassificationLevel(
          chapterDataWithParentIndex,
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
    if (classificationLevel === 0) {
      return "Select the most accurate heading";
    } else if (classificationLevel > 0) {
      return "Select the element that best matches the article description";
    }
  };

  const getStepInstructions = () => {
    if (classificationLevel === 0) {
      return "You can seach for and add candidates to the list using the explorer ->";
    } else if (classificationLevel > 0) {
      return "Which candidate most accurately matches the article description if it was added onto the in-progress classification?";
    }
  };

  return (
    <div className="h-full flex flex-col pt-8">
      {/* Content */}
      <div className="flex-1 overflow-hidden px-8 w-full max-w-3xl mx-auto flex flex-col gap-4">
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-4">
            <TertiaryText
              value={`Step ${2 + classificationLevel + 1}`}
              color={Color.NEUTRAL_CONTENT}
            />
            <div className="w-full flex justify-between items-end">
              <div className="flex flex-col">
                <PrimaryLabel
                  value={getStepDescription()}
                  color={Color.WHITE}
                />

                <TertiaryText
                  value={getStepInstructions()}
                  color={Color.NEUTRAL_CONTENT}
                />
              </div>
              {classificationLevel === 0 && (
                <button
                  className="btn btn-primary btn-sm text-white flex items-center gap-1"
                  onClick={() => setActiveTab(ClassifyTab.EXPLORE)}
                  disabled={loading.isLoading}
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  Search
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="h-full flex flex-col gap-8 overflow-hidden">
          {loading.isLoading && <LoadingIndicator text={loading.text} />}

          {levels[classificationLevel] &&
            levels[classificationLevel].candidates.length > 0 && (
              <div className="h-full gap-4">
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
                  getChapterElements(locallySelectedElement.chapter)
                );

                if (childrenOfSelectedElement.length > 0) {
                  setClassification({
                    ...classification,
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
                    levels: newProgressionLevels,
                  });
                  // TODO: Trigger the completion of the classification
                  // TODO: Trigger the completion of the classification
                  // TODO: Trigger the completion of the classification
                }
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
    </div>
  );
};
