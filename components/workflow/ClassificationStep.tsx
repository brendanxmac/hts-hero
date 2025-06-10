import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { LoadingIndicator } from "../LoadingIndicator";
import { useEffect, useRef, useState } from "react";
import { Loader } from "../../interfaces/ui";
import { CandidateElements } from "../CandidateElements";
import {
  downloadClassificationReport,
  getBestDescriptionCandidates,
  getDirectChildrenElements,
  getElementsInChapter,
} from "../../libs/hts";
import { CandidateSelection, HtsElement } from "../../interfaces/hts";
import { HtsSection } from "../../interfaces/hts";
import { getHtsSectionsAndChapters } from "../../libs/hts";
import { setIndexInArray } from "../../utilities/data";
import { elementsAtClassificationLevel } from "../../utilities/data";
import { TertiaryText } from "../TertiaryText";
import { PrimaryLabel } from "../PrimaryLabel";
import { Color } from "../../enums/style";
import { StepNavigation } from "./StepNavigation";
import { useClassifyTab } from "../../contexts/ClassifyTabContext";
import { ClassifyTab } from "../../enums/classify";
import { ConfirmationCard } from "../ConfirmationCard";
import { useHts } from "../../contexts/HtsContext";

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
  const { classification, addLevel, setClassification } = useClassification();
  const { articleDescription, levels } = classification;
  const previousArticleDescriptionRef = useRef<string>(articleDescription);
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);
  const [sectionCandidates, setSectionCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { htsElements } = useHts();

  const selectionForLevel = levels[classificationLevel]?.selection;

  const selectedElementIsFinalElement = () => {
    if (!selectionForLevel) {
      return false;
    }

    return (
      getDirectChildrenElements(
        selectionForLevel,
        getElementsInChapter(htsElements, selectionForLevel.chapter)
      ).length === 0
    );
  };

  const getNextNavigationLabel = () => {
    const isFinalElement = selectedElementIsFinalElement();

    if (isFinalElement) {
      return "🎉 Complete";
    } else {
      return "Next";
    }
  };

  // Get 2-3 Best Sections
  const getSections = async () => {
    console.log("Getting Sections");
    setLoading({ isLoading: true, text: "Finding Best Options" });

    let sections = htsSections;

    if (sections.length === 0) {
      const sectionsResponse = await getHtsSectionsAndChapters();
      setHtsSections(sectionsResponse.sections);
      sections = sectionsResponse.sections;
    }

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
    console.log("Getting Chapters");
    setLoading({ isLoading: true, text: "Finding Best Options" });
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
    console.log("Getting Headings");
    setLoading({ isLoading: true, text: "Finding Best Options" });
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

    addLevel(candidatesForHeading);

    // DO not move this down, it will break the classification as the timing is critical
    setLoading({ isLoading: false, text: "" });
  };

  useEffect(() => {
    if (previousArticleDescriptionRef.current !== articleDescription) {
      setClassificationLevel(0);
      setSectionCandidates([]);
      setChapterCandidates([]);
      previousArticleDescriptionRef.current = articleDescription;
    }
  }, [articleDescription]);

  useEffect(() => {
    if (
      levels[classificationLevel] === undefined ||
      (levels[classificationLevel] !== undefined &&
        levels[classificationLevel].candidates.length === 0)
    ) {
      getSections();
    }
  }, [classificationLevel]);

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
    if (chapterCandidates && chapterCandidates.length > 0) {
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
          value="Which option would most accurately describe the item if it was added onto your prior selection(s)?"
          color={Color.NEUTRAL_CONTENT}
        />
      );
    }
  };

  const completeClassification = async () => {
    setLoading({ isLoading: true, text: "Generating Report" });
    await downloadClassificationReport(classification);
    setLoading({ isLoading: false, text: "" });
    setShowConfirmation(false);
  };

  return (
    <div className="h-full flex flex-col pt-8">
      <div className="flex-1 overflow-hidden px-8 w-full max-w-3xl mx-auto flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
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
          {/* Breadcrumbs to show where element came from */}
          {/* {classificationLevel > 0 && (
            <div className="">
              {getProgressionDescriptions(
                classification,
                classificationLevel - 1
              ).map(
                (description, index) =>
                  description && (
                    <TertiaryLabel
                      key={index}
                      value={`${"-".repeat(index + 1)} ${description}`}
                      color={Color.WHITE}
                    />
                  )
              )}
            </div>
          )} */}
        </div>

        <div className="h-full flex flex-col gap-8 overflow-hidden">
          {levels[classificationLevel] &&
            levels[classificationLevel].candidates.length > 0 && (
              <div className="h-full flex flex-col gap-4">
                <CandidateElements
                  key={`classification-level-${classificationLevel}`}
                  classificationLevel={classificationLevel}
                  setClassificationLevel={setClassificationLevel}
                  setLoading={setLoading}
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
              if (selectedElementIsFinalElement()) {
                setShowConfirmation(true);
              } else {
                setClassificationLevel(classificationLevel + 1);
              }
            },
            disabled:
              classification.levels.length === 0 ||
              classificationLevel === classification.levels.length - 1,
          }}
          previous={{
            label: "Back",
            onClick: () => {
              if (classificationLevel === 0) {
                setWorkflowStep(WorkflowStep.DESCRIPTION);
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
          description="To download a report of the classification, click the button below. NOTE: Your classification will NOT be saved if you leave this page"
          confirmText="Download"
          cancelText="Close"
          onConfirm={completeClassification}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};
