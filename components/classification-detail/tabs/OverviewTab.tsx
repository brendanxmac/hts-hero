"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { useClassification } from "../../../contexts/ClassificationContext";
import { useClassifications } from "../../../contexts/ClassificationsContext";
import { UserProfile } from "../../../libs/supabase/user";
import {
  ClassificationI,
  ClassificationRecord,
  ClassificationStatus,
  Importer,
} from "../../../interfaces/hts";
import { updateClassification } from "../../../libs/classification";
import { createImporter } from "../../../libs/supabase/importers";
import { generateBasisForClassification } from "../../../libs/hts";
import ImporterDropdown from "../../ImporterDropdown";
import Modal from "../../Modal";
import { ClassificationHierarchy } from "../ClassificationHierarchy";
import { StatusDropdown } from "../../classification-ui/StatusDropdown";
import { DownloadReportButton } from "../../classification-ui/DownloadReportButton";
import { Country } from "../../../constants/countries";
import {
  DocumentTextIcon,
  TrashIcon,
  ShareIcon,
  TagIcon,
  CheckCircleIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/16/solid";
import { CountrySelection } from "../../CountrySelection";
import { DashboardCard, DashboardCardHeader } from "../DashboardCard";
import { PublicShareSection, TeamShareSection } from "../ShareSections";
import { TariffDashboardSection } from "../TariffDashboardSection";
import { useIsReadOnly } from "../../../contexts/ReadOnlyContext";

interface Props {
  classification: ClassificationI;
  classificationRecord?: ClassificationRecord;
  userProfile: UserProfile | null;
  importers: Importer[];
  isLoadingImporters: boolean;
  canUpdateDetails: boolean;
  canDelete: boolean;
  updatingStatus: boolean;
  downloadingReport: boolean;
  isDeleting: boolean;
  latestHtsCode: string;
  countryOfOrigin: Country | null;
  onCountryChange: (country: { code: string } | null) => void;
  onStatusChange: (status: ClassificationStatus) => void;
  onDownloadReport: () => void;
  onDeleteClick: () => void;
  onNavigateToDuty: () => void;
  onNavigateToTab?: (tabId: string) => void;
}

export const OverviewTab = ({
  classification,
  classificationRecord,
  userProfile,
  importers: initialImporters,
  isLoadingImporters: initialLoadingImporters,
  canUpdateDetails,
  canDelete,
  updatingStatus,
  downloadingReport,
  isDeleting,
  latestHtsCode,
  countryOfOrigin,
  onCountryChange,
  onStatusChange,
  onDownloadReport,
  onDeleteClick,
  onNavigateToDuty,
  onNavigateToTab,
}: Props) => {
  const readOnly = useIsReadOnly();
  const {
    classification: ctxClassification,
    setClassification,
    classificationId,
    flushAndSave,
  } = useClassification();
  const { refreshClassifications } = useClassifications();

  const liveClassification = ctxClassification || classification;

  const basisTextareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeBasisTextarea = useCallback(() => {
    const textarea = basisTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useLayoutEffect(() => {
    resizeBasisTextarea();
  }, [
    liveClassification.notes,
    liveClassification.levels,
    resizeBasisTextarea,
  ]);

  useEffect(() => {
    if (readOnly) return;
    if (
      liveClassification.isComplete &&
      (liveClassification.notes === undefined ||
        liveClassification.notes === null)
    ) {
      setClassification({
        ...liveClassification,
        notes: generateBasisForClassification(liveClassification),
      });
    }
  }, [liveClassification.isComplete, readOnly]);

  const [importers, setImporters] = useState<Importer[]>(initialImporters);
  const [selectedImporterId, setSelectedImporterId] = useState<string>(
    classificationRecord?.importer_id || ""
  );
  const [isLoadingImporters, setIsLoadingImporters] = useState(
    initialLoadingImporters
  );
  const [newImporter, setNewImporter] = useState("");
  const [isCreatingImporter, setIsCreatingImporter] = useState(false);
  const [showCreateImporterModal, setShowCreateImporterModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const hasAddedImporterRef = useRef(false);

  useEffect(() => {
    if (readOnly) return;
    if (!hasAddedImporterRef.current) {
      setImporters(initialImporters);
    }
    setIsLoadingImporters(initialLoadingImporters);
    if (classificationRecord) {
      setSelectedImporterId(classificationRecord.importer_id || "");
    }
  }, [
    readOnly,
    initialImporters,
    initialLoadingImporters,
    classificationRecord,
  ]);

  const handleAddImporter = async () => {
    if (!newImporter.trim() || !userProfile) return;
    setIsCreatingImporter(true);
    try {
      const newImporterData = await createImporter(
        newImporter.trim(),
        userProfile.team_id || undefined
      );
      hasAddedImporterRef.current = true;
      setImporters((prev) => [...prev, newImporterData]);
      setNewImporter("");
      setSelectedImporterId(newImporterData.id);
      await updateClassification(
        classificationId,
        undefined,
        newImporterData.id,
        undefined
      );
      await refreshClassifications();
    } catch (error) {
      console.error("Failed to create importer:", error);
    } finally {
      setIsCreatingImporter(false);
    }
  };

  const isComplete = liveClassification.isComplete;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-base-content">
          Classification Overview
        </h1>
        <p className="text-sm text-base-content/50 mt-1">
          A summary of this classification. Use the tabs in the sidebar to explore each step in detail.
        </p>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 via-base-100 to-base-200/30 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/[0.04] blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-success/[0.04] blur-3xl" />
        </div>

        <div className="relative px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {isComplete ? (
                <div className="w-fit flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-full bg-success/10 border border-success/20">
                  <CheckCircleSolid className="w-3.5 h-3.5 text-success" />
                  <span className="text-[11px] font-semibold text-success">
                    Classification Complete
                  </span>
                </div>
              ) : (
                <div className="w-fit flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-full bg-warning/10 border border-warning/20">
                  <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  <span className="text-[11px] font-semibold text-warning">
                    Classification Incomplete
                  </span>
                </div>
              )}

              <span className="relative inline-block mb-2">
                <span
                  onClick={
                    latestHtsCode
                      ? () => {
                        navigator.clipboard.writeText(latestHtsCode);
                        setCodeCopied(true);
                        setTimeout(() => setCodeCopied(false), 1500);
                      }
                      : undefined
                  }
                  className={`text-3xl sm:text-4xl font-mono font-bold tracking-wide ${latestHtsCode
                    ? "text-primary cursor-pointer"
                    : "text-base-content/40"
                    }`}
                >
                  {latestHtsCode || "Pending..."}
                </span>
                {latestHtsCode && (
                  <span
                    className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-success text-white text-[10px] font-semibold whitespace-nowrap pointer-events-none transition-all duration-200 ${codeCopied
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-1"
                      }`}
                  >
                    Copied!
                  </span>
                )}
              </span>

              <p className="text-sm text-base-content/60 leading-relaxed line-clamp-2 max-w-lg">
                {liveClassification?.articleDescription ||
                  "No description available."}
              </p>

              {countryOfOrigin && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-base">{countryOfOrigin.flag}</span>
                  <span className="text-xs font-medium text-base-content/60">
                    {countryOfOrigin.name}
                  </span>
                </div>
              )}
            </div>

            {!readOnly && isComplete && (
              <div className="flex flex-wrap gap-2 shrink-0">
                {classificationRecord && isComplete && (
                  <StatusDropdown
                    status={classificationRecord.status}
                    isUpdating={updatingStatus}
                    disabled={!canUpdateDetails}
                    onChange={onStatusChange}
                  />
                )}
                <DownloadReportButton
                  isDownloading={downloadingReport}
                  disabled={downloadingReport || isLoadingImporters}
                  onClick={onDownloadReport}
                />
                {classificationRecord && (
                  <button
                    className="btn btn-sm btn-outline gap-1.5 h-9"
                    onClick={() => setShowShareModal(true)}
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                )}
                {canDelete && classificationRecord && userProfile && (
                  <button
                    className="btn btn-sm btn-outline btn-error gap-1.5 h-9"
                    onClick={onDeleteClick}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {readOnly ? (
        countryOfOrigin && (
          <DashboardCard>
            <DashboardCardHeader
              title="Country of Origin"
              icon={<GlobeAltIcon className="w-4 h-4" />}
            />
            <div className="p-5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{countryOfOrigin.flag}</span>
                <span className="text-sm font-medium text-base-content">
                  {countryOfOrigin.name}
                </span>
              </div>
            </div>
          </DashboardCard>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard>
            <DashboardCardHeader
              title="Country of Origin"
              icon={<GlobeAltIcon className="w-4 h-4" />}
            />
            <div className="p-5">
              <CountrySelection
                selectedCountries={countryOfOrigin ? [countryOfOrigin] : []}
                setSelectedCountries={(countries) => {
                  onCountryChange(countries[0] || null);
                }}
                singleSelect
              />
            </div>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader
              title="Importer"
              icon={<TagIcon className="w-4 h-4" />}
            />
            <div className="p-5">
              <div className="flex gap-2">
                <ImporterDropdown
                  importers={importers}
                  selectedImporterId={selectedImporterId}
                  onSelectionChange={(value) => {
                    setSelectedImporterId(value);
                    updateClassification(
                      classificationId,
                      undefined,
                      value || null,
                      undefined
                    ).then(() => refreshClassifications());
                  }}
                  onCreateSelected={() => setShowCreateImporterModal(true)}
                  isLoading={isLoadingImporters}
                  disabled={!canUpdateDetails}
                  showCreateOption={canUpdateDetails}
                />
                {selectedImporterId && canUpdateDetails && (
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      setSelectedImporterId("");
                      updateClassification(
                        classificationId,
                        undefined,
                        null,
                        undefined
                      ).then(() => refreshClassifications());
                    }}
                    disabled={isLoadingImporters}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Tariff Summary */}
      <TariffDashboardSection
        countryOfOrigin={countryOfOrigin}
        classification={liveClassification}
        onNavigateToDuty={onNavigateToDuty}
      />

      {/* Classification Path */}
      <DashboardCard>
        <DashboardCardHeader
          title="Classification Path"
          icon={<CheckCircleIcon className="w-4 h-4" />}
        />
        <div className="p-5">
          <ClassificationHierarchy
            classification={liveClassification}
            onItemClick={onNavigateToTab}
          />
        </div>
      </DashboardCard>

      {/* Basis for Classification */}
      <DashboardCard>
        <DashboardCardHeader
          title="Basis for Classification"
          icon={<DocumentTextIcon className="w-4 h-4" />}
        />
        <div className="p-5">
          <textarea
            ref={basisTextareaRef}
            className={`whitespace-pre-wrap min-h-36 w-full px-4 py-3 rounded-lg border transition-all duration-200 placeholder:text-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 resize-none overflow-hidden text-sm leading-relaxed ${canUpdateDetails
              ? "bg-base-100 border-base-300 hover:border-primary/40"
              : "bg-base-200/50 border-base-300 cursor-not-allowed opacity-60"
              }`}
            placeholder="Add any notes about your classification here"
            value={liveClassification.notes ?? ""}
            disabled={!canUpdateDetails}
            onChange={(e) => {
              setClassification({
                ...liveClassification,
                notes: e.target.value,
              });
              resizeBasisTextarea();
            }}
            onBlur={() => {
              if (!readOnly) flushAndSave();
            }}
          />
        </div>
      </DashboardCard>

      {/* Share Modal */}
      {!readOnly && classificationRecord && userProfile && (
        <Modal isOpen={showShareModal} setIsOpen={setShowShareModal}>
          <div className="p-6 flex flex-col gap-5 min-w-80 sm:min-w-[420px]">
            <div className="flex items-center gap-2">
              <ShareIcon className="w-5 h-5 text-base-content/50" />
              <h3 className="text-lg font-semibold">Share & Collaborate</h3>
            </div>
            <TeamShareSection classificationRecord={classificationRecord} />
            <div className="h-px bg-base-300" />
            <PublicShareSection classificationRecord={classificationRecord} />
          </div>
        </Modal>
      )}

      {/* Create Importer Modal */}
      {!readOnly && (
        <Modal
          isOpen={showCreateImporterModal}
          setIsOpen={setShowCreateImporterModal}
        >
          <div className="p-6 flex flex-col gap-4 min-w-80">
            <h3 className="text-lg font-semibold">Create New Importer</h3>
            <input
              type="text"
              placeholder="Importer name"
              value={newImporter}
              className="input input-bordered w-full"
              onChange={(e) => setNewImporter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newImporter.trim()) {
                  handleAddImporter();
                  setShowCreateImporterModal(false);
                  setNewImporter("");
                }
              }}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowCreateImporterModal(false);
                  setNewImporter("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleAddImporter();
                  setShowCreateImporterModal(false);
                  setNewImporter("");
                }}
                disabled={isCreatingImporter || !newImporter.trim()}
              >
                {isCreatingImporter ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
