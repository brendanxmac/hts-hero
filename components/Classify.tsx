"use client";

import { useEffect, useState } from "react";
import { CandidateSelection, HtsElement, HtsSection } from "../interfaces/hts";
import { getBestDescriptionCandidates } from "../libs/hts";
import { getHtsSectionsAndChapters } from "../libs/hts";
import { elementsAtClassificationLevel } from "../utilities/data";
import { setIndexInArray } from "../utilities/data";
import { useChapters } from "../contexts/ChaptersContext";
import { HtsLevel } from "../enums/hts";
import { useClassification } from "../contexts/ClassificationContext";
import { DescriptionStep } from "./workflow/DescriptionStep";
import { AnalysisStep } from "./workflow/AnalysisStep";
import { ClassificationStep } from "./workflow/ClassificationStep";
import { WorkflowStep } from "../app/classify/page";

interface ClassifyProps {
  workflowStep: WorkflowStep;
  setWorkflowStep: (step: WorkflowStep) => void;
  setShowExplore: (show: boolean) => void;
}

export const Classify = ({ workflowStep, setWorkflowStep }: ClassifyProps) => {
  const { fetchChapter, getChapterElements } = useChapters();
  const { setProductDescription, addToProgressionLevels } = useClassification();
  const [localProductDescription, setLocalProductDescription] = useState("");
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);
  const [sectionCandidates, setSectionCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [classificationIndentLevel, setClassificationIndentLevel] = useState(1);
  const [loading, setLoading] = useState({ isLoading: false, text: "" });

  // Get 2-3 Best Sections
  const getSections = async () => {
    setLoading({ isLoading: true, text: "Finding Best Sections" });
    const sectionsResponse = await getHtsSectionsAndChapters();
    setHtsSections(sectionsResponse.sections);
    const sections = sectionsResponse.sections;
    const bestSectionCandidates = await getBestDescriptionCandidates(
      [],
      localProductDescription,
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
          localProductDescription,
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
          localProductDescription,
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
    setClassificationIndentLevel(classificationIndentLevel + 1);
    setLoading({ isLoading: false, text: "" });
  };

  useEffect(() => {
    if (localProductDescription) {
      setProductDescription(localProductDescription);
      getSections();
    }
  }, [localProductDescription]);

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

  if (workflowStep === WorkflowStep.DESCRIPTION) {
    return <DescriptionStep setWorkflowStep={setWorkflowStep} />;
  }

  if (workflowStep === WorkflowStep.ANALYSIS) {
    return <AnalysisStep setWorkflowStep={setWorkflowStep} />;
  }

  if (workflowStep === WorkflowStep.CLASSIFICATION) {
    return <ClassificationStep setWorkflowStep={setWorkflowStep} />;
  }

  //   return (
  //     <section className="grow h-full w-full flex flex-col items-start gap-4">
  //       <div className="w-full flex flex-col overflow-auto gap-4">
  //         <div className="w-full overflow-y-scroll flex flex-col gap-8">
  //           <div className="flex flex-col gap-4">
  //             <TextInput
  //               label="Item Description"
  //               placeholder="Enter item description"
  //               setProductDescription={setLocalProductDescription}
  //             />
  //             {/* <TextInput
  //             label="Analysis"
  //             placeholder="Enter product analysis"
  //             setProductDescription={() => {}}
  //           /> */}
  //           </div>

  //           {loading.isLoading && <LoadingIndicator text={loading.text} />}

  //           {classification.progressionLevels.length > 0 &&
  //             classification.progressionLevels.map((level, index) => (
  //               <CandidateElements
  //                 key={`classification-level-${index}`}
  //                 indentLevel={index}
  //                 classificationProgression={classification.progressionLevels}
  //                 setClassificationProgression={(progression) =>
  //                   setClassification((prev: Classification) => ({
  //                     ...prev,
  //                     progressionLevels: progression,
  //                   }))
  //                 }
  //                 productDescription={localProductDescription}
  //               />
  //             ))}
  //         </div>
  //       </div>
  //     </section>
  //   );
};
