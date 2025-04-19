import { PencilIcon } from "@heroicons/react/24/solid";
import { useClassification } from "../../contexts/ClassificationContext";
import { HtsLevel, WorkflowStep } from "../../enums/hts";
import SquareIconButton from "../SqaureIconButton";
import { TextDisplay } from "../TextDisplay";
import { WorkflowHeader } from "./WorkflowHeader";
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

interface ClassificationStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
  showExplore: boolean;
  setShowExplore: (show: boolean) => void;
}

export const ClassificationStep = ({
  setWorkflowStep,
  showExplore,
  setShowExplore,
}: ClassificationStepProps) => {
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });
  const { fetchChapter, getChapterElements } = useChapters();
  const { classification, addToProgressionLevels } = useClassification();
  const { productDescription, analysis, progressionLevels } = classification;

  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);
  const [sectionCandidates, setSectionCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);

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

    addToProgressionLevels(HtsLevel.HEADING, candidatesForHeading);
    // DO not move this down, it will break the classification as the timing is critical
    setLoading({ isLoading: false, text: "" });
  };

  useEffect(() => {
    if (sectionCandidates && sectionCandidates.length > 0) {
      getChapters();
    }
  }, [sectionCandidates]);

  useEffect(() => {
    if (chapterCandidates && chapterCandidates.length > 0) {
      getHeadings();
    }
  }, [chapterCandidates]);

  useEffect(() => {
    if (progressionLevels.length === 0) {
      addToProgressionLevels(HtsLevel.HEADING, []);
    }
  }, []);

  return (
    <div className="h-full flex flex-col gap-8">
      <WorkflowHeader
        currentStep={WorkflowStep.CLASSIFICATION}
        previousStep={WorkflowStep.ANALYSIS}
        setWorkflowStep={setWorkflowStep}
        showExplore={showExplore}
        setShowExplore={setShowExplore}
      />

      <div className="border-b border-base-content/10 pb-4 flex justify-between">
        <TextDisplay title="Item Description" text={productDescription} />
        <SquareIconButton
          icon={<PencilIcon className="h-4 w-4" />}
          onClick={() => {
            setWorkflowStep(WorkflowStep.DESCRIPTION);
          }}
        />
      </div>

      <div className="border-b border-base-content/10 pb-4 flex flex-col">
        <div className="flex justify-between">
          <TextDisplay title="Item Analysis" text={analysis} />
          {!analysis && (
            <SquareIconButton
              icon={<PencilIcon className="h-4 w-4" />}
              onClick={() => {
                console.log("generate analysis clicked");
              }}
            />
          )}
        </div>
        {!analysis && <span className="text-sm text-base-content/50">N/A</span>}
      </div>

      <div>
        {loading.isLoading && <LoadingIndicator text={loading.text} />}

        {progressionLevels.length > 0 &&
          progressionLevels.map((level, index) => (
            <CandidateElements
              key={`classification-level-${index}`}
              indentLevel={index}
            />
          ))}
      </div>
    </div>
  );
};
