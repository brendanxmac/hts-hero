"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { useClassifications } from "../contexts/ClassificationsContext";
import { useHts } from "../contexts/HtsContext";
import { useUser } from "../contexts/UserContext";
import { ClassifyPage } from "../enums/classify";
import { LoadingIndicator } from "./LoadingIndicator";
import { VerticalDescriptionStep } from "./vertical-flow/VerticalDescriptionStep";
import { VerticalClassificationStep } from "./vertical-flow/VerticalClassificationStep";
import { VerticalClassificationResult } from "./vertical-flow/VerticalClassificationResult";
import { fetchUser, UserProfile } from "../libs/supabase/user";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  CheckCircleIcon,
} from "@heroicons/react/16/solid";
import Modal from "./Modal";
import ConversionPricing from "./ConversionPricing";
import { Explore } from "./Explore";

interface Props {
  setPage: (page: ClassifyPage) => void;
}

export const Classification = ({ setPage }: Props) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(
    null
  );
  const scrollContainerRef = useCallback((node: HTMLDivElement | null) => {
    setScrollContainer(node);
  }, []);
  const { isFetching } = useHts();
  const {
    classification,
    setClassification,
    setClassificationId,
    classificationId,
  } = useClassification();
  const { classifications } = useClassifications();
  const { user } = useUser();

  const classificationRecord = classifications.find(
    (c) => c.id === classificationId
  );

  // Show the classification flow if:
  // 1. We have an existing classificationId (loaded from ClassificationSummary), OR
  // 2. We have an articleDescription AND levels (started a new classification)
  const hasStartedClassification = Boolean(
    classificationId ||
      (classification?.articleDescription && classification?.levels?.length > 0)
  );

  const isUsersClassification = classificationRecord
    ? classificationRecord.user_id === user.id
    : true;

  // Get the latest HTS code from selections (going backwards through levels)
  const latestHtsCode = useMemo(() => {
    if (!classification?.levels) return null;

    // Go backwards through levels to find the most recent selection with an htsno
    for (let i = classification.levels.length - 1; i >= 0; i--) {
      const level = classification.levels[i];
      if (level.selection?.htsno) {
        return level.selection.htsno;
      }
    }
    return null;
  }, [classification?.levels]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const profile = await fetchUser(user.id);
      setUserProfile(profile || null);
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      setClassification(null);
      setClassificationId(null);
    };
  }, []);

  // Handle scroll to toggle compact header with hysteresis to prevent flickering
  useEffect(() => {
    if (!scrollContainer || !hasStartedClassification) return;

    const SCROLL_DOWN_THRESHOLD = 100; // Scroll down past this to minimize
    const SCROLL_UP_THRESHOLD = 20; // Scroll up past this to maximize

    let ticking = false;
    let lastScrollTop = scrollContainer.scrollTop;

    const updateHeader = () => {
      const scrollTop = scrollContainer.scrollTop;

      setIsScrolled((prev) => {
        // If currently minimized, only maximize when scrolled above the up threshold
        if (prev) {
          return scrollTop > SCROLL_UP_THRESHOLD;
        }
        // If currently maximized, only minimize when scrolled below the down threshold
        return scrollTop > SCROLL_DOWN_THRESHOLD;
      });

      lastScrollTop = scrollTop;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    // Check initial scroll position
    updateHeader();

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [scrollContainer, hasStartedClassification]);

  if (isFetching || !userProfile) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-base-100">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-full w-full bg-base-100 overflow-y-auto"
    >
      {/* Show Description Step when no classification started OR when editing */}
      {!hasStartedClassification ? (
        <>
          {/* Simple Header for Description Step */}
          <div className="bg-base-100/95 backdrop-blur-sm">
            <div className="w-full max-w-4xl mx-auto px-6 py-4">
              <button
                className="group flex items-center gap-2 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors"
                onClick={() => {
                  setPage(ClassifyPage.CLASSIFICATIONS);
                }}
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back
              </button>
            </div>
          </div>

          {/* Description Step */}
          <div className="w-full max-w-4xl mx-auto px-6 py-8">
            <VerticalDescriptionStep
              setPage={setPage}
              setShowPricing={setShowPricing}
              classificationRecord={classificationRecord}
            />
          </div>
        </>
      ) : (
        <>
          {/* Sticky Hero Header with Item Description */}
          <div
            className={`sticky top-0 z-50 transition-all duration-300 shadow-lg shadow-base-content/5 ${
              isScrolled
                ? "bg-base-100/95 backdrop-blur-md "
                : "bg-gradient-to-br from-base-200 via-base-100 to-base-200"
            } border-b border-base-content/5`}
          >
            {/* Subtle animated background - only show when not scrolled */}
            {!isScrolled && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
                {/* Subtle grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.02]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "32px 32px",
                  }}
                />
              </div>
            )}

            <div
              className={`relative z-10 w-full max-w-4xl mx-auto px-6 transition-all duration-300 ${
                isScrolled ? "py-3" : "py-6 md:py-8"
              }`}
            >
              {/* Back Button - hidden when scrolled */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isScrolled
                    ? "max-h-0 opacity-0 mb-0"
                    : "max-h-12 opacity-100 mb-4"
                }`}
              >
                <button
                  className="group flex items-center gap-2 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors"
                  onClick={() => setPage(ClassifyPage.CLASSIFICATIONS)}
                >
                  <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Classifications
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Left side - Item Description */}
                <div
                  className={`flex flex-col transition-all duration-300 ${
                    isScrolled ? "gap-0.5" : "gap-2"
                  } flex-1 min-w-0`}
                >
                  {/* Label - always visible */}
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/80">
                    <span className="inline-block w-8 h-px bg-primary/40" />
                    Classifying Item
                  </div>
                  <h1
                    className={`font-extrabold tracking-tight leading-tight truncate transition-all duration-300 ${
                      isScrolled
                        ? "text-lg md:text-xl"
                        : "text-2xl md:text-3xl lg:text-4xl"
                    }`}
                  >
                    <span className="bg-gradient-to-r from-base-content via-base-content to-base-content/80 bg-clip-text">
                      {classification?.articleDescription}
                    </span>
                  </h1>
                </div>

                {/* Right side - Dynamic HTS Code Display */}
                <div className="flex items-center shrink-0">
                  {classification?.isComplete ? (
                    // Complete state - prominent success styling
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex flex-col items-end transition-all duration-300 ${
                          isScrolled ? "gap-0.5" : "gap-1"
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-widest text-success">
                          Final Code
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-success transition-all duration-300 ${
                              isScrolled ? "text-lg" : "text-xl md:text-2xl"
                            }`}
                          >
                            {latestHtsCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : latestHtsCode ? (
                    // In progress with a code selected
                    <div
                      className={`flex flex-col items-end transition-all duration-300 ${
                        isScrolled ? "gap-0.5" : "gap-1"
                      }`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-widest text-primary/60">
                        Current Code
                      </span>
                      <span
                        className={`font-bold text-primary transition-all duration-300 ${
                          isScrolled ? "text-lg" : "text-xl md:text-2xl"
                        }`}
                      >
                        {latestHtsCode}
                      </span>
                    </div>
                  ) : (
                    // No selection yet
                    <div
                      className={`flex flex-col items-end transition-all duration-300 ${
                        isScrolled ? "gap-0.5" : "gap-1"
                      }`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
                        HTS Code
                      </span>
                      <span
                        className={`text-base-content/30 transition-all duration-300 ${
                          isScrolled ? "text-lg" : "text-xl md:text-2xl"
                        }`}
                      >
                        ----.--.----
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Flow Content */}
          <div className="w-full max-w-4xl mx-auto px-6 py-8 flex flex-col">
            {/* Classification Levels */}
            {classification.levels.map((level, index) => {
              // Check if this is the current active level (no selection yet)
              const isActiveLevel = !level.selection;
              const previousLevelHasSelection =
                index > 0 && classification.levels[index - 1]?.selection;

              return (
                <div key={`level-${index}`}>
                  {/* Flow Connector - shows between levels */}
                  {index > 0 && !classification.isComplete ? (
                    <div className="flex flex-col items-center py-4">
                      <div
                        className={`w-px h-4 ${
                          previousLevelHasSelection && isActiveLevel
                            ? "bg-gradient-to-b from-success/40 to-primary/40"
                            : "bg-gradient-to-b from-base-content/20 to-base-content/10"
                        }`}
                      />
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full shadow-sm ${
                          previousLevelHasSelection && isActiveLevel
                            ? "bg-primary/20 border border-primary/30 animate-pulse"
                            : "bg-base-200 border border-base-content/10"
                        }`}
                      >
                        <ChevronDownIcon
                          className={`w-4 h-4 ${
                            previousLevelHasSelection && isActiveLevel
                              ? "text-primary"
                              : "text-base-content/40"
                          }`}
                        />
                      </div>
                      <div
                        className={`w-px h-4 ${
                          previousLevelHasSelection && isActiveLevel
                            ? "bg-gradient-to-b from-primary/40 to-transparent"
                            : "bg-gradient-to-b from-base-content/10 to-transparent"
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="h-4" />
                  )}

                  <VerticalClassificationStep
                    classificationLevel={index}
                    classificationRecord={classificationRecord}
                    onOpenExplore={() => setShowExploreModal(true)}
                  />
                </div>
              );
            })}

            {/* Flow Connector to Result */}
            {classification?.isComplete && (
              <>
                <div className="flex flex-col items-center py-4">
                  <div className="w-px h-6 bg-gradient-to-b from-base-content/20 to-success/30" />
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 border border-success/30 shadow-sm">
                    <ChevronDownIcon className="w-4 h-4 text-success" />
                  </div>
                  <div className="w-px h-6 bg-gradient-to-b from-success/30 to-transparent" />
                </div>

                <VerticalClassificationResult
                  userProfile={userProfile}
                  setPage={setPage}
                />
              </>
            )}
          </div>
        </>
      )}

      {/* Pricing Modal */}
      {showPricing && (
        <Modal isOpen={showPricing} setIsOpen={setShowPricing}>
          <ConversionPricing />
        </Modal>
      )}

      {/* Explore Modal */}
      {showExploreModal && (
        <Modal
          isOpen={showExploreModal}
          setIsOpen={setShowExploreModal}
          size="full"
        >
          <div className="h-[85vh] w-full overflow-hidden rounded-2xl">
            <Explore />
          </div>
        </Modal>
      )}
    </div>
  );
};
