"use client";

import { useEffect, useRef, useState } from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import { useSectionChapterDiscovery } from "../../contexts/SectionChapterDiscoveryContext";
import {
  getBestDescriptionCandidates,
  qualifyCandidatesWithNotes,
} from "../../libs/hts";
import { ChapterCandidate } from "../../contexts/SectionChapterDiscoveryContext";
import toast from "react-hot-toast";
import {
  QueueListIcon,
  ChevronDownIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";
import { SectionChapterCandidate } from "./SectionChapterCandidate";

export const VerticalChapterDiscovery = () => {
  const { classification } = useClassification();
  const { articleDescription } = classification || {};
  const {
    sectionCandidates,
    sectionDiscoveryComplete,
    chapterCandidates,
    setChapterCandidates,
    removeChapterCandidate,
    chapterReasoning,
    setChapterReasoning,
    isFetchingChapters,
    setIsFetchingChapters,
    chapterDiscoveryComplete,
    setChapterDiscoveryComplete,
  } = useSectionChapterDiscovery();

  const { classificationTier } = useClassification();
  const isPremium = classificationTier === "premium";

  const [isExpanded, setIsExpanded] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState<
    "finding" | "qualifying" | null
  >(null);
  const hasFetchedRef = useRef(false);
  // const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to this component when section discovery completes
  // useEffect(() => {
  //   if (sectionDiscoveryComplete && containerRef.current) {
  //     containerRef.current.scrollIntoView({
  //       behavior: "smooth",
  //       block: "start",
  //     });
  //   }
  // }, [sectionDiscoveryComplete]);

  // Fetch chapter candidates once section discovery is complete
  useEffect(() => {
    if (!sectionDiscoveryComplete) return;
    if (!articleDescription) return;
    if (hasFetchedRef.current) return;
    if (chapterCandidates.length > 0) return;
    if (sectionCandidates.length === 0) return;

    hasFetchedRef.current = true;
    fetchChapterCandidates();
  }, [sectionDiscoveryComplete, sectionCandidates]);

  const fetchChapterCandidates = async () => {
    setIsFetchingChapters(true);
    setLoadingPhase("finding");

    try {
      const allChapterCandidates: ChapterCandidate[] = [];

      // For each section, find best chapter candidates
      await Promise.all(
        sectionCandidates.map(async (sectionCandidate) => {
          const section = sectionCandidate.section;
          const bestChapterCandidates = await getBestDescriptionCandidates(
            [],
            articleDescription,
            true,
            1,
            3,
            section.chapters.map((c) => c.description)
          );

          const candidates = bestChapterCandidates.bestCandidates
            .map((candidateIndex) => {
              const chapter = section.chapters[candidateIndex];
              if (!chapter) return null;
              return {
                chapter,
                sectionNumber: section.number,
              };
            })
            .filter(Boolean);

          allChapterCandidates.push(...candidates);
        })
      );

      console.log("Chapter candidates:", allChapterCandidates);
      setChapterCandidates(allChapterCandidates);

      // Only do qualification for premium tier
      if (isPremium) {
        // Switch to qualifying phase
        setLoadingPhase("qualifying");

        // Qualify candidates with notes (for reasoning)
        const chapterCandidateAnalysis = await qualifyCandidatesWithNotes({
          productDescription: articleDescription,
          candidates: allChapterCandidates.map((candidate) => ({
            identifier: candidate.chapter.number,
            description: candidate.chapter.description,
          })),
          candidateType: "chapter",
        });

        console.log("Chapter Analysis:", chapterCandidateAnalysis);

        // Update reasoning if available
        if (chapterCandidateAnalysis?.analysis) {
          setChapterReasoning(chapterCandidateAnalysis.analysis);
        }
      }

      setChapterDiscoveryComplete(true);
    } catch (err) {
      console.error("Error getting chapters", err);
      toast.error("Failed to find suitable chapters. Please try again.");
      hasFetchedRef.current = false; // Allow retry
    } finally {
      setIsFetchingChapters(false);
      setLoadingPhase(null);
    }
  };

  // Don't render until section discovery is complete
  if (!sectionDiscoveryComplete) {
    return null;
  }

  const isCollapsed = chapterDiscoveryComplete && !isExpanded;

  return (
    <div
      // ref={containerRef}
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
        {/* Header */}
        <div
          className="flex items-center justify-between mb-4 hover:cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span
            className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-300 ${
              chapterDiscoveryComplete ? "text-success" : "text-primary"
            }`}
          >
            Chapters
          </span>

          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-base-content/5 hover:bg-base-content/10 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronDownIcon
              className={`w-4 h-4 text-base-content/60 transition-transform duration-300 ease-in-out ${
                isCollapsed ? "-rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Collapsed Summary */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isCollapsed ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          {chapterCandidates.length > 0 && (
            <div className="flex flex-col gap-2">
              {chapterCandidates.map(({ chapter }) => (
                <div
                  key={`chapter-${chapter.number}`}
                  className="bg-base-100 p-4 flex items-center gap-3 border border-base-content/10 rounded-lg"
                >
                  {/* Title */}
                  <p className="shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold bg-primary/20 text-primary border border-primary/30">
                    Chapter {chapter.number}
                  </p>

                  {/* Description */}
                  <p className="text-base leading-relaxed font-bold">
                    {chapter.description}
                  </p>
                </div>
              ))}
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
            Which chapters within these sections are most relevant?
          </h2>

          {/* Candidates Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <QueueListIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-base-content/80">
                    {chapterCandidates.length > 0
                      ? `Candidates (${chapterCandidates.length})`
                      : "Candidates"}
                  </span>
                </div>
                {isFetchingChapters && loadingPhase && (
                  <div className="flex items-center gap-1.5 text-primary/70">
                    <span className="loading loading-spinner loading-xs"></span>
                    <span className="text-xs font-medium">
                      {loadingPhase === "finding"
                        ? "Finding chapters..."
                        : "Analyzing candidates..."}
                    </span>
                  </div>
                )}
              </div>

              {/* Add Button (placeholder for future implementation) */}
              <button
                className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-base-100 border border-base-content/15 hover:border-primary/40 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={true}
                title="Coming soon"
              >
                <PlusIcon className="w-4 h-4 text-primary" />
                <span>Add Chapter</span>
              </button>
            </div>

            {/* Candidate List */}
            {chapterCandidates.length > 0 ? (
              <div className="flex flex-col gap-3">
                {chapterCandidates.map((candidate) => (
                  <SectionChapterCandidate
                    key={`chapter-${candidate.chapter.number}`}
                    number={candidate.chapter.number}
                    description={candidate.chapter.description}
                    type="chapter"
                    reasoning={candidate.reasoning}
                    onRemove={() =>
                      removeChapterCandidate(candidate.chapter.number)
                    }
                  />
                ))}
              </div>
            ) : (
              // Loading skeleton
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-base-content/10 bg-base-100 p-5 animate-pulse"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="h-6 w-24 bg-base-content/10 rounded-lg" />
                      <div className="h-6 w-6 bg-base-content/10 rounded-lg" />
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

          {/* Reasoning Section */}
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-wider text-base-content/80">
                Analysis
              </span>
            </div>

            {!isPremium ? (
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
            ) : chapterReasoning ? (
              <div className="relative overflow-hidden rounded-xl bg-base-100 border border-primary/20 p-4">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                </div>
                <div className="relative z-10">
                  <p className="text-base leading-relaxed text-base-content whitespace-pre-line">
                    {chapterReasoning}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-base-content/10 bg-base-100 p-4">
                <p className="text-sm text-base-content/60 italic">
                  {loadingPhase === "qualifying"
                    ? "Analyzing candidates..."
                    : loadingPhase === "finding"
                      ? "Finding chapters..."
                      : "Reasoning will appear here after analysis."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
