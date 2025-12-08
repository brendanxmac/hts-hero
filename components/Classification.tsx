"use client";

import { useEffect, useState, useMemo } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { useClassifications } from "../contexts/ClassificationsContext";
import { useHts } from "../contexts/HtsContext";
import { useUser } from "../contexts/UserContext";
import { ClassifyPage } from "../enums/classify";
import { LoadingIndicator } from "./LoadingIndicator";
import { VerticalDescriptionStep } from "./vertical-flow/VerticalDescriptionStep";
import { VerticalClassificationStep } from "./vertical-flow/VerticalClassificationStep";
import { VerticalClassificationResult } from "./vertical-flow/VerticalClassificationResult";
import { fetchUser, UserProfile, UserRole } from "../libs/supabase/user";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import Modal from "./Modal";
import ConversionPricing from "./ConversionPricing";
import { Explore } from "./Explore";
import { ClassificationStatus } from "../interfaces/hts";
import {
  updateClassification,
  deleteClassification,
} from "../libs/classification";
import { downloadClassificationReport } from "../libs/hts";
import {
  fetchImportersForUser,
  fetchImportersForTeam,
} from "../libs/supabase/importers";
import { Importer } from "../interfaces/hts";
import { Countries } from "../constants/countries";
import toast from "react-hot-toast";

interface Props {
  setPage: (page: ClassifyPage) => void;
}

