"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import { useHts } from "../../contexts/HtsContext";
import { useUser } from "../../contexts/UserContext";
import { LoadingIndicator } from "../LoadingIndicator";
import {
  SectionChapterDiscoveryProvider,
  useSectionChapterDiscovery,
} from "../../contexts/SectionChapterDiscoveryContext";
import { useHtsSections } from "../../contexts/HtsSectionsContext";
import Modal from "../Modal";
import { Explore } from "../Explore";
import { ClassificationStatus, Navigatable } from "../../interfaces/hts";
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
  recordIsFromUsersTeam,
} from "../../libs/classification-helpers";
import { ClassificationRecord } from "../../interfaces/hts";
import { DeleteConfirmationModal } from "../classification-ui/DeleteConfirmationModal";
import { ClassificationSidebar } from "./ClassificationSidebar";
import { MobileNavDropdown } from "./MobileNavDropdown";
import { useClassificationNav, NavTab, ANON_LOCKED_TABS } from "./useClassificationNav";
import { OverviewTab } from "./tabs/OverviewTab";
import { ClassificationLevelTab } from "./tabs/ClassificationLevelTab";
import { DutyTariffTab } from "./tabs/DutyTariffTab";
import { PlaceholderTab } from "./tabs/PlaceholderTab";
import { CrossRulingsTab } from "./tabs/CrossRulingsTab";
import { ClassificationCompleteModal } from "./ClassificationCompleteModal";
import { AnonymousClassificationCompleteModal } from "./AnonymousClassificationCompleteModal";
import { AnonymousConversionBanner } from "./AnonymousConversionBanner";
import { LockedTabOverlay } from "./LockedTabOverlay";
import { useIsReadOnly } from "../../contexts/ReadOnlyContext";

/**
 * Hydrates the SectionChapterDiscovery context from persisted classification
 * data on mount. Runs once so that the nav hook can compute the correct
 * initial tab without needing discovery components to mount first.
 */
function DiscoveryHydrator(): null {
  const { classification } = useClassification();
  const { getSections, sections: htsSections } = useHtsSections();
  const {
    sectionDiscoveryComplete,
    setSectionCandidates,
    setSectionReasoning,
    setSectionDiscoveryComplete,
    chapterDiscoveryComplete,
    setChapterCandidates,
    setChapterReasoning,
    setChapterDiscoveryComplete,
  } = useSectionChapterDiscovery();

  const hasHydratedSections = useRef(false);
  const hasHydratedChapters = useRef(false);

  useEffect(() => {
    if (hasHydratedSections.current || sectionDiscoveryComplete) return;
    if (!classification?.preliminaryLevels) return;

    const sectionLevel = classification.preliminaryLevels.find(
      (l) => l.level === "section"
    );
    if (!sectionLevel || sectionLevel.candidates.length === 0) return;

    hasHydratedSections.current = true;

    const hydrate = async () => {
      let sections = htsSections;
      if (sections.length === 0) {
        sections = await getSections();
      }

      const candidates = sectionLevel.candidates
        .map((c) => {
          const section = sections.find((s) => s.number === c.identifier);
          return section ? { section } : null;
        })
        .filter(Boolean);

      setSectionCandidates(candidates);
      if (sectionLevel.analysis) {
        setSectionReasoning(sectionLevel.analysis);
      }
      setSectionDiscoveryComplete(true);
    };

    hydrate();
  }, [classification?.preliminaryLevels, htsSections, getSections]);

  useEffect(() => {
    if (hasHydratedChapters.current || chapterDiscoveryComplete) return;
    if (!classification?.preliminaryLevels) return;

    const chapterLevel = classification.preliminaryLevels.find(
      (l) => l.level === "chapter"
    );
    if (!chapterLevel || chapterLevel.candidates.length === 0) return;

    hasHydratedChapters.current = true;

    const hydrate = async () => {
      let sections = htsSections;
      if (sections.length === 0) {
        sections = await getSections();
      }

      const candidates = chapterLevel.candidates.map((c) => {
        let sectionNumber = 0;
        for (const s of sections) {
          if (s.chapters.some((ch) => ch.number === c.identifier)) {
            sectionNumber = s.number;
            break;
          }
        }
        return {
          chapter: {
            number: c.identifier,
            description: c.description,
            type: Navigatable.CHAPTER as const,
          },
          sectionNumber,
        };
      });

      setChapterCandidates(candidates);
      if (chapterLevel.analysis) {
        setChapterReasoning(chapterLevel.analysis);
      }
      setChapterDiscoveryComplete(true);
    };

    hydrate();
  }, [classification?.preliminaryLevels, htsSections, getSections]);

  return null;
}

interface Props {
  classificationRecord?: ClassificationRecord;
  /** Pass `{ skipFlush: true }` after delete so we do not PATCH a removed row. */
  onNavigateBack: (options?: { skipFlush?: boolean }) => void | Promise<void>;
}

