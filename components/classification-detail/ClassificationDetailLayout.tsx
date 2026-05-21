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
import { useExploreModal } from "../../contexts/ExploreModalContext";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import OnboardingTour from "../onboarding/OnboardingTour";
import { type OnboardingStep, isTourCompleted } from "../../hooks";

import {
  SparklesIcon,
  MapIcon,
  QueueListIcon,
  PlusCircleIcon,
  BeakerIcon,
  DocumentTextIcon as DocumentTextOutline,
  CheckBadgeIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  GlobeAltIcon,
  TagIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

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
  const { openExplore } = useExploreModal();
  const { isFetching } = useHts();
  const { user } = useUser();
  const { classification, classificationId, isSaving } = useClassification();
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

  const [workspaceTourDone, setWorkspaceTourDone] = useState(() =>
    isTourCompleted("classification-detail-workspace")
  );
  const [candidatesTourDone, setCandidatesTourDone] = useState(() =>
    isTourCompleted("classification-detail-candidates")
  );

  const { activeTab, setActiveTab, navItems } =
    useClassificationNav(classification);

  const visitedTabsRef = useRef(new Set<NavTab>([activeTab]));
  visitedTabsRef.current.add(activeTab);

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
      const previousStatus = classificationRecord?.status;
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
        trackEvent(MixpanelEvent.CLASSIFICATION_STATUS_CHANGED, {
          classification_id: classificationId,
          previous_status: previousStatus,
          new_status: newStatus,
        });
      } catch (error) {
        console.error("Error updating status:", error);
      } finally {
        setUpdatingStatus(false);
      }
    },
    [classificationId, classificationRecord?.status, refreshRecord]
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
      trackEvent(MixpanelEvent.CLASSIFICATION_REPORT_DOWNLOADED, {
        classification_id: classificationRecord.id,
      });
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
      trackEvent(MixpanelEvent.CLASSIFICATION_DELETED, {
        classification_id: classificationRecord.id,
      });
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
        trackEvent(MixpanelEvent.CLASSIFICATION_COO_SET, {
          classification_id: classificationId,
          country_code: country?.code ?? null,
        });
      } catch (error) {
        console.error("Error updating country of origin:", error);
      }
    },
    [classificationId]
  );

  const handleOpenExplore = useCallback(() => {
    if (!readOnly) openExplore("classification_modal");
  }, [readOnly, openExplore]);

  // ---------------------------------------------------------------------------
  // Contextual onboarding mini-tours
  // (must live before the early-return guard so hook call order is stable)
  // ---------------------------------------------------------------------------

  const workspaceTourSteps: OnboardingStep[] = useMemo(
    () => [
      {
        id: "workspace-welcome",
        type: "modal" as const,
        title: "Your Classification Workspace",
        description:
          "This is where you classify products. We'll automatically discover relevant HS sections, chapters, and headings -- as well as any relevant legal notes or CROSS rulings.",
        icon: <SparklesIcon className="h-5 w-5 text-primary" />,
      },
      {
        id: "workspace-nav",
        type: "spotlight" as const,
        targetSelector: "#onboarding-detail-nav",
        title: "See the Big Picture",
        description:
          "Use this sidebar to navigate between different aspects of your classification - from duties, to the classification path, and CROSS ruling validation.",
        placement: "right" as const,
        icon: <MapIcon className="h-5 w-5 text-primary" />,
      },
      {
        id: "workspace-path",
        type: "spotlight" as const,
        targetSelector: "#onboarding-detail-classification-path",
        title: "Navigate Your Classification Path",
        description:
          "You will select the best HTS element level-by-level, starting with headings. Your selection path through the HTS is tracked here. Completed levels show a green check, and your current step pulses to show where you are.",
        placement: "right" as const,
      },
    ],
    []
  );

  const candidatesTourSteps: OnboardingStep[] = useMemo(
    () => [
      {
        id: "candidates-options",
        type: "spotlight" as const,
        targetSelector: "#onboarding-detail-options",
        title: "Get Heading Candidates For Your Product",
        description:
          "We automatically find HS heading candidates based on your product description, legal notes, and GRIs. Click any option to select it and advance to the next level of the tariff schedule.",
        placement: "right" as const,
        icon: <QueueListIcon className="h-5 w-5 text-primary" />,
      },
      {
        id: "candidates-add",
        type: "spotlight" as const,
        targetSelector: "#onboarding-detail-add-candidates",
        title: "Add Missing Candidates",
        description:
          "If you don't see any good options, you can quickly browse the entire HTS and add candidates yourself.",
        placement: "bottom" as const,
        icon: <PlusCircleIcon className="h-5 w-5 text-primary" />,
      },
      // {
      //   id: "candidates-research",
      //   type: "spotlight" as const,
      //   targetSelector: "#onboarding-detail-research-panel",
      //   title: "Candidate Analysis",
      //   description:
      //     "We analyze each candidate against the Legal Notes & GRIs to help you make the best selection. This is for reference only, always use your own judgment.",
      //   placement: "left" as const,
      //   icon: <BeakerIcon className="h-5 w-5 text-primary" />,
      // },
      {
        id: "candidates-tabs",
        type: "spotlight" as const,
        targetSelector: "#onboarding-detail-research-tabs",
        title: "Research, Legal Notes, & CROSS Rulings related to your product",
        description:
          "Quickly see AI research, Legal Notes, and CROSS rulings that may affect your classification.",
        placement: "bottom" as const,
      },
    ],
    []
  );

  const completionTourSteps: OnboardingStep[] = useMemo(
    () => [
      // {
      //   id: "complete-congrats",
      //   type: "modal" as const,
      //   title: "Classification Complete!",
      //   description:
      //     "Your classification is done — let's walk through the tools you have to finalize, share, and organize it.",
      //   icon: <TrophyIcon className="h-5 w-5 text-primary" />,
      // },
      {
        id: "complete-status",
        type: "spotlight" as const,
        targetSelector: "#onboarding-detail-status",
        title: "Set Classification Status",
        description:
          "Mark your classification as Final when you're confident, or flag it as Needs Review for a teammate to check.",
        placement: "bottom" as const,
        icon: <CheckBadgeIcon className="h-5 w-5 text-primary" />,
      },
      {
        id: "complete-report",
        type: "spotlight" as const,
        targetSelector: "#onboarding-detail-download-report",
        title: "Generate Classification Report",
        description:
          "Download a full classification report including your HTS code path, product details, and any notes you've added — ready to share with clients, colleagues, or file for audit. You can add your company logo by uploading it in your settings.",
        placement: "bottom" as const,
        icon: <DocumentArrowDownIcon className="h-5 w-5 text-primary" />,
      },
      {
        id: "complete-share",
        type: "spotlight" as const,
        targetSelector: "#onboarding-detail-share",
        title: "Share with Colleagues or Clients",
        description:
          "Share this classification with teammates for review or generate a public link to send to clients — no account required for them to view.",
        placement: "bottom" as const,
        icon: <ShareIcon className="h-5 w-5 text-primary" />,
      },
      {
        id: "complete-country",
        type: "spotlight" as const,
        targetSelector: "#onboarding-detail-country",
        title: "Country of Origin & Tariffs",
        description:
          "Select the country of origin to instantly see applicable duty rates, tariff programs, and possible ways to save on your classified product's import duties.",
        placement: "bottom" as const,
        icon: <GlobeAltIcon className="h-5 w-5 text-primary" />,
      },
      {
        id: "complete-tag",
        type: "spotlight" as const,
        targetSelector: "#onboarding-detail-tag",
        title: "Tag for Easy Organization",
        description:
          "Add a tag to group related classifications together — great for organizing by importer, client, or product line so you can filter them on the main page.",
        placement: "bottom" as const,
        icon: <TagIcon className="h-5 w-5 text-primary" />,
      },
      {
        id: "complete-notes",
        type: "spotlight" as const,
        targetSelector: "#onboarding-detail-notes",
        title: "Classification Defense Notes",
        description:
          "Pull notes from the classification levels in the left panel, or add your own reasoning here — everything you write is included in the report when you download.",
        placement: "top" as const,
        icon: <DocumentTextOutline className="h-5 w-5 text-primary" />,
      },
    ],
    []
  );

  const hasRenderedContentRef = useRef(false);

  // Block initial render until HTS data and user profile are available.
  // After the first successful render, skip this guard so transient
  // isFetching flips don't unmount the entire tab tree and destroy state.
  if (!hasRenderedContentRef.current) {
    if ((!readOnly && isFetching) || (!readOnly && !isAnonymous && !userProfile)) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-base-100">
          <LoadingIndicator />
        </div>
      );
    }
  }
  hasRenderedContentRef.current = true;

  const hasAnyCandidates = classification?.levels?.some(
    (l) => l.candidates && l.candidates.length > 0
  );
  const isOnLevelTab =
    activeTab.startsWith("classification-level-") ||
    activeTab === "classification-section" ||
    activeTab === "classification-chapter";

  const LOCKED_TAB_FEATURE_NAMES: Partial<Record<NavTab, string>> = {
    "cross-rulings": "CROSS Ruling Validation",
    attachments: "Attachments",
    "classification-report": "Classification Reports",
  };

  const renderTab = (tab: NavTab) => {
    switch (tab) {
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
        const levelMatch = tab.match(/^classification-level-(\d+)$/);
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
            onOpenExplore={readOnly ? undefined : handleOpenExplore}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Mobile Top Bar */}
          <div className="lg:hidden">
            <MobileNavDropdown
              classification={classification}
              classificationId={classificationId}
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
              {Array.from(visitedTabsRef.current).map((tab) => {
                const isActive = tab === activeTab;
                const content = renderTab(tab);
                return (
                  <div key={tab} className={isActive ? undefined : "hidden"}>
                    {!readOnly && isAnonymous && ANON_LOCKED_TABS.has(tab) ? (
                      <LockedTabOverlay
                        classificationId={classificationId}
                        featureName={LOCKED_TAB_FEATURE_NAMES[tab] || "this feature"}
                      >
                        {content}
                      </LockedTabOverlay>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        </div>

        {/* Modals (hidden in readonly/shared mode) */}
        {!readOnly && (
          <>
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

        {/* Contextual onboarding tours — sequenced via onComplete callbacks */}
        <OnboardingTour
          tourId="classification-detail-workspace"
          steps={workspaceTourSteps}
          enabled={!readOnly && hasRenderedContentRef.current}
          onComplete={() => setWorkspaceTourDone(true)}
        />
        <OnboardingTour
          tourId="classification-detail-candidates"
          steps={candidatesTourSteps}
          enabled={
            !readOnly &&
            workspaceTourDone &&
            isOnLevelTab &&
            !!hasAnyCandidates
          }
          onComplete={() => setCandidatesTourDone(true)}
        />
        <OnboardingTour
          tourId="classification-detail-complete"
          steps={completionTourSteps}
          enabled={
            !readOnly &&
            !!classification?.isComplete &&
            activeTab === "overview" &&
            !showCompleteModal
          }
        />
      </div>
    </SectionChapterDiscoveryProvider>
  );
};
