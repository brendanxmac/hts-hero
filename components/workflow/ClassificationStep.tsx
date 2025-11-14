import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { LoadingIndicator } from "../LoadingIndicator";
import { useEffect, useRef, useState } from "react";
import { Loader } from "../../interfaces/ui";
import { CandidateElements } from "../CandidateElements";
import {
  getBestDescriptionCandidates,
  getElementsInChapter,
} from "../../libs/hts";
import {
  CandidateSelection,
  ClassificationRecord,
  HtsElement,
} from "../../interfaces/hts";
import { HtsSection } from "../../interfaces/hts";
import { getHtsSectionsAndChapters } from "../../libs/hts";
import { setIndexInArray } from "../../utilities/data";
import { elementsAtClassificationLevel } from "../../utilities/data";
import { PrimaryLabel } from "../PrimaryLabel";
import { Color } from "../../enums/style";
import { useClassifyTab } from "../../contexts/ClassifyTabContext";
import { ClassifyTab } from "../../enums/classify";
import { useHts } from "../../contexts/HtsContext";
import { SecondaryLabel } from "../SecondaryLabel";
import Modal from "../Modal";
import { SearchCrossRulings } from "../SearchCrossRulings";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { TertiaryLabel } from "../TertiaryLabel";
import toast from "react-hot-toast";
import { useUser } from "../../contexts/UserContext";

export interface ClassificationStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
  classificationLevel: number | undefined;
  setClassificationLevel: (level: number | undefined) => void;
  setFetchingOptionsOrSuggestions: (fetching: boolean) => void;
  classificationRecord: ClassificationRecord;
}

export const ClassificationStep = ({
  setWorkflowStep,
  classificationLevel,
  setClassificationLevel,
  setFetchingOptionsOrSuggestions,
  classificationRecord,
}: ClassificationStepProps) => {
  const { setActiveTab } = useClassifyTab();
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });

  const { user } = useUser();
  const [showCrossRulingsModal, setShowCrossRulingsModal] = useState(false);
  const { classification, addLevel, updateLevel } = useClassification();
  const { articleDescription, levels } = classification;
  const [showNotes, setShowNotes] = useState(
    Boolean(levels[classificationLevel]?.notes)
  );
  const previousArticleDescriptionRef = useRef<string>(articleDescription);
  const isMountedRef = useRef(true);
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);
  const [sectionCandidates, setSectionCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);
  const { htsElements } = useHts();

  const optionsForLevel = levels[classificationLevel]?.candidates.length;
  const isUsersClassification = classificationRecord.user_id === user.id;

  useEffect(() => {
    setFetchingOptionsOrSuggestions(loading.isLoading);
  }, [loading.isLoading]);

  // Get 2-3 Best Sections
  const getSections = async () => {
    setLoading({ isLoading: true, text: "Looking for Candidates" });

    let sections = htsSections;

    try {
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
    } catch (err) {
      console.error("Error getting sections", err);
      toast.error("Failed to find suitable sections. Please try again.");
    } finally {
      setLoading({ isLoading: false, text: "" });
    }
  };

  // Get 2-3 Best Chapters
  const getChapters = async () => {
    setLoading({ isLoading: true, text: "Looking for Candidates" });

    try {
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
    } catch (err) {
      console.error("Error getting chapters", err);
      toast.error("Failed to find suitable chapters. Please try again.");
    } finally {
      setLoading({ isLoading: false, text: "" });
    }
  };

  // Get up to 2 Best Headings Per Chapter
  const getHeadings = async () => {
    setLoading({ isLoading: true, text: "Looking for Candidates" });
    const candidatesForHeading: HtsElement[] = [];

    try {
      await Promise.all(
        chapterCandidates.map(async (chapter) => {
          const chapterElements = getElementsInChapter(
            htsElements,
            chapter.index
          );

          const chapterElementsWithParentIndex =
            setIndexInArray(chapterElements);
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

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        console.log("Component unmounted, skipping state update");
        return;
      }

      addLevel(candidatesForHeading);
    } catch (err) {
      console.error("Error getting headings", err);
      toast.error("Failed to find suitable headings. Please try again.");
    } finally {
      // DO not move this down, it will break the classification as the timing is critical
      setLoading({ isLoading: false, text: "" });
    }
  };

  useEffect(() => {
    // Set mounted to true when component mounts
    isMountedRef.current = true;

    // Cleanup function to mark as unmounted
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
              {classificationLevel === 0 && (
                <button
                  className="grow btn btn-xs btn-primary"
                  onClick={() => setActiveTab(ClassifyTab.EXPLORE)}
                  disabled={loading.isLoading}
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Find Headings
                </button>
              )}
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
                  disabled={
                    classificationRecord.finalized || !isUsersClassification
                  }
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
