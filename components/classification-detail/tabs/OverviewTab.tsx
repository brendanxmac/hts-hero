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
  ArrowRightIcon,
  ShareIcon,
  LinkIcon,
  ClipboardDocumentCheckIcon,
  TagIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  UsersIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  ClipboardIcon,
} from "@heroicons/react/16/solid";
import apiClient from "../../../libs/api";
import config from "@/config";
import { useHts } from "../../../contexts/HtsContext";
import { HtsElement } from "../../../interfaces/hts";
import {
  addTariffsToCountry,
  CountryWithTariffs,
  get15PercentCountryTotalBaseRate,
  getAdValoremRate,
  getAmountRatesString,
} from "../../../tariffs/tariffs";
import { TariffColumn } from "../../../enums/tariff";
import { EuropeanUnionCountries } from "../../../constants/countries";
import { Column2CountryCodes } from "../../../tariffs/tariff-columns";
import { getHtsElementParents } from "../../../libs/hts";

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
  onStatusChange: (status: ClassificationStatus) => void;
  onDownloadReport: () => void;
  onDeleteClick: () => void;
  onNavigateToDuty: () => void;
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

const HARBOR_MAINTENANCE_FEE_RATE = 0.00125;
const MERCHANDISE_PROCESSING_FEE_RATE = 0.003464;
const MPF_MIN = 33.58;
const MPF_MAX = 651.5;
const DEFAULT_CUSTOMS_VALUE = 10000;
const DEFAULT_UNITS = 1000;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function TariffSnapshotCard({
  countryOfOrigin,
  classification,
  onNavigateToDuty,
}: {
  countryOfOrigin: Country | null;
  classification: ClassificationI;
  onNavigateToDuty: () => void;
}) {
  const { htsElements } = useHts();

  const element =
    classification.levels[classification.levels.length - 1]?.selection;

  const snapshot = (() => {
    if (!countryOfOrigin || !element || htsElements.length === 0) return null;

    const findTariffElement = (el: HtsElement): HtsElement => {
      if (el.general || el.special || el.other) return el;
      const parents = getHtsElementParents(el, htsElements);
      for (let i = parents.length - 1; i >= 0; i--) {
        if (parents[i].general || parents[i].special || parents[i].other)
          return parents[i];
      }
      return el;
    };

    const tariffElement = findTariffElement(element);
    const cwt = addTariffsToCountry(
      countryOfOrigin,
      element,
      tariffElement,
      [],
      undefined,
      DEFAULT_UNITS,
      DEFAULT_CUSTOMS_VALUE
    );

    const isOtherColumn = Column2CountryCodes.includes(countryOfOrigin.code);
    const tariffColumn = isOtherColumn
      ? TariffColumn.OTHER
      : TariffColumn.GENERAL;
    const is15Cap =
      EuropeanUnionCountries.includes(countryOfOrigin.code) ||
      countryOfOrigin.code === "JP" ||
      countryOfOrigin.code === "KR";
    const baseFlat = cwt.baseTariffs.flatMap((t) => t.tariffs);
    const adValoremEquiv = get15PercentCountryTotalBaseRate(
      baseFlat,
      DEFAULT_CUSTOMS_VALUE,
      DEFAULT_UNITS
    );

    const rates = cwt.tariffSets.map((ts) => {
      const isArticle = ts.name === "Article" || ts.name === "";
      const includeBase =
        isArticle && !(is15Cap && adValoremEquiv < 15);
      const rate = includeBase
        ? getAdValoremRate(tariffColumn, ts.tariffs, baseFlat)
        : getAdValoremRate(tariffColumn, ts.tariffs);
      const hasAmount =
        includeBase && baseFlat.some((t) => t.type === "amount");
      return {
        name: ts.name || "Article",
        rate,
        hasAmount,
        amountStr: hasAmount ? getAmountRatesString(baseFlat) : null,
      };
    });

    const totalDuty = cwt.tariffSets.reduce((sum, ts, idx) => {
      const r = rates[idx];
      return sum + (DEFAULT_CUSTOMS_VALUE * r.rate) / 100;
    }, 0);

    const hmf = DEFAULT_CUSTOMS_VALUE * HARBOR_MAINTENANCE_FEE_RATE;
    let mpf = DEFAULT_CUSTOMS_VALUE * MERCHANDISE_PROCESSING_FEE_RATE;
    if (mpf < MPF_MIN) mpf = MPF_MIN;
    if (mpf > MPF_MAX) mpf = MPF_MAX;
    const totalFees = hmf + mpf;

    return { cwt, rates, totalDuty, totalFees, totalAll: totalDuty + totalFees };
  })();

  return (
    <DashboardCard>
      <DashboardCardHeader
        title="Tariff Summary"
        icon={<CurrencyDollarIcon className="w-4 h-4" />}
      />
      <div className="p-5">
        {countryOfOrigin && snapshot ? (
          <div className="flex flex-col gap-4">
            {/* Country */}
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{countryOfOrigin.flag}</span>
              <div>
                <p className="text-sm font-semibold text-base-content">
                  {countryOfOrigin.name}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
                  Country of Origin
                </p>
              </div>
            </div>

            {/* Rate + Duty cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Tariff Rate */}
              <div className="rounded-xl bg-primary/[0.06] border border-primary/15 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 mb-1">
                  Tariff Rate
                </p>
                <p className="text-xl font-black text-primary tabular-nums">
                  {snapshot.rates[0]?.hasAmount && snapshot.rates[0]?.amountStr
                    ? `${snapshot.rates[0].amountStr} + `
                    : ""}
                  {snapshot.rates[0]?.rate ?? 0}%
                </p>
              </div>

              {/* Total Duty & Fees */}
              <div className="rounded-xl bg-secondary/[0.06] border border-secondary/15 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 mb-1">
                  Duty & Fees
                </p>
                <p className="text-xl font-black text-secondary tabular-nums">
                  {formatCurrency(snapshot.totalAll)}
                </p>
                <p className="text-[10px] text-base-content/40 mt-0.5">
                  on {formatCurrency(DEFAULT_CUSTOMS_VALUE)}
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToDuty}
              className="btn btn-sm btn-outline btn-primary gap-1.5 w-full"
            >
              See All Tariff Details
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-base-content/60 mb-3">
              Select a country of origin on the Duty / Tariffs tab to see rates
              here.
            </p>
            <button
              onClick={onNavigateToDuty}
              className="btn btn-sm btn-outline btn-primary gap-1.5 w-full"
            >
              See All Tariff Details
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </>
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
  onStatusChange,
  onDownloadReport,
  onDeleteClick,
  onNavigateToDuty,
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
              <div className="flex items-center gap-3 mb-3">
                {isComplete ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                    <CheckCircleSolid className="w-3.5 h-3.5 text-success" />
                    <span className="text-[11px] font-semibold text-success">
                      Complete
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20">
                    <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                    <span className="text-[11px] font-semibold text-warning">
                      In Progress
                    </span>
                  </div>
                )}
                {classificationRecord && isComplete && (
                  <StatusDropdown
                    status={classificationRecord.status}
                    isUpdating={updatingStatus}
                    disabled={!canUpdateDetails}
                    onChange={onStatusChange}
                  />
                )}
              </div>

              <p className="text-3xl sm:text-4xl font-mono font-bold text-primary tracking-wide mb-2">
                {latestHtsCode || "Pending..."}
              </p>

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
              <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                <DownloadReportButton
                  isDownloading={downloadingReport}
                  disabled={downloadingReport || isLoadingImporters}
                  onClick={onDownloadReport}
                />
                <button
                  onClick={onNavigateToDuty}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-lg font-semibold text-xs transition-all duration-200 bg-base-200 hover:bg-base-300 text-base-content/70 border border-base-300"
                >
                  <CurrencyDollarIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Duty Rates</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      {isComplete && (
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
      )}

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (3/5) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Classification Hierarchy */}
          <DashboardCard>
            <DashboardCardHeader
              title="Classification Path"
              icon={<CheckCircleIcon className="w-4 h-4" />}
            />
            <div className="p-5">
              <ClassificationHierarchy classification={liveClassification} />
            </div>
          </DashboardCard>
        </div>

        {/* Right Column (2/5) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Share & Collaborate */}
          {classificationRecord && userProfile && (
            <DashboardCard>
              <DashboardCardHeader
                title="Share & Collaborate"
                icon={<ShareIcon className="w-4 h-4" />}
              />
              <div className="p-5 flex flex-col gap-5">
                <TeamShareSection
                  classificationRecord={classificationRecord}
                />
                <div className="h-px bg-base-300 -mx-5" />
                <PublicShareSection
                  classificationRecord={classificationRecord}
                />
              </div>
            </DashboardCard>
          )}

          {/* Tariff Summary */}
          {isComplete && (
            <TariffSnapshotCard
              countryOfOrigin={countryOfOrigin}
              classification={liveClassification}
              onNavigateToDuty={onNavigateToDuty}
            />
          )}

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

          {/* Danger Zone */}
          {canDelete && classificationRecord && (
            <DashboardCard className="border-error/20">
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-error">
                    Delete Classification
                  </p>
                  <p className="text-xs text-base-content/40 mt-0.5">
                    This action cannot be undone.
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-outline btn-error gap-1.5"
                  onClick={onDeleteClick}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <TrashIcon className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </DashboardCard>
          )}
        </div>
      </div>

      {/* ── Basis for Classification (full width) ── */}
      <DashboardCard>
        <DashboardCardHeader
          title="Basis for Classification"
          icon={<DocumentTextIcon className="w-4 h-4" />}
        />
        <div className="p-5">
          <textarea
            ref={basisTextareaRef}
            className={`whitespace-pre-wrap min-h-36 w-full px-4 py-3 rounded-lg border transition-all duration-200 placeholder:text-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 resize-none overflow-hidden text-sm leading-relaxed ${
              canUpdateDetails
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