export const Classification = ({ setPage }: Props) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [importers, setImporters] = useState<Importer[]>([]);
  const [isLoadingImporters, setIsLoadingImporters] = useState(true);
  const { isFetching } = useHts();
  const {
    classification,
    setClassification,
    setClassificationId,
    classificationId,
    saveAndClear,
  } = useClassification();
  const { classifications, refreshClassifications } = useClassifications();
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

  const canUpdateDetails =
    userProfile?.role === UserRole.ADMIN ||
    userProfile?.id === classificationRecord?.user_id;

  const canDelete =
    userProfile?.id === classificationRecord?.user_id &&
    classificationRecord?.status === ClassificationStatus.DRAFT;

  const isDraft = classificationRecord?.status === ClassificationStatus.DRAFT;

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

  // Get country of origin from classification record
  const countryOfOrigin = useMemo(() => {
    if (!classificationRecord?.country_of_origin) return null;
    return Countries.find(
      (c) => c.code === classificationRecord.country_of_origin
    );
  }, [classificationRecord?.country_of_origin]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const profile = await fetchUser(user.id);
      setUserProfile(profile || null);

      // Fetch importers
      try {
        const fetchedImporters = profile?.team_id
          ? await fetchImportersForTeam(profile.team_id)
          : await fetchImportersForUser();
        setImporters(fetchedImporters);
      } catch (error) {
        console.error("Error fetching importers:", error);
      } finally {
        setIsLoadingImporters(false);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const handleStatusChange = async (newStatus: ClassificationStatus) => {
    if (!classificationId) return;
    setUpdatingStatus(true);
    try {
      await updateClassification(
        classificationId,
        undefined,
        undefined,
        undefined,
        newStatus
      );
      await refreshClassifications();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!classificationRecord || !userProfile) return;
    setDownloadingReport(true);
    try {
      const importer = importers.find(
        (i) => i.id === classificationRecord.importer_id
      );
      await downloadClassificationReport(
        classificationRecord,
        userProfile,
        importer
      );
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleDeleteClassification = async () => {
    if (!classificationRecord) return;
    try {
      setIsDeleting(true);
      await deleteClassification(classificationRecord.id);
      toast.success("Classification deleted");
      await refreshClassifications();
      setPage(ClassifyPage.CLASSIFICATIONS);
    } catch (error) {
      console.error("Error deleting classification:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    return () => {
      // Save any pending changes and clear state when leaving the page
      saveAndClear();
    };
  }, []);

  // Handle scroll to toggle compact header with hysteresis to prevent flickering
  // Now listens to the parent scroll container (layout level)
  useEffect(() => {
    if (!hasStartedClassification) return;

    // Find the parent scroll container (the layout's overflow-y-auto div)
    const scrollContainer = document.querySelector(
      ".h-screen.overflow-y-auto"
    ) as HTMLElement | null;
    if (!scrollContainer) return;

    const SCROLL_DOWN_THRESHOLD = 100; // Scroll down past this to minimize
    const SCROLL_UP_THRESHOLD = 20; // Scroll up past this to maximize

    let ticking = false;

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
  }, [hasStartedClassification]);

  // Smooth scroll to top when classification is completed
  useEffect(() => {
    if (classification?.isComplete) {
      // Find the parent scroll container
      const scrollContainer = document.querySelector(
        ".h-screen.overflow-y-auto"
      ) as HTMLElement | null;

      if (scrollContainer) {
        // Small delay to allow the UI to transition, then smooth scroll to top
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }, 150);
      }
    }
  }, [classification?.isComplete]);

  if (isFetching || !userProfile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-base-100">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-base-100">
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
            className={`sticky top-0 z-50 transition-all duration-200 shadow-lg shadow-base-content/5 ${
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
              className={`relative z-10 w-full max-w-4xl mx-auto px-6 transition-all duration-200 ${
                isScrolled ? "py-3" : "py-6 md:py-8"
              }`}
            >
              {/* Top Row: Back Button + Actions - hidden when scrolled */}
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isScrolled
                    ? "max-h-0 opacity-0 mb-0"
                    : "max-h-12 opacity-100 mb-4"
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Back Button */}
                  <button
                    className="group flex items-center gap-2 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors"
                    onClick={() => setPage(ClassifyPage.CLASSIFICATIONS)}
                  >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Classifications
                  </button>

                  {/* Header Actions */}
                  {classificationRecord && (
                    <div className="flex items-center gap-2">
                      {/* Status Dropdown - Only show when complete */}
                      {classification?.isComplete && (
                        <div className="relative">
                          <select
                            className={`select select-sm h-9 bg-base-100 rounded-lg border border-base-content/15 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 hover:border-primary/40 cursor-pointer font-semibold text-xs ${
                              classificationRecord.status ===
                              ClassificationStatus.FINAL
                                ? "text-success border-success/30"
                                : classificationRecord.status ===
                                    ClassificationStatus.REVIEW
                                  ? "text-warning border-warning/30"
                                  : "text-base-content/70"
                            }`}
                            value={classificationRecord.status}
                            disabled={updatingStatus || !canUpdateDetails}
                            onChange={(e) =>
                              handleStatusChange(
                                e.target.value as ClassificationStatus
                              )
                            }
                          >
                            <option value={ClassificationStatus.DRAFT}>
                              Draft
                            </option>
                            <option value={ClassificationStatus.REVIEW}>
                              Review
                            </option>
                            <option value={ClassificationStatus.FINAL}>
                              Final
                            </option>
                          </select>
                          {updatingStatus && (
                            <span className="loading loading-spinner loading-xs absolute right-8 top-1/2 -translate-y-1/2 text-primary"></span>
                          )}
                        </div>
                      )}

                      {/* Download Report Button - Only show when complete */}
                      {classification?.isComplete && (
                        <button
                          className="group flex items-center gap-1.5 h-9 px-3 rounded-lg font-semibold text-xs transition-all duration-200 bg-primary text-primary-content hover:bg-primary/90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={downloadingReport || isLoadingImporters}
                          onClick={handleDownloadReport}
                          title="Download classification report"
                        >
                          {downloadingReport ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">Report</span>
                        </button>
                      )}

                      {/* Delete Button - Always show */}
                      <div className="relative group">
                        <button
                          className={`flex items-center gap-1.5 h-9 px-3 rounded-lg font-semibold text-xs transition-all duration-200 ${
                            canDelete
                              ? "bg-error/15 border border-error/30 text-error hover:bg-error/25 hover:border-error/40"
                              : "bg-base-content/5 border border-base-content/10 text-base-content/30 cursor-not-allowed"
                          }`}
                          onClick={() => canDelete && setShowDeleteModal(true)}
                          disabled={!canDelete || isDeleting}
                          title={
                            canDelete
                              ? "Delete classification"
                              : "Only drafts can be deleted"
                          }
                        >
                          {isDeleting ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <TrashIcon className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {/* Tooltip for disabled state */}
                        {!canDelete && !isDeleting && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-base-content text-base-100 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                            Only drafts can be deleted
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-base-content"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Left side - Item Description */}
                <div
                  className={`flex flex-col transition-all duration-200 ${
                    isScrolled ? "gap-0.5" : "gap-1.5"
                  } flex-1 min-w-0`}
                >
                  {/* Label - always visible */}
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-base-content/70">
                    {/* <span className="inline-block w-8 h-px bg-primary/40" /> */}
                    {classification.isComplete
                      ? "Item Classified"
                      : "Item to Classify"}
                  </div>
                  <h1
                    className={`font-extrabold tracking-tight transition-all duration-200 ${
                      isScrolled
                        ? "text-base md:text-lg leading-snug line-clamp-2"
                        : "text-xl md:text-2xl lg:text-3xl leading-tight"
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
                    <div
                      className={`flex flex-col items-end transition-all duration-200 ${
                        isScrolled ? "gap-0" : "gap-1"
                      }`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-widest text-base-content/70">
                        HTS Code
                      </span>
                      <span
                        className={`font-bold text-primary transition-all duration-200 ${
                          isScrolled
                            ? "text-base md:text-lg"
                            : "text-lg md:text-2xl lg:text-3xl"
                        }`}
                      >
                        {latestHtsCode}
                      </span>
                      {/* Country of Origin */}
                      {countryOfOrigin && (
                        <div
                          className={`flex items-center gap-1.5 transition-all duration-200 ${
                            isScrolled ? "mt-0" : "mt-1"
                          }`}
                        >
                          <span className={`text-xs text-base-content/50`}>
                            from
                          </span>
                          <span
                            className={`text-base ${isScrolled ? "text-base" : "text-lg md:text-xl"}`}
                          >
                            {countryOfOrigin.flag}
                          </span>
                          <span
                            className={`text-xs uppercase font-semibold text-base-content/70`}
                          >
                            {countryOfOrigin.name}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : latestHtsCode ? (
                    // In progress with a code selected
                    <div
                      className={`flex flex-col items-end transition-all duration-200 ${
                        isScrolled ? "gap-0" : "gap-0.5"
                      }`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-widest text-primary/60">
                        Current Code
                      </span>
                      <span
                        className={`font-bold text-primary transition-all duration-200 ${
                          isScrolled
                            ? "text-base md:text-lg"
                            : "text-lg md:text-xl"
                        }`}
                      >
                        {latestHtsCode}
                      </span>
                    </div>
                  ) : (
                    // No selection yet
                    <div
                      className={`flex flex-col items-end transition-all duration-200 ${
                        isScrolled ? "gap-0" : "gap-0.5"
                      }`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
                        HTS Code
                      </span>
                      <span
                        className={`text-base-content/30 transition-all duration-200 ${
                          isScrolled
                            ? "text-base md:text-lg"
                            : "text-lg md:text-xl"
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
            {/* Show classification levels inline only when NOT complete */}
            {!classification?.isComplete && (
              <>
                {classification.levels.map((level, index) => {
                  // Check if this is the current active level (no selection yet)
                  const isActiveLevel = !level.selection;
                  const previousLevelHasSelection =
                    index > 0 && classification.levels[index - 1]?.selection;

                  return (
                    <div key={`level-${index}`}>
                      {/* Flow Connector - shows between levels */}
                      {index > 0 ? (
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
              </>
            )}

            {/* When complete, show the result component which contains everything */}
            {classification?.isComplete && (
              <VerticalClassificationResult
                userProfile={userProfile}
                setPage={setPage}
                classificationRecord={classificationRecord}
                onOpenExplore={() => setShowExploreModal(true)}
              />
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="relative overflow-hidden bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-base-content/15"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-error/15 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-error/20 border border-error/30 mb-4">
                <TrashIcon className="h-6 w-6 text-error" />
              </div>

              <h3 className="text-xl font-bold text-base-content mb-2">
                Delete Classification
              </h3>
              <p className="text-base-content/70 mb-6 leading-relaxed">
                Are you sure you want to delete this classification? This action
                cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-xl font-semibold text-sm text-base-content/80 hover:text-base-content hover:bg-base-content/10 transition-all duration-200"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-xl font-semibold text-sm bg-error text-error-content hover:bg-error/90 hover:shadow-lg hover:shadow-error/30 transition-all duration-200"
                  onClick={handleDeleteClassification}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
