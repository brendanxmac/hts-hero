import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { LoadingIndicator } from "../LoadingIndicator";
import { useEffect, useRef, useState } from "react";
import { Loader } from "../../interfaces/ui";
import { CandidateElements } from "../CandidateElements";
import {
  getBestClassificationProgression,
  getBestDescriptionCandidates,
  getElementsInChapter,
  getProgressionDescriptionWithArrows,
} from "../../libs/hts";
import {
  CandidateSelection,
  Classification,
  HtsElement,
} from "../../interfaces/hts";
import { HtsSection } from "../../interfaces/hts";
import { getHtsSectionsAndChapters } from "../../libs/hts";
import { setIndexInArray } from "../../utilities/data";
import { elementsAtClassificationLevel } from "../../utilities/data";
import { TertiaryText } from "../TertiaryText";
import { PrimaryLabel } from "../PrimaryLabel";
import { Color } from "../../enums/style";
import { useClassifyTab } from "../../contexts/ClassifyTabContext";
import { ClassifyTab } from "../../enums/classify";
import { useHts } from "../../contexts/HtsContext";
import { SecondaryLabel } from "../SecondaryLabel";
import Modal from "../Modal";
import { SearchCrossRulings } from "../SearchCrossRulings";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { PencilSquareIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { TertiaryLabel } from "../TertiaryLabel";

export interface ClassificationStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
  classificationLevel: number | undefined;
  setClassificationLevel: (level: number | undefined) => void;
  setFetchingOptionsOrSuggestions: (fetching: boolean) => void;
}

