"use client";

import { useState, useMemo, useCallback } from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import { useHts } from "../../contexts/HtsContext";
import { useUser } from "../../contexts/UserContext";
import { LoadingIndicator } from "../LoadingIndicator";
import {
  SectionChapterDiscoveryProvider,
} from "../../contexts/SectionChapterDiscoveryContext";
import Modal from "../Modal";
import { Explore } from "../Explore";
import { ClassificationStatus } from "../../interfaces/hts";
import {
  updateClassification,
  deleteClassification,
  fetchClassificationById,
} from "../../libs/classification";
import { downloadClassificationReport } from "../../libs/hts";
import toast from "react-hot-toast";
import { useUserProfileAndImporters } from "../../hooks";
import {
  getLatestHtsCode,
  getCountryOfOrigin,
  canUserUpdateDetails,
  canUserDelete,
} from "../../libs/classification-helpers";
import { ClassificationRecord } from "../../interfaces/hts";
import { DeleteConfirmationModal } from "../classification-ui/DeleteConfirmationModal";
import { ClassificationSidebar } from "./ClassificationSidebar";
import { MobileNavDropdown } from "./MobileNavDropdown";
import { useClassificationNav, NavTab } from "./useClassificationNav";
import { OverviewTab } from "./tabs/OverviewTab";
import { ClassificationLevelTab } from "./tabs/ClassificationLevelTab";
import { DutyTariffTab } from "./tabs/DutyTariffTab";
import { PlaceholderTab } from "./tabs/PlaceholderTab";

interface Props {
  classificationRecord?: ClassificationRecord;
  onNavigateBack: () => void;
}

export const ClassificationDetailLayout = ({
  classificationRecord: initialRecord,
  onNavigateBack,
}: Props) => {
  const { isFetching } = useHts();
  const { user } = useUser();
  const { classification, classificationId, isSaving } = useClassification();
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

  const { activeTab, setActiveTab, navItems } =
    useClassificationNav(classification);

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

  if (isFetching || (!isAnonymous && !userProfile)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-base-100">
        <LoadingIndicator />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            classification={classification}
            classificationRecord={classificationRecord}
            userProfile={userProfile}
            importers={importers}
            isLoadingImporters={isLoadingImporters}
            canUpdateDetails={canUpdateDetails}
            canDelete={canDelete}
            updatingStatus={updatingStatus}
            downloadingReport={downloadingReport}
            isDeleting={isDeleting}
            latestHtsCode={latestHtsCode}
            countryOfOrigin={countryOfOrigin}
            onStatusChange={handleStatusChange}
            onDownloadReport={handleDownloadReport}
            onDeleteClick={() => setShowDeleteModal(true)}
            onNavigateToDuty={() => setActiveTab("duty-tariffs")}
          />
        );
      case "classification-section":
        return (
          <ClassificationLevelTab
            type="section"
            classificationRecord={classificationRecord}
            onOpenExplore={handleOpenExplore}
          />
        );
      case "classification-chapter":
        return (
          <ClassificationLevelTab
            type="chapter"
            classificationRecord={classificationRecord}
            onOpenExplore={handleOpenExplore}
          />
        );
      case "cross-rulings":
        return (
          <PlaceholderTab
            title="CROSS Rulings"
            description="Search and reference Customs Rulings Online Search System (CROSS) rulings relevant to this classification."
            icon="scale"
          />
        );
      case "classification-defense":
        return (
          <PlaceholderTab
            title="Classification Defense"
            description="Build and document your legal defense for this classification decision."
            icon="shield"
          />
        );
      case "duty-tariffs":
        return (
          <DutyTariffTab
            classificationRecord={classificationRecord}
            userProfile={userProfile}
          />
        );
      case "attachments":
        return (
          <PlaceholderTab
            title="Attachments"
            description="Upload supporting documents, images, and other files related to this classification."
            icon="paperclip"
          />
        );
      case "audit-report":
        return (
          <PlaceholderTab
            title="Audit-Ready Report"
            description="Generate a comprehensive, audit-ready classification report for customs compliance."
            icon="document"
          />
        );
      default: {
        const levelMatch = activeTab.match(/^classification-level-(\d+)$/);
        if (levelMatch) {
          const levelIndex = parseInt(levelMatch[1], 10);
          return (
            <ClassificationLevelTab
              type="level"
              levelIndex={levelIndex}
              classificationRecord={classificationRecord}
              onOpenExplore={handleOpenExplore}
            />
          );
        }
        return null;
      }
    }
  };

  return (
    <SectionChapterDiscoveryProvider>
      <div className="h-screen flex bg-base-100">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 border-r border-base-300 bg-base-200/50 h-full overflow-hidden shrink-0">
          <ClassificationSidebar
            classification={classification}
            classificationRecord={classificationRecord}
            latestHtsCode={latestHtsCode}
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onNavigateBack={onNavigateBack}
            isSaving={isSaving || refreshingRecord}
            userProfile={userProfile}
            isAnonymous={isAnonymous}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Mobile Top Bar */}
          <div className="lg:hidden">
            <MobileNavDropdown
              classification={classification}
              navItems={navItems}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onNavigateBack={onNavigateBack}
              userProfile={userProfile}
              isAnonymous={isAnonymous}
            />
          </div>

          {/* Scrollable Content Panel */}
          <main className="flex-1 overflow-y-auto bg-base-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              {renderTabContent()}
            </div>
          </main>
        </div>

        {/* Modals */}
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
    </SectionChapterDiscoveryProvider>
  );
};
