"use client";

import { useEffect, useRef, useState } from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import { useSectionChapterDiscovery } from "../../contexts/SectionChapterDiscoveryContext";
import { getBestDescriptionCandidates } from "../../libs/hts";
import { shouldSkipSectionChapterDiscovery } from "../../libs/classification-helpers";
import { lacksProductDescriptionForAnalysis } from "../../libs/classification-from-hts-code";
import { ChapterCandidate } from "../../contexts/SectionChapterDiscoveryContext";
import {
  PreliminaryCandidate,
  PreliminaryClassificationLevel,
} from "../../interfaces/hts";
import toast from "react-hot-toast";
import { QueueListIcon } from "@heroicons/react/16/solid";
import { SectionChapterCandidate } from "./SectionChapterCandidate";
import { AnalysisLoadingAnimation } from "../classification-ui/AnalysisLoadingAnimation";
import { useIsReadOnly } from "../../contexts/ReadOnlyContext";

export const VerticalChapterDiscovery = () => {
  const readOnly = useIsReadOnly();
  const { classification, setClassification, classificationTier } =
    useClassification();
  const { articleDescription } = classification || {};
  const {
    sectionCandidates,
    sectionDiscoveryComplete,
    chapterCandidates,
    setChapterCandidates,
    removeChapterCandidate,
    isFetchingChapters,
    setIsFetchingChapters,
    setChapterReasoning,
    setChapterDiscoveryComplete,
  } = useSectionChapterDiscovery();

  const isPremium = classificationTier === "premium";

  const [loadingPhase, setLoadingPhase] = useState<
    "finding" | "qualifying" | null
  >(null);
  const hasFetchedRef = useRef(false);

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
    if (readOnly) return;
    if (!sectionDiscoveryComplete) return;
    if (lacksProductDescriptionForAnalysis(articleDescription)) return;
    if (hasFetchedRef.current) return;
    if (chapterCandidates.length > 0) return;
    if (sectionCandidates.length === 0) return;
    // Old classifications have levels with selections but no preliminaryLevels - don't fetch
    if (shouldSkipSectionChapterDiscovery(classification)) return;

    const persistedChapter = classification?.preliminaryLevels?.find(
      (l) => l.level === "chapter"
    );
    if ((persistedChapter?.candidates?.length ?? 0) > 0) {
      return;
    }

    hasFetchedRef.current = true;
    fetchChapterCandidates();
  }, [
    sectionDiscoveryComplete,
    sectionCandidates.length,
    chapterCandidates.length,
    readOnly,
    classification,
    articleDescription,
  ]);

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

  const isLoading = isFetchingChapters || chapterCandidates.length === 0;

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
            {chapterCandidates.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-base-300 text-[11px] font-semibold text-base-content/60">
                {chapterCandidates.length}
              </span>
            )}
          </div>
          {/* {isLoading && loadingPhase && (
            <div className="flex items-center gap-1.5 text-primary/70">
              <span className="loading loading-spinner loading-xs" />
              <span className="text-xs font-medium">
                {loadingPhase === "finding"
                  ? "Finding chapters..."
                  : "Analyzing..."}
              </span>
            </div>
          )} */}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {chapterCandidates.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {chapterCandidates.map((candidate) => (
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
          <AnalysisLoadingAnimation
            title={loadingPhase === "finding" ? "Discovering chapters" : "Analyzing chapters"}
            subtitle="Narrowing down the best chapter matches"
          />
        )}
      </div>
    </div>
  );
};
