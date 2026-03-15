"use client";

import { useClassification } from "../../contexts/ClassificationContext";
import { useSectionChapterDiscovery } from "../../contexts/SectionChapterDiscoveryContext";
import { useEffect, useRef, useState } from "react";
import { Loader } from "../../interfaces/ui";
import {
  getBestClassificationProgression,
  getBestDescriptionCandidates,
  getElementsInChapter,
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
  const previousArticleDescriptionRef = useRef<string>(articleDescription);
  const isMountedRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { htsElements } = useHts();
  const hasFetchedCandidatesRef = useRef(false);
  const [isAnalysisCopied, setIsAnalysisCopied] = useState(false);

  const { chapterCandidates, chapterDiscoveryComplete } =
    useSectionChapterDiscovery();

  const handleCopyCostClick = () => {
    copyToClipboard(currentLevel?.analysisReason || "");
    setIsAnalysisCopied(true);
    setTimeout(() => setIsAnalysisCopied(false), 2000);
  };

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
    ? user
      ? classificationRecord.user_id === user.id
      : !classificationRecord.user_id
    : true;

  const isDisabled =
    !isUsersClassification ||
    classificationRecord?.status === ClassificationStatus.FINAL;

  const getNotesForCandidates = async (
    simplifiedCandidates: { code: string; description: string }[]
  ): Promise<NoteRecord[]> => {
    const { sections, chapters } =
      getSectionsAndChaptersFromCandidates(simplifiedCandidates);

    const { existingNotes, missingSections, missingChapters } =
      getNotesForSectionsAndChapters(sections, chapters);

    if (missingSections.length > 0 || missingChapters.length > 0) {
      const fetchedNotes = await fetchNotesForSectionsAndChapters(
        missingSections,
        missingChapters
      );

      if (fetchedNotes.length > 0) {
        addNotes(fetchedNotes);
      }

      return [...existingNotes, ...fetchedNotes];
    }

    return existingNotes;
  };

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

  const getHeadings = async () => {
    setLoading({ isLoading: true, text: "Looking for Headings" });
    const candidatesForHeading: (HtsElement & {
      referencedCodes: Record<string, string>;
    })[] = [];

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

          const fuse = new Fuse(coreElements, {
            keys: ["htsno"],
            threshold: 0.3,
            includeScore: true,
          });

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

          if (bestCandidateHeadings.bestCandidates.length === 0) {
            return;
          }

          if (bestCandidateHeadings.bestCandidates[0] < 0) {
            return;
          }

          const candidates = bestCandidateHeadings.bestCandidates
            .map((candidateIndex) => {
              return elementsWithReferencedCodes[candidateIndex];
            })
            .map((candidate) => ({
              ...candidate,
            }));

          candidatesForHeading.push(...candidates);
        })
      );

      if (!isMountedRef.current) {
        console.log("Component unmounted, skipping state update");
        return;
      }

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

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-base-300 bg-base-200/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QueueListIcon className="w-4 h-4 text-base-content/50" />
            <h3 className="text-sm font-semibold text-base-content">
              {classificationLevel === 0
                ? "Select a Heading"
                : `Select Sub-level ${classificationLevel + 1}`}
            </h3>
            {optionsForLevel > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-base-300 text-[11px] font-semibold text-base-content/60">
                {optionsForLevel}
              </span>
            )}
            {loading.isLoading && (
              <div className="flex items-center gap-1.5 text-primary/70">
                <span className="loading loading-spinner loading-xs" />
                <span className="text-xs font-medium">{loading.text}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {classificationLevel === 0 && (
              <button
                className="btn btn-ghost btn-xs gap-1.5 text-base-content/70 hover:text-primary"
                onClick={onOpenExplore}
                disabled={loading.isLoading || isDisabled}
              >
                <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                <span>Find Headings</span>
              </button>
            )}
            <button
              className="btn btn-ghost btn-xs gap-1.5 text-base-content/70 hover:text-primary"
              onClick={() => setShowCrossRulingsModal(true)}
              disabled={loading.isLoading}
            >
              <MagnifyingGlassIcon className="w-3.5 h-3.5" />
              <span>Search CROSS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Selected element highlight */}
        {selectedElement && (
          <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/30">
            <div className="flex items-center gap-2.5">
              <CheckCircleIcon className="w-4 h-4 text-success shrink-0" />
              {selectedElement.htsno && (
                <span className="shrink-0 px-2 py-0.5 rounded-md text-xs font-bold bg-success/20 text-success border border-success/30 font-mono">
                  {selectedElement.htsno}
                </span>
              )}
              <p className="text-sm font-semibold text-base-content leading-snug">
                {selectedElement.description}
              </p>
            </div>
          </div>
        )}

        {/* Candidates list */}
        {currentLevel && currentLevel.candidates?.length > 0 ? (
          <div className="flex flex-col gap-2.5">
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
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-base-300 bg-base-200/30 p-4 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-4 w-20 bg-base-300 rounded" />
                  <div className="flex gap-1 ml-auto">
                    <div className="h-6 w-6 bg-base-300 rounded-md" />
                    <div className="h-6 w-6 bg-base-300 rounded-md" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full bg-base-300 rounded" />
                  <div className="h-3.5 w-2/3 bg-base-300 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analysis section */}
        <div className="mt-5 pt-5 border-t border-base-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                Analysis
              </span>
            </div>
            {currentLevel?.analysisReason && (
              <button
                className="btn btn-ghost btn-xs gap-1 text-base-content/50"
                onClick={handleCopyCostClick}
              >
                {isAnalysisCopied ? (
                  <CheckCircleIcon className="w-3.5 h-3.5 text-success" />
                ) : (
                  <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                )}
                <span className="text-[11px]">
                  {isAnalysisCopied ? "Copied" : "Copy"}
                </span>
              </button>
            )}
          </div>

          {currentLevel?.analysisReason ? (
            <div className="flex flex-col gap-3">
              {/* Recommendation callout */}
              {/* {currentLevel.analysisElement && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
                  <SparklesIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70 mb-1">
                      Suggested
                    </p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {currentLevel.analysisElement.htsno && (
                        <span className="font-mono text-sm font-bold text-primary">
                          {currentLevel.analysisElement.htsno}
                        </span>
                      )}
                      <span className="text-sm text-base-content/80">
                        {currentLevel.analysisElement.description}
                      </span>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Reasoning */}
              <div className="rounded-lg border border-base-300 overflow-hidden">
                <div className="flex">
                  <div className="w-1 bg-primary/40 shrink-0" />
                  <div className="p-4 flex-1 min-w-0">
                    <div className="text-sm leading-[1.7] text-base-content/80 space-y-2.5">
                      {currentLevel.analysisReason
                        .split(/\n\n+/)
                        .filter((p) => p.trim())
                        .map((paragraph, i) => (
                          <p key={i} className="whitespace-pre-line">
                            {paragraph.trim()}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions to consider */}
              {currentLevel.analysisQuestions &&
                currentLevel.analysisQuestions.length > 0 && (
                  <div className="rounded-lg bg-warning/5 border border-warning/15 p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-warning/70 mb-2">
                      Consider before selecting
                    </p>
                    <ul className="space-y-1.5">
                      {currentLevel.analysisQuestions.map((question, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-base-content/70 leading-snug"
                        >
                          <span className="text-warning/60 shrink-0 mt-0.5 text-xs">
                            ?
                          </span>
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <p className="text-[11px] text-base-content/30">
                Analysis is for information purposes only and may not be correect. Always exercise your own judgement.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-base-300 overflow-hidden">
              <div className="flex">
                <div className="w-1 bg-base-300 shrink-0" />
                <div className="p-4 flex-1">
                  {loading.isLoading ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="loading loading-spinner loading-xs text-primary" />
                        <span className="text-xs font-medium text-primary/70">
                          {loading.text === "Analyzing Candidates"
                            ? "Analyzing candidates..."
                            : loading.text}
                        </span>
                      </div>
                      <div className="space-y-2 animate-pulse">
                        <div className="h-3 w-full bg-base-300/60 rounded" />
                        <div className="h-3 w-[90%] bg-base-300/60 rounded" />
                        <div className="h-3 w-[75%] bg-base-300/60 rounded" />
                        <div className="h-3 w-[85%] bg-base-300/60 rounded" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-base-content/40 italic">
                      Analysis will appear here after candidates are evaluated.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
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
