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
  ClassificationStatus,
  HtsElement,
} from "../../interfaces/hts";
import { HtsSection } from "../../interfaces/hts";
import { getHtsSectionsAndChapters } from "../../libs/hts";
import { setIndexInArray } from "../../utilities/data";
import { elementsAtClassificationLevel } from "../../utilities/data";
import { useClassifyTab } from "../../contexts/ClassifyTabContext";
import { ClassifyTab } from "../../enums/classify";
import { useHts } from "../../contexts/HtsContext";
import Modal from "../Modal";
import { SearchCrossRulings } from "../SearchCrossRulings";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  QueueListIcon,
} from "@heroicons/react/16/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
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
  const isUsersClassification = classificationRecord
    ? classificationRecord.user_id === user.id
    : true;

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
    <div className="w-full min-h-full flex flex-col bg-base-100 overflow-y-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200 border-b border-base-content/5">
        {/* Subtle animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/80">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Level {classificationLevel + 1}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-base-content via-base-content to-base-content/80 bg-clip-text">
                  {getStepDescription(classificationLevel)}
                </span>
              </h1>
            </div>

            {loading.isLoading && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                <LoadingIndicator text={loading.text} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {classificationLevel === 0 && (
            <button
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-base-200/60 border border-base-content/10 hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setActiveTab(ClassifyTab.EXPLORE)}
              disabled={
                loading.isLoading ||
                classificationRecord?.status === ClassificationStatus.FINAL ||
                !isUsersClassification
              }
            >
              <MagnifyingGlassIcon className="w-4 h-4 text-primary/70" />
              <span>Find Headings</span>
            </button>
          )}
          <button
            className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-base-200/60 border border-base-content/10 hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowCrossRulingsModal(true)}
            disabled={loading.isLoading}
          >
            <MagnifyingGlassIcon className="w-4 h-4 text-primary/70" />
            <span>Search CROSS</span>
          </button>
          {!showNotes && (
            <button
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-base-200/60 border border-base-content/10 hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowNotes(true)}
              disabled={
                loading.isLoading ||
                classificationRecord?.status === ClassificationStatus.FINAL ||
                !isUsersClassification
              }
            >
              <PencilSquareIcon className="w-4 h-4 text-primary/70" />
              <span>Add Notes</span>
            </button>
          )}
        </div>

        {/* Candidates Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <QueueListIcon className="w-5 h-5 text-primary/70" />
            <span className="text-sm font-semibold uppercase tracking-wider text-base-content/70">
              {optionsForLevel
                ? `Candidates (${optionsForLevel})`
                : "Candidates"}
            </span>
          </div>

          {levels[classificationLevel] &&
            levels[classificationLevel].candidates.length > 0 && (
              <CandidateElements
                key={`classification-level-${classificationLevel}`}
                classificationLevel={classificationLevel}
                setClassificationLevel={setClassificationLevel}
                setLoading={setLoading}
                setWorkflowStep={setWorkflowStep}
                disabled={
                  !isUsersClassification ||
                  classificationRecord?.status === ClassificationStatus.FINAL ||
                  !isUsersClassification
                }
              />
            )}
        </div>

        {/* Notes Section */}
        {showNotes && (
          <div className="relative overflow-hidden rounded-2xl border border-base-content/10 bg-gradient-to-br from-base-200/60 via-base-100 to-base-200/40 p-5">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PencilSquareIcon className="w-5 h-5 text-primary/70" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-base-content/70">
                    Classification Advisory Notes
                  </span>
                </div>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-error hover:bg-error/10 transition-colors"
                  onClick={() => {
                    setShowNotes(false);
                    updateLevel(classificationLevel, { notes: "" });
                  }}
                  disabled={loading.isLoading || !isUsersClassification}
                >
                  <XMarkIcon className="w-4 h-4" />
                  Remove
                </button>
              </div>

              <textarea
                className="min-h-36 w-full px-4 py-3 rounded-xl bg-base-100/80 border border-base-content/10 transition-all duration-200 placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 hover:border-primary/30 hover:bg-base-100 resize-none text-base"
                placeholder="Notes added are saved and will be included in advisory reports you generate."
                disabled={loading.isLoading || !isUsersClassification}
                value={levels[classificationLevel]?.notes || ""}
                onChange={(e) => {
                  updateLevel(classificationLevel, { notes: e.target.value });
                }}
              />
            </div>
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
