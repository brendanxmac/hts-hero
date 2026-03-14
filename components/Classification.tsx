"use client";

import { useState, useMemo, useCallback } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { useHts } from "../contexts/HtsContext";
import { useUser } from "../contexts/UserContext";
import { LoadingIndicator } from "./LoadingIndicator";
import { VerticalSectionDiscovery } from "./vertical-flow/VerticalSectionDiscovery";
import { VerticalChapterDiscovery } from "./vertical-flow/VerticalChapterDiscovery";
import { VerticalClassificationStep } from "./vertical-flow/VerticalClassificationStep";
import { VerticalClassificationResult } from "./vertical-flow/VerticalClassificationResult";
import {
  SectionChapterDiscoveryProvider,
  useSectionChapterDiscovery,
} from "../contexts/SectionChapterDiscoveryContext";
import Modal from "./Modal";
import ConversionPricing from "./ConversionPricing";
import { Explore } from "./Explore";
import { ClassificationI, ClassificationStatus } from "../interfaces/hts";
import {
  updateClassification,
  deleteClassification,
  fetchClassificationById,
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
import { ClassificationRecord } from "../interfaces/hts";
import { LevelConnector } from "./classification-ui/LevelConnector";
import { BackButton } from "./classification-ui/BackButton";
import { AnimatedBackground } from "./classification-ui/AnimatedBackground";
import { HeaderActions } from "./classification-ui/HeaderActions";
import { HtsCodeDisplay } from "./classification-ui/HtsCodeDisplay";
import { DeleteConfirmationModal } from "./classification-ui/DeleteConfirmationModal";
import { AnonymousClassificationResult } from "./vertical-flow/AnonymousClassificationResult";

interface ClassificationProps {
  classificationRecord?: ClassificationRecord;
  onNavigateBack: () => void;
}

// Inner component that can use the SectionChapterDiscovery context
interface ClassificationFlowContentProps {
  classification: ClassificationI;
  classificationRecord: ClassificationRecord | undefined;
  onOpenExplore: () => void;
  userProfile: any;
  isAnonymous: boolean;
}

const ClassificationFlowContent = ({
  classification,
  classificationRecord,
  onOpenExplore,
  userProfile,
  isAnonymous,
}: ClassificationFlowContentProps) => {
  const { chapterDiscoveryComplete } = useSectionChapterDiscovery();

  if (classification?.isComplete) {
    if (!isAnonymous) {
      return (
        <VerticalClassificationResult
          userProfile={userProfile}
          classificationRecord={classificationRecord}
          onOpenExplore={onOpenExplore}
        />
      );
    }
  }

  return (
    <>
      {classification.preliminaryLevels && (
        <>
          {/* Section Discovery Step */}
          <div className="h-4" />
          <VerticalSectionDiscovery />

          {/* Chapter Discovery Step */}
          <LevelConnector isActive={true} hasPreviousSelection={true} />
          <VerticalChapterDiscovery />
        </>
      )}

      {/* Heading and Sub-heading Classification Levels - only show when chapter discovery is complete */}
      {(chapterDiscoveryComplete || !classification.preliminaryLevels) &&
        classification.levels.map((level, index) => {
          const isActiveLevel = !level.selection;
          const previousLevelHasSelection =
            index > 0 && classification.levels[index - 1]?.selection;

          return (
            <div key={`level-${index}`}>
              <LevelConnector
                isActive={isActiveLevel}
                hasPreviousSelection={
                  index === 0 ? true : !!previousLevelHasSelection
                }
              />

              <VerticalClassificationStep
                classificationLevel={index}
                classificationRecord={classificationRecord}
                onOpenExplore={onOpenExplore}
              />
            </div>
          );
        })}
    </>
  );
};

export const Classification = ({
  classificationRecord: initialRecord,
  onNavigateBack,
}: ClassificationProps) => {
  const { isFetching } = useHts();
  const { user } = useUser();
  const {
    classification,
    classificationId,
    isSaving,
  } = useClassification();
  const [showPricing, setShowPricing] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshingRecord, setRefreshingRecord] = useState(false);
  const [classificationRecord, setClassificationRecord] = useState<
    ClassificationRecord | undefined
  >(initialRecord);

  const { userProfile, importers, isLoadingImporters } =
    useUserProfileAndImporters(user?.id);

  const isAnonymous = !user;

  const isScrolled = useHeaderScroll(true);
  useScrollToTopOnComplete(classification?.isComplete ?? false);

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

  // Refresh the classification record from the API
  const refreshRecord = useCallback(async () => {
    if (!classificationId) return;
    setRefreshingRecord(true);
    try {
      const updated = await fetchClassificationById(classificationId);
      setClassificationRecord(updated);
    } catch (error) {
      console.error("Error refreshing classification record:", error);
    } finally {
      setRefreshingRecord(false);
    }
  }, [classificationId]);

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
        await refreshRecord();
      } catch (error) {
        console.error("Error updating status:", error);
      } finally {
        setUpdatingStatus(false);
      }
    },
    [classificationId, refreshRecord]
  );

  const handleDownloadReport = useCallback(async () => {
    if (!classificationRecord || !userProfile) return;
    setDownloadingReport(true);
    try {
      const importer = importers.find(
        (i) => i.id === classificationRecord.importer_id
      );
      // Merge current classification from context (has latest notes) with classificationRecord
      const recordWithCurrentClassification = {
        ...classificationRecord,
        classification: classification || classificationRecord.classification,
      };
      await downloadClassificationReport(
        recordWithCurrentClassification,
        userProfile,
        importer
      );
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setDownloadingReport(false);
    }
  }, [classificationRecord, userProfile, importers, classification]);

  const handleDeleteClassification = useCallback(async () => {
    if (!classificationRecord) return;
    try {
      setIsDeleting(true);
      await deleteClassification(classificationRecord.id);
      toast.success("Classification deleted");
      onNavigateBack();
    } catch (error) {
      console.error("Error deleting classification:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }, [classificationRecord, onNavigateBack]);

  const handleOpenExplore = useCallback(() => setShowExploreModal(true), []);

  // ---------------------------------------------------------------------------
  // Render: Loading State
  // ---------------------------------------------------------------------------
  if (isFetching || (!isAnonymous && !userProfile)) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-base-100">
        <LoadingIndicator />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Anonymous Complete — full-page takeover, no header chrome
  // ---------------------------------------------------------------------------
  if (classification?.isComplete) {
    return (
      <div className="min-h-full w-full bg-base-100">
        <div className="w-full max-w-5xl mx-auto px-6 py-8 flex flex-col">
          <AnonymousClassificationResult
            classification={classification}
            classificationId={classificationRecord?.id}
          />
        </div>
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
        className={`sticky top-0 z-40 transition-all duration-300 shadow-lg ${"shadow-base-content/5 border-b border-base-content/5"} ${isScrolled
          ? "bg-base-100/95 backdrop-blur-md"
          : "bg-gradient-to-br from-base-200 via-base-100 to-base-200"
          }`}
      >
        <AnimatedBackground isScrolled={isScrolled} />

        <div
          className={`relative z-0 w-full max-w-5xl mx-auto px-6 transition-all duration-200 ${isScrolled ? "py-3" : "py-6 md:py-8"
            }`}
        >
          {/* Top Row: Back Button + Actions */}
          <div
            className={`overflow-hidden transition-all duration-200 ${isScrolled
              ? "max-h-0 opacity-0 mb-0"
              : "max-h-12 opacity-100 mb-4"
              }`}
          >
            <div className="flex items-center justify-between">
              <BackButton
                onClick={onNavigateBack}
                label="Classifications"
                isSaving={isSaving || refreshingRecord}
              />
              {classificationRecord && (
                <HeaderActions
                  classificationRecord={classificationRecord}
                  isComplete={classification?.isComplete ?? false}
                  canUpdateDetails={canUpdateDetails}
                  canDelete={canDelete}
                  refreshingClassifications={refreshingRecord}
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
              className={`flex flex-col transition-all duration-200 ${isScrolled ? "gap-0.5" : "gap-1.5"
                } flex-1 min-w-0`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-base-content/70">
                {classification.isComplete
                  ? "Item Classified"
                  : "Item to Classify"}
              </div>
              <h1
                className={`font-extrabold tracking-tight transition-all duration-200 ${isScrolled
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
      <SectionChapterDiscoveryProvider>
        <div className="w-full max-w-5xl mx-auto px-6 py-8 flex flex-col">
          <ClassificationFlowContent
            classification={classification}
            classificationRecord={classificationRecord}
            onOpenExplore={handleOpenExplore}
            userProfile={userProfile}
            isAnonymous={isAnonymous}
          />
        </div>
      </SectionChapterDiscoveryProvider>

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