export const ClassificationStep = ({
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
  const [showCrossRulingsModal, setShowCrossRulingsModal] = useState(false);
  const { classification, addLevel, updateLevel, setClassification } =
    useClassification();
  const { articleDescription, levels } = classification;
  const [showNotes, setShowNotes] = useState(
    Boolean(levels[classificationLevel]?.notes)
  );
  const previousArticleDescriptionRef = useRef<string>(articleDescription);
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);
  const [sectionCandidates, setSectionCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);
  const { htsElements } = useHts();

  const optionsForLevel = levels[classificationLevel]?.candidates.length;

  useEffect(() => {
    setFetchingOptionsOrSuggestions(loading.isLoading);
  }, [loading.isLoading]);

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
      1,
      3,
      sections.map((s) => s.description)
    );

    const candidates: CandidateSelection[] =
      bestSectionCandidates.bestCandidates.map((candidateIndex) => ({
        index: sections[candidateIndex].number,
        // description: sections[sectionCandidate.index].description,
        // logic: sectionCandidate.logic,
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
          1,
          3,
          section.chapters.map((c) => c.description)
        );

        const candidates: CandidateSelection[] =
          bestChapterCandidates.bestCandidates.map((candidateIndex) => ({
            index: section.chapters[candidateIndex].number,
            // description: section.chapters[chapterCandidate.index].description,
            // logic: chapterCandidate.logic,
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
          1,
          3,
          elementsAtLevel.map((e) => e.description)
        );

        // Handle Empty Case
        if (bestCandidateHeadings.bestCandidates.length === 0) {
          return;
        }

        // Handle Negative Index Case (sometimes chatGPT will do this)
        if (bestCandidateHeadings.bestCandidates[0] < 0) {
          return;
        }

        const candidates = bestCandidateHeadings.bestCandidates
          .map((candidateIndex) => {
            return elementsAtLevel[candidateIndex];
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

  // const getBestCandidate = async () => {
  //   const candidates = levels[classificationLevel].candidates;

  //   setLoading({
  //     isLoading: true,
  //     text: "Analyzing Candidates",
  //   });

  //   const simplifiedCandidates = candidates.map((e) => ({
  //     code: e.htsno,
  //     description: e.description,
  //   }));

  //   const progressionDescription = getProgressionDescriptionWithArrows(
  //     levels,
  //     classificationLevel
  //   );

  //   const {
  //     index: suggestedCandidateIndex,
  //     logic: suggestionReason,
  //     questions: suggestionQuestions,
  //   } = await getBestClassificationProgression(
  //     simplifiedCandidates,
  //     progressionDescription,
  //     articleDescription
  //   );

  //   console.log(progressionDescription);
  //   console.log(suggestedCandidateIndex);
  //   console.log(suggestionReason);
  //   console.log(suggestionQuestions);

  //   const bestCandidate = candidates[suggestedCandidateIndex - 1];

  //   // TODO: find a way to prevent this from happening
  //   // specifically, when user leaves the page (goes back to classifications)
  //   // this event below will trigger cause the component is still mounted and
  //   // classification will be undefined cause we set it that way when use leaves page
  //   // Ideas:
  //   // - Don't set to undefined when user leaves page
  //   // - Don't classifications should be its own page

  //   setClassification((prev: Classification) => {
  //     const newProgressionLevels = [...prev.levels];
  //     newProgressionLevels[classificationLevel] = {
  //       ...newProgressionLevels[classificationLevel],
  //       analysisElement: bestCandidate,
  //       analysisReason: suggestionReason,
  //       analysisQuestions: suggestionQuestions,
  //     };
  //     return {
  //       ...prev,
  //       levels: newProgressionLevels,
  //     };
  //   });

  //   setLoading({
  //     isLoading: false,
  //     text: "",
  //   });
  // };

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
      return "Find & select the most suitable heading for the item";
    } else {
      return "Select the most suitable candidate based on the item description";
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-scroll">
      <div className="flex-1 p-8 w-full max-w-4xl mx-auto flex flex-col gap-5">
        {/* HEADER */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <TertiaryLabel
              value={`Level ${classificationLevel + 1}`}
              color={Color.NEUTRAL_CONTENT}
            />
            {loading.isLoading && <LoadingIndicator text={loading.text} />}
          </div>

          <div className="w-full flex justify-between items-end">
            <div className="w-full flex flex-col gap-2">
              <PrimaryLabel
                value={getStepDescription(classificationLevel)}
                color={Color.WHITE}
              />
            </div>
          </div>
        </div>

        {/* CANDIDATES */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <SecondaryLabel
              value={
                optionsForLevel
                  ? `Candidates (${optionsForLevel})`
                  : "Candidates"
              }
              color={Color.WHITE}
            />

            <div className="flex gap-2 justify-between">
              <button
                className="grow btn btn-xs btn-primary"
                onClick={() => setActiveTab(ClassifyTab.EXPLORE)}
                disabled={loading.isLoading}
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Find Headings
              </button>
              <button
                className="grow btn btn-xs btn-primary"
                onClick={() => {
                  setShowCrossRulingsModal(true);
                }}
                disabled={loading.isLoading}
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Search CROSS
              </button>
              {/* <button
                className="btn btn-xs btn-primary"
                onClick={() => {
                  // remove analysis from this level if it exists
                  updateLevel(classificationLevel, {
                    analysisElement: undefined,
                    analysisReason: undefined,
                    analysisQuestions: undefined,
                  });
                  getBestCandidate();
                }}
                disabled={loading.isLoading}
              >
                <SparklesIcon className="w-4 h-4" />
                Analyze Options
              </button> */}
              {!showNotes && (
                <button
                  className="mx-auto btn btn-xs btn-primary"
                  onClick={() => {
                    setShowNotes(true);
                  }}
                  disabled={loading.isLoading}
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Add Notes
                </button>
              )}
            </div>
          </div>
          {levels[classificationLevel] &&
            levels[classificationLevel].candidates.length > 0 && (
              <div className="flex flex-col gap-4">
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

        {/* NOTES */}
        {showNotes && (
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-1">
                <SecondaryLabel value="Classifier Notes" color={Color.WHITE} />
                <button
                  className="btn btn-xs btn-primary"
                  onClick={() => {
                    setShowNotes(false);
                    updateLevel(classificationLevel, {
                      notes: "",
                    });
                  }}
                  disabled={loading.isLoading}
                >
                  <XMarkIcon className="w-4 h-4" />
                  Remove Notes
                </button>
              </div>
            </div>

            <textarea
              className="min-h-36 textarea textarea-bordered border-2 focus:outline-none text-white placeholder:text-white/20 placeholder:italic text-base w-full"
              placeholder="Notes added to this level are saved to your classification and included in your report."
              disabled={loading.isLoading}
              value={levels[classificationLevel]?.notes || ""}
              onChange={(e) => {
                updateLevel(classificationLevel, {
                  notes: e.target.value,
                });
              }}
            />
          </div>
        )}
      </div>
      {showCrossRulingsModal && (
        <Modal
          isOpen={showCrossRulingsModal}
          setIsOpen={setShowCrossRulingsModal}
        >
          <SearchCrossRulings searchTerm={articleDescription} />
        </Modal>
      )}
    </div>
  );
};
