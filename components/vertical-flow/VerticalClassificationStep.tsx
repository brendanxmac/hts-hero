"use client";

import { useClassification } from "../../contexts/ClassificationContext";
import { useSectionChapterDiscovery } from "../../contexts/SectionChapterDiscoveryContext";
import { useEffect, useRef, useState } from "react";
import { Loader } from "../../interfaces/ui";
import {
  getBestDescriptionCandidates,
  getElementsInChapter,
} from "../../libs/hts";
import {
  ClassificationRecord,
  ClassificationStatus,
  HtsElement,
} from "../../interfaces/hts";
import { setIndexInArray } from "../../utilities/data";
import { elementsAtClassificationLevel } from "../../utilities/data";
import { useHts } from "../../contexts/HtsContext";
import Modal from "../Modal";
import { SearchCrossRulings } from "../SearchCrossRulings";
import {
  MagnifyingGlassIcon,
  QueueListIcon,
  ChevronDownIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";
import toast from "react-hot-toast";
import { useUser } from "../../contexts/UserContext";
import { VerticalCandidateElement } from "./VerticalCandidateElement";
import {
  fetchHtsNotesBySectionAndChapter,
  getSectionAndChapterFromHtsCode,
} from "../../libs/supabase/hts-notes";

export interface VerticalClassificationStepProps {
  classificationLevel: number;
  classificationRecord: ClassificationRecord;
  onOpenExplore: () => void;
}

export const VerticalClassificationStep = ({
  classificationLevel,
  classificationRecord,
  onOpenExplore,
}: VerticalClassificationStepProps) => {
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });

  const { user } = useUser();
  const [showCrossRulingsModal, setShowCrossRulingsModal] = useState(false);
  const { classification, updateLevel, classificationTier } =
    useClassification();
  const { articleDescription, levels } = classification;
  const [isExpanded, setIsExpanded] = useState(true);
  const previousArticleDescriptionRef = useRef<string>(articleDescription);
  const isMountedRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { htsElements } = useHts();
  const hasFetchedCandidatesRef = useRef(false);

  // Get chapter candidates from the discovery context
  const { chapterCandidates, chapterDiscoveryComplete } =
    useSectionChapterDiscovery();

  // Auto-scroll to this component when chapter discovery completes (for level 0 only)
  useEffect(() => {
    if (
      classificationLevel === 0 &&
      chapterDiscoveryComplete &&
      containerRef.current
    ) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [classificationLevel, chapterDiscoveryComplete]);

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

  // Get up to 2 Best Headings Per Chapter
  const getHeadings = async () => {
    setLoading({ isLoading: true, text: "Looking for Headings" });
    const candidatesForHeading: HtsElement[] = [];

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

          const sectionAndChaptersForCandidates = candidatesForHeading
            .map((candidate) =>
              getSectionAndChapterFromHtsCode(candidate.htsno)
            )
            .filter((note) => note !== null);

          console.log("Sections & Chapter for Candidates: ");
          console.log(sectionAndChaptersForCandidates);

          const notes = await Promise.all(
            sectionAndChaptersForCandidates.map(async (sectionAndChapter) => {
              return fetchHtsNotesBySectionAndChapter(
                sectionAndChapter.section,
                sectionAndChapter.chapter
              );
            })
          );

          console.log("notes: ");
          console.log(notes);
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
                    setLoading={setLoading}
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
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-wider text-base-content/80">
                Analysis
              </span>
            </div>

            {classificationTier !== "premium" ? (
              // Upsell for standard tier
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-5">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                  <p className="text-base leading-relaxed text-base-content">
                    Upgrade to get in-depth analysis and candidate qualification
                    based on exact chapter notes and the GRIs.
                  </p>
                  <button
                    className="self-start px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-content hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/25"
                    onClick={() => {
                      // TODO: Implement upgrade flow
                    }}
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            ) : currentLevel?.analysisReason ? (
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

          {/* Notes Section */}
          {/* {showNotes && (
            <div className="mt-6 relative overflow-hidden rounded-xl border border-base-content/15 bg-base-100 p-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PencilSquareIcon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold uppercase tracking-wider text-base-content/80">
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
                  className="min-h-36 w-full px-4 py-3 rounded-xl bg-base-200/50 border border-base-content/15 transition-all duration-200 placeholder:text-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 hover:border-primary/40 resize-none text-base"
                  placeholder="Notes added are saved and will be included in advisory reports you generate."
                  disabled={loading.isLoading || !isUsersClassification}
                  value={levels[classificationLevel]?.notes || ""}
                  onChange={(e) => {
                    updateLevel(classificationLevel, {
                      notes: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          )} */}
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
