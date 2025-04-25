import { useClassification } from "../../contexts/ClassificationContext";
import { HtsLevel, WorkflowStep } from "../../enums/hts";
import { LoadingIndicator } from "../LoadingIndicator";
import { useEffect, useState } from "react";
import { Loader } from "../../interfaces/ui";
import { CandidateElements } from "../CandidateElements";
import {
  getBestDescriptionCandidates,
  getDirectChildrenElements,
  getHtsLevel,
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
import { ClassifyTab } from "./ClassificationNavigation";
import { StepNavigation } from "./StepNavigation";

interface ClassificationStepProps {
  setActiveTab: (tab: ClassifyTab) => void;
  setWorkflowStep: (step: WorkflowStep) => void;
  classificationLevel: number | undefined;
  setClassificationLevel: (level: number | undefined) => void;
}

export const ClassificationStep = ({
  setActiveTab,
  setWorkflowStep,
  classificationLevel,
  setClassificationLevel,
}: ClassificationStepProps) => {
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });
  const { fetchChapter, getChapterElements } = useChapters();
  const { classification, addToProgressionLevels, updateProgressionLevel } =
    useClassification();
  const { productDescription, progressionLevels } = classification;
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);
  const [sectionCandidates, setSectionCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);

  const candidatesExistForLevel =
    progressionLevels[classificationLevel] &&
    progressionLevels[classificationLevel].candidates.length > 0;

  const hasSelectionForLevel =
    candidatesExistForLevel &&
    progressionLevels[classificationLevel].selection !== null;

  const canContinue = candidatesExistForLevel && hasSelectionForLevel;

  // Get 2-3 Best Sections
  const getSections = async () => {
    setLoading({ isLoading: true, text: "Finding Best Sections" });
    const sectionsResponse = await getHtsSectionsAndChapters();
    setHtsSections(sectionsResponse.sections);
    const sections = sectionsResponse.sections;
    const bestSectionCandidates = await getBestDescriptionCandidates(
      [],
      productDescription,
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
          productDescription,
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

    console.log("candidatesForChapter", candidatesForChapter);

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
          productDescription,
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

    updateProgressionLevel(0, {
      candidates: candidatesForHeading,
    });

    // DO not move this down, it will break the classification as the timing is critical
    setLoading({ isLoading: false, text: "" });
  };

  useEffect(() => {
    if (classificationLevel === 0 && progressionLevels.length === 0) {
      setClassificationLevel(0);
      // TODO: see if we already do this elsewhere and if it should happen here
      addToProgressionLevels(HtsLevel.HEADING, []);
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
      progressionLevels[0] &&
      progressionLevels[0].candidates.length === 0
    ) {
      getHeadings();
    }
  }, [chapterCandidates]);

  const getStepDescription = () => {
    if (classificationLevel === 0) {
      return "Select the most accurate heading";
    } else if (classificationLevel > 0) {
      return "Select the best matching element";
    }
  };

  const getStepInstructions = () => {
    if (classificationLevel === 0) {
      return "You can seach for and add candidates to the list using our explorer 👉";
    } else if (classificationLevel > 0) {
      return "Which candidate most accurately matches the article description if it was added onto the in-progress classification?";
    }
  };

  return (
    <div className="h-full flex flex-col pt-8 overflow-hidden">
      {/* Content */}
      <div className="grow px-8 h-full w-full max-w-3xl mx-auto flex flex-col gap-8">
        <div className="shrink flex flex-col gap-14">
          <div className="flex flex-col gap-4">
            <TertiaryText
              value={`Step ${2 + classificationLevel + 1}`}
              color={Color.NEUTRAL_CONTENT}
            />
            <div className="w-full flex justify-between items-center">
              <div className="flex flex-col gap-2">
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
        <div className="grow h-full flex flex-col gap-8 overflow-y-auto">
          {loading.isLoading && <LoadingIndicator text={loading.text} />}

          {progressionLevels[classificationLevel] &&
            progressionLevels[classificationLevel].candidates.length > 0 && (
              <div className="h-full flex flex-col gap-4">
                <CandidateElements
                  key={`classification-level-${classificationLevel}`}
                  indentLevel={classificationLevel}
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
            label: "Continue",
            onClick: () => {
              // Add another classification level IF the current level is the last level in progressionLevels
              if (classificationLevel === progressionLevels.length - 1) {
                const children = getDirectChildrenElements(
                  progressionLevels[classificationLevel].selection,
                  getChapterElements(
                    progressionLevels[classificationLevel].selection.chapter
                  )
                );

                // if this is the final level, we need to add the children to the progression levels
                if (children.length > 0) {
                  addToProgressionLevels(
                    getHtsLevel(
                      progressionLevels[classificationLevel].selection.htsno
                    ),
                    children,
                    null,
                    ""
                  );
                } else {
                  // TADA! classification complete, do something special
                }
              }
              setClassificationLevel(classificationLevel + 1);
            },
            disabled: !canContinue,
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
