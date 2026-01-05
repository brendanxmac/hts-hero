"use client";

import { useEffect, useRef } from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import { useSectionChapterDiscovery } from "../../contexts/SectionChapterDiscoveryContext";
import { useHtsSections } from "../../contexts/HtsSectionsContext";
import {
  getBestDescriptionCandidates,
  qualifyCandidatesWithNotes,
} from "../../libs/hts";
import {
  PreliminaryCandidate,
  PreliminaryClassificationLevel,
} from "../../interfaces/hts";
import toast from "react-hot-toast";
import {
  QueueListIcon,
  ChevronDownIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";
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

  const [isExpanded, setIsExpanded] = useState(startExpanded);
  const [loadingPhase, setLoadingPhase] = useState<
    "finding" | "qualifying" | null
  >(null);
  const hasFetchedRef = useRef(false);
  const hasLoadedFromClassificationRef = useRef(false);

  // Helper to update preliminary levels in classification
  const updateSectionPreliminaryLevel = (
    candidates: PreliminaryCandidate[],
    analysis: string
  ) => {
    setClassification((prev) => {
      const existingLevels = prev.preliminaryLevels || [];
      // Find and update section level, or add new one
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

  // Load from existing classification preliminaryLevels if available
  useEffect(() => {
    if (hasLoadedFromClassificationRef.current) return;
    if (!classification?.preliminaryLevels) return;

    const sectionLevel = classification.preliminaryLevels.find(
      (l) => l.level === "section"
    );
    if (sectionLevel && sectionLevel.candidates.length > 0) {
      hasLoadedFromClassificationRef.current = true;
      hasFetchedRef.current = true; // Prevent fetching since we have data

      // Load candidates into discovery context - need to fetch full section data
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

  // Fetch section candidates on mount
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
      // Get sections if not already loaded
      let sections = htsSections;
      if (sections.length === 0) {
        sections = await getSections();
      }

      // Get best section candidates
      const bestSectionCandidates = await getBestDescriptionCandidates(
        [],
        articleDescription,
        true,
        2,
        undefined,
        sections.map((s) => s.description)
      );

      // Map to SectionCandidate format
      const candidates = bestSectionCandidates.bestCandidates
        .map((candidateIndex) => {
          const section = sections[candidateIndex];
          if (!section) return null;
          return { section };
        })
        .filter(Boolean);

      setSectionCandidates(candidates);

      // Build preliminary candidates for saving to classification
      const preliminaryCandidates: PreliminaryCandidate[] = candidates.map(
        (c) => ({
          identifier: c.section.number,
          description: c.section.description,
        })
      );

      let analysisText = "";

      // Only do qualification for premium tier
      if (isPremium) {
        console.log("Section candidates:", preliminaryCandidates);

        // Switch to qualifying phase
        setLoadingPhase("qualifying");

        // Qualify candidates with notes (for reasoning)
        const sectionCandidateAnalysis = await qualifyCandidatesWithNotes({
          productDescription: articleDescription,
          candidates: preliminaryCandidates,
          candidateType: "section",
        });

        console.log("Section Anaylsis:", sectionCandidateAnalysis);

        // Update reasoning if available
        if (sectionCandidateAnalysis?.analysis) {
          setSectionReasoning(sectionCandidateAnalysis.analysis);
          analysisText = sectionCandidateAnalysis.analysis;
        }
      }

      // Save to classification's preliminaryLevels
      updateSectionPreliminaryLevel(preliminaryCandidates, analysisText);

      setSectionDiscoveryComplete(true);
    } catch (err) {
      console.error("Error getting sections", err);
      toast.error("Failed to find suitable sections. Please try again.");
      hasFetchedRef.current = false; // Allow retry
    } finally {
      setIsFetchingSections(false);
      setLoadingPhase(null);
    }
  };

  const isCollapsed = sectionDiscoveryComplete && !isExpanded;

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

      <div className="relative z-10 p-6">
        {/* Header */}
        <div
          className="flex items-center justify-between mb-4 hover:cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span
            className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-300 ${
              sectionDiscoveryComplete ? "text-success" : "text-primary"
            }`}
          >
            Sections
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
          {sectionCandidates.length > 0 && (
            <div className="flex flex-col gap-2">
              {sectionCandidates.map(({ section }) => (
                <div
                  key={`section-${section.number}`}
                  className="bg-base-100 p-4 flex items-center gap-3 border border-base-content/10 rounded-lg"
                >
                  {/* Title */}
                  <p className="shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold bg-primary/20 text-primary border border-primary/30">
                    Section {section.number}
                  </p>

                  {/* Description */}
                  <p className="text-base leading-relaxed font-bold">
                    {section.description}
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
            Which HTS sections might contain this item?
          </h2>

          {/* Candidates Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <QueueListIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-base-content/80">
                    {sectionCandidates.length > 0
                      ? `Candidates (${sectionCandidates.length})`
                      : "Candidates"}
                  </span>
                </div>
                {isFetchingSections && loadingPhase && (
                  <div className="flex items-center gap-1.5 text-primary/70">
                    <span className="loading loading-spinner loading-xs"></span>
                    <span className="text-xs font-medium">
                      {loadingPhase === "finding"
                        ? "Finding sections..."
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
                <span>Add Section</span>
              </button>
            </div>

            {/* Candidate List */}
            {sectionCandidates.length > 0 ? (
              <div className="flex flex-col gap-3">
                {sectionCandidates.map((candidate) => (
                  <SectionChapterCandidate
                    key={`section-${candidate.section.number}`}
                    number={candidate.section.number}
                    description={candidate.section.description}
                    type="section"
                    reasoning={candidate.reasoning}
                    onRemove={() =>
                      removeSectionCandidate(candidate.section.number)
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
            ) : sectionReasoning ? (
              <div className="relative overflow-hidden rounded-xl bg-base-100 border border-primary/20 p-4">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                </div>
                <div className="relative z-10">
                  <p className="text-base leading-relaxed text-base-content whitespace-pre-line">
                    {sectionReasoning}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-base-content/10 bg-base-100 p-4">
                <p className="text-sm text-base-content/60 italic">
                  {loadingPhase === "qualifying"
                    ? "Analyzing candidates..."
                    : loadingPhase === "finding"
                      ? "Finding sections..."
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
