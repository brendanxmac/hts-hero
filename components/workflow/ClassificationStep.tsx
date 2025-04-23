import { SparklesIcon } from "@heroicons/react/24/solid";
import { useClassification } from "../../contexts/ClassificationContext";
import { HtsLevel, WorkflowStep } from "../../enums/hts";
import { LoadingIndicator } from "../LoadingIndicator";
import { useEffect, useState } from "react";
import { Loader } from "../../interfaces/ui";
import { CandidateElements } from "../CandidateElements";
import { getBestDescriptionCandidates } from "../../libs/hts";
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
import SquareIconButton from "../SqaureIconButton";

interface ClassificationStepProps {
  setActiveTab: (tab: ClassifyTab) => void;
  setWorkflowStep: (step: WorkflowStep) => void;
  showExplore: boolean;
  setShowExplore: (show: boolean) => void;
  activeClassificationLevel: number | undefined;
  setActiveClassificationLevel: (level: number | undefined) => void;
}

export const ClassificationStep = ({
  setActiveTab,
  setWorkflowStep,
  showExplore,
  setShowExplore,
  activeClassificationLevel,
  setActiveClassificationLevel,
}: ClassificationStepProps) => {
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });
  const { fetchChapter, getChapterElements } = useChapters();
  const { classification, addToProgressionLevels, updateProgressionLevel } =
    useClassification();
  const { productDescription, analysis, progressionLevels } = classification;
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);
  const [sectionCandidates, setSectionCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);

  useEffect(() => {
    console.log("progressionLevels", progressionLevels);
  }, [progressionLevels]);

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
    if (progressionLevels.length === 0) {
      setActiveClassificationLevel(0);
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

  return (
    <div className="h-full flex flex-col pt-8 overflow-hidden">
      <div className="h-full grow px-8 border-b-2 border-base-100">
        <div className="h-full w-full max-w-3xl mx-auto flex flex-col gap-4">
          <div className="shrink flex flex-col gap-14">
            <div className="flex flex-col gap-4">
              <TertiaryText value="Step 3" color={Color.NEUTRAL_CONTENT} />
              <div className="w-full flex justify-between items-center">
                <div>
                  <PrimaryLabel
                    value="Select the most accurate heading"
                    color={Color.WHITE}
                  />
                  <TertiaryText
                    value="You can seach for and add candidates to the list using our explorer 👉"
                    color={Color.NEUTRAL_CONTENT}
                  />
                </div>
                <button
                  className="btn btn-primary btn-sm flex items-center gap-1"
                  onClick={() => setActiveTab(ClassifyTab.EXPLORE)}
                  disabled={loading.isLoading}
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  Search
                </button>
              </div>
            </div>
          </div>
          <div className="grow h-full flex flex-col gap-8 overflow-y-auto">
            {loading.isLoading && <LoadingIndicator text={loading.text} />}

            {progressionLevels[0] &&
              progressionLevels[0].candidates.length > 0 && (
                <div className="h-full flex flex-col gap-4">
                  {progressionLevels.map((_, index) => (
                    <CandidateElements
                      key={`classification-level-${index}`}
                      indentLevel={index}
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
      <div className="shrink w-full max-w-3xl mx-auto">
        <StepNavigation
          next={{
            label: "Continue",
            onClick: () => {
              // setAnalysis(localAnalysis);
              // setWorkflowStep(WorkflowStep.CLASSIFICATION);
            },
            disabled: progressionLevels.length === 0,
          }}
          previous={{
            label: "Back",
            onClick: () => {
              setWorkflowStep(WorkflowStep.ANALYSIS);
            },
          }}
        />
      </div>
    </div>
  );
};
