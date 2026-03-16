"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
  useMemo,
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
import {
  fetchImportersForUser,
  fetchImportersForTeam,
  createImporter,
} from "../../../libs/supabase/importers";
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
  LinkIcon,
  ClipboardDocumentCheckIcon,
  TagIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  UsersIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/16/solid";
import {
  CheckCircleIcon as CheckCircleSolid,
  ClipboardIcon,
} from "@heroicons/react/16/solid";
import { CountrySelection } from "../../CountrySelection";
import apiClient from "../../../libs/api";
import config from "@/config";
import { useHts } from "../../../contexts/HtsContext";
import { HtsElement } from "../../../interfaces/hts";
import { addTariffsToCountry } from "../../../tariffs/tariffs";
import {
  findTariffElement,
  getTariffContext,
  calculateAllTariffs,
  formatCurrency,
  TariffCalculationResult,
} from "../../../tariffs/tariff-calculations";
import { get15PercentCountryTotalBaseRate } from "../../../tariffs/tariffs";
import { EstimatedCostsDisplay } from "../../tariff-ui/EstimatedCostsDisplay";

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DashboardCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function DashboardCardHeader({
  title,
  icon,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-base-300 bg-base-200/30">
      <div className="flex items-center gap-2">
        {icon && <span className="text-base-content/50">{icon}</span>}
        <h3 className="text-sm font-semibold text-base-content">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function PublicShareSection({
  classificationRecord,
}: {
  classificationRecord: ClassificationRecord;
}) {
  const [isShared, setIsShared] = useState(
    classificationRecord.is_shared ?? false
  );
  const [shareToken, setShareToken] = useState(
    classificationRecord.share_token ?? null
  );
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : `https://${config.domainName}`}/c/${shareToken}`
    : null;

  const handleToggleShare = async () => {
    setIsToggling(true);
    try {
      const response: { share_token: string | null; is_shared: boolean } =
        await apiClient.post("/classification/share", {
          id: classificationRecord.id,
          enable: !isShared,
        });
      setIsShared(response.is_shared);
      setShareToken(response.share_token);
    } catch (error) {
      console.error("Error toggling share:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <GlobeAltIcon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base-content">
                Public Read-Only Link
              </p>
              <p className="text-xs text-base-content/50 mt-0.5">
                Anyone with the link can view this classification
              </p>
            </div>
            <label className="flex items-center cursor-pointer gap-2 shrink-0 ml-3">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={isShared}
                onChange={handleToggleShare}
                disabled={isToggling}
              />
              {isToggling && (
                <span className="loading loading-spinner loading-xs" />
              )}
            </label>
          </div>

          {isShared && shareUrl && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 border border-base-300 text-xs text-base-content/60 truncate">
                <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{shareUrl}</span>
              </div>
              <button
                className="btn btn-sm btn-primary gap-1.5 shrink-0"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamShareSection({
  classificationRecord,
}: {
  classificationRecord: ClassificationRecord;
}) {
  const [copied, setCopied] = useState(false);

  const teamUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/classifications/${classificationRecord.id}`
      : `https://${config.domainName}/classifications/${classificationRecord.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(teamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center shrink-0 mt-0.5">
        <UsersIcon className="w-4 h-4 text-info" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-base-content">
          Share with Teammates
        </p>
        <p className="text-xs text-base-content/50 mt-0.5">
          Team members can view and collaborate on this classification
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 border border-base-300 text-xs text-base-content/60 truncate">
            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{teamUrl}</span>
          </div>
          <button
            className="btn btn-sm btn-outline btn-info gap-1.5 shrink-0"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <ClipboardIcon className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_CUSTOMS_VALUE = 10000;
const DEFAULT_UNITS = 1000;

function useTariffCalculation(
  countryOfOrigin: Country | null,
  classification: ClassificationI,
  htsElements: HtsElement[]
): TariffCalculationResult | null {
  return useMemo(() => {
    if (
      !countryOfOrigin ||
      !classification.isComplete ||
      htsElements.length === 0
    )
      return null;

    const element =
      classification.levels[classification.levels.length - 1]?.selection;
    if (!element) return null;

    const tariffEl = findTariffElement(element, htsElements);
    const cwt = addTariffsToCountry(
      countryOfOrigin,
      element,
      tariffEl,
      [],
      undefined,
      DEFAULT_UNITS,
      DEFAULT_CUSTOMS_VALUE
    );

    const { tariffColumn, is15Cap } = getTariffContext(countryOfOrigin.code);
    const baseFlat = cwt.baseTariffs.flatMap((t) => t.tariffs);
    const adValoremEquiv = get15PercentCountryTotalBaseRate(
      baseFlat,
      DEFAULT_CUSTOMS_VALUE,
      DEFAULT_UNITS
    );
    const below15Rule = is15Cap && adValoremEquiv < 15;

    return calculateAllTariffs(
      cwt.tariffSets,
      cwt.baseTariffs,
      DEFAULT_CUSTOMS_VALUE,
      DEFAULT_UNITS,
      [],
      tariffColumn,
      below15Rule
    );
  }, [countryOfOrigin, classification, htsElements]);
}

function TariffDashboardSection({
  countryOfOrigin,
  classification,
  onNavigateToDuty,
}: {
  countryOfOrigin: Country | null;
  classification: ClassificationI;
  onNavigateToDuty: () => void;
}) {
  const { htsElements } = useHts();
  const tariffData = useTariffCalculation(
    countryOfOrigin,
    classification,
    htsElements
  );

  return (
    <DashboardCard>
      <DashboardCardHeader
        title="Tariff Summary"
        icon={<CurrencyDollarIcon className="w-4 h-4" />}
        action={
          <button
            onClick={onNavigateToDuty}
            className="btn btn-sm btn-primary"
          >
            See All Tariff Details
            <ArrowRightIcon className="w-3 h-3" />
          </button>
        }
      />
      <div className="flex flex-col gap-5">
        {tariffData ? (
          <div className="p-4">
            <EstimatedCostsDisplay
              dutyEstimates={tariffData.dutyEstimates}
              feeEstimates={tariffData.feeEstimates}
              summaryTotals={tariffData.summaryTotals}
              totalImportDuty={tariffData.totalImportDuty}
              totalFees={tariffData.totalFees}
              customsValue={DEFAULT_CUSTOMS_VALUE}
            />
          </div>
        ) : countryOfOrigin && !classification.isComplete ? (
          <div className="text-center py-6">
            <p className="text-sm text-base-content/60">
              Complete the classification to see tariff estimates.
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-base-content/60">
              Select a country of origin on the dashboard to see tariff estimates.
            </p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

// ---------------------------------------------------------------------------
// OverviewTab
// ---------------------------------------------------------------------------

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
  }, [liveClassification.isComplete]);

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

  useEffect(() => {
    if (!userProfile) return;
    const fetchData = async () => {
      try {
        const fetchedImporters = userProfile.team_id
          ? await fetchImportersForTeam(userProfile.team_id)
          : await fetchImportersForUser();
        setImporters(fetchedImporters);
        setIsLoadingImporters(false);
        if (classificationRecord) {
          setSelectedImporterId(classificationRecord.importer_id || "");
        }
      } catch (error) {
        console.error("Error fetching importers:", error);
        setIsLoadingImporters(false);
      }
    };
    fetchData();
  }, [userProfile]);

  const handleAddImporter = async () => {
    if (!newImporter.trim() || !userProfile) return;
    setIsCreatingImporter(true);
    try {
      const newImporterData = await createImporter(
        newImporter.trim(),
        userProfile.team_id || undefined
      );
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
  const levelCount = liveClassification.levels.filter(
    (l) => l.selection
  ).length;
  const finalSelection =
    liveClassification.levels[liveClassification.levels.length - 1]?.selection;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Hero Banner ── */}
      <div className="relative rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 via-base-100 to-base-200/30 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/[0.04] blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-success/[0.04] blur-3xl" />
        </div>

        <div className="relative px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Left: Code + Description */}
            <div className="flex-1 min-w-0">
              {isComplete ? (
                <div className="w-fit flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-full bg-success/10 border border-success/20">
                  <CheckCircleSolid className="w-3.5 h-3.5 text-success" />
                  <span className="text-[11px] font-semibold text-success">
                    Complete
                  </span>
                </div>
              ) : (
                <div className="w-fit flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-full bg-warning/10 border border-warning/20">
                  <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  <span className="text-[11px] font-semibold text-warning">
                    In Progress
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
                  className={`text-3xl sm:text-4xl font-mono font-bold tracking-wide ${
                    latestHtsCode
                      ? "text-primary cursor-pointer"
                      : "text-base-content/40"
                  }`}
                >
                  {latestHtsCode || "Pending..."}
                </span>
                {latestHtsCode && (
                  <span
                    className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-success text-white text-[10px] font-semibold whitespace-nowrap pointer-events-none transition-all duration-200 ${
                      codeCopied
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

            {/* Right: Quick actions */}
            {isComplete && userProfile && (
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
                {canDelete && classificationRecord && (
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

      {/* ── Stats Strip ── */}
      {/* {isComplete && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Depth",
              value: `${levelCount} levels`,
              accent: "text-primary",
            },
            {
              label: "Final Code",
              value: finalSelection?.htsno || "—",
              accent: "text-success font-mono",
            },
            {
              label: "Description",
              value: finalSelection?.description || "—",
              accent: "text-base-content/70",
              truncate: true,
            },
            {
              label: "Status",
              value: classificationRecord?.status || "Draft",
              accent: "text-base-content/70 capitalize",
            },
          ].map(({ label, value, accent, truncate }) => (
            <div
              key={label}
              className="rounded-xl border border-base-300 bg-base-100 px-4 py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 mb-1">
                {label}
              </p>
              <p
                className={`text-sm font-semibold ${accent} ${truncate ? "truncate" : ""}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      )} */}



      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country of Origin */}
        <div className={`${userProfile ? "col-span-1" : "col-span-2"}`}>
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
        </div>

        {/* Importer */}
        {userProfile && (
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
        )}
      </div>


      {/* ── Tariff Summary (full width) ── */}
      <TariffDashboardSection
        countryOfOrigin={countryOfOrigin}
        classification={liveClassification}
        onNavigateToDuty={onNavigateToDuty}
      />

      {/* ── Classification Path ── */}
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



      {/* ── Basis for Classification (full width) ── */}
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
              flushAndSave();
            }}
          />
        </div>
      </DashboardCard>

      {/* ── Share Modal ── */}
      {classificationRecord && userProfile && (
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

      {/* ── Create Importer Modal ── */}
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
    </div>
  );
};
