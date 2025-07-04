import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { LoadingIndicator } from "../LoadingIndicator";
import { useEffect, useRef, useState } from "react";
import { Loader } from "../../interfaces/ui";
import { CandidateElements } from "../CandidateElements";
import {
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
import { useHts } from "../../contexts/HtsContext";
import { TertiaryLabel } from "../TertiaryLabel";
import { SecondaryLabel } from "../SecondaryLabel";
import { fetchUser } from "../../libs/supabase/user";
import { useUser } from "../../contexts/UserContext";

export interface ClassificationStepProps {
  workflowStep: WorkflowStep;
  setWorkflowStep: (step: WorkflowStep) => void;
  classificationLevel: number | undefined;
  setClassificationLevel: (level: number | undefined) => void;
  setFetchingOptionsOrSuggestions: (fetching: boolean) => void;
}

export const ClassificationStep = ({
  workflowStep,
  setWorkflowStep,
  classificationLevel,
  setClassificationLevel,
  setFetchingOptionsOrSuggestions,
}: ClassificationStepProps) => {
  const { setActiveTab } = useClassifyTab();
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });
  const { user } = useUser();
  const { classification, addLevel } = useClassification();
  const { articleDescription, levels } = classification;
  const previousArticleDescriptionRef = useRef<string>(articleDescription);
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);
  const [sectionCandidates, setSectionCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);
  // const [showConfirmation, setShowConfirmation] = useState(false);
  const { htsElements } = useHts();

  const selectionForLevel = levels[classificationLevel]?.selection;
  const optionsForLevel = levels[classificationLevel]?.candidates.length;

  useEffect(() => {
    setFetchingOptionsOrSuggestions(loading.isLoading);
  }, [loading.isLoading]);

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
      return "Results";
    } else {
      return "Next";
    }
  };

  // Get 2-3 Best Sections
  const getSections = async () => {
    setLoading({ isLoading: true, text: "Looking for Candidates" });

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
    setLoading({ isLoading: true, text: "Looking for Candidates" });
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
    setLoading({ isLoading: true, text: "Looking for Candidates" });
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

  const getStepDescription = (level: number) => {
    if (level === 0) {
      return "Find & select the most suitable heading for this item";
    } else if (level === 1) {
      return "Select the option that best matches your item description when added onto your first selection";
    } else {
      return "Select the option that best matches your item description when added onto your prior selection(s)";
    }
  };

  const getStepInstructions = () => {
    if (classificationLevel === 0) {
      return (
        <div className="w-full flex justify-between items-center">
          <div>
            Easily find and add candidates using the{" "}
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
          value="If an option below was added onto your prior selection(s) which would best describe your item?"
          color={Color.NEUTRAL_CONTENT}
        />
      );
    }
  };

  // const completeClassification = async () => {
  //   setLoading({ isLoading: true, text: "Generating Report" });
  //   const userProfile = await fetchUser(user.id);
  //   await downloadClassificationReport(classification, userProfile);
  //   setLoading({ isLoading: false, text: "" });
  //   setShowConfirmation(false);
  // };

  return (
    <div className="h-full flex flex-col pt-8 overflow-hidden">
      <div className="flex-1 overflow-hidden px-8 w-full max-w-3xl mx-auto flex flex-col gap-4 overflow-y-scroll">
        <div className="flex flex-col gap-3">
          <TertiaryLabel
            value={`Level ${classificationLevel + 1}`}
            color={Color.NEUTRAL_CONTENT}
          />

          <div className="w-full flex justify-between items-end">
            <div className="w-full flex flex-col">
              <PrimaryLabel
                value={getStepDescription(classificationLevel)}
                color={Color.WHITE}
              />
              {getStepInstructions()}
            </div>
          </div>
          {/* TODO: show the analysis (suggestion) for the current level */}
          {
            // levels[classificationLevel] &&
            //   levels[classificationLevel].suggestionReason && (
            //     <div className="flex flex-col gap-2">
            //       <div className="flex gap-1 text-accent items-center">
            //         <SparklesIcon className="h-4 w-4 text-accent" />
            //         <SecondaryLabel value="Analysis" color={Color.ACCENT} />
            //       </div>
            //       <div className="flex flex-col gap-2">
            //         {/* <TertiaryLabel value="Reasoning:" /> */}
            //         <p className="text-white">
            //           {levels[classificationLevel].suggestionReason}
            //         </p>
            //         <p className="text-xs italic text-gray-400">
            //           HTS Hero can make mistakes. Always exercise your own
            //           judgement
            //         </p>
            //       </div>
            //     </div>
            //   )
          }

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

        <div className="h-full flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              {/* <ListBulletIcon className="h-5 w-5 text-white" /> */}
              {/* Get the number of options for this level */}
              <SecondaryLabel
                value={
                  optionsForLevel ? `Options (${optionsForLevel})` : "Options"
                }
                color={Color.WHITE}
              />
            </div>
            {loading.isLoading && <LoadingIndicator text={loading.text} />}
            {/* <button className="btn btn-xs btn-primary">
              <MagnifyingGlassIcon className="h-4 w-4 text-white" />
              <TertiaryText value="Find Headings" color={Color.WHITE} />
            </button> */}
          </div>
          {levels[classificationLevel] &&
            levels[classificationLevel].candidates.length > 0 && (
              <div className="h-full flex flex-col gap-4">
                <CandidateElements
                  key={`classification-level-${classificationLevel}`}
                  classificationLevel={classificationLevel}
                  setClassificationLevel={setClassificationLevel}
                  setLoading={setLoading}
                  setWorkflowStep={setWorkflowStep}
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
                setWorkflowStep(WorkflowStep.RESULT);
              } else {
                setClassificationLevel(classificationLevel + 1);
              }
            },
            disabled:
              classification.levels.length === 0 ||
              workflowStep === WorkflowStep.RESULT ||
              !selectionForLevel,
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
      {/* {showConfirmation && (
        <ConfirmationCard
          title="🎉 Classification Complete"
          description="To download a report of the classification, click the button below. NOTE: Your classification will NOT be saved if you leave this page"
          confirmText="Download"
          cancelText="Close"
          onConfirm={completeClassification}
          onCancel={() => setShowConfirmation(false)}
        />
      )} */}
    </div>
  );
};
