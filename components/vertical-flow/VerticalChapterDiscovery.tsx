"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import { useSectionChapterDiscovery } from "../../contexts/SectionChapterDiscoveryContext";
import { getBestDescriptionCandidates } from "../../libs/hts";
import { ChapterCandidate } from "../../contexts/SectionChapterDiscoveryContext";
import {
  PreliminaryCandidate,
  PreliminaryClassificationLevel,
  Navigatable,
} from "../../interfaces/hts";
import toast from "react-hot-toast";
import { QueueListIcon } from "@heroicons/react/16/solid";
import { SectionChapterCandidate } from "./SectionChapterCandidate";

interface Props {
  startExpanded?: boolean;
}

export const VerticalChapterDiscovery = ({ startExpanded = true }: Props) => {
  const { classification, setClassification, classificationTier } =
    useClassification();
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

  const isPremium = classificationTier === "premium";

  const [loadingPhase, setLoadingPhase] = useState<
    "finding" | "qualifying" | null
  >(null);
  const hasFetchedRef = useRef(false);
  const hasLoadedFromClassificationRef = useRef(false);

  // Check if data already exists in classification (avoids loading flash)
  const existingChapterLevel = useMemo(() => {
    return classification?.preliminaryLevels?.find(
      (l) => l.level === "chapter"
    );
  }, [classification?.preliminaryLevels]);

  const hasExistingData =
    existingChapterLevel && existingChapterLevel.candidates.length > 0;

  const updateChapterPreliminaryLevel = (
    candidates: PreliminaryCandidate[],
    analysis: string
  ) => {
    setClassification((prev) => {
      const existingLevels = prev.preliminaryLevels || [];
      const chapterIndex = existingLevels.findIndex(
        (l) => l.level === "chapter"
      );
      const newLevel: PreliminaryClassificationLevel = {
        level: "chapter",
        candidates,
        analysis,
      };

      if (chapterIndex >= 0) {
        const updatedLevels = [...existingLevels];
        updatedLevels[chapterIndex] = newLevel;
        return { ...prev, preliminaryLevels: updatedLevels };
      } else {
        return { ...prev, preliminaryLevels: [...existingLevels, newLevel] };
      }
    });
  };

  useEffect(() => {
    if (hasLoadedFromClassificationRef.current) return;
    if (!classification?.preliminaryLevels) return;
    if (!sectionDiscoveryComplete) return;

    const chapterLevel = classification.preliminaryLevels.find(
      (l) => l.level === "chapter"
    );
    if (chapterLevel && chapterLevel.candidates.length > 0) {
      hasLoadedFromClassificationRef.current = true;
      hasFetchedRef.current = true;

      const loadedCandidates: ChapterCandidate[] = chapterLevel.candidates.map(
        (c) => ({
          chapter: {
            number: c.identifier,
            description: c.description,
            type: Navigatable.CHAPTER,
          },
          sectionNumber: 0,
        })
      );

      setChapterCandidates(loadedCandidates);
      if (chapterLevel.analysis) {
        setChapterReasoning(chapterLevel.analysis);
      }
      setChapterDiscoveryComplete(true);
    }
  }, [classification?.preliminaryLevels, sectionDiscoveryComplete]);

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

      await Promise.all(
        sectionCandidates.map(async (sectionCandidate) => {
          const section = sectionCandidate.section;
          const bestChapterCandidates = await getBestDescriptionCandidates(
            [],
            articleDescription,
            true,
            null,
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

      setChapterCandidates(allChapterCandidates);

      const preliminaryCandidates: PreliminaryCandidate[] =
        allChapterCandidates.map((candidate) => ({
          identifier: candidate.chapter.number,
          description: candidate.chapter.description,
        }));

      const analysisText = "";

      if (isPremium) {
        // Premium analysis placeholder
      }

      updateChapterPreliminaryLevel(preliminaryCandidates, analysisText);
      setChapterDiscoveryComplete(true);
    } catch (err) {
      console.error("Error getting chapters", err);
      toast.error("Failed to find suitable chapters. Please try again.");
      hasFetchedRef.current = false;
    } finally {
      setIsFetchingChapters(false);
      setLoadingPhase(null);
    }
  };

  if (!sectionDiscoveryComplete) {
    return null;
  }

  // If data exists in classification but context hasn't hydrated yet,
  // render directly from classification data to avoid loading flash
  const displayCandidates =
    chapterCandidates.length > 0
      ? chapterCandidates
      : hasExistingData
        ? existingChapterLevel.candidates.map((c) => ({
            chapter: {
              number: c.identifier,
              description: c.description,
              type: Navigatable.CHAPTER,
            },
            sectionNumber: 0,
          }))
        : [];

  const isLoading =
    isFetchingChapters || (displayCandidates.length === 0 && !hasExistingData);

  return (
    <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-base-300 bg-base-200/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QueueListIcon className="w-4 h-4 text-base-content/50" />
            <h3 className="text-sm font-semibold text-base-content">
              Chapter Candidates
            </h3>
            {displayCandidates.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-base-300 text-[11px] font-semibold text-base-content/60">
                {displayCandidates.length}
              </span>
            )}
          </div>
          {isLoading && loadingPhase && (
            <div className="flex items-center gap-1.5 text-primary/70">
              <span className="loading loading-spinner loading-xs" />
              <span className="text-xs font-medium">
                {loadingPhase === "finding"
                  ? "Finding chapters..."
                  : "Analyzing..."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-sm text-base-content/60 mb-4">
          Identified HTS chapters most relevant to your item description.
        </p>

        {displayCandidates.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {displayCandidates.map((candidate) => (
              <SectionChapterCandidate
                key={`chapter-${candidate.chapter.number}`}
                number={candidate.chapter.number}
                description={candidate.chapter.description}
                type="chapter"
                onRemove={() =>
                  removeChapterCandidate(candidate.chapter.number)
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-base-300 bg-base-200/30 p-4 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-6 w-20 bg-base-300 rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full bg-base-300 rounded" />
                  <div className="h-3.5 w-2/3 bg-base-300 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
