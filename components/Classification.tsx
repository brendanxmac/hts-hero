"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { useClassifications } from "../contexts/ClassificationsContext";
import { useHts } from "../contexts/HtsContext";
import { useUser } from "../contexts/UserContext";
import { ClassifyPage } from "../enums/classify";
import { LoadingIndicator } from "./LoadingIndicator";
import { VerticalDescriptionStep } from "./vertical-flow/VerticalDescriptionStep";
import { VerticalClassificationStep } from "./vertical-flow/VerticalClassificationStep";
import { VerticalClassificationResult } from "./vertical-flow/VerticalClassificationResult";
import Modal from "./Modal";
import ConversionPricing from "./ConversionPricing";
import { Explore } from "./Explore";
import { ClassificationStatus } from "../interfaces/hts";
import {
  updateClassification,
  deleteClassification,
} from "../libs/classification";
import { downloadClassificationReport } from "../libs/hts";
import toast from "react-hot-toast";
import {
  useUserProfileAndImporters,
  useHeaderScroll,
  useScrollToTopOnComplete,
} from "../hooks";
import {
  getLatestHtsCode,
  getCountryOfOrigin,
  canUserUpdateDetails,
  canUserDelete,
} from "../libs/classification-helpers";
import {
  BackButton,
  HeaderActions,
  HtsCodeDisplay,
  AnimatedBackground,
  LevelConnector,
  DeleteConfirmationModal,
} from "./classification-ui";

interface ClassificationProps {
  setPage: (page: ClassifyPage) => void;
}

