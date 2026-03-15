"use client";

import { useEffect, useRef, useState } from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import { useSectionChapterDiscovery } from "../../contexts/SectionChapterDiscoveryContext";
import { useHtsSections } from "../../contexts/HtsSectionsContext";
import { getBestDescriptionCandidates } from "../../libs/hts";
import {
  PreliminaryCandidate,
  PreliminaryClassificationLevel,
} from "../../interfaces/hts";
import toast from "react-hot-toast";
import { QueueListIcon } from "@heroicons/react/16/solid";
import { SectionChapterCandidate } from "./SectionChapterCandidate";

export const VerticalSectionDiscovery = () => {
  const { classification, setClassification, classificationTier } =
    useClassification();
  const { articleDescription } = classification || {};
  const { getSections, sections: htsSections } = useHtsSections();
  const {
    sectionCandidates,
    setSectionCandidates,
    removeSectionCandidate,
    isFetchingSections,
    setIsFetchingSections,
    setSectionReasoning,
    setSectionDiscoveryComplete,
  } = useSectionChapterDiscovery();

  const isPremium = classificationTier === "premium";

  const [loadingPhase, setLoadingPhase] = useState<
    "finding" | "qualifying" | null
  >(null);
  const hasFetchedRef = useRef(false);

  const updateSectionPreliminaryLevel = (
    candidates: PreliminaryCandidate[],
    analysis: string
  ) => {
    setClassification((prev) => {
      const existingLevels = prev.preliminaryLevels || [];
      const sectionIndex = existingLevels.findIndex(
        (l) => l.level === "section"
      );
      const newLevel: PreliminaryClassificationLevel = {
        level: "section",
        candidates,
        analysis,
      };

      if (sectionIndex >= 0) {
        const updatedLevels = [...existingLevels];
        updatedLevels[sectionIndex] = newLevel;
        return { ...prev, preliminaryLevels: updatedLevels };
      } else {
        return { ...prev, preliminaryLevels: [...existingLevels, newLevel] };
      }
    });
  };

  // Fetch section candidates if none exist yet (fresh discovery)
  useEffect(() => {
    if (!articleDescription || hasFetchedRef.current) return;
    if (sectionCandidates.length > 0) return;

    hasFetchedRef.current = true;
    fetchSectionCandidates();
  }, [articleDescription, sectionCandidates.length]);

  const fetchSectionCandidates = async () => {
    setIsFetchingSections(true);
    setLoadingPhase("finding");

    try {
      let sections = htsSections;
      if (sections.length === 0) {
        sections = await getSections();
      }

      const classifiableSections = sections.filter((s) => s.number < 22);

      const bestSectionCandidates = await getBestDescriptionCandidates(
        [],
        articleDescription,
        true,
        2,
        undefined,
        classifiableSections.map((s) => s.description)
      );

      const candidates = bestSectionCandidates.bestCandidates
        .map((candidateIndex) => {
          const section = sections[candidateIndex];
          if (!section) return null;
          return { section };
        })
        .filter(Boolean);

      setSectionCandidates(candidates);

      const preliminaryCandidates: PreliminaryCandidate[] = candidates.map(
        (c) => ({
          identifier: c.section.number,
          description: c.section.description,
        })
      );

      const analysisText = "";

      if (isPremium) {
        // Premium analysis placeholder
      }

      updateSectionPreliminaryLevel(preliminaryCandidates, analysisText);
      setSectionDiscoveryComplete(true);
    } catch (err) {
      console.error("Error getting sections", err);
      toast.error("Failed to find suitable sections. Please try again.");
      hasFetchedRef.current = false;
    } finally {
      setIsFetchingSections(false);
      setLoadingPhase(null);
    }
  };

  const isLoading = isFetchingSections || sectionCandidates.length === 0;

  return (
    <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-base-300 bg-base-200/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QueueListIcon className="w-4 h-4 text-base-content/50" />
            <h3 className="text-sm font-semibold text-base-content">
              Section Candidates
            </h3>
            {sectionCandidates.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-base-300 text-[11px] font-semibold text-base-content/60">
                {sectionCandidates.length}
              </span>
            )}
          </div>
          {isLoading && loadingPhase && (
            <div className="flex items-center gap-1.5 text-primary/70">
              <span className="loading loading-spinner loading-xs" />
              <span className="text-xs font-medium">
                {loadingPhase === "finding"
                  ? "Finding sections..."
                  : "Analyzing..."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {sectionCandidates.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {sectionCandidates.map((candidate) => (
              <SectionChapterCandidate
                key={`section-${candidate.section.number}`}
                number={candidate.section.number}
                description={candidate.section.description}
                type="section"
                onRemove={() =>
                  removeSectionCandidate(candidate.section.number)
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