export const ClassificationDetailLayout = ({
  classificationRecord: initialRecord,
  onNavigateBack,
}: Props) => {
  const readOnly = useIsReadOnly();
  const { isFetching } = useHts();
  const { user } = useUser();
  const { classification, classificationId, isSaving } = useClassification();
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshingRecord, setRefreshingRecord] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const wasCompleteRef = useRef(classification?.isComplete ?? false);
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

  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainContentRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  useEffect(() => {
    if (readOnly) return;
    const isNowComplete = classification?.isComplete ?? false;
    if (isNowComplete && !wasCompleteRef.current) {
      setShowCompleteModal(true);
    }
    wasCompleteRef.current = isNowComplete;
  }, [classification?.isComplete, readOnly]);

  const anonymousEditorClassificationId =
    isAnonymous &&
      classificationRecord &&
      classificationRecord.user_id === null &&
      !classificationRecord.is_shared
      ? classificationRecord.id
      : null;

  const canUpdateDetails = readOnly
    ? false
    : canUserUpdateDetails(userProfile, classificationRecord, {
      anonymousEditorClassificationId,
    });
  const canDelete = readOnly
    ? false
    : canUserDelete(userProfile, classificationRecord);

  const viewerOnTeam = useMemo(
    () =>
      recordIsFromUsersTeam(
        userProfile,
        classificationRecord,
      ),
    [userProfile, classificationRecord],
  );

  const useNormalWorkspace = !readOnly || viewerOnTeam;

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
      await Promise.resolve(onNavigateBack({ skipFlush: true }));
    } catch (error) {
      console.error("Error deleting classification:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }, [classificationRecord, onNavigateBack]);

  const handleCountryChange = useCallback(
    async (country: { code: string } | null) => {
      if (!classificationId) return;
      setClassificationRecord((prev) =>
        prev ? { ...prev, country_of_origin: country?.code || null } : prev
      );
      try {
        await updateClassification(
          classificationId,
          undefined,
          undefined,
          undefined,
          undefined,
          country?.code ?? null
        );
      } catch (error) {
        console.error("Error updating country of origin:", error);
      }
    },
    [classificationId]
  );

  const handleOpenExplore = useCallback(() => {
    if (!readOnly) setShowExploreModal(true);
  }, [readOnly]);

  // When read-only (e.g. viewing team/shared classification), don't block on isFetching or userProfile
  if ((!readOnly && isFetching) || (!readOnly && !isAnonymous && !userProfile)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-base-100">
        <LoadingIndicator />
      </div>
    );
  }

  const LOCKED_TAB_FEATURE_NAMES: Partial<Record<NavTab, string>> = {
    "cross-rulings": "CROSS Ruling Validation",
    attachments: "Attachments",
    "classification-report": "Classification Reports",
  };

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
            onCountryChange={handleCountryChange}
            onStatusChange={handleStatusChange}
            onDownloadReport={handleDownloadReport}
            onDeleteClick={() => setShowDeleteModal(true)}
            onNavigateToDuty={() => setActiveTab("duty-tariffs")}
            onNavigateToTab={setActiveTab}
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
          <CrossRulingsTab
            latestHtsCode={latestHtsCode}
            isComplete={classification?.isComplete ?? false}
          />
        );
      case "duty-tariffs":
        return (
          <DutyTariffTab
            classificationRecord={classificationRecord}
            userProfile={userProfile}
            countryOfOrigin={countryOfOrigin}
          />
        );
      case "attachments":
        return (
          <PlaceholderTab
            title="Attachments"
            description="Upload supporting documents, images, and other files related to your product and this classification."
            icon="paperclip"
          />
        );
      case "classification-report":
        return (
          <PlaceholderTab
            title="Classification Report"
            description="Generate customized, branded classification reports for your own records or to share with clients. While you can already generate reports in the Overview tab, you will have the ability to customize your reports soon."
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
      <DiscoveryHydrator />
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
            useNormalWorkspace={useNormalWorkspace}
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
              useNormalWorkspace={useNormalWorkspace}
            />
          </div>

          {/* Anonymous conversion banner — persistent when modal dismissed */}
          {!readOnly && isAnonymous && classification?.isComplete && !showCompleteModal && (
            <AnonymousConversionBanner classificationId={classificationId} />
          )}

          {/* Scrollable Content Panel */}
          <main ref={mainContentRef} className="flex-1 overflow-y-auto bg-base-100">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              {!readOnly && isAnonymous && ANON_LOCKED_TABS.has(activeTab) ? (
                <LockedTabOverlay
                  classificationId={classificationId}
                  featureName={LOCKED_TAB_FEATURE_NAMES[activeTab] || "this feature"}
                >
                  {renderTabContent()}
                </LockedTabOverlay>
              ) : (
                renderTabContent()
              )}
            </div>
          </main>
        </div>

        {/* Modals (hidden in readonly/shared mode) */}
        {!readOnly && (
          <>
            {showExploreModal && (
              <Modal
                isOpen={showExploreModal}
                setIsOpen={setShowExploreModal}
                size="full"
              >
                <div className="h-[85vh] w-full rounded-2xl">
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

            {isAnonymous ? (
              <AnonymousClassificationCompleteModal
                show={showCompleteModal}
                latestHtsCode={latestHtsCode}
                articleDescription={classification?.articleDescription}
                classificationId={classificationId}
                onContinueWithoutSaving={() => {
                  setShowCompleteModal(false);
                  setActiveTab("overview");
                }}
              />
            ) : (
              <ClassificationCompleteModal
                show={showCompleteModal}
                latestHtsCode={latestHtsCode}
                articleDescription={classification?.articleDescription}
                onClose={() => {
                  setShowCompleteModal(false);
                }}
                onProceed={() => {
                  setShowCompleteModal(false);
                  setActiveTab("overview");
                }}
              />
            )}
          </>
        )}
      </div>
    </SectionChapterDiscoveryProvider>
  );
};
