"use client";

import { useClassification } from "../../contexts/ClassificationContext";
import { useSectionChapterDiscovery } from "../../contexts/SectionChapterDiscoveryContext";
import { useEffect, useRef, useState } from "react";
import { Loader } from "../../interfaces/ui";
import {
  getBestClassificationProgression,
  getBestDescriptionCandidates,
  getElementsInChapter,
  getProgressionDescriptionWithArrows,
  getSectionsAndChaptersFromCandidates,
  fetchNotesForSectionsAndChapters,
  addReferenceCodesToElements,
  transformTextWithVerifiedHtsCodes,
  HTS_CODE_REGEX,
} from "../../libs/hts";
import { NoteRecord } from "../../types/hts";
import {
  ClassificationRecord,
  ClassificationStatus,
  HtsElement,
  LevelSelection,
} from "../../interfaces/hts";
import { copyToClipboard, setIndexInArray } from "../../utilities/data";
import { elementsAtClassificationLevel } from "../../utilities/data";
import { useHts } from "../../contexts/HtsContext";
import Modal from "../Modal";
import { SearchCrossRulings } from "../SearchCrossRulings";
import {
  MagnifyingGlassIcon,
  QueueListIcon,
  ChevronDownIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/16/solid";
import toast from "react-hot-toast";
import { useUser } from "../../contexts/UserContext";
import { VerticalCandidateElement } from "./VerticalCandidateElement";
import Fuse from "fuse.js";

export interface VerticalClassificationStepProps {
  classificationLevel: number;
  classificationRecord: ClassificationRecord;
  onOpenExplore: () => void;
  disableAutoScroll?: boolean;
}

export const VerticalClassificationStep = ({
  classificationLevel,
  classificationRecord,
  onOpenExplore,
  disableAutoScroll = false,
}: VerticalClassificationStepProps) => {
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });

  const { user } = useUser();
  const [showCrossRulingsModal, setShowCrossRulingsModal] = useState(false);
  const {
    classification,
    updateLevel,
    classificationTier,
    addNotes,
    getNotesForSectionsAndChapters,
  } = useClassification();
  const { articleDescription, articleAnalysis, levels } = classification;
  const [isExpanded, setIsExpanded] = useState(true);
  const previousArticleDescriptionRef = useRef<string>(articleDescription);
  const isMountedRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { htsElements } = useHts();
  const hasFetchedCandidatesRef = useRef(false);
  const [isAnalysisCopied, setIsAnalysisCopied] = useState(false);

  // Get chapter candidates from the discovery context
  const { chapterCandidates, chapterDiscoveryComplete } =
    useSectionChapterDiscovery();

  const handleCopyCostClick = () => {
    copyToClipboard(currentLevel?.analysisReason || "");
    setIsAnalysisCopied(true);
    setTimeout(() => setIsAnalysisCopied(false), 2000);
  };

  // Auto-scroll to this component when chapter discovery completes (for level 0 only)
  useEffect(() => {
    if (
      classificationLevel === 0 &&
      chapterDiscoveryComplete &&
      containerRef.current &&
      !disableAutoScroll
    ) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [classificationLevel, chapterDiscoveryComplete, disableAutoScroll]);

  const currentLevel = levels[classificationLevel];
  const optionsForLevel = currentLevel?.candidates?.length || 0;
  const hasSelection = Boolean(currentLevel?.selection);
  const selectedElement = currentLevel?.selection;
  const isUsersClassification = classificationRecord
    ? classificationRecord.user_id === user.id
    : true;

  const isDisabled =
    !isUsersClassification ||
    classificationRecord?.status === ClassificationStatus.FINAL;

  // Determine if we should show collapsed state
  const isCollapsed = hasSelection && !isExpanded;

  // Auto-collapse when a selection is made (immediate, no animation)
  useEffect(() => {
    if (hasSelection && isExpanded) {
      setIsExpanded(false);
    }
  }, [hasSelection]);

  /**
   * Fetches all relevant notes for the given candidates.
   * Checks the context cache first, fetches missing notes, and adds them to context.
   */
  const getNotesForCandidates = async (
    simplifiedCandidates: { code: string; description: string }[]
  ): Promise<NoteRecord[]> => {
    // Extract sections and chapters from candidates
    const { sections, chapters } =
      getSectionsAndChaptersFromCandidates(simplifiedCandidates);

    // Check which notes we already have in context
    const { existingNotes, missingSections, missingChapters } =
      getNotesForSectionsAndChapters(sections, chapters);

    // Fetch any missing notes
    if (missingSections.length > 0 || missingChapters.length > 0) {
      console.log(
        `Fetching missing notes: ${missingSections.length} sections, ${missingChapters.length} chapters`
      );
      console.log("Fetching Note from Database");
      const fetchedNotes = await fetchNotesForSectionsAndChapters(
        missingSections,
        missingChapters
      );

      // Add fetched notes to context cache
      if (fetchedNotes.length > 0) {
        addNotes(fetchedNotes);
      }

      // Return all notes (existing + newly fetched)
      return [...existingNotes, ...fetchedNotes];
    } else {
      console.log(" 🚀 All notes were already in context 🚀");
    }

    // All notes were already in context
    return existingNotes;
  };

  // Fetch AI analysis when candidates are loaded and no analysis exists yet
  useEffect(() => {
    isMountedRef.current = true;

    const findBestClassificationProgression = async () => {
      if (
        currentLevel?.candidates?.length > 0 &&
        !currentLevel?.analysisElement
      ) {
        setLoading({
          isLoading: true,
          text: "Analyzing Candidates",
        });

        const coreElements = htsElements.filter((e) => e.chapter < 98);

        // Create Fuse index ONCE for all lookups (major perf improvement)
        const fuse = new Fuse(coreElements, {
          keys: ["htsno"],
          threshold: 0.3,
          includeScore: true,
        });

        const elementsWithReferencedCodes = addReferenceCodesToElements(
          currentLevel.candidates,
          coreElements,
          fuse
        );

        const simplifiedCandidates = elementsWithReferencedCodes.map((e) => {
          let finalDescription = e.description;

          if (e.description.match(HTS_CODE_REGEX)) {
            const enhancedDescription = transformTextWithVerifiedHtsCodes(
              e.description,
              coreElements,
              fuse
            );

            if (e.description !== enhancedDescription) {
              finalDescription = enhancedDescription;
            }
          }

          return {
            code: e.htsno,
            description: finalDescription,
            referencedCodes: e.referencedCodes,
          };
        });

        const selectionPath =
          classificationLevel > 0
            ? levels
                .map((level, i): LevelSelection => {
                  if (level.selection) {
                    return {
                      level: i + 1,
                      description: level.selection.description,
                    };
                  }
                  return null;
                })
                .filter((selection) => selection !== null)
            : [];

        try {
          if (!isMountedRef.current) return;

          let relevantNotes: NoteRecord[] = [];

          if (classificationTier === "premium") {
            // Fetch all relevant notes for the candidates
            relevantNotes = await getNotesForCandidates(simplifiedCandidates);
          }

          const {
            index: suggestedCandidateIndex,
            analysis: suggestionReason,
            questions: suggestionQuestions,
          } = await getBestClassificationProgression(
            simplifiedCandidates,
            selectionPath,
            articleDescription + "\n" + articleAnalysis,
            classificationLevel,
            classificationTier,
            relevantNotes
          );

          if (!isMountedRef.current) return;

          const bestCandidate =
            currentLevel.candidates[suggestedCandidateIndex];

          updateLevel(classificationLevel, {
            analysisElement: bestCandidate,
            analysisReason: suggestionReason,
            analysisQuestions: suggestionQuestions,
          });
        } catch (error) {
          console.error("Error analyzing candidates:", error);
        } finally {
          if (isMountedRef.current) {
            setLoading({ isLoading: false, text: "" });
          }
        }
      }
    };

    if (
      currentLevel?.candidates?.length > 0 &&
      !currentLevel?.analysisElement
    ) {
      findBestClassificationProgression();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [currentLevel?.candidates?.length]);

  // Get up to 2 Best Headings Per Chapter
  const getHeadings = async () => {
    console.log("FINDING HEADINGS");
    setLoading({ isLoading: true, text: "Looking for Headings" });
    const candidatesForHeading: (HtsElement & {
      referencedCodes: Record<string, string>;
    })[] = [];

    console.log("Chapter Candidates:");
    console.log(chapterCandidates);

    try {
      await Promise.all(
        chapterCandidates.map(async (chapterCandidate) => {
          const chapterElements = getElementsInChapter(
            htsElements,
            chapterCandidate.chapter.number
          );

          const chapterElementsWithParentIndex =
            setIndexInArray(chapterElements);
          const elementsAtLevel = elementsAtClassificationLevel(
            chapterElementsWithParentIndex,
            0
          );

          const coreElements = htsElements.filter((e) => e.chapter < 98);

          // Create Fuse index ONCE for all lookups (major perf improvement)
          const fuse = new Fuse(coreElements, {
            keys: ["htsno"],
            threshold: 0.3,
            includeScore: true,
          });

          // Add referencedCodes to each element for LLM context
          const elementsWithReferencedCodes = addReferenceCodesToElements(
            elementsAtLevel,
            coreElements,
            fuse
          );

          const enrichedCandidates = elementsWithReferencedCodes.map((e) => {
            let finalDescription = e.description;

            if (e.description.match(HTS_CODE_REGEX)) {
              const enhancedDescription = transformTextWithVerifiedHtsCodes(
                e.description,
                coreElements,
                fuse
              );

              if (e.description !== enhancedDescription) {
                console.log("Enhanced Description:");
                console.log(e.description);
                console.log(enhancedDescription);

                finalDescription = enhancedDescription;
              }
            }

            return {
              ...e,
              description: finalDescription,
            };
          });

          const bestCandidateHeadings = await getBestDescriptionCandidates(
            enrichedCandidates,
            articleDescription,
            false,
            null,
            3
          );

          console.log(
            `Best Candidate Headings for ${chapterCandidate.chapter.description}:`
          );
          console.log(bestCandidateHeadings);

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
              // Use elementsWithReferencedCodes to preserve referencedCodes
              return elementsWithReferencedCodes[candidateIndex];
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

      // Update the existing level 0 with candidates instead of adding a new level
      updateLevel(0, { candidates: candidatesForHeading });
    } catch (err) {
      console.error("Error getting headings", err);
      toast.error("Failed to find suitable headings. Please try again.");
    } finally {
      setLoading({ isLoading: false, text: "" });
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (previousArticleDescriptionRef.current !== articleDescription) {
      previousArticleDescriptionRef.current = articleDescription;
    }
  }, [articleDescription]);

  // Fetch headings once chapter discovery is complete (for level 0 only)
  useEffect(() => {
    if (
      classificationLevel === 0 &&
      chapterDiscoveryComplete &&
      chapterCandidates.length > 0 &&
      !hasFetchedCandidatesRef.current &&
      (levels[classificationLevel] === undefined ||
        levels[classificationLevel].candidates.length === 0)
    ) {
      hasFetchedCandidatesRef.current = true;
      getHeadings();
    }
  }, [classificationLevel, chapterDiscoveryComplete, chapterCandidates]);

  const getStepDescription = (level: number) => {
    if (level === 0) {
      return "Find & select the most suitable candidate for the item";
    } else {
      return "Which next candidate best fits the item description?";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border ${
        isCollapsed
          ? "border-success/30 bg-base-200/50"
          : "border-base-content/15 bg-base-200/50"
      }`}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl ${
            isCollapsed ? "bg-success/10" : "bg-primary/10"
          }`}
        />
      </div>

      <div className="relative z-10 p-6">
        {/* Persistent Header */}
        <div
          className="flex items-center justify-between mb-4 hover:cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span
            className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-300 ${
              hasSelection ? "text-success" : "text-primary"
            }`}
          >
            Level {classificationLevel + 1}
          </span>

          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-base-content/5 hover:bg-base-content/10 transition-all duration-200"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDownIcon
              className={`w-4 h-4 text-base-content/60 transition-transform duration-300 ease-in-out ${
                isCollapsed ? "-rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Selected Element Summary - shown when collapsed */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isCollapsed ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          {selectedElement && (
            <div className="p-4 rounded-xl bg-base-100 border border-base-content/10">
              <div className="flex items-center gap-3">
                {selectedElement.htsno && (
                  <span className="shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold bg-success/20 text-success border border-success/30">
                    {selectedElement.htsno}
                  </span>
                )}
                <p className="text-base font-bold text-base-content leading-relaxed">
                  {selectedElement.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            !isCollapsed ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          {/* Description */}
          <h2 className="text-xl font-bold text-base-content mb-6">
            {getStepDescription(classificationLevel)}
          </h2>

          {/* Candidates Header Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <QueueListIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-base-content/80">
                    {optionsForLevel
                      ? `Candidates (${optionsForLevel})`
                      : "Candidates"}
                  </span>
                </div>
                {loading.isLoading && (
                  <div className="flex items-center gap-1.5 text-primary/70">
                    <span className="loading loading-spinner loading-xs"></span>
                    <span className="text-xs font-medium">{loading.text}</span>
                  </div>
                )}
              </div>
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {classificationLevel === 0 && (
                  <button
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-base-100 border border-base-content/15 hover:border-primary/40 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onOpenExplore}
                    disabled={loading.isLoading || isDisabled}
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 text-primary" />
                    <span>Find Headings</span>
                  </button>
                )}
                <button
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-base-100 border border-base-content/15 hover:border-primary/40 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowCrossRulingsModal(true)}
                  disabled={loading.isLoading}
                >
                  <MagnifyingGlassIcon className="w-4 h-4 text-primary" />
                  <span>Search CROSS</span>
                </button>
                {/* {!showNotes && (
                  <button
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-base-100 border border-base-content/15 hover:border-primary/40 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowNotes(true)}
                    disabled={loading.isLoading || isDisabled}
                  >
                    <PencilSquareIcon className="w-4 h-4 text-primary" />
                    <span>Add Notes</span>
                  </button>
                )} */}
              </div>
            </div>

            {currentLevel && currentLevel.candidates?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {currentLevel.candidates.map((element) => (
                  <VerticalCandidateElement
                    key={element.uuid}
                    element={element}
                    classificationLevel={classificationLevel}
                    disabled={isDisabled}
                    onOpenExplore={onOpenExplore}
                  />
                ))}
              </div>
            ) : (
              // Loading skeleton when candidates are being fetched
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-base-content/10 bg-base-100 p-5 animate-pulse"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="h-4 w-24 bg-base-content/10 rounded" />
                      <div className="flex gap-1">
                        <div className="h-6 w-6 bg-base-content/10 rounded-lg" />
                        <div className="h-6 w-6 bg-base-content/10 rounded-lg" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-base-content/10 rounded" />
                      <div className="h-4 w-3/4 bg-base-content/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analysis Section */}
          <div className="w-full mt-6 flex flex-col gap-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-wider text-base-content/80">
                  Analysis
                </span>
              </div>
              <button
                className={`btn btn-sm gap-1.5 btn-neutral shrink-0`}
                onClick={handleCopyCostClick}
              >
                {isAnalysisCopied ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : (
                  <ClipboardDocumentIcon className="w-4 h-4" />
                )}
                {isAnalysisCopied ? "Copied!" : "Copy"}
              </button>
            </div>

            {currentLevel?.analysisReason ? (
              <div className="relative overflow-hidden rounded-xl bg-base-100 border border-primary/20 p-4">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                </div>
                <div className="relative z-10">
                  <p className="text-base leading-relaxed text-base-content whitespace-pre-line mb-3">
                    {currentLevel.analysisReason}
                  </p>
                  <p className="text-xs text-base-content/60">
                    Analysis is for information purposes only and may not be
                    correct. Always exercise your own judgement as the
                    classifier.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-base-content/10 bg-base-100 p-4">
                <p className="text-sm text-base-content/60 italic">
                  {loading.isLoading && loading.text === "Analyzing Candidates"
                    ? "Analyzing candidates..."
                    : loading.isLoading
                      ? loading.text
                      : "Analysis will appear here after candidates are evaluated."}
                </p>
              </div>
            )}
          </div>
        </div>
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
