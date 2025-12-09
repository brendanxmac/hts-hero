"use client";

import { useClassification } from "../../contexts/ClassificationContext";
import { LoadingIndicator } from "../LoadingIndicator";
import { useEffect, useRef, useState } from "react";
import { Loader } from "../../interfaces/ui";
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
import { useHts } from "../../contexts/HtsContext";
import Modal from "../Modal";
import { SearchCrossRulings } from "../SearchCrossRulings";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  QueueListIcon,
  CheckCircleIcon,
  PencilIcon,
} from "@heroicons/react/16/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import { useUser } from "../../contexts/UserContext";
import { VerticalCandidateElement } from "./VerticalCandidateElement";

export interface VerticalClassificationStepProps {
  classificationLevel: number;
  classificationRecord: ClassificationRecord;
  onOpenExplore: () => void;
  isClassificationComplete?: boolean;
}

export const VerticalClassificationStep = ({
  classificationLevel,
  classificationRecord,
  onOpenExplore,
  isClassificationComplete = false,
}: VerticalClassificationStepProps) => {
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });

  const { user } = useUser();
  const [showCrossRulingsModal, setShowCrossRulingsModal] = useState(false);
  const { classification, addLevel, updateLevel, setClassification } =
    useClassification();
  const { articleDescription, levels } = classification;
  const [showNotes, setShowNotes] = useState(
    Boolean(levels[classificationLevel]?.notes)
  );
  const [isExpanded, setIsExpanded] = useState(true);
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
  const hasFetchedCandidatesRef = useRef(false);

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
      setSectionCandidates([]);
      setChapterCandidates([]);
      previousArticleDescriptionRef.current = articleDescription;
    }
  }, [articleDescription]);

  // Only fetch candidates for level 0 and only once
  useEffect(() => {
    if (
      classificationLevel === 0 &&
      !hasFetchedCandidatesRef.current &&
      (levels[classificationLevel] === undefined ||
        (levels[classificationLevel] !== undefined &&
          levels[classificationLevel].candidates.length === 0))
    ) {
      hasFetchedCandidatesRef.current = true;
      getSections();
    }
  }, [classificationLevel]);

  useEffect(() => {
    if (
      classificationLevel === 0 &&
      sectionCandidates &&
      sectionCandidates.length > 0 &&
      chapterCandidates.length === 0
    ) {
      getChapters();
    }
  }, [sectionCandidates]);

  useEffect(() => {
    if (
      classificationLevel === 0 &&
      chapterCandidates &&
      chapterCandidates.length > 0
    ) {
      getHeadings();
    }
  }, [chapterCandidates]);

  const getStepDescription = (level: number) => {
    if (level === 0) {
      return "Find & select the most suitable candidate for the item";
    } else {
      return "Which next candidate best fits the item description?";
    }
  };

  return (
    <div
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

      <div className="relative z-10">
        {/* Collapsed Summary View */}
        {isCollapsed && (
          <div className="px-6 py-4">
            {/* Step Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-success">
                    Level {classificationLevel + 1}
                  </span>
                </div>
              </div>

              {/* Edit button */}
              {isUsersClassification && !isDisabled && (
                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-base-content/70 hover:text-base-content hover:bg-base-content/10 transition-all"
                  onClick={() => setIsExpanded(true)}
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>

            {/* Selected Element Summary */}
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
        )}

        {/* Expanded View */}
        {!isCollapsed && (
          <div className="p-6">
            {/* Step Header */}
            <div className="flex flex-col gap-3 mb-6">
              {/* Top row: Level label + Collapse */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-300 ${
                    hasSelection ? "text-success" : "text-primary"
                  }`}
                >
                  Level {classificationLevel + 1}
                </span>

                {hasSelection && isUsersClassification && !isDisabled && (
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-base-content/70 hover:text-base-content hover:bg-base-content/10 transition-all"
                    onClick={() => setIsExpanded(false)}
                  >
                    Collapse
                  </button>
                )}
              </div>

              {/* Description on its own row */}
              <h2 className="text-xl font-bold text-base-content">
                {getStepDescription(classificationLevel)}
              </h2>
            </div>

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
                      <span className="text-xs font-medium">
                        {loading.text}
                      </span>
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
                  {!showNotes && (
                    <button
                      className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-base-100 border border-base-content/15 hover:border-primary/40 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setShowNotes(true)}
                      disabled={loading.isLoading || isDisabled}
                    >
                      <PencilSquareIcon className="w-4 h-4 text-primary" />
                      <span>Add Notes</span>
                    </button>
                  )}
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

            {/* Notes Section */}
            {showNotes && (
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
            )}
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
