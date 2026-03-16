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
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  CheckCircleIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

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
  }, [classification?.preliminaryLevels, htsSections]);

  useEffect(() => {
    if (hasHydratedChapters.current || chapterDiscoveryComplete) return;
    if (!classification?.preliminaryLevels) return;

    const chapterLevel = classification.preliminaryLevels.find(
      (l) => l.level === "chapter"
    );
    if (!chapterLevel || chapterLevel.candidates.length === 0) return;

    hasHydratedChapters.current = true;

    const candidates = chapterLevel.candidates.map((c) => ({
      chapter: {
        number: c.identifier,
        description: c.description,
        type: Navigatable.CHAPTER as const,
      },
      sectionNumber: 0,
    }));

    setChapterCandidates(candidates);
    if (chapterLevel.analysis) {
      setChapterReasoning(chapterLevel.analysis);
    }
    setChapterDiscoveryComplete(true);
  }, [classification?.preliminaryLevels]);

  return null;
}

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

  useEffect(() => {
    const isNowComplete = classification?.isComplete ?? false;
    if (isNowComplete && !wasCompleteRef.current) {
      setShowCompleteModal(true);
    }
    wasCompleteRef.current = isNowComplete;
  }, [classification?.isComplete]);

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
          country?.code || undefined
        );
      } catch (error) {
        console.error("Error updating country of origin:", error);
      }
    },
    [classificationId]
  );

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
            onCountryChange={handleCountryChange}
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

        {/* Classification Complete Modal */}
        <Transition appear show={showCompleteModal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={() => {
              setShowCompleteModal(false);
              setActiveTab("overview");
            }}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-90"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-90"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-base-100 border border-base-300 shadow-2xl transition-all">
                    <div className="relative overflow-hidden">
                      {/* Decorative gradient header */}
                      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-success/10 to-transparent pointer-events-none" />
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-success/5 blur-3xl pointer-events-none" />

                      <div className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center">
                        {/* Success icon */}
                        <div className="relative mb-4">
                          <div className="absolute -inset-2 rounded-full bg-success/20 blur-xl animate-pulse" />
                          <div className="relative w-14 h-14 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center">
                            <CheckCircleIcon className="w-8 h-8 text-success" />
                          </div>
                        </div>

                        {/* Title */}
                        <Dialog.Title className="text-xl font-bold text-base-content mb-1">
                          Classification Complete
                        </Dialog.Title>
                        <p className="text-sm text-base-content/50 mb-5">
                          Your item has been successfully classified
                        </p>

                        {/* HTS Code display */}
                        <div className="w-full rounded-xl bg-base-200/60 border border-base-300 p-4 mb-6">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 mb-1.5">
                            HTS Code
                          </p>
                          <p className="text-2xl font-mono font-bold text-success tracking-wide mb-2">
                            {latestHtsCode || "—"}
                          </p>
                          {classification?.articleDescription && (
                            <p className="text-xs text-base-content/50 leading-relaxed line-clamp-2">
                              {classification.articleDescription}
                            </p>
                          )}
                        </div>

                        {/* Next steps */}
                        <div className="w-full space-y-2.5 mb-6">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 text-left">
                            What you can do next
                          </p>
                          {[
                            {
                              icon: ScaleIcon,
                              text: "Verify with CROSS rulings database",
                            },
                            {
                              icon: CurrencyDollarIcon,
                              text: "Find duty & tariff rates for any country",
                            },
                            {
                              icon: ShieldCheckIcon,
                              text: "Generate an audit-ready defense report",
                            },
                            {
                              icon: ShareIcon,
                              text: "Share with clients or teammates",
                            },
                          ].map(({ icon: Icon, text }) => (
                            <div
                              key={text}
                              className="flex items-center gap-3 rounded-lg bg-base-200/40 px-3.5 py-2.5"
                            >
                              <Icon className="w-4 h-4 text-primary shrink-0" />
                              <span className="text-xs font-medium text-base-content/70">
                                {text}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Proceed button */}
                        <button
                          className="btn btn-primary w-full gap-2"
                          onClick={() => {
                            setShowCompleteModal(!showCompleteModal);
                            setActiveTab("overview");
                          }}
                        >
                          <SparklesIcon className="w-4 h-4" />
                          Proceed to Overview
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </SectionChapterDiscoveryProvider>
  );
};