export const Classification = ({ setPage }: ClassificationProps) => {
  const { isFetching } = useHts();
  const { user } = useUser();
  const { classification, classificationId, saveAndClear } =
    useClassification();
  const {
    classifications,
    refreshClassifications,
    isLoading: refreshingClassifications,
  } = useClassifications();
  const [showPricing, setShowPricing] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { userProfile, importers, isLoadingImporters } =
    useUserProfileAndImporters(user?.id);

  const hasStartedClassification = Boolean(
    classificationId ||
      (classification?.articleDescription && classification?.levels?.length > 0)
  );
  const isScrolled = useHeaderScroll(hasStartedClassification);
  useScrollToTopOnComplete(classification?.isComplete ?? false);

  const classificationRecord = useMemo(
    () => classifications.find((c) => c.id === classificationId),
    [classifications, classificationId]
  );

  const latestHtsCode = useMemo(
    () => getLatestHtsCode(classification?.levels),
    [classification?.levels]
  );

  const countryOfOrigin = useMemo(
    () => getCountryOfOrigin(classificationRecord?.country_of_origin),
    [classificationRecord?.country_of_origin]
  );

  const canUpdateDetails = canUserUpdateDetails(
    userProfile,
    classificationRecord
  );
  const canDelete = canUserDelete(userProfile, classificationRecord);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------
  const handleStatusChange = useCallback(
    async (newStatus: ClassificationStatus) => {
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
    },
    [classificationId, refreshClassifications]
  );

  const handleDownloadReport = useCallback(async () => {
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
  }, [classificationRecord, userProfile, importers]);

  const handleDeleteClassification = useCallback(async () => {
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
  }, [classificationRecord, refreshClassifications, setPage]);

  const handleOpenExplore = useCallback(() => setShowExploreModal(true), []);
  const handleNavigateBack = useCallback(
    () => setPage(ClassifyPage.CLASSIFICATIONS),
    [setPage]
  );

  useEffect(() => {
    return () => {
      saveAndClear();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Render: Loading State
  // ---------------------------------------------------------------------------
  if (isFetching || !userProfile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-base-100">
        <LoadingIndicator />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Description Step (No Classification Started)
  // ---------------------------------------------------------------------------
  if (!hasStartedClassification) {
    return (
      <div className="min-h-full w-full bg-base-100">
        <div className="bg-base-100/95 backdrop-blur-sm">
          <div className="w-full max-w-4xl mx-auto px-6 py-4">
            <BackButton onClick={handleNavigateBack} />
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto px-6 py-8">
          <VerticalDescriptionStep
            setPage={setPage}
            setShowPricing={setShowPricing}
            classificationRecord={classificationRecord}
          />
        </div>

        {showPricing && (
          <Modal isOpen={showPricing} setIsOpen={setShowPricing}>
            <ConversionPricing />
          </Modal>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Classification Flow
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-full w-full bg-base-100">
      {/* Sticky Hero Header */}
      <div
        className={`sticky top-0 z-40 transition-all duration-200 shadow-lg shadow-base-content/5 ${
          isScrolled
            ? "bg-base-100/95 backdrop-blur-md"
            : "bg-gradient-to-br from-base-200 via-base-100 to-base-200"
        } border-b border-base-content/5`}
      >
        <AnimatedBackground isScrolled={isScrolled} />

        <div
          className={`relative z-0 w-full max-w-5xl mx-auto px-6 transition-all duration-200 ${
            isScrolled ? "py-3" : "py-6 md:py-8"
          }`}
        >
          {/* Top Row: Back Button + Actions */}
          <div
            className={`overflow-hidden transition-all duration-200 ${
              isScrolled
                ? "max-h-0 opacity-0 mb-0"
                : "max-h-12 opacity-100 mb-4"
            }`}
          >
            <div className="flex items-center justify-between">
              <BackButton
                onClick={handleNavigateBack}
                label="Classifications"
              />
              {classificationRecord && (
                <HeaderActions
                  classificationRecord={classificationRecord}
                  isComplete={classification?.isComplete ?? false}
                  canUpdateDetails={canUpdateDetails}
                  canDelete={canDelete}
                  refreshingClassifications={refreshingClassifications}
                  updatingStatus={updatingStatus}
                  downloadingReport={downloadingReport}
                  isLoadingImporters={isLoadingImporters}
                  isDeleting={isDeleting}
                  onStatusChange={handleStatusChange}
                  onDownloadReport={handleDownloadReport}
                  onDeleteClick={() => setShowDeleteModal(true)}
                />
              )}
            </div>
          </div>

          {/* Main Header Content */}
          <div className="flex items-center justify-between gap-4">
            {/* Item Description */}
            <div
              className={`flex flex-col transition-all duration-200 ${
                isScrolled ? "gap-0.5" : "gap-1.5"
              } flex-1 min-w-0`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-base-content/70">
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

            {/* HTS Code Display */}
            <div className="flex items-center shrink-0">
              <HtsCodeDisplay
                isComplete={classification?.isComplete ?? false}
                latestHtsCode={latestHtsCode}
                countryOfOrigin={countryOfOrigin}
                isScrolled={isScrolled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Classification Flow Content */}
      <div className="w-full max-w-5xl mx-auto px-6 py-8 flex flex-col">
        {!classification?.isComplete ? (
          // In-progress classification levels
          <>
            {classification.levels.map((level, index) => {
              const isActiveLevel = !level.selection;
              const previousLevelHasSelection =
                index > 0 && classification.levels[index - 1]?.selection;

              return (
                <div key={`level-${index}`}>
                  {index > 0 ? (
                    <LevelConnector
                      isActive={isActiveLevel}
                      hasPreviousSelection={!!previousLevelHasSelection}
                    />
                  ) : (
                    <div className="h-4" />
                  )}

                  <VerticalClassificationStep
                    classificationLevel={index}
                    classificationRecord={classificationRecord}
                    onOpenExplore={handleOpenExplore}
                  />
                </div>
              );
            })}
          </>
        ) : (
          // Completed classification result
          <VerticalClassificationResult
            userProfile={userProfile}
            classificationRecord={classificationRecord}
            onOpenExplore={handleOpenExplore}
          />
        )}
      </div>

      {/* Modals */}
      {showPricing && (
        <Modal isOpen={showPricing} setIsOpen={setShowPricing}>
          <ConversionPricing />
        </Modal>
      )}

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

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteClassification}
      />
    </div>
  );
};
