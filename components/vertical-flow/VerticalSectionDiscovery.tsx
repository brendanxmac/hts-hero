"use client";

import { useEffect, useRef, useMemo } from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import { useSectionChapterDiscovery } from "../../contexts/SectionChapterDiscoveryContext";
import { useHtsSections } from "../../contexts/HtsSectionsContext";
import { getBestDescriptionCandidates } from "../../libs/hts";
import {
  PreliminaryCandidate,
  PreliminaryClassificationLevel,
  HtsSectionAndChapterBase,
} from "../../interfaces/hts";
import toast from "react-hot-toast";
import { QueueListIcon, PlusIcon } from "@heroicons/react/16/solid";
import { SectionChapterCandidate } from "./SectionChapterCandidate";
import { useState } from "react";

interface Props {
  startExpanded?: boolean;
}

export const VerticalSectionDiscovery = ({ startExpanded = true }: Props) => {
  const { classification, setClassification, classificationTier } =
    useClassification();
  const { articleDescription } = classification || {};
  const { getSections, sections: htsSections } = useHtsSections();
  const {
    sectionCandidates,
    setSectionCandidates,
    removeSectionCandidate,
    sectionReasoning,
    setSectionReasoning,
    isFetchingSections,
    setIsFetchingSections,
    sectionDiscoveryComplete,
    setSectionDiscoveryComplete,
  } = useSectionChapterDiscovery();

  const isPremium = classificationTier === "premium";

  const [loadingPhase, setLoadingPhase] = useState<
    "finding" | "qualifying" | null
  >(null);
  const hasFetchedRef = useRef(false);
  const hasLoadedFromClassificationRef = useRef(false);

  // Check if data already exists in classification (avoids loading flash)
  const existingSectionLevel = useMemo(() => {
    return classification?.preliminaryLevels?.find(
      (l) => l.level === "section"
    );
  }, [classification?.preliminaryLevels]);

  const hasExistingData =
    existingSectionLevel && existingSectionLevel.candidates.length > 0;

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

  useEffect(() => {
    if (hasLoadedFromClassificationRef.current) return;
    if (!classification?.preliminaryLevels) return;

    const sectionLevel = classification.preliminaryLevels.find(
      (l) => l.level === "section"
    );
    if (sectionLevel && sectionLevel.candidates.length > 0) {
      hasLoadedFromClassificationRef.current = true;
      hasFetchedRef.current = true;

      const loadSectionData = async () => {
        let sections = htsSections;
        if (sections.length === 0) {
          sections = await getSections();
        }

        const loadedCandidates = sectionLevel.candidates
          .map((c) => {
            const section = sections.find((s) => s.number === c.identifier);
            if (!section) return null;
            return { section };
          })
          .filter(Boolean);

        setSectionCandidates(loadedCandidates);
        if (sectionLevel.analysis) {
          setSectionReasoning(sectionLevel.analysis);
        }
        setSectionDiscoveryComplete(true);
      };

      loadSectionData();
    }
  }, [classification?.preliminaryLevels, htsSections]);

  useEffect(() => {
    if (!articleDescription || hasFetchedRef.current) return;
    if (sectionCandidates.length > 0) return;

    hasFetchedRef.current = true;
    fetchSectionCandidates();
  }, [articleDescription]);

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

  // If data exists in classification but context hasn't hydrated yet,
  // render directly from classification data to avoid loading flash
  const displayCandidates =
    sectionCandidates.length > 0
      ? sectionCandidates
      : hasExistingData
        ? existingSectionLevel.candidates.map((c) => ({
            section: {
              number: c.identifier,
              description: c.description,
              chapters: [] as HtsSectionAndChapterBase[],
            },
          }))
        : [];

  const isLoading =
    isFetchingSections || (displayCandidates.length === 0 && !hasExistingData);

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
                  ? "Finding sections..."
                  : "Analyzing..."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-sm text-base-content/60 mb-4">
          Identified HTS sections most relevant to your item description.
        </p>

        {displayCandidates.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {displayCandidates.map((candidate) => (
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
