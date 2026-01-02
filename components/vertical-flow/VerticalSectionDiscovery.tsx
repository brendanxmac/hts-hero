"use client";

import { useEffect, useRef } from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import { useSectionChapterDiscovery } from "../../contexts/SectionChapterDiscoveryContext";
import { useHtsSections } from "../../contexts/HtsSectionsContext";
import {
  getBestDescriptionCandidates,
  qualifyCandidatesWithNotes,
} from "../../libs/hts";
import { PreliminaryCandidate } from "../../interfaces/hts";
import toast from "react-hot-toast";
import {
  QueueListIcon,
  ChevronDownIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";
import { SectionChapterCandidate } from "./SectionChapterCandidate";
import { useState } from "react";

export const VerticalSectionDiscovery = () => {
  const { classification } = useClassification();
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

  const [isExpanded, setIsExpanded] = useState(true);
  const hasFetchedRef = useRef(false);

  // Fetch section candidates on mount
  useEffect(() => {
    if (!articleDescription || hasFetchedRef.current) return;
    if (sectionCandidates.length > 0) return;

    hasFetchedRef.current = true;
    fetchSectionCandidates();
  }, [articleDescription]);

  const fetchSectionCandidates = async () => {
    setIsFetchingSections(true);

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

      // Build preliminary candidates for qualification
      const preliminaryCandidates: PreliminaryCandidate[] = candidates.map(
        (c) => ({
          identifier: c.section.number,
          description: c.section.description,
        })
      );

      console.log("Section candidates:", preliminaryCandidates);

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
      }

      setSectionDiscoveryComplete(true);
    } catch (err) {
      console.error("Error getting sections", err);
      toast.error("Failed to find suitable sections. Please try again.");
      hasFetchedRef.current = false; // Allow retry
    } finally {
      setIsFetchingSections(false);
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
            Section Discovery
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
            <div className="p-4 rounded-xl bg-base-100 border border-base-content/10">
              <p className="text-base font-bold text-base-content leading-relaxed">
                {/* {sectionCandidates.length} section
                {sectionCandidates.length !== 1 ? "s" : ""} identified:{" "} */}
                {sectionCandidates
                  .map((c) => `Section ${c.section.number}`)
                  .join(", ")}
              </p>
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
                {isFetchingSections && (
                  <div className="flex items-center gap-1.5 text-primary/70">
                    <span className="loading loading-spinner loading-xs"></span>
                    <span className="text-xs font-medium">
                      Finding sections...
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
                Reasoning
              </span>
            </div>

            {sectionReasoning ? (
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
                  {isFetchingSections
                    ? "Analyzing sections..."
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
